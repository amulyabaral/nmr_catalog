import sqlite3
import os
import json

# Define database path
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'amr.db')

# Create database and tables
def init_db():
    """Initialize the database with tables"""
    # Ensure the directory exists
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # Create enhanced data points table
    c.execute('''CREATE TABLE IF NOT EXISTS data_points (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    data_source_id TEXT NOT NULL,
                    category TEXT NOT NULL,           -- Top level category (genomic, population, etc.)
                    subcategory TEXT NOT NULL,        -- Second level (wgs, metagenomic, etc.)
                    data_type TEXT,                   -- Specific data type
                    data_format TEXT,                 -- File format
                    data_resolution TEXT NOT NULL,    -- From metadata_keys
                    repository TEXT NOT NULL,
                    repository_url TEXT NOT NULL,
                    data_description TEXT NOT NULL,
                    keywords TEXT NOT NULL,
                    last_updated DATE NOT NULL,
                    contact_information TEXT NOT NULL,
                    metadata JSON,                    -- Additional metadata as JSON
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )''')

    conn.commit()
    conn.close()

def load_initial_data():
    """Load initial data from SQL file if database is empty"""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Check if database is empty
    c.execute('SELECT COUNT(*) FROM data_points')
    count = c.fetchone()[0]
    
    if count == 0:
        # Load and execute initial data SQL file
        with open('init_data.sql', 'r') as f:
            sql = f.read()
            c.executescript(sql)
            conn.commit()
    
    conn.close()

def generate_data_source_id(data):
    """
    Generate a unique ID based on the data fields.
    Format: {CATEGORY}-{INSTITUTION}-{YEAR}
    Example: CLIN-NIPH-2023
    """
    # Extract category prefix (first 4 letters uppercase)
    category_prefix = data[1][:4].upper()
    
    # Extract year from last_updated
    year = data[10].split('-')[0]
    
    # Extract institution from metadata
    metadata = json.loads(data[12])
    institution = metadata.get('institution', '').upper()
    
    # Generate ID
    data_source_id = f"{category_prefix}-{institution}-{year}"
    
    # Check if ID exists, append number if needed
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    base_id = data_source_id
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
    Check if a similar entry already exists based on key fields
    """
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Check for duplicate based on category, subcategory, repository_url, and last_updated
    c.execute('''
        SELECT 1 FROM data_points 
        WHERE category = ? 
        AND subcategory = ? 
        AND repository_url = ? 
        AND last_updated = ?
    ''', (data[1], data[2], data[7], data[10]))
    
    exists = c.fetchone() is not None
    conn.close()
    return exists

def add_data_point(data):
    """Add a new data point with auto-generated ID"""
    # Check for duplicates first
    if check_duplicate_entry(data):
        raise ValueError("A similar entry already exists in the database")
    
    # Generate unique ID
    data_source_id = generate_data_source_id(data)
    
    # Create new data tuple with generated ID
    new_data = (data_source_id,) + data[1:]
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''INSERT INTO data_points (
                    data_source_id,
                    category,
                    subcategory,
                    data_type,
                    data_format,
                    data_resolution,
                    repository,
                    repository_url,
                    data_description,
                    keywords,
                    last_updated,
                    contact_information,
                    metadata
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''', new_data)
    conn.commit()
    conn.close()
    return data_source_id

def get_all_data_points():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT * FROM data_points ORDER BY created_at DESC')
    data_points = c.fetchall()
    conn.close()
    return data_points
