import sqlite3
import os

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

# Update other functions to use DB_PATH
def add_data_point(data):
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
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''', data)
    conn.commit()
    conn.close()

def get_all_data_points():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT * FROM data_points ORDER BY created_at DESC')
    data_points = c.fetchall()
    conn.close()
    return data_points
