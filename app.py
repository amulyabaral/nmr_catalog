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
    'default': 'ellipse'
}

# --- Define Country Flags and Colors (Pastel Palette) ---
COUNTRY_INFO = {
    "Denmark": {"flag": "🇩🇰", "color": "#FFB6B6"}, # Pastel Red
    "Norway": {"flag": "🇳🇴", "color": "#AEC6CF"}, # Pastel Blue
    "Sweden": {"flag": "🇸🇪", "color": "#FDFD96"}, # Pastel Yellow
    "Finland": {"flag": "🇫🇮", "color": "#B3E2CD"}, # Pastel Green
    "default": {"flag": "🏳️", "color": "#E0E0E0"}  # Light Grey for others
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

# --- Function to generate consistent node IDs for hierarchy ---
def get_hierarchy_node_id(level, name):
    """Generates a consistent node ID for hierarchy levels."""
    # Replace spaces and special chars for cleaner IDs
    clean_name = ''.join(e for e in name if e.isalnum() or e == '_').lower()
    return f"L{level}_{clean_name}"

# --- Updated route for Network Data (Physics-based) ---
@app.route('/api/network-data')
def get_network_data():
    nodes = []
    edges = []
    added_nodes = set() # Keep track of added node IDs
    base_font_size = 16 # Increased base font size

    # 1. Load Hierarchy Definition
    hierarchy_definition = VOCABULARIES.get('resource_type_hierarchy', {})
    if not hierarchy_definition:
        return jsonify({"error": "Resource hierarchy not found in vocabularies"}), 500

    # --- Helper Function to Recursively Build Hierarchy Nodes/Edges ---
    def process_hierarchy_level(level_data, parent_node_id, current_level):
        if current_level > 5: # Limit recursion depth
            return

        for key, details in level_data.items():
            # Skip metadata keys like 'level', 'title' if they are siblings to actual categories
            if key in ['level', 'title']:
                continue
            if not isinstance(details, dict): # Ensure details is a dictionary
                 print(f"Skipping invalid hierarchy entry: {key} (details not a dict)")
                 continue

            node_name = key # The key is the name (e.g., 'omics_data')
            node_id = get_hierarchy_node_id(current_level, node_name)
            node_label = details.get('title', node_name.replace('_', ' ').title())
            node_color = '#CCCCCC' # Default grey
            node_shape = 'ellipse'
            # Adjust size based on level (make less drastic change)
            node_size = 22 - (current_level * 2)
            node_mass = 5 - current_level # Mass influences physics layout

            # Assign colors/shapes based on level (customize as needed)
            if current_level == 1: # Resource Type
                node_color = '#87CEEB' # Sky Blue
                node_shape = 'database'
                node_size = 24
                node_mass = 10
            elif current_level == 2: # Category
                node_color = '#90EE90' # Light Green
                node_size = 20
                node_mass = 8
            elif current_level == 3: # Subcategory
                node_color = '#FFB6C1' # Light Pink
                node_size = 16
                node_mass = 6
            elif current_level == 4: # Data Type
                node_color = '#FFD700' # Gold
                node_size = 14
                node_mass = 4
            elif current_level == 5: # Item/Leaf
                node_color = '#FFA07A' # Light Salmon
                node_size = 12
                node_mass = 2

            # Add the hierarchy node if not already added
            if node_id not in added_nodes:
                nodes.append({
                    'id': node_id,
                    'label': node_label,
                    'title': f"Level {current_level}: {node_label}", # Tooltip indicates level
                    'group': f"level_{current_level}",
                    'color': node_color,
                    'shape': node_shape,
                    'size': node_size,
                    'mass': node_mass,
                    'font': {'size': base_font_size} # Apply base font size
                })
                added_nodes.add(node_id)

            # Add edge from parent to this node
            if parent_node_id:
                edges.append({
                    'from': parent_node_id,
                    'to': node_id,
                    # 'arrows': 'to', # << REMOVED ARROWS
                    'length': 100 + (current_level * 10), # Length influences physics layout
                    'color': {'color': '#e0e0e0', 'highlight': '#d0d0d0', 'hover': '#d0d0d0'}
                })

            # Recurse for sub_categories
            if 'sub_categories' in details and isinstance(details['sub_categories'], dict):
                process_hierarchy_level(details['sub_categories'], node_id, current_level + 1)

            # Process items as Level 5 leaves
            if 'items' in details and isinstance(details['items'], list):
                 item_level = current_level + 1
                 if item_level <= 5:
                    for item in details['items']:
                        item_name = None
                        if isinstance(item, str):
                            item_name = item
                        elif isinstance(item, dict) and 'name' in item:
                            item_name = item['name']

                        if item_name:
                            item_id = get_hierarchy_node_id(item_level, item_name)
                            item_label = item_name.replace('_', ' ').title()
                            item_color = '#FFA07A' # Light Salmon for L5
                            item_shape = 'ellipse'
                            item_size = 12 # Slightly larger L5
                            item_mass = 2

                            if item_id not in added_nodes:
                                nodes.append({
                                    'id': item_id,
                                    'label': item_label,
                                    'title': f"Level {item_level}: {item_label}",
                                    'group': f"level_{item_level}",
                                    'color': item_color,
                                    'shape': item_shape,
                                    'size': item_size,
                                    'mass': item_mass,
                                    'font': {'size': base_font_size - 2} # Slightly smaller font for L5
                                })
                                added_nodes.add(item_id)

                            # Add edge from parent (current node) to item node
                            edges.append({
                                'from': node_id, # Edge from the category that contains the items
                                'to': item_id,
                                # 'arrows': 'to', # << REMOVED ARROWS
                                'length': 150,
                                'color': {'color': '#e0e0e0', 'highlight': '#d0d0d0', 'hover': '#d0d0d0'}
                            })


    # 2. Build Hierarchy Nodes and Edges by processing Level 1
    process_hierarchy_level(hierarchy_definition, None, 1)

    # 3. Fetch Data Points
    conn = get_db()
    cur = conn.cursor()
    # Select columns needed for linking and display
    cur.execute('SELECT id, data_source_id, resource_type, category, subcategory, data_type, level5, country, domain, metadata FROM data_points')
    data_points = cur.fetchall()
    conn.close()

    # Get country/domain info
    default_country_info = COUNTRY_INFO['default']

    # 4. Process Data Points and Connect to Hierarchy, Country, Domain
    for point in data_points:
        point_dict = dict(point)
        metadata = {}
        if point_dict.get('metadata'):
            try:
                metadata = json.loads(point_dict['metadata'])
            except json.JSONDecodeError:
                pass # Ignore invalid JSON

        # --- Determine the leaf hierarchy node ID for this data point ---
        leaf_hierarchy_node_id = None
        if point_dict.get('level5'):
            leaf_hierarchy_node_id = get_hierarchy_node_id(5, point_dict['level5'])
        elif point_dict.get('data_type'):
            leaf_hierarchy_node_id = get_hierarchy_node_id(4, point_dict['data_type'])
        elif point_dict.get('subcategory'):
            leaf_hierarchy_node_id = get_hierarchy_node_id(3, point_dict['subcategory'])
        elif point_dict.get('category'):
            leaf_hierarchy_node_id = get_hierarchy_node_id(2, point_dict['category'])
        elif point_dict.get('resource_type'):
            leaf_hierarchy_node_id = get_hierarchy_node_id(1, point_dict['resource_type'])

        # Ensure the determined hierarchy node actually exists from step 2
        if leaf_hierarchy_node_id and leaf_hierarchy_node_id not in added_nodes: # Check if not None before checking set
             print(f"Warning: Hierarchy node '{leaf_hierarchy_node_id}' for data point '{point_dict['data_source_id']}' not found in processed hierarchy. Skipping hierarchy link.")
             leaf_hierarchy_node_id = None # Prevent edge creation to non-existent node


        # --- Add Data Point Node ---
        dp_node_id = f"dp_{point_dict['id']}" # Use DB primary key for uniqueness
        dp_label = metadata.get('title', point_dict['data_source_id'])
        country = point_dict.get('country')
        domain = point_dict.get('domain')
        country_info = COUNTRY_INFO.get(country, default_country_info)
        # Use country color for the data point fill, but add distinct border
        dp_fill_color = country_info['color']
        dp_border_color = '#555555' # Darker border for contrast
        dp_shape = 'dot'
        tooltip = f"<b>{dp_label}</b><br>ID: {point_dict['data_source_id']}<br>Country: {country}<br>Domain: {domain}<br>Type: {point_dict.get('resource_type', 'N/A')}"

        if dp_node_id not in added_nodes:
            nodes.append({
                'id': dp_node_id,
                'label': dp_label,
                'title': tooltip,
                'group': 'data_point',
                'shape': dp_shape,
                'size': 18, # Slightly larger data points
                'mass': 3,
                'font': {'size': base_font_size}, # Apply base font size
                # --- Styling for Data Points ---
                'color': {
                    'background': dp_fill_color, # Fill color based on country
                    'border': dp_border_color,   # Distinct border color
                    'highlight': {
                        'background': dp_fill_color,
                        'border': '#2B7CE9' # Standard highlight border color
                    },
                    'hover': {
                        'background': dp_fill_color,
                        'border': '#E04141' # Different hover border color
                    }
                },
                'borderWidth': 2, # Make border thicker than default
                'borderWidthSelected': 4 # Even thicker when selected
                # --- End Styling ---
            })
            added_nodes.add(dp_node_id)

        # --- Add Edge from Hierarchy Leaf to Data Point ---
        if leaf_hierarchy_node_id:
            edges.append({
                'from': leaf_hierarchy_node_id,
                'to': dp_node_id,
                # 'arrows': 'to', # REMOVED ARROWS
                'length': 80, # Shorter link from hierarchy to data point
                'color': {'color': '#c0c0c0', 'highlight': '#a0a0a0', 'hover': '#a0a0a0'}
            })

        # --- Add Country and Domain Nodes and Edges from Data Point ---
        # Country Node
        country_node_id = f"country_{country.replace(' ', '_').lower()}" if country else None
        if country_node_id:
            if country_node_id not in added_nodes:
                country_label = f"{country_info['flag']} {country}"
                nodes.append({
                    'id': country_node_id,
                    'label': country_label,
                    'title': f"Country: {country}",
                    'group': 'country_node',
                    'color': country_info['color'], # Use the pastel color
                    'shape': 'hexagon',
                    'size': 30, # Larger country nodes
                    'mass': 15,
                    'font': {'size': base_font_size + 2} # Larger font for countries
                })
                added_nodes.add(country_node_id)
            # Edge from Data Point to Country
            edges.append({
                'from': dp_node_id,
                'to': country_node_id,
                # 'arrows': 'to', # REMOVED ARROWS
                'length': 200, # Longer link to country
                'color': {'color': '#dddddd', 'highlight': '#848484', 'hover': '#848484'}
            })

        # Domain Node
        domain_node_id = f"domain_{domain.replace(' ', '_').lower()}" if domain else None
        if domain_node_id:
             if domain_node_id not in added_nodes:
                domain_shape = DOMAIN_SHAPES.get(domain, DOMAIN_SHAPES['default'])
                domain_color = '#FFDAB9' # Pastel Orange/Peach for domain
                nodes.append({
                    'id': domain_node_id,
                    'label': domain,
                    'title': f"Domain: {domain}",
                    'group': 'domain_node',
                    'color': domain_color,
                    'shape': domain_shape,
                    'size': 22, # Larger domain nodes
                    'mass': 8,
                    'font': {'size': base_font_size} # Apply base font size
                })
                added_nodes.add(domain_node_id)
             # Edge from Data Point to Domain
             edges.append({
                'from': dp_node_id,
                'to': domain_node_id,
                # 'arrows': 'to', # REMOVED ARROWS
                'length': 180, # Slightly shorter link to domain than country
                'color': {'color': '#dddddd', 'highlight': '#848484', 'hover': '#848484'}
             })


    return jsonify({'nodes': nodes, 'edges': edges})

if __name__ == '__main__':
    # Ensure DB is initialized when running directly
    init_db()
    load_initial_data()
    app.run(debug=True)
