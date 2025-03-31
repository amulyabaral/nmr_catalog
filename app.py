from flask import Flask, render_template, request, redirect, url_for, jsonify
import yaml
import json
from database import init_db, add_data_point, get_all_data_points, load_initial_data, get_main_categories, get_resource_type_hierarchy, get_data_point_by_id, get_db
import random # Import random for color generation

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

# --- Helper function to generate distinct colors ---
def generate_color(seed_string):
    """Generates a somewhat consistent color based on a string."""
    random.seed(seed_string)
    r = random.randint(50, 200)
    g = random.randint(50, 200)
    b = random.randint(50, 200)
    return f'rgb({r},{g},{b})'

# --- Define shapes for domains ---
DOMAIN_SHAPES = {
    'Human': 'dot',
    'Animal': 'square',
    'Environment': 'triangle',
    # Add more if needed, or a default
    'default': 'ellipse'
}

@app.route('/')
def index():
    # data_points = get_all_data_points() # No longer needed directly here if fetched by JS
    return render_template('index.html', vocabularies=VOCABULARIES) # Pass vocabularies

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
            
            # Get related entity
            related_entity = request.form.get('related_entity', '')
            
            # Use the first country as primary for database storage
            # (we'll store the others in metadata)
            primary_country = countries[0] if countries else ""
            
            # Create metadata JSON
            metadata = {
                'title': request.form.get('resource_name', ''),
                'countries': countries,
                'domains': domains,
                'years': years,
                'version': ', '.join(years),  # Use years as version
                'related_entity': related_entity
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

@app.route('/api/filter-resources', methods=['POST'])
def filter_resources():
    filters = request.json
    
    # Build the SQL query based on filters
    query = """
        SELECT * FROM data_points WHERE 1=1
    """
    params = []
    
    if filters.get('countries'):
        query += " AND country IN (" + ",".join(["?"] * len(filters['countries'])) + ")"
        params.extend(filters['countries'])
        
    if filters.get('domains'):
        query += " AND domain IN (" + ",".join(["?"] * len(filters['domains'])) + ")"
        params.extend(filters['domains'])
        
    if filters.get('resourceTypes'):
        query += " AND resource_type IN (" + ",".join(["?"] * len(filters['resourceTypes'])) + ")"
        params.extend(filters['resourceTypes'])
    
    # Execute query
    conn = get_db()
    cur = conn.execute(query, params)
    results = cur.fetchall()
    conn.close() # Close connection
    
    # Convert results to list of dictionaries
    return jsonify([dict(row) for row in results])

@app.route('/api/resource/<resource_id>')
def get_resource(resource_id):
    conn = get_db() # Get connection
    cur = conn.execute('SELECT * FROM data_points WHERE data_source_id = ?', [resource_id])
    result = cur.fetchone()
    conn.close() # Close connection
    
    if result is None:
        return jsonify({'error': 'Resource not found'}), 404
        
    return jsonify(dict(result))

# --- New route for network data ---
@app.route('/api/network-data')
def get_network_data():
    conn = get_db()
    cur = conn.cursor()
    cur.execute('SELECT * FROM data_points')
    data_points = cur.fetchall()
    conn.close()

    nodes = []
    edges = []
    added_nodes = set() # Keep track of added category nodes

    # Define colors for countries
    country_colors = {country: generate_color(country) for country in VOCABULARIES['main_categories'].get('Country', [])}
    default_country_color = '#999999'

    for point in data_points:
        point_dict = dict(point)
        metadata = {}
        if point_dict.get('metadata'):
            try:
                metadata = json.loads(point_dict['metadata'])
            except json.JSONDecodeError:
                pass # Ignore if metadata is invalid JSON

        node_id = f"dp_{point_dict['data_source_id']}"
        label = metadata.get('title', point_dict['data_source_id'])
        country = point_dict.get('country')
        domain = point_dict.get('domain')
        resource_type = point_dict.get('resource_type')
        category = point_dict.get('category')
        subcategory = point_dict.get('subcategory')

        # --- Add Data Point Node ---
        node_color = country_colors.get(country, default_country_color)
        node_shape = DOMAIN_SHAPES.get(domain, DOMAIN_SHAPES['default'])
        tooltip = f"<b>{label}</b><br>Type: {resource_type}<br>Country: {country}<br>Domain: {domain}<br>Category: {category}"

        nodes.append({
            'id': node_id,
            'label': label,
            'title': tooltip,
            'group': 'data_point', # General group for data points
            'color': node_color,
            'shape': node_shape,
            'size': 15 # Base size for data points
        })

        # --- Add Category Nodes and Edges ---
        categories_to_link = {
            'country': country,
            'domain': domain,
            'resource_type': resource_type,
            'category': category,
            'subcategory': subcategory
        }

        for cat_type, cat_value in categories_to_link.items():
            if cat_value: # Only add if value exists
                cat_node_id = f"{cat_type}_{cat_value.replace(' ', '_').lower()}"

                # Add category node if not already added
                if cat_node_id not in added_nodes:
                    cat_label = cat_value.replace('_', ' ')
                    cat_shape = 'ellipse' # Default shape for category nodes
                    cat_color = '#CCCCCC' # Default color
                    cat_size = 10 # Smaller size for category nodes

                    if cat_type == 'country':
                        cat_color = country_colors.get(cat_value, default_country_color)
                        cat_shape = 'hexagon'
                        cat_size = 12
                    elif cat_type == 'domain':
                        cat_color = '#FFA500' # Orange for domain
                        cat_shape = DOMAIN_SHAPES.get(cat_value, DOMAIN_SHAPES['default'])
                        cat_size = 12
                    elif cat_type == 'resource_type':
                        cat_color = '#87CEEB' # Sky blue for resource type
                        cat_shape = 'database'
                    elif cat_type == 'category':
                        cat_color = '#90EE90' # Light green for category
                    elif cat_type == 'subcategory':
                        cat_color = '#FFB6C1' # Light pink for subcategory

                    nodes.append({
                        'id': cat_node_id,
                        'label': cat_label,
                        'title': f"{cat_type.replace('_', ' ').title()}: {cat_label}",
                        'group': f"{cat_type}_node",
                        'color': cat_color,
                        'shape': cat_shape,
                        'size': cat_size
                    })
                    added_nodes.add(cat_node_id)

                # Add edge from data point to category node
                edges.append({
                    'from': node_id,
                    'to': cat_node_id,
                    'arrows': 'to',
                    'length': 150 # Adjust edge length as needed
                })

    return jsonify({'nodes': nodes, 'edges': edges})

if __name__ == '__main__':
    app.run(debug=True)
