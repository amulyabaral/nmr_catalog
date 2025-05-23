from flask import Flask, render_template, request, redirect, url_for, jsonify, flash, session, send_file, send_from_directory # Added send_file and send_from_directory
from dotenv import load_dotenv # Import dotenv
import yaml
import json
from database import (
    init_db, add_pending_submission, get_all_data_points, # REMOVED load_initial_data
    get_main_categories, get_resource_type_hierarchy, get_data_point_by_id, get_db,
    get_pending_submissions, get_pending_submission_by_id, delete_pending_submission, # Added DB functions
    add_data_point, update_pending_submission_status,
    update_data_point, # <<< Import the new update function
    DB_PATH, # <<< Import DB_PATH
    delete_data_point # <<< Import if implementing delete
)
import random # Import random for color generation
import os # Import os for secret key
import datetime # Needed for last_updated
from urllib.parse import urlparse # Needed for repository extraction
from functools import wraps # Needed for decorator
from werkzeug.datastructures import MultiDict
import logging # Ensure logging is imported
import sqlite3 # Ensure sqlite3 is imported for the new API endpoint
import requests
from bs4 import BeautifulSoup
import fitz # PyMuPDF
import re
import base64 # <<< Import base64 for encoding file content

load_dotenv() # Load environment variables from .env file

app = Flask(__name__)
# Set a secret key for session management
app.secret_key = os.environ.get('FLASK_SECRET_KEY', 'a_very_secret_key_for_dev_only') # Use env var or random bytes
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD') # Load admin password from env
# <<< NEW: GEMINI API KEY >>>
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')

# Initialize database at startup
init_db()
# load_initial_data() # <<< REMOVE THIS CALL

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

# --- NEW HELPER FUNCTIONS FOR AI PROCESSING ---

def extract_text_from_source(input_source, source_name, content_type_hint=None):
    """
    Extracts text from a given input_source (URL string or file-like object).
    source_name is the URL or filename for context.
    content_type_hint is the mimetype from the uploaded file.
    Primarily for HTML and TXT files now. PDFs will be handled directly by Gemini.
    """
    if isinstance(input_source, str): # It's a URL
        url = input_source
        logging.info(f"Extracting text from URL (non-PDF): {url}")
        try:
            headers = {'User-Agent': 'Mozilla/5.0'}
            response = requests.get(url, headers=headers, timeout=30, allow_redirects=True)
            response.raise_for_status()
            
            content_type = response.headers.get('content-type', '').lower()
            
            # This function will now primarily be called for HTML or plain text from URLs
            if 'html' in content_type:
                soup = BeautifulSoup(response.content, 'html.parser')
                for script_or_style in soup(["script", "style"]):
                    script_or_style.decompose()
                text = soup.get_text(separator='\n', strip=True)
                text = re.sub(r'\n\s*\n', '\n\n', text)
                return text, None
            elif 'text/plain' in content_type:
                return response.text, None
            # PDF handling removed from here, as Gemini will process it directly
            # elif 'pdf' in content_type:
            #     return "IS_PDF_URL", None # Signal that it's a PDF URL
            else:
                # Attempt to read as plain text if content type is not explicitly handled
                logging.warning(f"Unsupported or ambiguous content type from URL {url}: {content_type}. Attempting to read as text.")
                try:
                    text = response.text
                    if text.strip():
                        return text, None
                    else:
                        return None, f"Content from URL {url} (type: {content_type}) is empty or not readable as text."
                except Exception as e_text:
                    logging.error(f"Could not read content from URL {url} as text: {e_text}")
                    return None, f"Unsupported content type from URL: {content_type}. Could not read as text."
                
        except requests.exceptions.RequestException as e:
            logging.error(f"Error fetching URL {url}: {e}")
            return None, f"Error fetching URL: {e}"
        except Exception as e:
            logging.error(f"Error processing content from URL {url}: {e}")
            return None, f"Error processing content: {e}"

    elif hasattr(input_source, 'read'): # It's a file-like object (uploaded file stream)
        filename = source_name
        file_content_type = content_type_hint or ''
        logging.info(f"Extracting text from uploaded file (non-PDF): {filename}, MIME hint: {file_content_type}")

        if (not file_content_type or file_content_type == 'application/octet-stream') and filename:
            if filename.lower().endswith('.txt'):
                file_content_type = 'text/plain'
            elif filename.lower().endswith(('.html', '.htm')):
                file_content_type = 'text/html'
            # PDF handling removed from here

        try:
            if hasattr(input_source, 'seek'):
                input_source.seek(0)
            file_bytes = input_source.read()

            if 'text/plain' in file_content_type:
                text = file_bytes.decode('utf-8', errors='replace')
                return text, None
            elif 'html' in file_content_type:
                soup = BeautifulSoup(file_bytes, 'html.parser')
                for script_or_style in soup(["script", "style"]):
                    script_or_style.decompose()
                text = soup.get_text(separator='\n', strip=True)
                text = re.sub(r'\n\s*\n', '\n\n', text)
                return text, None
            # PDF handling removed from here
            else:
                # Attempt to read as plain text as a last resort if type is unknown
                try:
                    logging.info(f"Unknown non-PDF file type for {filename}, attempting to read as text.")
                    text = file_bytes.decode('utf-8', errors='replace')
                    if text.strip():
                        return text, None
                    else:
                        return None, f"Unsupported non-PDF file type or empty file: {filename} (MIME: {file_content_type or 'unknown'})"
                except Exception as e_text:
                    logging.error(f"Could not read {filename} as text: {e_text}")
                    return None, f"Unsupported non-PDF file type: {filename} (MIME: {file_content_type or 'unknown'})"
        except Exception as e:
            logging.error(f"Error processing non-PDF file {filename}: {e}", exc_info=True)
            return None, f"Error processing file {filename}: {e}"
    else:
        return None, "Invalid input type for text extraction."


def get_detailed_vocab_text():
    """Extracts a more detailed list of terms from vocabularies to guide the LLM."""
    main_cats = VOCABULARIES.get('main_categories', {})
    hierarchy = VOCABULARIES.get('resource_type_hierarchy', {})
    
    vocab_summary = "You MUST use the following vocabulary. Only select terms from this list for categorization.\n\n"
    vocab_summary += "== Main Categories ==\n"
    if main_cats.get('Country'):
        vocab_summary += f"Countries: {', '.join(main_cats['Country'])}\n"
    if main_cats.get('Domain'):
        vocab_summary += f"Domains: {', '.join(main_cats['Domain'])}\n"
    
    vocab_summary += "\n== Resource Hierarchy (Levels 1-5) ==\n"
    vocab_summary += "The values you return in the JSON for primary_hierarchy levels (e.g. level1_resource_type) MUST be the internal keys/names (e.g., 'omics_data', 'whole_genome_sequencing') and NOT the display titles (e.g., 'Omics Data').\n"
    vocab_summary += "Format: L1_key > L2_key > L3_key > L4_key > L5_key (item name)\n"
    vocab_summary += "Select the most specific path that applies. Only use terms exactly as listed below for the JSON values.\n"

    def format_internal_key(key): # Helper to ensure we are referring to keys
        return key

    def get_display_name(key, details_dict): # Helper for constructing the text for LLM
        return details_dict.get('title', key.replace('_', ' ').title())

    # Iterate through L1 resource types
    for l1_key, l1_details in hierarchy.items():
        l1_display_name = get_display_name(l1_key, l1_details)
        vocab_summary += f"\n--- Resource Type (L1): {l1_display_name} (key: {format_internal_key(l1_key)}) ---\n"
        
        if l1_details.get('sub_categories'):
            for l2_key, l2_details in l1_details['sub_categories'].items():
                l2_display_name = get_display_name(l2_key, l2_details)
                vocab_summary += f"  L2: {l2_display_name} (key: {format_internal_key(l2_key)}) under {l1_display_name}\n"
                
                if l2_details.get('sub_categories'):
                    for l3_key, l3_details in l2_details['sub_categories'].items():
                        l3_display_name = get_display_name(l3_key, l3_details)
                        vocab_summary += f"    L3: {l3_display_name} (key: {format_internal_key(l3_key)}) under {l2_display_name}\n"
                        
                        if l3_details.get('sub_categories'):
                            for l4_key, l4_details in l3_details['sub_categories'].items():
                                l4_display_name = get_display_name(l4_key, l4_details)
                                vocab_summary += f"      L4: {l4_display_name} (key: {format_internal_key(l4_key)}) under {l3_display_name}\n"
                                if l4_details.get('items'):
                                    for item in l4_details['items']:
                                        item_key = item.get('name', str(item))
                                        item_display_name = get_display_name(item_key, item)
                                        vocab_summary += f"        L5 Item: {item_display_name} (key: {format_internal_key(item_key)}) under {l4_display_name}\n"
                        elif l3_details.get('items'): 
                            for item in l3_details['items']:
                                item_key = item.get('name', str(item))
                                item_display_name = get_display_name(item_key, item)
                                vocab_summary += f"      L4 Item: {item_display_name} (key: {format_internal_key(item_key)}) under {l3_display_name}\n"

                elif l2_details.get('items'):
                     for item in l2_details['items']:
                        item_key = item.get('name', str(item))
                        item_display_name = get_display_name(item_key, item)
                        vocab_summary += f"    L3 Item: {item_display_name} (key: {format_internal_key(item_key)}) under {l2_display_name}\n"
        elif l1_details.get('items'): 
            for item in l1_details['items']:
                item_key = item.get('name', str(item))
                item_display_name = get_display_name(item_key, item)
                vocab_summary += f"  L2 Item: {item_display_name} (key: {format_internal_key(item_key)}) under {l1_display_name}\n"
    return vocab_summary


def call_gemini_api(source_identifier, prompt_text_content=None, file_bytes=None, file_mime_type=None, pdf_url=None):
    """
    Calls the Gemini API to extract information.
    Can handle pre-extracted text_content, direct file_bytes (e.g., for PDF), or a pdf_url.
    """
    if not GEMINI_API_KEY:
        return None, "GEMINI_API_KEY not configured."

    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
    vocab_context = get_detailed_vocab_text()

    prompt_source_guidance = ""
    original_input_url_for_prompt = ""

    if source_identifier.startswith('http://') or source_identifier.startswith('https://'):
        prompt_source_guidance = f"The content was sourced from the URL: {source_identifier}."
        if pdf_url or file_mime_type == 'application/pdf': # If it's a PDF URL being processed by Gemini
             original_input_url_for_prompt = source_identifier
        # If it's an HTML URL, prompt_text_content will contain its text, so original_input_url_for_prompt might not be needed in the same way for resource_url fallback.
    else:
        prompt_source_guidance = f"The content was sourced from an uploaded file named: {source_identifier}."

    # Base prompt structure
    base_prompt = f"""
    You are a meticulous data extraction assistant.
    Your task is to analyze the content from the source and populate a JSON object. {prompt_source_guidance}
    **CRITICAL INSTRUCTIONS:**
    1.  **Primary Resource Classification**: First, determine the fundamental nature of the input source itself.
        *   If the source is a document (e.g., a PDF file, a webpage of an article, a report), its primary classification should reflect that (e.g., "Publications" -> "Research Articles", "Publications" -> "Policy Documents"). The `level1_resource_type` in your JSON output MUST be one of "Data", "Systems", "Publications", "Entities", or "Utilities" from the vocabulary.
        *   Only if the source is a direct link to a dataset, a database, or a software tool/system, should its primary classification be "Data" or "Systems".
        *   The goal is to classify the item you are *directly analyzing*, not just the topics mentioned within it. For example, a PDF of a research paper *about* omics data is primarily a "Publication", not "Data".
    2.  **Strict Vocabulary Adherence**: You MUST use the exact internal keys/names (e.g., 'omics_data', 'whole_genome_sequencing') provided in the "Vocabulary and Hierarchy" section below for categorization fields ("countries", "domains", "primary_hierarchy" levels) in your JSON output. Do NOT use display titles or variations.
    3.  **No Hallucination**: If information for a field is NOT explicitly present in the text, OMIT the field from the JSON or set its value to null. DO NOT invent or infer data.
    4.  **Single Resource Focus**: If the document describes multiple distinct resources, focus on extracting information for the most prominent one or the first one described in detail. The system currently processes one resource at a time.
    5.  **JSON Output Only**: Your entire response MUST be a single, valid JSON object. Do not include any explanatory text before or after the JSON.

    **Vocabulary and Hierarchy (Use EXACT internal keys/names from here for JSON values):**
    --- VOCABULARY START ---
    {vocab_context}
    --- VOCABULARY END ---

    **JSON Output Structure and Fields:**
    - "resource_name": (string) The primary title or name of the resource. This is mandatory. 
    - "countries": (list of strings) Relevant countries, selected ONLY from the 'Countries' list in the vocabulary. This is mandatory.
    - "domains": (list of strings) Relevant domains, selected ONLY from the 'Domains' list in the vocabulary. This is mandatory.
    - "primary_hierarchy": (object) This is mandatory. The most specific classification path found in the text, matching the "Resource Hierarchy" provided. Values for levels MUST be the internal keys. This is mandatory.
        - "level1_resource_type": (string) e.g., "Data", "Systems". Must be an L1 key. This is mandatory.
        - "level2_category": (string, optional) e.g., "omics_data". Must be an L2 key under the selected L1.   
        - "level3_subcategory": (string, optional) e.g., "genomic". Must be an L3 key under the selected L2.
        - "level4_data_type": (string, optional) e.g., "whole_genome_sequencing". Must be an L4 key/item.
        - "level5_item": (string, optional) e.g., "clinical_isolates". Must be an L5 key/item.
    - "year_start": (integer, optional) The start year. Extract if clearly stated.
    - "year_end": (integer, optional) The end year. Extract if clearly stated.
    - "resource_url": (string, optional) If the analyzed text explicitly mentions a primary URL for the resource itself, provide that. {'If no specific URL is found in the text, you may use the source URL: "' + original_input_url_for_prompt + '" if the content was sourced from a URL and is a PDF.' if original_input_url_for_prompt else 'If the content was from an uploaded file and no URL is found in its text, or if it was a non-PDF URL, omit this field or set it to null unless a URL is found in the document.'}
    - "contact_info": (string, optional) Contact email, person, or organization, if found.
    - "description": (string) Detailed info about the resource extracted directly from the text/file (max 3000 words). Try to be as informative as possible, but be straight to the point. Paste any found links as links. If no summary, state "No summary found in text."
    - "keywords": (list of strings, optional) Keywords explicitly mentioned or strongly implied by the text.
    - "license": (string, optional) License information, if found.

    **Example of how to select hierarchy (use the internal keys for the JSON values):**
    If the text discusses "wastewater metagenomes", and the vocabulary shows:
    --- Resource Type (L1): Data (key: Data) ---
      L2: omics_data (key: omics_data) under Data
        L3: metagenomic (key: metagenomic) under omics_data
          L4 Item: wastewater_metagenomes (key: wastewater_metagenomes) under metagenomic
    Then the JSON for primary_hierarchy should be:
    "primary_hierarchy": {{
        "level1_resource_type": "Data",
        "level2_category": "omics_data",
        "level3_subcategory": "metagenomic",
        "level4_data_type": "wastewater_metagenomes"
    }}
    """

    gemini_parts = []
    final_prompt_text = ""

    if prompt_text_content: # For HTML/TXT where text is pre-extracted
        final_prompt_text = base_prompt + f"""
    **Analyze the following text content:**
    --- TEXT START ---
    {prompt_text_content[:800000]} 
    --- TEXT END ---

    Return ONLY the JSON object.
    """
        gemini_parts.append({"text": final_prompt_text})
    elif file_bytes or pdf_url: # For PDFs handled directly by Gemini
        final_prompt_text = base_prompt + """
    **Analyze the provided document (which is included as a separate part in this request) to extract the information.**

    Return ONLY the JSON object.
    """
        gemini_parts.append({"text": final_prompt_text})
        
        if file_bytes and file_mime_type:
            base64_encoded_data = base64.b64encode(file_bytes).decode('utf-8')
            gemini_parts.append({
                "inlineData": {
                    "mimeType": file_mime_type,
                    "data": base64_encoded_data
                }
            })
            logging.info(f"Sending uploaded file {source_identifier} ({len(file_bytes)} bytes, type: {file_mime_type}) to Gemini as inlineData.")
        elif pdf_url:
            try:
                logging.info(f"Fetching PDF content from URL: {pdf_url} for Gemini.")
                headers = {'User-Agent': 'Mozilla/5.0'}
                response = requests.get(pdf_url, headers=headers, timeout=60, allow_redirects=True) # Increased timeout for fetching
                response.raise_for_status()
                pdf_content_bytes = response.content
                base64_encoded_pdf_data = base64.b64encode(pdf_content_bytes).decode('utf-8')
                gemini_parts.append({
                    "inlineData": {
                        "mimeType": "application/pdf", # Assuming it's a PDF
                        "data": base64_encoded_pdf_data
                    }
                })
                logging.info(f"Sending PDF from URL {pdf_url} ({len(pdf_content_bytes)} bytes) to Gemini as inlineData.")
            except requests.exceptions.RequestException as e:
                logging.error(f"Error fetching PDF from URL {pdf_url} for Gemini: {e}")
                return None, f"Error fetching PDF from URL for AI: {e}"
            except Exception as e:
                logging.error(f"Error processing PDF from URL {pdf_url} for Gemini: {e}")
                return None, f"Error processing PDF from URL for AI: {e}"
    else:
        return None, "No content provided to Gemini API (no text, file, or PDF URL)."


    payload = {
        "contents": [{"parts": gemini_parts}],
        "generationConfig": {
            "temperature": 0.3,
            "topK": 1,
            "topP": 1,
            "maxOutputTokens": 8192,
            "responseMimeType": "application/json",
        },
    }

    try:
        response = requests.post(api_url, json=payload, headers={'Content-Type': 'application/json'}, timeout=120) # Increased timeout
        response.raise_for_status()
        
        # Gemini might return JSON directly, or a JSON string within its response structure.
        # The `responseMimeType: "application/json"` should make it return raw JSON.
        response_json = response.json()

        # If `responseMimeType: "application/json"` works as expected, response_json is the direct data.
        # If it's nested (older API versions or different models):
        # extracted_text = response_json.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
        # For direct JSON output, the structure might be simpler.
        # Let's assume `responseMimeType` gives us the direct JSON.
        # If the model doesn't directly output JSON in the main body with responseMimeType,
        # we might need to parse its 'text' part which should contain the JSON string.
        
        if 'candidates' in response_json and response_json['candidates']:
            content = response_json['candidates'][0].get('content', {})
            if 'parts' in content and content['parts']:
                # If responseMimeType was application/json, the part *should* be the JSON object itself.
                # However, the API might still wrap it in a text field.
                json_text_part = content['parts'][0].get('text')
                if json_text_part:
                    try:
                        # Attempt to parse the text part as JSON
                        return json.loads(json_text_part), None
                    except json.JSONDecodeError as e:
                        logging.error(f"Gemini API returned text that is not valid JSON: {json_text_part}. Error: {e}")
                        return None, f"Gemini API returned non-JSON text. Raw: {json_text_part[:500]}"
                else: # If responseMimeType worked and 'parts'[0] is the JSON object directly
                    # This case might not happen if 'text' is always populated.
                    # Check if parts[0] itself is a dict (the JSON object)
                    if isinstance(content['parts'][0], dict):
                         # This assumes the API directly puts the JSON object here when responseMimeType is application/json
                         # This part is speculative based on how `responseMimeType` *should* work.
                         # The Gemini API docs for direct JSON output are a bit sparse for REST.
                         # For now, we rely on the 'text' field containing the JSON string.
                         pass # Fall through to error if json_text_part was empty
        
        # Fallback or if the structure is different
        logging.error(f"Unexpected Gemini API response structure: {response_json}")
        return None, f"Unexpected Gemini API response structure. Check logs. Response: {str(response_json)[:500]}"

    except requests.exceptions.RequestException as e:
        logging.error(f"Gemini API request error: {e}")
        if e.response is not None:
            logging.error(f"Gemini API response content: {e.response.text}")
            return None, f"Gemini API request error: {e}. Response: {e.response.text[:500]}"
        return None, f"Gemini API request error: {e}"
    except json.JSONDecodeError as e: # If response.json() itself fails
        logging.error(f"Failed to decode Gemini API JSON response: {e}. Raw response: {response.text}")
        return None, f"Failed to decode Gemini API JSON response. Raw: {response.text[:500]}"
    except Exception as e:
        logging.error(f"Error calling Gemini API: {e}", exc_info=True)
        return None, f"Error calling Gemini API: {e}"

# --- NEW ROUTE FOR AI URL PROCESSING ---
@app.route('/ai-process-input', methods=['POST']) # Renamed route
def ai_process_input():
    url_to_process = request.form.get('ai_url')
    uploaded_file = request.files.get('ai_file')
    submit_action = request.form.get('submit_action') # Check which button was pressed
    
    extracted_data = None # Will hold data from Gemini
    gemini_error = None
    source_identifier = None 
    source_for_redirect_url = None 

    # Determine input type and prepare for Gemini
    if uploaded_file and uploaded_file.filename:
        filename = uploaded_file.filename
        source_identifier = filename
        file_content_type = uploaded_file.content_type or ''
        
        logging.info(f"AI Processing: Uploaded file: {filename}, MIME type: {file_content_type}")

        if 'pdf' in file_content_type.lower():
            try:
                file_bytes = uploaded_file.stream.read()
                if not file_bytes:
                    gemini_error = "Uploaded PDF file is empty."
                else:
                    # Pass bytes and mime type directly to Gemini
                    extracted_data, gemini_error = call_gemini_api(
                        source_identifier=filename, 
                        file_bytes=file_bytes, 
                        file_mime_type=file_content_type
                    )
            except Exception as e:
                logging.error(f"Error reading uploaded PDF file {filename}: {e}", exc_info=True)
                gemini_error = f"Error reading uploaded PDF file: {e}"
        else: # HTML, TXT, or other non-PDF files
            text_content, error = extract_text_from_source(uploaded_file.stream, filename, file_content_type)
            if error:
                gemini_error = f'Error extracting content from uploaded file: {error}'
            elif not text_content:
                gemini_error = 'Could not extract any text content from the uploaded file.'
            else:
                extracted_data, gemini_error = call_gemini_api(source_identifier=filename, prompt_text_content=text_content)
        
        # source_for_redirect_url remains None for file uploads unless explicitly set later from extracted_data

    elif url_to_process:
        source_identifier = url_to_process
        source_for_redirect_url = url_to_process
        logging.info(f"AI Processing: URL: {url_to_process}")

        # Simple check for PDF URL, or let Gemini attempt if type is unknown via URL
        # For more robust URL type detection, a HEAD request could check Content-Type
        is_pdf_url = url_to_process.lower().endswith('.pdf')
        # Attempt to get content type from URL without downloading full content yet
        try:
            head_response = requests.head(url_to_process, timeout=10, allow_redirects=True, headers={'User-Agent': 'Mozilla/5.0'})
            if 'application/pdf' in head_response.headers.get('content-type','').lower():
                is_pdf_url = True
        except requests.exceptions.RequestException as e:
            logging.warning(f"Could not perform HEAD request for {url_to_process}: {e}")


        if is_pdf_url:
            # Pass PDF URL directly to Gemini call
            extracted_data, gemini_error = call_gemini_api(source_identifier=url_to_process, pdf_url=url_to_process)
        else: # HTML or other web content
            text_content, error = extract_text_from_source(url_to_process, url_to_process)
            if error:
                gemini_error = f'Error extracting content from URL: {error}'
            elif not text_content:
                gemini_error = 'Could not extract any text content from the URL.'
            else:
                extracted_data, gemini_error = call_gemini_api(source_identifier=url_to_process, prompt_text_content=text_content)
    else:
        flash('No URL or file provided for AI processing.', 'error')
        return redirect(url_for('add_data'))

    # Handle results from Gemini
    if gemini_error:
        flash(f'AI processing error: {gemini_error}', 'error')
        # Pass back original URL if available, and potentially some extracted text if that part succeeded
        # For now, just the URL. Description prefill might be tricky if only PDF processing failed.
        return redirect(url_for('add_data', resource_url=source_for_redirect_url))

    if not extracted_data:
        flash('AI could not extract data. Please fill the form manually.', 'warning')
        return redirect(url_for('add_data', resource_url=source_for_redirect_url))

    # --- Action: Pre-fill and Edit Form ---
    if submit_action == 'prefill':
        query_params = {}
        if extracted_data.get("resource_name"):
            query_params["resource_name"] = extracted_data["resource_name"]
        
        if isinstance(extracted_data.get("countries"), list):
            for country in extracted_data["countries"]:
                query_params.setdefault("countries", []).append(country)
        elif isinstance(extracted_data.get("countries"), str):
            query_params.setdefault("countries", []).append(extracted_data["countries"])

        if isinstance(extracted_data.get("domains"), list):
            for domain in extracted_data["domains"]:
                query_params.setdefault("domains", []).append(domain)
        elif isinstance(extracted_data.get("domains"), str):
            query_params.setdefault("domains", []).append(extracted_data["domains"])

        if isinstance(extracted_data.get("keywords"), list):
            query_params["keywords"] = ",".join(extracted_data["keywords"])
        elif isinstance(extracted_data.get("keywords"), str):
            query_params["keywords"] = extracted_data["keywords"]


        hierarchy = extracted_data.get("primary_hierarchy", {})
        if hierarchy.get("level1_resource_type"):
            query_params["level1_resource_type"] = hierarchy["level1_resource_type"]
        if hierarchy.get("level2_category"):
            query_params["level2_category"] = hierarchy["level2_category"]
        if hierarchy.get("level3_subcategory"):
            query_params["level3_subcategory"] = hierarchy["level3_subcategory"]
        if hierarchy.get("level4_data_type"):
            query_params["level4_data_type"] = hierarchy["level4_data_type"]
        if hierarchy.get("level5_item"):
            query_params["level5_item"] = hierarchy["level5_item"]

        if extracted_data.get("year_start"):
            query_params["year_start"] = str(extracted_data["year_start"])
        if extracted_data.get("year_end"):
            query_params["year_end"] = str(extracted_data["year_end"])
        
        if source_for_redirect_url:
            query_params["resource_url"] = source_for_redirect_url
        elif extracted_data.get("resource_url"):
            query_params["resource_url"] = extracted_data.get("resource_url")
        
        if extracted_data.get("contact_info"):
            query_params["contact_info"] = extracted_data["contact_info"]
        if extracted_data.get("description"):
            query_params["description"] = extracted_data["description"]
        if extracted_data.get("license"):
            query_params["license"] = extracted_data["license"]

        flash('AI processing complete. Please review and complete the form.', 'success')
        return redirect(url_for('add_data', **query_params))

    # --- Action: Direct AI Submit to Pending ---
    elif submit_action == 'direct_submit':
        logging.info(f"Attempting direct AI submission for source: {source_identifier}")
        
        # Validate essential fields from AI output
        resource_name = extracted_data.get("resource_name")
        countries = extracted_data.get("countries") # Can be list or string
        domains = extracted_data.get("domains") # Can be list or string
        primary_hierarchy = extracted_data.get("primary_hierarchy", {})
        level1_resource_type = primary_hierarchy.get("level1_resource_type")

        missing_fields = []
        if not resource_name: missing_fields.append("Resource Name")
        if not countries: missing_fields.append("Countries")
        if not domains: missing_fields.append("Domains")
        if not level1_resource_type: missing_fields.append("Level 1 Resource Type (Primary Hierarchy)")

        if missing_fields:
            flash(f"AI could not extract all required fields for direct submission: {', '.join(missing_fields)}. Please complete the form manually.", 'warning')
            # Redirect to pre-fill form instead of direct submission
            # We can reuse the query_params logic from the 'prefill' action
            query_params = {}
            if resource_name: query_params["resource_name"] = resource_name
            if countries:
                if isinstance(countries, list): query_params["countries"] = countries
                else: query_params.setdefault("countries", []).append(countries)
            if domains:
                if isinstance(domains, list): query_params["domains"] = domains
                else: query_params.setdefault("domains", []).append(domains)
            if isinstance(extracted_data.get("keywords"), list): query_params["keywords"] = ",".join(extracted_data["keywords"])
            elif isinstance(extracted_data.get("keywords"), str): query_params["keywords"] = extracted_data["keywords"]
            if level1_resource_type: query_params["level1_resource_type"] = level1_resource_type
            if primary_hierarchy.get("level2_category"): query_params["level2_category"] = primary_hierarchy["level2_category"]
            if primary_hierarchy.get("level3_subcategory"): query_params["level3_subcategory"] = primary_hierarchy["level3_subcategory"]
            if primary_hierarchy.get("level4_data_type"): query_params["level4_data_type"] = primary_hierarchy["level4_data_type"]
            if primary_hierarchy.get("level5_item"): query_params["level5_item"] = primary_hierarchy["level5_item"]
            if extracted_data.get("year_start"): query_params["year_start"] = str(extracted_data["year_start"])
            if extracted_data.get("year_end"): query_params["year_end"] = str(extracted_data["year_end"])
            if source_for_redirect_url: query_params["resource_url"] = source_for_redirect_url
            elif extracted_data.get("resource_url"): query_params["resource_url"] = extracted_data.get("resource_url")
            if extracted_data.get("contact_info"): query_params["contact_info"] = extracted_data["contact_info"]
            if extracted_data.get("description"): query_params["description"] = extracted_data["description"]
            if extracted_data.get("license"): query_params["license"] = extracted_data["license"]
            return redirect(url_for('add_data', **query_params))

        # Prepare data for add_pending_submission
        submission_data = {
            'resource_name': resource_name,
            'countries': json.dumps(countries if isinstance(countries, list) else [countries]),
            'domains': json.dumps(domains if isinstance(domains, list) else [domains]),
            'primary_hierarchy_path': json.dumps(primary_hierarchy),
            'year_start': extracted_data.get('year_start'),
            'year_end': extracted_data.get('year_end'),
            'resource_url': extracted_data.get('resource_url') if extracted_data.get('resource_url') else source_for_redirect_url, # Prioritize extracted, then original URL
            'contact_info': extracted_data.get('contact_info'),
            'description': extracted_data.get('description'),
            'related_metadata': json.dumps(extracted_data.get('related_metadata_categories', [])), # Assuming AI might provide this
            'related_resources': json.dumps(extracted_data.get('related_resource_ids', [])), # Assuming AI might provide this
            'keywords': ",".join(extracted_data.get("keywords", [])) if isinstance(extracted_data.get("keywords"), list) else extracted_data.get("keywords"),
            'license': extracted_data.get('license'),
            'submitter_info': 'AI Direct Submission' # Indicate source
        }
        
        # Add year validation: if both years provided, start <= end
        year_start_val = submission_data.get('year_start')
        year_end_val = submission_data.get('year_end')
        if year_start_val is not None and year_end_val is not None and int(year_start_val) > int(year_end_val):
            flash('AI extracted an invalid year range (Start year after end year). Please review and submit manually.', 'warning')
            # Redirect to pre-fill form
            # Re-construct query_params for prefill as done in the missing_fields block
            query_params = {k: v for k, v in extracted_data.items() if v is not None} # Basic prefill
            if source_for_redirect_url: query_params["resource_url"] = source_for_redirect_url
            if isinstance(query_params.get("countries"), list): pass # Already a list
            elif query_params.get("countries"): query_params["countries"] = [query_params["countries"]]
            if isinstance(query_params.get("domains"), list): pass
            elif query_params.get("domains"): query_params["domains"] = [query_params["domains"]]
            if isinstance(query_params.get("keywords"), list): query_params["keywords"] = ",".join(query_params["keywords"])
            # primary hierarchy needs to be flattened for query_params
            ph = query_params.pop("primary_hierarchy", {})
            for k,v in ph.items(): query_params[k] = v
            
            return redirect(url_for('add_data', **query_params))


        submission_id = add_pending_submission(submission_data)
        if submission_id:
            flash(f'Resource "{resource_name}" directly submitted by AI for admin review (Submission ID: {submission_id}).', 'success')
            return redirect(url_for('index'))
        else:
            flash('AI direct submission failed. Please try pre-filling and submitting manually.', 'error')
            # Fallback to pre-fill form
            query_params = {k: v for k, v in extracted_data.items() if v is not None}
            if source_for_redirect_url: query_params["resource_url"] = source_for_redirect_url
            if isinstance(query_params.get("countries"), list): pass # Already a list
            elif query_params.get("countries"): query_params["countries"] = [query_params["countries"]]
            if isinstance(query_params.get("domains"), list): pass
            elif query_params.get("domains"): query_params["domains"] = [query_params["domains"]]
            if isinstance(query_params.get("keywords"), list): query_params["keywords"] = ",".join(query_params["keywords"])
            ph = query_params.pop("primary_hierarchy", {})
            for k,v in ph.items(): query_params[k] = v
            return redirect(url_for('add_data', **query_params))

    else:
        # Should not happen if buttons have values
        flash('Invalid action specified for AI processing.', 'error')
        return redirect(url_for('add_data'))


@app.route('/add-data', methods=['GET', 'POST'])
def add_data():
    form_data = MultiDict() # Initialize form_data as MultiDict

    if request.method == 'GET':
        # <<< Check session for pre-fill data >>>
        if 'prefill_data' in session:
            prefill_data = session.pop('prefill_data', None) # Get and remove from session
            if prefill_data:
                # Convert the prefill_data (which was likely a simple dict)
                # into a MultiDict suitable for the template's form_data expectations.
                # Handle lists specifically for countries and domains.
                temp_form_data = {}
                for key, value in prefill_data.items():
                    if key in ['countries', 'domains'] and isinstance(value, list):
                        # For lists, add each item individually to the MultiDict
                        for item in value:
                            temp_form_data.setdefault(key, []).append(item)
                    else:
                        # For other items, just assign them
                        temp_form_data[key] = value
                form_data = MultiDict(temp_form_data)
                flash('AI extraction results pre-filled. Please review and submit.', 'info')
        # <<< End session check >>>

        # Render the form, potentially pre-filled from session
        return render_template('add_data.html', vocabularies=VOCABULARIES, form_data=form_data)

    # --- POST Request Handling (Manual Submission) ---
    if request.method == 'POST':
        try:
            # --- Collect Form Data ---
            resource_name = request.form.get('resource_name')
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

            # Get year values, allowing for empty strings -> None
            year_start_str = request.form.get('year_start')
            year_end_str = request.form.get('year_end')
            year_start = int(year_start_str) if year_start_str else None
            year_end = int(year_end_str) if year_end_str else None

            resource_url = request.form.get('resource_url')
            contact_info = request.form.get('contact_info')
            description = request.form.get('description')

            # Related Metadata Categories (hierarchy paths)
            related_metadata_json = request.form.get('related_metadata', '[]')
            # Related Resources (linked existing resource IDs)
            related_resources_json = request.form.get('related_resources', '[]')

            # Validate JSON before storing
            try:
                json.loads(related_metadata_json)
                json.loads(related_resources_json)
            except json.JSONDecodeError as e:
                 flash(f'Invalid format for related data: {e}', 'error')
                 return render_template('add_data.html', vocabularies=VOCABULARIES, form_data=form_data)


            keywords = request.form.get('keywords') # Assuming JS joins keywords with commas
            license_info = request.form.get('license') # Optional

            # --- Basic Validation ---
            if not resource_name:
                 flash('Resource Name / Title is required.', 'error')
                 return render_template('add_data.html', vocabularies=VOCABULARIES, form_data=form_data)
            if not countries or not domains:
                flash('Please select at least one Country and one Domain.', 'error')
                return render_template('add_data.html', vocabularies=VOCABULARIES, form_data=form_data)
            if not primary_hierarchy.get('resource_type'):
                 flash('Please select the primary hierarchy path (at least Resource Type).', 'error')
                 return render_template('add_data.html', vocabularies=VOCABULARIES, form_data=form_data)
            # <<< REMOVED validation for resource_url >>>
            # if not resource_url:
            #      flash('Resource URL is required.', 'error')
            #      return render_template('add_data.html', vocabularies=VOCABULARIES, form_data=form_data)
            # <<< REMOVED validation for year range >>>
            # if year_start is None or year_end is None or year_start > year_end:
            #      flash('Invalid year range selected.', 'error')
            #      return render_template('add_data.html', vocabularies=VOCABULARIES, form_data=form_data)
            # <<< ADDED validation: if both years provided, start <= end >>>
            if year_start is not None and year_end is not None and year_start > year_end:
                flash('Invalid year range: Start year cannot be after end year.', 'error')
                return render_template('add_data.html', vocabularies=VOCABULARIES, form_data=form_data)


            # --- Prepare Data for Pending Submission ---
            submission_data = {
                'resource_name': resource_name,
                'countries': json.dumps(countries),
                'domains': json.dumps(domains),
                'primary_hierarchy_path': json.dumps(primary_hierarchy),
                'year_start': year_start,
                'year_end': year_end,
                'resource_url': resource_url,
                'contact_info': contact_info,
                'description': description,
                'related_metadata': related_metadata_json, # Store the JSON string (category paths)
                'related_resources': related_resources_json, # Store linked resource IDs
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
                return render_template('add_data.html', vocabularies=VOCABULARIES, form_data=form_data)

        except Exception as e:
            # Log the exception for debugging
            app.logger.error(f"Error processing submission: {e}", exc_info=True) # Log stack trace
            flash(f'An unexpected error occurred: {e}', 'error')
            # Pass submitted data back to the form
            return render_template('add_data.html', vocabularies=VOCABULARIES, form_data=form_data)

    # --- GET Request ---
    # Add a check for vocabulary structure before rendering
    if not isinstance(VOCABULARIES, dict) or \
       not isinstance(VOCABULARIES.get('main_categories'), dict) or \
       not isinstance(VOCABULARIES.get('resource_type_hierarchy'), dict):
        app.logger.error("Vocabulary data is corrupted or missing. Check structure_tree.yaml.") # Log the error
        flash('Error: Vocabulary data is corrupted or missing. Cannot load submission form.', 'error')
        # Redirect to index or show an error page
        return redirect(url_for('index'))

    # Pass vocabularies and potentially empty form_data for template rendering
    # Ensure form_data is passed even on GET for consistency if template expects it
    return render_template('add_data.html', vocabularies=VOCABULARIES, form_data=form_data)


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

    # --- UPDATED Filtering for JSON columns ---
    # Use LIKE for simple JSON array matching (assumes simple values like ["Sweden", "Norway"])
    # This is not the most efficient way for large datasets but works for SQLite without JSON extensions
    if filters.get('countries'):
        country_conditions = []
        for country in filters['countries']:
            # Create a LIKE pattern for the country within the JSON array string
            # e.g., %"Sweden"% - checks if the exact string exists
            like_pattern = f'%"{country}"%'
            country_conditions.append("countries LIKE ?")
            params.append(like_pattern)
        if country_conditions:
            query += " AND (" + " OR ".join(country_conditions) + ")" # Use OR if any selected country should match

    if filters.get('domains'):
        domain_conditions = []
        for domain in filters['domains']:
            like_pattern = f'%"{domain}"%'
            domain_conditions.append("domains LIKE ?")
            params.append(like_pattern)
        if domain_conditions:
            query += " AND (" + " OR ".join(domain_conditions) + ")" # Use OR if any selected domain should match
    # --- END UPDATED Filtering ---

    if filters.get('resourceTypes'):
        query += " AND resource_type IN (" + ",".join(["?"] * len(filters['resourceTypes'])) + ")"
        params.extend(filters['resourceTypes'])

    # Execute query
    conn = get_db()
    cur = conn.execute(query, params)
    results = cur.fetchall()
    conn.close() # Close connection

    # Convert results to list of dictionaries
    # Parse countries and domains JSON for the response
    processed_results = []
    for row in results:
        row_dict = dict(row)
        try:
            row_dict['countries_list'] = json.loads(row_dict.get('countries', '[]'))
        except json.JSONDecodeError:
            row_dict['countries_list'] = ['Error']
        try:
            row_dict['domains_list'] = json.loads(row_dict.get('domains', '[]'))
        except json.JSONDecodeError:
            row_dict['domains_list'] = ['Error']
        processed_results.append(row_dict)

    return jsonify(processed_results)

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

    # Convert row to dict and parse metadata, countries, domains
    resource_dict = dict(result)
    if resource_dict.get('metadata'):
        try:
            resource_dict['metadata'] = json.loads(resource_dict['metadata'])
        except json.JSONDecodeError:
            resource_dict['metadata'] = {} # Handle invalid JSON
    try:
        resource_dict['countries_list'] = json.loads(resource_dict.get('countries', '[]'))
    except json.JSONDecodeError:
        resource_dict['countries_list'] = []
    try:
        resource_dict['domains_list'] = json.loads(resource_dict.get('domains', '[]'))
    except json.JSONDecodeError:
        resource_dict['domains_list'] = []


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
    # <<< Fetch countries and domains instead of country, domain >>>
    cur.execute('SELECT id, data_source_id, resource_type, category, subcategory, data_type, level5, countries, domains, metadata FROM data_points')
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

        # --- Parse Countries and Domains JSON ---
        countries_list = []
        domains_list = []
        try:
            countries_list = json.loads(point_dict.get('countries', '[]'))
        except json.JSONDecodeError:
            print(f"Warning: Could not parse countries JSON for {point_dict['data_source_id']}")
        try:
            domains_list = json.loads(point_dict.get('domains', '[]'))
        except json.JSONDecodeError:
            print(f"Warning: Could not parse domains JSON for {point_dict['data_source_id']}")

        # --- Use FIRST country/domain for node linking/coloring (simplification) ---
        country = countries_list[0] if countries_list else None
        domain = domains_list[0] if domains_list else None
        # --- End Simplification ---

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
        dp_node_id = f"dp_{point_dict['id']}"
        dp_label = metadata.get('title', point_dict['data_source_id'])
        country_info = COUNTRY_INFO.get(country, default_country_info) if country else default_country_info
        dp_fill_color = country_info['color']
        dp_border_color = '#555555'
        dp_shape = 'dot'
        # Update tooltip to show lists
        tooltip = f"<b>{dp_label}</b><br>ID: {point_dict['data_source_id']}<br>Countries: {', '.join(countries_list)}<br>Domains: {', '.join(domains_list)}<br>Type: {point_dict.get('resource_type', 'N/A')}"

        if dp_node_id not in added_nodes:
            nodes.append({
                'id': dp_node_id,
                'label': dp_label,
                'title': tooltip,
                'group': 'data_point',
                'shape': dp_shape,
                'size': 18,
                'mass': 3,
                'font': {'size': base_font_size},
                'color': {
                    'background': dp_fill_color,
                    'border': dp_border_color,
                    'highlight': { 'background': dp_fill_color, 'border': '#2B7CE9' },
                    'hover': { 'background': dp_fill_color, 'border': '#E04141' }
                },
                'borderWidth': 2,
                'borderWidthSelected': 4,
                'dataSourceId': point_dict['data_source_id']
            })
            added_nodes.add(dp_node_id)

        # --- Add Edge from Hierarchy Leaf to Data Point ---
        if leaf_hierarchy_node_id:
            edges.append({
                'from': leaf_hierarchy_node_id,
                'to': dp_node_id,
                'length': 80,
                'color': {'color': '#c0c0c0', 'highlight': '#a0a0a0', 'hover': '#a0a0a0'}
            })

        # --- Add Country and Domain Nodes and Edges from Data Point ---
        # Link to *all* countries and domains associated with the data point
        for c_name in countries_list:
            country_node_id = f"country_{c_name.replace(' ', '_').lower()}"
            c_info = COUNTRY_INFO.get(c_name, default_country_info)
            if country_node_id not in added_nodes:
                country_label = f"{c_info['flag']} {c_name}"
                nodes.append({
                    'id': country_node_id, 'label': country_label, 'title': f"Country: {c_name}",
                    'group': 'country_node', 'color': c_info['color'], 'shape': 'hexagon',
                    'size': 30, 'mass': 15, 'font': {'size': base_font_size + 2}
                })
                added_nodes.add(country_node_id)
            edges.append({
                'from': dp_node_id, 'to': country_node_id, 'length': 200,
                'color': {'color': '#dddddd', 'highlight': '#848484', 'hover': '#848484'}
            })

        for d_name in domains_list:
            domain_node_id = f"domain_{d_name.replace(' ', '_').lower()}"
            if domain_node_id not in added_nodes:
                domain_shape = DOMAIN_SHAPES.get(d_name, DOMAIN_SHAPES['default'])
                domain_color = '#FFDAB9'
                nodes.append({
                    'id': domain_node_id, 'label': d_name, 'title': f"Domain: {d_name}",
                    'group': 'domain_node', 'color': domain_color, 'shape': domain_shape,
                    'size': 22, 'mass': 8, 'font': {'size': base_font_size}
                })
                added_nodes.add(domain_node_id)
            edges.append({
                'from': dp_node_id, 'to': domain_node_id, 'length': 180,
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
            item['related_resources_list'] = json.loads(item.get('related_resources', '[]'))
        except json.JSONDecodeError:
            item['countries_list'] = ['Error']
            item['domains_list'] = ['Error']
            item['primary_hierarchy_dict'] = {'Error': 'Invalid JSON'}
            item['related_metadata_list'] = ['Error']
            item['related_resources_list'] = ['Error']
    return render_template('admin_review.html', submissions=pending)

@app.route('/admin/approve/<int:submission_id>', methods=['POST'])
@admin_required
def approve_submission(submission_id):
    submission = get_pending_submission_by_id(submission_id)
    if not submission:
        flash('Submission not found.', 'error')
        return redirect(url_for('admin_review'))

    try:
        # --- Transform Submission Data ---
        resource_name = submission.get('resource_name')
        # Get JSON strings directly from submission
        countries_json = submission.get('countries', '[]')
        domains_json = submission.get('domains', '[]')
        # Parse primary hierarchy and related data
        primary_hierarchy = json.loads(submission.get('primary_hierarchy_path', '{}'))
        related_metadata_paths = json.loads(submission.get('related_metadata', '[]'))
        related_resource_ids = json.loads(submission.get('related_resources', '[]'))
        # <<< Year start/end can be None >>>
        year_start = submission.get('year_start')
        year_end = submission.get('year_end')

        # Validate JSON lists are not empty
        countries_list = json.loads(countries_json)
        domains_list = json.loads(domains_json)
        if not countries_list or not domains_list:
             flash(f'Submission {submission_id} missing Country or Domain selection. Cannot approve.', 'error')
             return redirect(url_for('admin_review'))

        # Extract hierarchy levels (use .get with None default)
        resource_type = primary_hierarchy.get('resource_type') # Required
        category = primary_hierarchy.get('category')
        subcategory = primary_hierarchy.get('subcategory')
        data_type = primary_hierarchy.get('data_type')
        level5 = primary_hierarchy.get('level5')

        # --- Validation ---
        # <<< REMOVED year range check from required fields >>>
        if not resource_name or not resource_type:
             flash(f'Submission {submission_id} missing required fields (Name, Type). Cannot approve.', 'error')
             return redirect(url_for('admin_review'))
        # --- End Validation ---

        # <<< Handle potentially None URL >>>
        repository_url = submission.get('resource_url')
        repository = 'Unknown'
        if repository_url:
            try:
                parsed_url = urlparse(repository_url)
                repository = parsed_url.netloc if parsed_url.netloc else 'Unknown'
            except Exception:
                repository = 'Unknown' # Keep Unknown if URL parsing fails

        # <<< Description can be None/empty >>>
        data_description = submission.get('description') # Allow None
        keywords = submission.get('keywords')
        contact_information = submission.get('contact_info')
        last_updated = datetime.date.today().isoformat()
        data_format = 'Unknown'
        data_resolution = 'Unknown'

        # Create metadata JSON
        metadata_dict = {
            "title": resource_name,
            "institution": "Unknown",
            "license": submission.get('license'),
            "original_url": repository_url, # Store None if not provided
            "related_metadata_categories": related_metadata_paths,
            "related_resource_ids": related_resource_ids,
            "submitted_description": data_description # Store None if not provided
        }
        metadata_json = json.dumps(metadata_dict)

        # Prepare tuple for add_data_point (matching function signature)
        # <<< Pass potentially None values for year_start, year_end, repository_url, data_description >>>
        data_point_tuple = (
            None, resource_type, category, subcategory, data_type, level5,
            year_start, year_end, data_format, data_resolution, repository, repository_url,
            data_description, keywords, last_updated, contact_information, metadata_json,
            countries_json, domains_json
        )

        # --- Add to Main Data Points Table ---
        new_data_source_id = add_data_point(data_point_tuple)

        if new_data_source_id:
            delete_pending_submission(submission_id)
            flash(f'Submission {submission_id} approved and added with ID: {new_data_source_id}.', 'success')
        else:
            flash(f'Failed to add approved submission {submission_id} to main database (possibly duplicate URL).', 'error')

    except json.JSONDecodeError as e:
        flash(f'Error parsing JSON data for submission {submission_id}: {e}. Cannot approve.', 'error')
    except Exception as e:
        app.logger.error(f"Error approving submission {submission_id}: {e}", exc_info=True)
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

# --- NEW ROUTE: Download Database ---
@app.route('/admin/download-db')
@admin_required
def download_db():
    """Allows admin to download the current database file."""
    try:
        # Get the absolute path to the database file from database.py
        db_path = DB_PATH # Use the imported DB_PATH
        if not os.path.exists(db_path):
            flash('Database file not found.', 'error')
            return redirect(url_for('admin_review'))

        # Send the file to the user
        return send_file(
            db_path,
            as_attachment=True,
            download_name=f'nomoreamr_backup_{datetime.date.today().isoformat()}.db' # Suggest a filename
        )
    except Exception as e:
        app.logger.error(f"Error downloading database: {e}", exc_info=True)
        flash(f'An error occurred while trying to download the database: {e}', 'error')
        return redirect(url_for('admin_review'))
# --- END NEW ROUTE ---

# --- NEW: Admin Manage Approved Resources ---
@app.route('/admin/manage')
@admin_required
def admin_manage():
    """Displays a list of approved resources for editing or deletion."""
    approved_resources = get_all_data_points() # Fetch all approved points
    # Parse JSON fields for display
    for resource in approved_resources:
        try:
            if resource.get('metadata'):
                 resource['metadata_obj'] = json.loads(resource['metadata'])
            else:
                 resource['metadata_obj'] = {}
            # <<< Parse countries and domains JSON >>>
            resource['countries_list'] = json.loads(resource.get('countries', '[]'))
            resource['domains_list'] = json.loads(resource.get('domains', '[]'))
        except json.JSONDecodeError:
            resource['metadata_obj'] = {'Error': 'Invalid JSON'}
            resource['countries_list'] = ['Error'] # Add error handling
            resource['domains_list'] = ['Error']
    return render_template('admin_manage.html', resources=approved_resources)

# --- NEW: Edit Resource (GET - Show Form) ---
@app.route('/admin/edit/<int:data_id>', methods=['GET'])
@admin_required
def edit_data_form(data_id):
    """Displays the form to edit an existing resource."""
    data_point_row = get_data_point_by_id(data_id) # Fetch by primary key ID
    if not data_point_row:
        flash(f'Resource with ID {data_id} not found.', 'error')
        return redirect(url_for('admin_manage'))

    data_point = dict(data_point_row)
    form_data = {}
    metadata = {}
    form_data_multidict = MultiDict() # Initialize MultiDict

    try:
        if data_point.get('metadata'):
            metadata = json.loads(data_point['metadata'])
        data_point['metadata_obj'] = metadata # Keep for display

        # <<< Parse countries and domains JSON from DB >>>
        countries_list = json.loads(data_point.get('countries', '[]'))
        domains_list = json.loads(data_point.get('domains', '[]'))

        # --- Populate form_data dictionary (used for MultiDict creation) ---
        form_data['resource_name'] = metadata.get('title', data_point.get('data_source_id'))
        form_data['license'] = metadata.get('license', '')
        # Store JSON strings for hidden fields
        form_data['related_resources'] = json.dumps(metadata.get('related_resource_ids', []))
        form_data['related_metadata'] = json.dumps(metadata.get('related_metadata_categories', []))
        # Store lists directly for multi-select pre-filling via MultiDict
        form_data['countries'] = countries_list
        form_data['domains'] = domains_list
        # Hierarchy fields
        form_data['level1_resource_type'] = data_point.get('resource_type')
        form_data['level2_category'] = data_point.get('category')
        form_data['level3_subcategory'] = data_point.get('subcategory')
        form_data['level4_data_type'] = data_point.get('data_type')
        form_data['level5_item'] = data_point.get('level5')
        # Other fields
        form_data['year_start'] = data_point.get('year_start')
        form_data['year_end'] = data_point.get('year_end')
        form_data['resource_url'] = data_point.get('repository_url')
        form_data['contact_info'] = data_point.get('contact_information', '')
        form_data['description'] = data_point.get('data_description', '')
        form_data['keywords'] = data_point.get('keywords', '')
        # --- End form_data population ---


        # --- Convert to MultiDict for template compatibility ---
        # Handle list values correctly for MultiDict by iterating
        form_data_multidict_items = []
        for key, value in form_data.items():
            if isinstance(value, list):
                # If the value is a list, add each item separately for MultiDict
                for item in value:
                    form_data_multidict_items.append((key, item))
            elif value is not None: # Add non-list items, skip None values
                 form_data_multidict_items.append((key, value))
            # If value is None, it's skipped, which is usually desired for form pre-filling

        form_data_multidict = MultiDict(form_data_multidict_items)
        # --- End MultiDict Conversion ---


    except json.JSONDecodeError as e:
        flash(f'Error parsing stored data for editing: {e}', 'error')
        data_point['metadata_obj'] = {'Error': 'Invalid JSON'}
        # Provide empty lists if parsing fails, MultiDict will be empty or partial
        form_data_multidict = MultiDict() # Reset to empty on error

    # Pass the original data_point (for display) and the prepared MultiDict
    return render_template('edit_data.html',
                           vocabularies=VOCABULARIES,
                           data_point=data_point, # Pass original data for display if needed
                           form_data=form_data_multidict) # Pass the pre-filled MultiDict

# --- NEW: Edit Resource (POST - Handle Update) ---
@app.route('/admin/edit/<int:data_id>', methods=['POST'])
@admin_required
def update_data(data_id):
    """Handles the submission of the edit form."""
    original_data_point_row = get_data_point_by_id(data_id) # Fetch row object
    if not original_data_point_row:
        flash(f'Resource with ID {data_id} not found.', 'error')
        return redirect(url_for('admin_manage'))

    # Convert row to dict for easier manipulation
    original_data_point = dict(original_data_point_row)

    # --- Helper function to prepare data_point for template rendering ---
    def prepare_data_point_for_template(data_point_dict):
        try:
            if data_point_dict.get('metadata'):
                data_point_dict['metadata_obj'] = json.loads(data_point_dict['metadata'])
            else:
                data_point_dict['metadata_obj'] = {}
            # <<< Parse countries and domains JSON for display in template if needed >>>
            data_point_dict['countries_list'] = json.loads(data_point_dict.get('countries', '[]'))
            data_point_dict['domains_list'] = json.loads(data_point_dict.get('domains', '[]'))
        except json.JSONDecodeError:
            data_point_dict['metadata_obj'] = {'Error': 'Invalid JSON in DB'}
            data_point_dict['countries_list'] = ['Error']
            data_point_dict['domains_list'] = ['Error']
        return data_point_dict
    # --- End Helper ---

    form_data = request.form # Keep as ImmutableMultiDict for now

    try:
        # --- Collect Form Data ---
        resource_name = form_data.get('resource_name')
        # <<< Use getlist for multi-select fields >>>
        countries_list = form_data.getlist('countries')
        domains_list = form_data.getlist('domains')

        primary_hierarchy = {
            'resource_type': form_data.get('level1_resource_type'),
            'category': form_data.get('level2_category'),
            'subcategory': form_data.get('level3_subcategory'),
            'data_type': form_data.get('level4_data_type'),
            'level5': form_data.get('level5_item')
        }
        # Ensure empty strings become None for database consistency
        primary_hierarchy = {k: (v if v else None) for k, v in primary_hierarchy.items()}

        # Get year values, allowing for empty strings -> None
        year_start_str = form_data.get('year_start')
        year_end_str = form_data.get('year_end')
        year_start = int(year_start_str) if year_start_str else None
        year_end = int(year_end_str) if year_end_str else None

        resource_url = form_data.get('resource_url')
        contact_info = form_data.get('contact_info')
        description = form_data.get('description')
        related_metadata_json = form_data.get('related_metadata', '[]')
        related_resources_json = form_data.get('related_resources', '[]')
        keywords = form_data.get('keywords')
        license_info = form_data.get('license')

        # --- Basic Validation ---
        # <<< Check if countries_list or domains_list are empty >>>
        if not resource_name or not countries_list or not domains_list or not primary_hierarchy.get('resource_type'):
             flash('Missing required fields (Name, Country, Domain, Resource Type).', 'error')
             # <<< Prepare original_data_point before re-rendering >>>
             original_data_point = prepare_data_point_for_template(original_data_point)
             # Pass the submitted form data back as MultiDict for pre-filling
             return render_template('edit_data.html', vocabularies=VOCABULARIES, data_point=original_data_point, form_data=MultiDict(form_data))
        # <<< ADDED validation: if both years provided, start <= end >>>
        if year_start is not None and year_end is not None and year_start > year_end:
            flash('Invalid year range: Start year cannot be after end year.', 'error')
            original_data_point = prepare_data_point_for_template(original_data_point)
            return render_template('edit_data.html', vocabularies=VOCABULARIES, data_point=original_data_point, form_data=MultiDict(form_data))


        # --- Prepare Data for Update ---
        resource_type = primary_hierarchy.get('resource_type')
        category = primary_hierarchy.get('category')
        subcategory = primary_hierarchy.get('subcategory')
        data_type = primary_hierarchy.get('data_type')
        level5 = primary_hierarchy.get('level5')

        try:
            parsed_url = urlparse(resource_url)
            repository = parsed_url.netloc if parsed_url.netloc else 'Unknown'
            # Validate and load related data JSON
            related_metadata_list = json.loads(related_metadata_json)
            related_resources_list = json.loads(related_resources_json)
        except (json.JSONDecodeError, Exception) as e:
             flash(f'Invalid format for related data or URL: {e}', 'error')
             original_data_point = prepare_data_point_for_template(original_data_point)
             return render_template('edit_data.html', vocabularies=VOCABULARIES, data_point=original_data_point, form_data=MultiDict(form_data))

        original_metadata = {}
        if original_data_point.get('metadata'):
            try:
                original_metadata = json.loads(original_data_point['metadata'])
            except json.JSONDecodeError:
                pass # Keep original_metadata empty if parsing fails

        metadata_dict = {
            "title": resource_name,
            "institution": original_metadata.get('institution', "Unknown"), # Preserve original institution if possible
            "license": license_info,
            "original_url": resource_url,
            "related_metadata_categories": related_metadata_list,
            "related_resource_ids": related_resources_list,
            "submitted_description": description # Use the new description from the form
        }
        metadata_json_updated = json.dumps(metadata_dict)

        # <<< Convert lists back to JSON strings for DB storage >>>
        countries_json_updated = json.dumps(countries_list)
        domains_json_updated = json.dumps(domains_list)

        update_payload = {
            'resource_type': resource_type,
            'category': category,
            'subcategory': subcategory,
            'data_type': data_type,
            'level5': level5,
            'year_start': year_start,
            'year_end': year_end,
            'repository': repository,
            'repository_url': resource_url,
            'data_description': description,
            'keywords': keywords,
            'last_updated': datetime.date.today().isoformat(),
            'contact_information': contact_info,
            'metadata': metadata_json_updated,
            'countries': countries_json_updated, # <<< Use JSON string >>>
            'domains': domains_json_updated    # <<< Use JSON string >>>
        }

        # <<< Add Logging before DB call >>>
        app.logger.info(f"Attempting to update data_point ID: {data_id}")
        app.logger.info(f"Update Payload: {json.dumps(update_payload, indent=2)}") # Log the payload

        # --- Call Database Update Function ---
        if update_data_point(data_id, update_payload):
            flash(f'Resource {original_data_point.get("data_source_id", data_id)} updated successfully!', 'success')
            return redirect(url_for('admin_manage'))
        else:
            # The error message "Failed to update resource..." comes from here
            flash(f'Failed to update resource {original_data_point.get("data_source_id", data_id)}. Check logs for details.', 'error') # Updated flash message
            original_data_point = prepare_data_point_for_template(original_data_point)
            return render_template('edit_data.html', vocabularies=VOCABULARIES, data_point=original_data_point, form_data=MultiDict(form_data))

    except Exception as e:
        app.logger.error(f"Error updating resource {data_id}: {e}", exc_info=True) # Log full exception
        flash(f'An unexpected error occurred: {e}', 'error')
        original_data_point = prepare_data_point_for_template(original_data_point)
        return render_template('edit_data.html', vocabularies=VOCABULARIES, data_point=original_data_point, form_data=MultiDict(form_data))

# --- (Optional) NEW: Delete Resource ---
@app.route('/admin/delete/<int:data_id>', methods=['POST'])
@admin_required
def delete_data(data_id):
    """Handles the deletion of an approved resource."""
    data_point = get_data_point_by_id(data_id) # Fetch to get name for flash message
    if not data_point:
        flash(f'Resource with ID {data_id} not found.', 'error')
        return redirect(url_for('admin_manage'))

    if delete_data_point(data_id):
        flash(f'Resource "{data_point.get("data_source_id", data_id)}" deleted successfully.', 'success')
    else:
        flash(f'Failed to delete resource "{data_point.get("data_source_id", data_id)}".', 'error')

    return redirect(url_for('admin_manage'))

# --- NEW: API Endpoint for Searching Resources ---
@app.route('/api/search-resources')
def search_resources():
    """API endpoint for Select2 AJAX search."""
    search_term = request.args.get('q', '').strip()
    limit = request.args.get('limit', 15, type=int) # Limit results for performance

    if not search_term or len(search_term) < 2: # Require at least 2 characters
        return jsonify([])

    conn = get_db()
    c = conn.cursor()

    # Prepare search pattern
    search_pattern = f"%{search_term}%"

    # Query across multiple fields: data_source_id, keywords, description, and title within metadata JSON
    # Using LIKE for basic search. For JSON, we use json_extract.
    # Note: json_extract might be slow on large datasets without indexing.
    query = """
        SELECT id, data_source_id, metadata, keywords, data_description
        FROM data_points
        WHERE data_source_id LIKE ?
           OR keywords LIKE ?
           OR data_description LIKE ?
           OR json_extract(metadata, '$.title') LIKE ?
        ORDER BY last_updated DESC
        LIMIT ?
    """
    params = [search_pattern, search_pattern, search_pattern, search_pattern, limit]

    try:
        c.execute(query, params)
        results = c.fetchall()
    except sqlite3.Error as e:
        logging.error(f"Error searching resources: {e}")
        results = [] # Return empty on error
    finally:
        conn.close()

    # Format results for Select2 { id: data_source_id, text: 'Title (ID)' }
    formatted_results = []
    for row in results:
        row_dict = dict(row)
        title = row_dict.get('data_source_id', 'Unknown ID') # Default to ID
        try:
            metadata = json.loads(row_dict.get('metadata', '{}'))
            title = metadata.get('title', title) # Use title from metadata if available
        except json.JSONDecodeError:
            pass # Keep default title if metadata parsing fails

        formatted_results.append({
            "id": row_dict['data_source_id'], # Use data_source_id as the value
            "text": f"{title} ({row_dict['data_source_id']})" # Display text
        })

    return jsonify(formatted_results)
# --- END NEW API Endpoint ---

# --- NEW API ENDPOINT FOR AI CHAT ---
@app.route('/api/ai-chat', methods=['POST'])
def ai_chat_handler():
    if not GEMINI_API_KEY:
        return jsonify({"error": "AI service not configured."}), 503

    data = request.json
    user_query = data.get('query')
    selected_resource_ids = data.get('selected_resource_ids', []) # List of data_source_id

    if not user_query:
        return jsonify({"error": "No query provided."}), 400

    conn = get_db()
    c = conn.cursor()

    # 1. Fetch summary of all resources (ID, Title, Resource Type, Keywords)
    # These will form the general knowledge base for the AI for this turn.
    try:
        c.execute("SELECT data_source_id, metadata, resource_type, category, keywords FROM data_points")
        all_resources_rows = c.fetchall()
    except sqlite3.Error as e:
        logging.error(f"AI Chat - DB error fetching all resources: {e}")
        return jsonify({"error": "Database error fetching resource summary."}), 500
    
    all_resources_summary_list = []
    for row_idx, row in enumerate(all_resources_rows):
        row_dict = dict(row)
        title = row_dict.get('data_source_id', f'Unknown Resource {row_idx+1}')
        try:
            metadata = json.loads(row_dict.get('metadata', '{}'))
            title = metadata.get('title', title)
        except json.JSONDecodeError:
            pass
        
        countries_list_summary = json.loads(row_dict.get('countries', '[]'))
        domains_list_summary = json.loads(row_dict.get('domains', '[]'))

        summary_entry = (
            f"- ID: {row_dict['data_source_id']}\n"
            f"  Title: {title}\n"
            f"  Resource Type: {row_dict.get('resource_type', 'N/A')}\n"
            f"  Category: {row_dict.get('category', 'N/A')}\n"
            f"  Keywords: {row_dict.get('keywords', 'N/A')}\n"
            f"  Countries: {', '.join(countries_list_summary)}\n"
            f"  Domains: {', '.join(domains_list_summary)}\n"
            f"  Years: {row_dict.get('year_start','N/A')}-{row_dict.get('year_end','N/A')}"
        )
        all_resources_summary_list.append(summary_entry)
    
    all_resources_summary_text = "\n".join(all_resources_summary_list)
    if not all_resources_summary_text:
        all_resources_summary_text = "No resources found in the database."

    # 2. Fetch details for specifically selected resources
    selected_resources_details_text = ""
    if selected_resource_ids:
        try:
            # Ensure selected_resource_ids is a list of strings for the query
            placeholders = ','.join('?' for _ in selected_resource_ids)
            c.execute(f"SELECT data_source_id, metadata, resource_type, category, subcategory, data_type, level5, data_description, keywords, countries, domains, year_start, year_end FROM data_points WHERE data_source_id IN ({placeholders})", selected_resource_ids)
            selected_rows = c.fetchall()
            
            if selected_rows:
                selected_resources_details_text += "\n\n== Details for Specifically Selected Resources ==\n"
                for row in selected_rows:
                    row_dict = dict(row)
                    title = row_dict.get('data_source_id', 'Unknown ID')
                    try:
                        metadata = json.loads(row_dict.get('metadata', '{}'))
                        title = metadata.get('title', title)
                    except json.JSONDecodeError:
                        pass
                    
                    countries_list = json.loads(row_dict.get('countries', '[]'))
                    domains_list = json.loads(row_dict.get('domains', '[]'))

                    selected_resources_details_text += (
                        f"\n---\n"
                        f"Resource ID: {row_dict['data_source_id']}\n"
                        f"Title: {title}\n"
                        f"Resource Type: {row_dict.get('resource_type')}\n"
                        f"Category: {row_dict.get('category')}\n"
                        f"Subcategory: {row_dict.get('subcategory')}\n"
                        f"Data Type: {row_dict.get('data_type')}\n"
                        f"Level 5 Item: {row_dict.get('level5')}\n"
                        f"Description: {row_dict.get('data_description', 'N/A')}\n"
                        f"Keywords: {row_dict.get('keywords', 'N/A')}\n"
                        f"Countries: {', '.join(countries_list)}\n"
                        f"Domains: {', '.join(domains_list)}\n"
                        f"Year Range: {row_dict.get('year_start', 'N/A')} - {row_dict.get('year_end', 'N/A')}\n"
                        f"---\n"
                    )
            else:
                selected_resources_details_text = "\n\n(No details found for the specifically selected resource IDs, or none were selected.)\n"
        except sqlite3.Error as e:
            logging.error(f"AI Chat - DB error fetching selected resources: {e}")
            selected_resources_details_text = "\n\n(Error fetching details for selected resources.)\n"
    
    conn.close()

    # 3. Get Vocabulary/Hierarchy Text
    hierarchy_context = get_detailed_vocab_text() # This provides the structure

    # 4. Construct the prompt for Gemini
    prompt = f"""
You are a specialized AI assistant for the NoMoReAMR database, a Nordic initiative for antimicrobial resistance research.
Your primary goal is to help users discover relevant data points, systems, publications, or entities within this database.
You must use the provided information (Vocabulary/Hierarchy, All Available Resources Summary, and Details for Specifically Selected Resources) to answer the user's query.
Be concise, helpful, and professional. Your responses must be in Markdown format.

User's Query: "{user_query}"

--------------------------------------------------
CONTEXTUAL INFORMATION:
--------------------------------------------------

1.  VOCABULARY & HIERARCHY:
    This describes how resources are categorized in the NoMoReAMR database.
    {hierarchy_context}

2.  DETAILS FOR SPECIFICALLY SELECTED RESOURCES (if any, these are high priority for context):
    The user has explicitly selected these resources to discuss. Focus on these if the query relates to them.
    {selected_resources_details_text if selected_resources_details_text.strip() else "No specific resources were selected by the user for this query."}

3.  SUMMARY OF ALL AVAILABLE RESOURCES IN THE DATABASE (general context, use if no specific resources are selected or if query is broad):
    This is a list of all resources. Use this to find potentially relevant items if the query is general.
    {all_resources_summary_text}

--------------------------------------------------
RESPONSE INSTRUCTIONS:
--------------------------------------------------

Based on the user's query and ALL the contextual information above:
*   Provide a helpful and informative response.
*   If you identify specific resources relevant to the query, you MUST list their Title and Data Source ID.
*   CRITICAL: When you mention a resource that the user might want to view in detail, you MUST format it as a Markdown link using the special 'resource_click://' protocol followed by the resource's 'data_source_id'.
    Example: If a resource has Title "Swedish Wastewater Data" and ID "SWE_WW_DATA_001", you must link it as: [Swedish Wastewater Data (SWE_WW_DATA_001)](resource_click://SWE_WW_DATA_001)
*   Do NOT invent resource IDs or details. Only refer to information present in the provided context.
*   If the query is too vague or if no relevant resources are found, politely state that and perhaps suggest how the user could refine their query.
*   Ensure your entire response is formatted using Markdown (e.g., use bullet points for lists, bold for emphasis).
"""

    try:
        response = requests.post(f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}", json={"contents": [{"parts": [{"text": prompt}]}]}, headers={"Content-Type": "application/json"})
        response.raise_for_status()
        response_json = response.json()
        
        ai_reply = "Sorry, I couldn't generate a response." # Default
        if 'candidates' in response_json and response_json['candidates']:
            content = response_json['candidates'][0].get('content', {})
            if 'parts' in content and content['parts']:
                ai_reply = content['parts'][0].get('text', ai_reply)
        
        return jsonify({"reply": ai_reply})

    except requests.exceptions.RequestException as e:
        logging.error(f"AI Chat - Gemini API request error: {e}")
        if e.response is not None:
            logging.error(f"AI Chat - Gemini API response content: {e.response.text}")
            return jsonify({"error": f"AI service request error: {e}. Response: {e.response.text[:200]}"}), 502
        return jsonify({"error": f"AI service request error: {e}"}), 502
    except Exception as e:
        logging.error(f"AI Chat - Error calling Gemini API: {e}", exc_info=True)
        return jsonify({"error": f"AI service processing error: {e}"}), 500
# --- END NEW API ENDPOINT ---

# --- NEW ROUTE FOR AI EXPLORER PAGE ---
@app.route('/ai-search')
def ai_search():
    """Serves the dedicated AI Search page."""
    # Pass vocabularies if needed by any components on this page, though chat primarily uses API
    vocabularies = {
        "main_categories": get_main_categories(),
        "resource_type_hierarchy": get_resource_type_hierarchy()
    }
    return render_template('ai_search.html', vocabularies=vocabularies)
# --- END NEW ROUTE ---

if __name__ == '__main__':
    if not ADMIN_PASSWORD:
        print("Warning: ADMIN_PASSWORD environment variable not set. Admin login will not work.")
    if not GEMINI_API_KEY: # <<< Check for Gemini key
        print("Warning: GEMINI_API_KEY environment variable not set. AI processing will not work.")
    # Ensure DB is initialized when running directly
    init_db()
    # load_initial_data() # <<< REMOVE THIS CALL
    app.run(debug=True)
