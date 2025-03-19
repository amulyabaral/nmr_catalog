import sqlite3

# Create database and tables
def init_db():
    conn = sqlite3.connect('amr.db')
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

# Insert a new data point
def add_data_point(data):
    conn = sqlite3.connect('amr.db')
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

# Fetch all data points
def get_all_data_points():
    conn = sqlite3.connect('amr.db')
    c = conn.cursor()
    c.execute('SELECT * FROM data_points')
    data_points = c.fetchall()
    conn.close()
    return data_points
