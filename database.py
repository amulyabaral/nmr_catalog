import sqlite3
import os
import json
import yaml

# Define database path
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'amr.db')

def get_db():
    """Get a database connection"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # This allows accessing columns by name
    return conn

# Create database and tables
def init_db():
    """Initialize the database with tables"""
    # Ensure the directory exists
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    
    conn = get_db()
    c = conn.cursor()

    # Drop the table if it exists to apply schema changes (Use with caution in production!)
    # For development, this ensures the new schema is applied cleanly.
    # In production, you would use ALTER TABLE.
    c.execute('DROP TABLE IF EXISTS data_points')

    # Create enhanced data points table with level columns
    c.execute('''CREATE TABLE IF NOT EXISTS data_points (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    data_source_id TEXT NOT NULL UNIQUE, -- Made unique for better ID generation
                    resource_type TEXT NOT NULL,        -- Level 1 from YAML
                    category TEXT NOT NULL,             -- Level 2 from YAML
                    subcategory TEXT NOT NULL,          -- Level 3 from YAML
                    data_type TEXT,                     -- Level 4 from YAML (can be NULL if hierarchy stops at L3)
                    level5 TEXT,                        -- Level 5 from YAML (can be NULL)
                    data_format TEXT,                   -- File format
                    data_resolution TEXT NOT NULL,      -- From metadata_keys (or could be derived)
                    repository TEXT NOT NULL,
                    repository_url TEXT NOT NULL,
                    data_description TEXT NOT NULL,
                    keywords TEXT NOT NULL,
                    last_updated DATE NOT NULL,
                    contact_information TEXT NOT NULL,
                    metadata JSON,                      -- Additional metadata as JSON
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    country TEXT NOT NULL,              -- Main category: Country
                    domain TEXT NOT NULL                -- Main category: Domain
                    -- Removed redundant resource_type, category, subcategory, data_type if strictly mapping levels
                    -- Keeping them for now as they are used elsewhere, but ensure they match L1-L4
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
    # (data_source_id, resource_type, category, subcategory, data_type, level5, data_format, ...)
    # category is at index 2
    category_prefix = data[2][:4].upper() if data[2] else "DATA" # Use L2 (category)

    # Extract year from last_updated (index 11)
    year = data[11].split('-')[0] if data[11] else "YYYY"

    # Extract institution from metadata (index 13)
    institution = "UNKNOWN"
    try:
        metadata = json.loads(data[13])
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
    # Indices adjusted for assumed data tuple order: repository_url is index 9
    c.execute('SELECT 1 FROM data_points WHERE repository_url = ?', (data[9],))
    
    exists = c.fetchone() is not None
    conn.close()
    return exists

def add_data_point(data):
    """Add a new data point with auto-generated ID"""
    # The input 'data' tuple structure is assumed to be:
    # (None, resource_type, category, subcategory, data_type, level5, data_format,
    #  data_resolution, repository, repository_url, data_description, keywords,
    #  last_updated, contact_information, metadata, country, domain)
    # Indices:   1           2          3            4          5        6
    #            7              8           9              10                 11
    #            12             13                  14         15       16

    # Check for duplicates first (using adjusted index for repository_url)
    if check_duplicate_entry(data):
        # Consider logging this instead of raising an error that stops the app
        print(f"Warning: Duplicate entry detected based on repository_url: {data[9]}")
        # raise ValueError("A similar entry already exists in the database based on URL")
        return None # Indicate failure without crashing

    # Generate unique ID (pass the relevant parts of the data tuple)
    # Need category (idx 2), last_updated (idx 12), metadata (idx 14)
    id_gen_data = (
        None, None, data[2], None, None, None, None, None, None, None, None, None,
        data[12], None, data[14]
    )
    data_source_id = generate_data_source_id(id_gen_data)


    # Create new data tuple with generated ID, matching the table columns
    # Order: data_source_id, resource_type, category, subcategory, data_type, level5, data_format, ...
    new_data = (
        data_source_id, data[1], data[2], data[3], data[4], data[5], data[6],
        data[7], data[8], data[9], data[10], data[11], data[12], data[13],
        data[14], data[15], data[16]
    )

    conn = get_db()
    c = conn.cursor()
    try:
        c.execute('''INSERT INTO data_points (
                        data_source_id, resource_type, category, subcategory, data_type, level5,
                        data_format, data_resolution, repository, repository_url, data_description,
                        keywords, last_updated, contact_information, metadata, country, domain
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''', new_data)
        conn.commit()
        print(f"Added data point with ID: {data_source_id}")
    except sqlite3.IntegrityError as e:
         print(f"Error adding data point (IntegrityError, possibly duplicate data_source_id '{data_source_id}'): {e}")
         conn.rollback()
         return None # Indicate failure
    except sqlite3.Error as e:
         print(f"Error adding data point: {e}")
         conn.rollback()
         return None # Indicate failure
    finally:
        conn.close()

    return data_source_id

def get_all_data_points():
    conn = get_db()
    c = conn.cursor()
    # Select all columns including the new level5
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
    """Get the main categories from the _reusables.yaml file"""
    try:
        with open('_reusables.yaml', 'r') as file:
            data = yaml.safe_load(file)
            return data.get('main_categories', {})
    except FileNotFoundError:
        print("Error: _reusables.yaml not found.")
        return {}
    except yaml.YAMLError as e:
        print(f"Error parsing _reusables.yaml: {e}")
        return {}
        
def get_resource_type_hierarchy():
    """Get the resource type hierarchy from the _reusables.yaml file"""
    try:
        with open('_reusables.yaml', 'r') as file:
            data = yaml.safe_load(file)
            return data.get('Resource_type_hierarchy', {})
    except FileNotFoundError:
        print("Error: _reusables.yaml not found.")
        return {}
    except yaml.YAMLError as e:
        print(f"Error parsing _reusables.yaml: {e}")
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
