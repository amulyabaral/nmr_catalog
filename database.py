import sqlite3
import os

# Define database path
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'amr.db')

# Create database and tables
def init_db():
    # Ensure the directory exists
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # Create data points table
    c.execute('''CREATE TABLE IF NOT EXISTS data_points (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    data_source_id TEXT,
                    data_type TEXT,
                    data_resolution TEXT,
                    repository TEXT,
                    repository_url TEXT,
                    data_description TEXT,
                    keywords TEXT,
                    last_updated TEXT,
                    contact_information TEXT
                )''')

    conn.commit()
    conn.close()

# Update other functions to use DB_PATH
def add_data_point(data):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''INSERT INTO data_points (
                    data_source_id,
                    data_type,
                    data_resolution,
                    repository,
                    repository_url,
                    data_description,
                    keywords,
                    last_updated,
                    contact_information
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''', data)
    conn.commit()
    conn.close()

def get_all_data_points():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT * FROM data_points')
    data_points = c.fetchall()
    conn.close()
    return data_points
