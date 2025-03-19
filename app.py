from flask import Flask, render_template, request, redirect, url_for
import yaml
import sqlite3
from database import init_db, add_data_point, get_all_data_points

app = Flask(__name__)

# Load controlled vocabularies from _reusables.yaml
def load_vocabularies():
    with open('_reusables.yaml', 'r') as file:
        return yaml.safe_load(file)

vocabularies = load_vocabularies()

# Homepage: Browse data
@app.route('/')
def index():
    data_points = get_all_data_points()
    return render_template('index.html', data_points=data_points, vocabularies=vocabularies)

# Add new data point
@app.route('/add', methods=['GET', 'POST'])
def add_data():
    if request.method == 'POST':
        data = (
            request.form['data_source_id'],
            request.form['data_type'],
            request.form['data_resolution'],
            request.form['repository'],
            request.form['repository_url'],
            request.form['data_description'],
            request.form['keywords'],
            request.form['last_updated'],
            request.form['contact_information']
        )
        add_data_point(data)
        return redirect(url_for('index'))
    return render_template('add_data.html', vocabularies=vocabularies)

if __name__ == '__main__':
    init_db()  # Initialize database
    app.run(debug=True)
