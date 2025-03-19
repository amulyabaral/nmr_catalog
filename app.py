from flask import Flask, render_template, request, redirect, url_for, jsonify
import yaml
import json
from database import init_db, add_data_point, get_all_data_points, load_initial_data

app = Flask(__name__)

# Initialize database at startup
init_db()
load_initial_data()

def load_vocabularies():
    with open('_reusables.yaml', 'r') as file:
        data = yaml.safe_load(file)
        return {
            'data_types': data.get('data_types', {}),
            'metadata_keys': data.get('metadata_keys', []),
            'resolutions': data.get('resolutions', []),  # Fixed from using metadata_keys
            'repositories': data.get('repositories', []),  # Fixed from using metadata_keys
            'common_formats': data.get('common_formats', {}),
            'tags': data.get('tags', {}),
            'countries': data.get('countries', [])
        }

# Cache vocabularies at startup
VOCABULARIES = load_vocabularies()

@app.route('/')
def index():
    data_points = get_all_data_points()
    return render_template('index.html', data_points=data_points, vocabularies=VOCABULARIES)

@app.route('/add', methods=['GET', 'POST'])
def add_data():
    if request.method == 'POST':
        # Parse the hierarchical data type selection
        data_type_parts = request.form['data_type'].split(' - ')
        category = data_type_parts[0]
        subcategory = data_type_parts[1] if len(data_type_parts) > 1 else ''
        specific_type = data_type_parts[2] if len(data_type_parts) > 2 else ''

        # Create metadata JSON
        metadata = {
            'title': request.form.get('title', ''),
            'creator': request.form.get('creator', ''),
            'institution': request.form.get('institution', ''),
            'geographic_coverage': request.form.get('geographic_coverage', ''),
            'license': request.form.get('license', ''),
            'version': request.form.get('version', ''),
            'documentation_link': request.form.get('documentation_link', ''),
            'research_area': request.form.get('research_area', '')
        }

        data = (
            request.form['data_source_id'],
            category,
            subcategory,
            specific_type,
            request.form.get('data_format', ''),
            request.form['data_resolution'],
            request.form['repository'],
            request.form['repository_url'],
            request.form['data_description'],
            request.form['keywords'],
            request.form['last_updated'],
            request.form['contact_information'],
            json.dumps(metadata)
        )
        
        add_data_point(data)
        return redirect(url_for('index'))
    
    return render_template('add_data.html', vocabularies=VOCABULARIES)

@app.route('/api/data-types')
def get_data_types():
    """API endpoint to get the hierarchical data types"""
    return jsonify(VOCABULARIES['data_types'])

if __name__ == '__main__':
    app.run(debug=True)
