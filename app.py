from flask import Flask, render_template, request, redirect, url_for, jsonify
import yaml
import json
from database import init_db, add_data_point, get_all_data_points, load_initial_data, get_main_categories, get_resource_type_hierarchy, get_data_point_by_id

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
            # Get category, subcategory from form
            category = request.form.get('category', '')
            subcategory = request.form.get('subcategory', '')
            
            # Get main category selections
            countries = request.form.getlist('countries')  # Multiple countries
            domains = request.form.getlist('domains')      # Multiple domains
            resource_type = request.form.get('resource_type')  # Single resource type
            
            # Get years (multiple)
            years = request.form.getlist('years')
            
            # Use the first country as primary for database storage
            # (we'll store the others in metadata)
            primary_country = countries[0] if countries else ""
            
            # Create metadata JSON
            metadata = {
                'title': request.form.get('resource_name', ''),
                'countries': countries,
                'domains': domains,
                'years': years,
                'version': ', '.join(years)  # Use years as version
            }

            # Create data tuple without ID (it will be generated)
            data = (
                None,  # Placeholder for data_source_id
                category,
                subcategory,
                '',  # No data_type
                request.form.get('data_format', ''),
                'standard',  # Default data_resolution
                request.form.get('resource_name', ''),  # Use resource name as repository
                request.form.get('resource_url', ''),
                request.form.get('data_description', ''),
                request.form.get('keywords', ''),
                years[-1] + '-12-31' if years else '2023-12-31',  # Use last year as last_updated
                request.form.get('contact_information', ''),
                json.dumps(metadata),
                primary_country,
                domains[0] if domains else "",  # Use first domain as primary
                resource_type
            )
            
            add_data_point(data)
            return redirect(url_for('index'))
            
        except ValueError as e:
            return render_template('add_data.html', 
                                vocabularies=VOCABULARIES, 
                                error=str(e))
        except IndexError:
            return render_template('add_data.html',
                                vocabularies=VOCABULARIES,
                                error="Please select at least one country and domain")
    
    return render_template('add_data.html', vocabularies=VOCABULARIES)

@app.route('/api/resource-hierarchy')
def get_resource_hierarchy():
    """API endpoint to get the resource type hierarchy"""
    return jsonify(VOCABULARIES['resource_type_hierarchy'])

@app.route('/api/main-categories')
def get_categories():
    """API endpoint to get the main categories"""
    return jsonify(VOCABULARIES['main_categories'])

@app.route('/api/data-point/<int:data_id>')
def get_data_point(data_id):
    """API endpoint to get a single data point"""
    data_point = get_data_point_by_id(data_id)
    if data_point:
        # Convert to dictionary for JSON serialization
        result = dict(data_point)
        # Parse metadata JSON
        if result['metadata']:
            result['metadata'] = json.loads(result['metadata'])
        return jsonify(result)
    return jsonify({"error": "Data point not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)
