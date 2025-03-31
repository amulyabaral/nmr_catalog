from flask import Flask, render_template, request, redirect, url_for, jsonify, flash, session # Added session
from dotenv import load_dotenv # Import dotenv
import yaml
import json
from database import (
    init_db, add_pending_submission, get_all_data_points, load_initial_data,
    get_main_categories, get_resource_type_hierarchy, get_data_point_by_id, get_db,
    get_pending_submissions, get_pending_submission_by_id, delete_pending_submission, # Added DB functions
    add_data_point, update_pending_submission_status # Added DB functions
)
import random # Import random for color generation
import os # Import os for secret key
import datetime # Needed for last_updated
from urllib.parse import urlparse # Needed for repository extraction
from functools import wraps # Needed for decorator

load_dotenv() # Load environment variables from .env file

app = Flask(__name__)
# Set a secret key for session management
app.secret_key = os.environ.get('FLASK_SECRET_KEY', os.urandom(24)) # Use env var or random bytes
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD') # Load admin password from env

# Initialize database at startup
init_db()
load_initial_data() # Load initial data into data_points if empty

def load_vocabularies():
    try:
        with open('structure_tree.yaml', 'r') as file:
            data = yaml.safe_load(file)
            return {
                'main_categories': data.get('main_categories', {}),
                'resource_type_hierarchy': data.get('Resource_type_hierarchy', {})
            }
    except FileNotFoundError:
        print("Error: structure_tree.yaml not found.")
        return {'main_categories': {}, 'resource_type_hierarchy': {}}
    except yaml.YAMLError as e:
        print(f"Error parsing structure_tree.yaml: {e}")
        return {'main_categories': {}, 'resource_type_hierarchy': {}}


# Cache vocabularies at startup
VOCABULARIES = load_vocabularies()

# --- Authentication Decorator ---
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('is_admin'):
            flash('Admin access required.', 'warning')
            return redirect(url_for('admin_login'))
        return f(*args, **kwargs)
    return decorated_function

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

# --- Updated Add Data Route ---
@app.route('/add', methods=['GET', 'POST'])
def add_data():
    if request.method == 'POST':
        try:
            # --- Collect Form Data ---
            countries = request.form.getlist('countries')
            domains = request.form.getlist('domains')

            # Primary Hierarchy Path (collect selected values from L1 to L5)
            primary_hierarchy = {
                'resource_type': request.form.get('level1_resource_type'),
                'category': request.form.get('level2_category'),
                'subcategory': request.form.get('level3_subcategory'),
                'data_type': request.form.get('level4_data_type'),
                'level5': request.form.get('level5_item')
            }
            # Remove None or empty string values from hierarchy path
            primary_hierarchy = {k: v for k, v in primary_hierarchy.items() if v}

            year_start = request.form.get('year_start', type=int)
            year_end = request.form.get('year_end', type=int)
            resource_url = request.form.get('resource_url')
            contact_info = request.form.get('contact_info')
            description = request.form.get('description')

            # Related Metadata (assuming it's submitted as a JSON string from JS)
            related_metadata_json = request.form.get('related_metadata', '[]')
            # Validate JSON before storing
            try:
                json.loads(related_metadata_json)
            except json.JSONDecodeError:
                 flash('Invalid format for related metadata.', 'error')
                 return render_template('add_data.html', vocabularies=VOCABULARIES, form_data=request.form)


            keywords = request.form.get('keywords') # Assuming JS joins keywords with commas
            license_info = request.form.get('license') # Optional

            # --- Basic Validation ---
            if not countries or not domains:
                flash('Please select at least one Country and one Domain.', 'error')
                return render_template('add_data.html', vocabularies=VOCABULARIES, form_data=request.form)
            if not primary_hierarchy.get('resource_type'):
                 flash('Please select the primary hierarchy path (at least Resource Type).', 'error')
                 return render_template('add_data.html', vocabularies=VOCABULARIES, form_data=request.form)
            if not resource_url:
                 flash('Resource URL is required.', 'error')
                 return render_template('add_data.html', vocabularies=VOCABULARIES, form_data=request.form)
            if year_start is None or year_end is None or year_start > year_end:
                 flash('Invalid year range selected.', 'error')
                 return render_template('add_data.html', vocabularies=VOCABULARIES, form_data=request.form)


            # --- Prepare Data for Pending Submission ---
            submission_data = {
                'countries': json.dumps(countries),
                'domains': json.dumps(domains),
                'primary_hierarchy_path': json.dumps(primary_hierarchy),
                'year_start': year_start,
                'year_end': year_end,
                'resource_url': resource_url,
                'contact_info': contact_info,
                'description': description,
                'related_metadata': related_metadata_json, # Store the JSON string
                'keywords': keywords,
                'license': license_info,
                'submitter_info': None # Add user info here if authentication exists
            }

            # --- Add to Pending Table ---
            submission_id = add_pending_submission(submission_data)

            if submission_id:
                flash('Resource submitted successfully for review!', 'success')
                return redirect(url_for('index'))
            else:
                flash('Failed to submit resource. Please try again.', 'error')
                # Pass submitted data back to the form
                return render_template('add_data.html', vocabularies=VOCABULARIES, form_data=request.form)

        except Exception as e:
            # Log the exception for debugging
            print(f"Error processing submission: {e}")
            flash(f'An unexpected error occurred: {e}', 'error')
            # Pass submitted data back to the form
            return render_template('add_data.html', vocabularies=VOCABULARIES, form_data=request.form)

    # --- GET Request ---
    # Pass vocabularies and potentially empty form_data for template rendering
    return render_template('add_data.html', vocabularies=VOCABULARIES, form_data={})


# --- API Endpoints (Remain largely the same) ---

@app.route('/api/resource-hierarchy')
def get_resource_hierarchy():
    """API endpoint to get the resource type hierarchy"""
    # Ensure hierarchy is loaded
    if not VOCABULARIES['resource_type_hierarchy']:
         return jsonify({"error": "Resource hierarchy data not available."}), 500
    return jsonify(VOCABULARIES['resource_type_hierarchy'])

@app.route('/api/main-categories')
def get_categories():
    """API endpoint to get the main categories"""
    return jsonify(VOCABULARIES['main_categories'])

# Deprecated? This endpoint fetches by internal DB ID, might not be needed if using data_source_id
@app.route('/api/data-point/<int:data_id>')
def get_data_point(data_id):
    """API endpoint to get a single data point by internal ID"""
    data_point = get_data_point_by_id(data_id)
    if data_point:
        result = dict(data_point)
        if result.get('metadata'):
            try:
                result['metadata'] = json.loads(result['metadata'])
            except json.JSONDecodeError:
                 result['metadata'] = {} # Handle case where metadata in DB is invalid
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

# Use data_source_id for fetching specific resources via API
@app.route('/api/resource/<resource_id>')
def get_resource(resource_id):
    conn = get_db() # Get connection
    # Fetch using data_source_id which is the public identifier
    cur = conn.execute('SELECT * FROM data_points WHERE data_source_id = ?', [resource_id])
    result = cur.fetchone()
    conn.close() # Close connection

    if result is None:
        return jsonify({'error': 'Resource not found'}), 404

    # Convert row to dict and parse metadata
    resource_dict = dict(result)
    if resource_dict.get('metadata'):
        try:
            resource_dict['metadata'] = json.loads(resource_dict['metadata'])
        except json.JSONDecodeError:
            resource_dict['metadata'] = {} # Handle invalid JSON

    return jsonify(resource_dict)


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
                        item_details = {} # Store potential extra info from item object
                        if isinstance(item, str):
                            item_name = item
                        elif isinstance(item, dict) and 'name' in item:
                            item_name = item['name']
                            item_details = item # Keep the whole dict

                        if item_name:
                            item_id = get_hierarchy_node_id(item_level, item_name)
                            # Use title from item details if available, otherwise format name
                            item_label = item_details.get('title', item_name.replace('_', ' ').title())
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

    # 3. Fetch *Approved* Data Points
    conn = get_db()
    cur = conn.cursor()
    # Select columns needed for linking and display from the main data_points table
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
                # Metadata is already stored as JSON string in DB
                metadata = json.loads(point_dict['metadata'])
            except json.JSONDecodeError:
                pass # Ignore invalid JSON

        # --- Determine the leaf hierarchy node ID for this data point ---
        # This uses the specific hierarchy fields stored in data_points
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
        # Use data_source_id for the node ID for consistency if possible,
        # but ensure it doesn't clash with hierarchy IDs. Prefixing is safer.
        # Let's stick with db primary key for uniqueness guarantee.
        dp_node_id = f"dp_{point_dict['id']}"
        # Get title from metadata if available, otherwise use data_source_id
        dp_label = metadata.get('title', point_dict['data_source_id'])
        country = point_dict.get('country') # Primary country from DB
        domain = point_dict.get('domain')   # Primary domain from DB
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
        # Country Node (Primary Country)
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

        # Domain Node (Primary Domain)
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

# --- Admin Routes ---
@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if session.get('is_admin'):
        return redirect(url_for('admin_review')) # Already logged in

    if request.method == 'POST':
        password = request.form.get('password')
        if password and password == ADMIN_PASSWORD:
            session['is_admin'] = True
            flash('Login successful!', 'success')
            return redirect(url_for('admin_review'))
        else:
            flash('Invalid password.', 'error')
    return render_template('admin_login.html')

@app.route('/admin/logout')
def admin_logout():
    session.pop('is_admin', None)
    flash('You have been logged out.', 'info')
    return redirect(url_for('index'))

@app.route('/admin/review')
@admin_required
def admin_review():
    pending = get_pending_submissions()
    # Parse JSON fields for display in the template
    for item in pending:
        try:
            item['countries_list'] = json.loads(item.get('countries', '[]'))
            item['domains_list'] = json.loads(item.get('domains', '[]'))
            item['primary_hierarchy_dict'] = json.loads(item.get('primary_hierarchy_path', '{}'))
            item['related_metadata_list'] = json.loads(item.get('related_metadata', '[]'))
        except json.JSONDecodeError:
            item['countries_list'] = ['Error']
            item['domains_list'] = ['Error']
            item['primary_hierarchy_dict'] = {'Error': 'Invalid JSON'}
            item['related_metadata_list'] = ['Error']
    return render_template('admin_review.html', submissions=pending)

@app.route('/admin/approve/<int:submission_id>', methods=['POST'])
@admin_required
def approve_submission(submission_id):
    submission = get_pending_submission_by_id(submission_id)
    if not submission:
        flash('Submission not found.', 'error')
        return redirect(url_for('admin_review'))

    try:
        # --- Transform Submission Data to Data Point Format ---
        countries = json.loads(submission.get('countries', '[]'))
        domains = json.loads(submission.get('domains', '[]'))
        primary_hierarchy = json.loads(submission.get('primary_hierarchy_path', '{}'))
        related_metadata = json.loads(submission.get('related_metadata', '[]'))

        # Simplification: Use first country/domain for the main table columns
        country = countries[0] if countries else 'Unknown'
        domain = domains[0] if domains else 'Unknown'

        # Extract hierarchy levels
        resource_type = primary_hierarchy.get('resource_type')
        category = primary_hierarchy.get('category')
        subcategory = primary_hierarchy.get('subcategory')
        data_type = primary_hierarchy.get('data_type')
        level5 = primary_hierarchy.get('level5')

        # Basic validation for core fields
        if not resource_type or not category or not subcategory:
             flash(f'Submission {submission_id} missing required hierarchy levels (Type, Category, Subcategory). Cannot approve.', 'error')
             return redirect(url_for('admin_review'))

        # Generate other fields
        repository_url = submission.get('resource_url')
        repository = urlparse(repository_url).netloc if repository_url else 'Unknown' # Extract domain as repository
        data_description = submission.get('description', '')
        keywords = submission.get('keywords', '')
        contact_information = submission.get('contact_info', 'N/A')
        last_updated = datetime.date.today().isoformat() # Use approval date
        data_format = 'Unknown' # Default
        data_resolution = 'Unknown' # Default

        # Create metadata JSON
        metadata_dict = {
            "title": data_description.split('.')[0] if data_description else repository_url, # Use first sentence or URL as title
            "institution": "Unknown", # Consider adding to form
            "geographic_coverage": countries,
            "license": submission.get('license'),
            "version": f"{submission.get('year_start')}-{submission.get('year_end')}",
            "original_url": repository_url,
            "related_metadata": related_metadata,
            "submitted_description": data_description # Keep original description
        }
        metadata_json = json.dumps(metadata_dict)

        # Prepare tuple for add_data_point (order matters!)
        # (None, resource_type, category, subcategory, data_type, level5, data_format,
        #  data_resolution, repository, repository_url, data_description, keywords,
        #  last_updated, contact_information, metadata, country, domain)
        data_point_tuple = (
            None, resource_type, category, subcategory, data_type, level5, data_format,
            data_resolution, repository, repository_url, data_description, keywords,
            last_updated, contact_information, metadata_json, country, domain
        )

        # --- Add to Main Data Points Table ---
        new_data_source_id = add_data_point(data_point_tuple)

        if new_data_source_id:
            # Update status or delete the pending submission
            # Option 1: Update status
            # update_pending_submission_status(submission_id, 'approved')
            # Option 2: Delete after approval
            delete_pending_submission(submission_id)
            flash(f'Submission {submission_id} approved and added with ID: {new_data_source_id}.', 'success')
        else:
            flash(f'Failed to add approved submission {submission_id} to main database.', 'error')

    except json.JSONDecodeError:
        flash(f'Error parsing JSON data for submission {submission_id}. Cannot approve.', 'error')
    except Exception as e:
        print(f"Error approving submission {submission_id}: {e}")
        flash(f'An error occurred while approving submission {submission_id}: {e}', 'error')

    return redirect(url_for('admin_review'))


@app.route('/admin/reject/<int:submission_id>', methods=['POST'])
@admin_required
def reject_submission(submission_id):
    # Option 1: Update status to 'rejected'
    if update_pending_submission_status(submission_id, 'rejected'):
         flash(f'Submission {submission_id} rejected.', 'info')
    else:
         flash(f'Failed to update status for submission {submission_id}.', 'error')

    # Option 2: Delete rejected submission
    # if delete_pending_submission(submission_id):
    #     flash(f'Submission {submission_id} rejected and removed.', 'info')
    # else:
    #     flash(f'Failed to remove rejected submission {submission_id}.', 'error')

    return redirect(url_for('admin_review'))


if __name__ == '__main__':
    if not ADMIN_PASSWORD:
        print("Warning: ADMIN_PASSWORD environment variable not set. Admin login will not work.")
    # Ensure DB is initialized when running directly
    init_db()
    load_initial_data()
    app.run(debug=True)
