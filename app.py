from flask import Flask, render_template, request, redirect, url_for, jsonify
import yaml
import json
from database import init_db, add_data_point, get_all_data_points, load_initial_data, get_main_categories, get_resource_type_hierarchy

app = Flask(__name__)

# Initialize database at startup
init_db()
load_initial_data()

def load_vocabularies():
    with open('_reusables.yaml', 'r') as file:
        data = yaml.safe_load(file)
        return {
            'main_categories': data.get('main_categories', {}),
            'resource_type_hierarchy': data.get('Resource_type_hierarchy', {})
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
        try:
            # Get category, subcategory, and data_type from form
            category = request.form.get('category', '')
            subcategory = request.form.get('subcategory', '')
            data_type = request.form.get('data_type', '')

            # Get main category selections
            country = request.form['country']
            domain = request.form['domain']
            resource_type = request.form['resource_type']

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

            # Create data tuple without ID (it will be generated)
            data = (
                None,  # Placeholder for data_source_id
                category,
                subcategory,
                data_type,
                request.form.get('data_format', ''),
                request.form.get('data_resolution', 'standard'),
                request.form['repository'],
                request.form['repository_url'],
                request.form['data_description'],
                request.form['keywords'],
                request.form['last_updated'],
                request.form['contact_information'],
                json.dumps(metadata),
                country,
                domain,
                resource_type
            )
            
            add_data_point(data)
            return redirect(url_for('index'))
            
        except ValueError as e:
            return render_template('add_data.html', 
                                vocabularies=VOCABULARIES, 
                                error=str(e))
    
    return render_template('add_data.html', vocabularies=VOCABULARIES)

@app.route('/api/resource-hierarchy')
def get_resource_hierarchy():
    """API endpoint to get the resource type hierarchy"""
    return jsonify(VOCABULARIES['resource_type_hierarchy'])

@app.route('/api/main-categories')
def get_categories():
    """API endpoint to get the main categories"""
    return jsonify(VOCABULARIES['main_categories'])

if __name__ == '__main__':
    app.run(debug=True)
