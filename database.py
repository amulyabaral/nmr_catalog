import sqlite3
import os
import json
import yaml

# Define database path - UPDATED TO USE RENDER DISK PATH
DB_PATH = os.path.join('/database_nomoreamr', 'amr.db') # Use the Render mount path

def get_db():
    """Get a database connection"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # This allows accessing columns by name
    return conn

# Create database and tables
def init_db():
    """Initialize the database with tables"""
    # Ensure the directory exists (Render should mount it, but this is safe)
    db_dir = os.path.dirname(DB_PATH)
    if not os.path.exists(db_dir):
        try:
            os.makedirs(db_dir, exist_ok=True)
            print(f"Created database directory: {db_dir}")
        except OSError as e:
            print(f"Error creating database directory {db_dir}: {e}")
            # Depending on your error handling strategy, you might want to raise the error
            # or exit if the directory cannot be created.
            raise # Re-raise the exception if directory creation fails

    conn = get_db()
    c = conn.cursor()

    # Drop the table if it exists to apply schema changes (Use with caution in production!)
    # For development, this ensures the new schema is applied cleanly.
    # In production, you would use ALTER TABLE.
    # Consider removing this DROP TABLE line before final deployment if you want to preserve data across restarts
    # c.execute('DROP TABLE IF EXISTS data_points')
    # c.execute('DROP TABLE IF EXISTS pending_submissions') # Also consider if you want to drop this

    # Create enhanced data points table
    c.execute('''CREATE TABLE IF NOT EXISTS data_points (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    data_source_id TEXT NOT NULL UNIQUE,
                    resource_type TEXT NOT NULL,        -- Level 1 from YAML
                    category TEXT,                      -- Level 2 from YAML (Allow NULL)
                    subcategory TEXT,                   -- Level 3 from YAML (Allow NULL)
                    data_type TEXT,                     -- Level 4 from YAML (Allow NULL)
                    level5 TEXT,                        -- Level 5 from YAML (Allow NULL)
                    year_start INTEGER,
                    year_end INTEGER,
                    data_format TEXT,                   -- File format (Allow NULL)
                    data_resolution TEXT,               -- <<< MADE NULLABLE
                    repository TEXT NOT NULL,
                    repository_url TEXT NOT NULL,
                    data_description TEXT NOT NULL,
                    keywords TEXT,                      -- Allow NULL
                    last_updated DATE NOT NULL,         -- Date the entry was last updated/approved
                    contact_information TEXT,           -- Allow NULL
                    metadata JSON,                      -- Additional metadata as JSON
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    country TEXT NOT NULL,              -- Main category: Country
                    domain TEXT NOT NULL                -- Main category: Domain
                )''')

    # Create pending submissions table
    c.execute('''CREATE TABLE IF NOT EXISTS pending_submissions (
                    submission_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    status TEXT DEFAULT 'pending', -- pending, approved, rejected
                    resource_name TEXT,     -- <<< ADDED: Name/Title of the resource
                    countries TEXT,         -- JSON list of selected countries
                    domains TEXT,           -- JSON list of selected domains
                    primary_hierarchy_path TEXT, -- JSON object: {resource_type: val, category: val, ... level5: val}
                    year_start INTEGER,
                    year_end INTEGER,
                    resource_url TEXT,
                    contact_info TEXT,
                    description TEXT,
                    related_metadata TEXT,  -- JSON list of selected hierarchy node paths/IDs
                    related_resources TEXT, -- <<< ADDED: JSON list of linked existing resource data_source_ids
                    keywords TEXT,          -- Comma-separated string
                    license TEXT,           -- Optional license info
                    submitter_info TEXT     -- Optional: could add user ID or email if auth is implemented
                )''')

    conn.commit()
    conn.close()

def load_initial_data():
    """Load initial data from SQL file if database is empty"""
    conn = get_db()
    c = conn.cursor()
    
    # Check if database is empty
    c.execute('SELECT COUNT(*) FROM data_points')
    count = c.fetchone()[0]
    
    if count == 0:
        try:
            # Load and execute initial data SQL file
            with open('init_data.sql', 'r') as f:
                sql = f.read()
                c.executescript(sql)
                conn.commit()
            print("Initial data loaded successfully.")
        except sqlite3.Error as e:
            print(f"Error loading initial data: {e}")
            conn.rollback() # Rollback changes if error occurs
        except FileNotFoundError:
            print("Error: init_data.sql not found.")
    
    conn.close()

def generate_data_source_id(data):
    """
    Generate a unique ID based on the data fields.
    Format: {L2_PREFIX}-{INSTITUTION}-{YEAR}[-{COUNTER}]
    Example: OMIC-NIPH-2023
    """
    # Extract Level 2 prefix (first 4 letters uppercase)
    # data tuple indices need adjustment based on the new structure passed to add_data_point
    # Assuming the order in add_data_point's execute call:
    # (data_source_id, resource_type, category, subcategory, data_type, level5, year_start, year_end, data_format, ...)
    # category is at index 2
    category_prefix = data[2][:4].upper() if data[2] else "DATA" # Use L2 (category)

    # Extract year from year_end (index 7) or last_updated (index 13) as fallback
    year = str(data[7]) if data[7] else (data[13].split('-')[0] if data[13] else "YYYY")

    # Extract institution from metadata (index 15)
    institution = "UNKNOWN"
    try:
        metadata = json.loads(data[15]) # Adjusted index
        institution = metadata.get('institution', 'UNKNOWN').upper().replace(" ", "")[:4]
    except (json.JSONDecodeError, TypeError):
        pass # Keep UNKNOWN if metadata is invalid or missing

    # Generate base ID
    base_id = f"{category_prefix}-{institution}-{year}"
    data_source_id = base_id

    # Check if ID exists, append number if needed
    conn = get_db()
    c = conn.cursor()
    counter = 1
    while True:
        c.execute('SELECT 1 FROM data_points WHERE data_source_id = ?', (data_source_id,))
        if not c.fetchone():
            break
        data_source_id = f"{base_id}-{counter}"
        counter += 1
    
    conn.close()
    return data_source_id

def check_duplicate_entry(data):
    """
    Check if a similar entry already exists based on key fields.
    Using repository_url as a strong indicator of duplication.
    """
    conn = get_db()
    c = conn.cursor()
    
    # Check for duplicate based on repository_url
    # Indices adjusted for assumed data tuple order: repository_url is index 11
    c.execute('SELECT 1 FROM data_points WHERE repository_url = ?', (data[11],)) # Adjusted index
    
    exists = c.fetchone() is not None
    conn.close()
    return exists

def add_data_point(data):
    """Add a new data point with auto-generated ID and year range"""
    # The input 'data' tuple structure is assumed to be:
    # (None, resource_type, category, subcategory, data_type, level5, year_start, year_end, data_format,
    #  data_resolution, repository, repository_url, data_description, keywords,
    #  last_updated, contact_information, metadata, country, domain)
    # Indices:   1           2          3            4          5        6           7          8
    #            9              10          11             12                 13
    #            14             15                  16         17       18

    if check_duplicate_entry(data):
        print(f"Warning: Duplicate entry detected based on repository_url: {data[11]}")
        return None

    # Generate unique ID
    id_gen_data = (
        None, None, data[2], None, None, None, None, data[7], None, None, None, None, None,
        data[14], None, data[16]
    )
    data_source_id = generate_data_source_id(id_gen_data)

    # Create new data tuple matching the table columns
    # Ensure None is used for potentially missing hierarchy levels
    new_data = (
        data_source_id,
        data[1],  # resource_type (required)
        data[2] or None,  # category
        data[3] or None,  # subcategory
        data[4] or None,  # data_type
        data[5] or None,  # level5
        data[6],  # year_start (required)
        data[7],  # year_end (required)
        data[8] or 'Unknown',  # data_format (default if None)
        data[9] or 'Unknown',  # data_resolution (default if None)
        data[10], # repository (required)
        data[11], # repository_url (required)
        data[12], # data_description (required)
        data[13] or None, # keywords
        data[14], # last_updated (required)
        data[15] or None, # contact_information
        data[16] or '{}', # metadata (default if None)
        data[17], # country (required)
        data[18]  # domain (required)
    )

    conn = get_db()
    c = conn.cursor()
    try:
        # Updated INSERT statement to match the refined column list and order
        c.execute('''INSERT INTO data_points (
                        data_source_id, resource_type, category, subcategory, data_type, level5,
                        year_start, year_end, data_format, data_resolution, repository, repository_url,
                        data_description, keywords, last_updated, contact_information, metadata,
                        country, domain
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''', new_data)
        conn.commit()
        print(f"Added data point with ID: {data_source_id}")
    except sqlite3.IntegrityError as e:
         print(f"Error adding data point (IntegrityError, possibly duplicate data_source_id '{data_source_id}'): {e}")
         conn.rollback()
         return None
    except sqlite3.Error as e:
         print(f"Error adding data point: {e}")
         conn.rollback()
         return None
    finally:
        conn.close()

    return data_source_id

def get_all_data_points():
    conn = get_db()
    c = conn.cursor()
    # Select all columns including the new year columns
    c.execute('SELECT * FROM data_points ORDER BY created_at DESC')
    data_points = c.fetchall()
    conn.close()
    
    # Convert to list of dictionaries for easier access in templates
    result = []
    for point in data_points:
        point_dict = dict(point)
        # Parse metadata JSON
        try:
            if point_dict.get('metadata'):
                point_dict['metadata_obj'] = json.loads(point_dict['metadata'])
            else:
                 point_dict['metadata_obj'] = {}
        except json.JSONDecodeError:
             point_dict['metadata_obj'] = {} # Handle invalid JSON
        result.append(point_dict)
    
    return result

def get_main_categories():
    """Get the main categories from the structure_tree.yaml file"""
    try:
        with open('structure_tree.yaml', 'r') as file:
            data = yaml.safe_load(file)
            return data.get('main_categories', {})
    except FileNotFoundError:
        print("Error: structure_tree.yaml not found.")
        return {}
    except yaml.YAMLError as e:
        print(f"Error parsing structure_tree.yaml: {e}")
        return {}
        
def get_resource_type_hierarchy():
    """Get the resource type hierarchy from the structure_tree.yaml file"""
    try:
        with open('structure_tree.yaml', 'r') as file:
            data = yaml.safe_load(file)
            return data.get('Resource_type_hierarchy', {})
    except FileNotFoundError:
        print("Error: structure_tree.yaml not found.")
        return {}
    except yaml.YAMLError as e:
        print(f"Error parsing structure_tree.yaml: {e}")
        return {}

def get_data_point_by_id(data_id):
    """Get a single data point by ID"""
    conn = get_db()
    c = conn.cursor()
    c.execute('SELECT * FROM data_points WHERE id = ?', (data_id,))
    data_point = c.fetchone()
    conn.close()
    return data_point

def get_data_point_by_source_id(source_id):
    """Get a single data point by data_source_id"""
    conn = get_db()
    c = conn.cursor()
    c.execute('SELECT * FROM data_points WHERE data_source_id = ?', (source_id,))
    data_point = c.fetchone()
    conn.close()
    return data_point

def get_pending_submissions():
    """Get all pending submissions"""
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM pending_submissions WHERE status = 'pending' ORDER BY submitted_at ASC")
    submissions = c.fetchall()
    conn.close()
    return [dict(row) for row in submissions] # Return as list of dicts

def get_pending_submission_by_id(submission_id):
    """Get a single pending submission by its ID"""
    conn = get_db()
    c = conn.cursor()
    c.execute('SELECT * FROM pending_submissions WHERE submission_id = ?', (submission_id,))
    submission = c.fetchone()
    conn.close()
    return dict(submission) if submission else None # Return as dict or None

def update_pending_submission_status(submission_id, status):
    """Update the status of a pending submission"""
    conn = get_db()
    c = conn.cursor()
    try:
        c.execute('UPDATE pending_submissions SET status = ? WHERE submission_id = ?', (status, submission_id))
        conn.commit()
        print(f"Updated submission {submission_id} status to {status}")
        return True
    except sqlite3.Error as e:
        print(f"Error updating submission status: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

def delete_pending_submission(submission_id):
    """Delete a pending submission (e.g., after approval or rejection)"""
    conn = get_db()
    c = conn.cursor()
    try:
        c.execute('DELETE FROM pending_submissions WHERE submission_id = ?', (submission_id,))
        conn.commit()
        print(f"Deleted submission {submission_id}")
        return True
    except sqlite3.Error as e:
        print(f"Error deleting submission: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

def add_pending_submission(submission_data):
    """Add a new pending submission to the database."""
    conn = get_db()
    c = conn.cursor()
    try:
        # Ensure the keys in submission_data match the column names
        # The order in the VALUES clause must match the order of columns listed
        c.execute('''INSERT INTO pending_submissions (
                        resource_name, countries, domains, primary_hierarchy_path, year_start, year_end,
                        resource_url, contact_info, description, related_metadata, related_resources,
                        keywords, license, submitter_info
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''', # Added one placeholder
                  (
                      submission_data.get('resource_name'), # <<< ADDED
                      submission_data.get('countries'),
                      submission_data.get('domains'),
                      submission_data.get('primary_hierarchy_path'),
                      submission_data.get('year_start'),
                      submission_data.get('year_end'),
                      submission_data.get('resource_url'),
                      submission_data.get('contact_info'),
                      submission_data.get('description'),
                      submission_data.get('related_metadata'),
                      submission_data.get('related_resources'), # <<< ADDED
                      submission_data.get('keywords'),
                      submission_data.get('license'),
                      submission_data.get('submitter_info')
                  ))
        conn.commit()
        submission_id = c.lastrowid # Get the ID of the inserted row
        print(f"Added pending submission with ID: {submission_id}")
        return submission_id
    except sqlite3.Error as e:
        print(f"Error adding pending submission: {e}")
        conn.rollback()
        return None # Indicate failure
    finally:
        conn.close()
