from flask import Blueprint, request, jsonify, current_app
import os
import logging
import json
from config import UPLOAD_FOLDER
from services.exif_service import extract_metadata
from services.risk_analysis_service import analyze_metadata_risks  # New import

metadata_bp = Blueprint('metadata', __name__)
logger = logging.getLogger(__name__)

# Original scan endpoint remains unchanged
@metadata_bp.route('/scan', methods=['POST'])
def scan_metadata():
    logger.info("Received request at /metadata/scan endpoint.")

    if 'file' not in request.files:
        logger.error("No file part found in the request.")
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    file.save(file_path)
    logger.info("File saved to: %s", file_path)

    metadata = extract_metadata(file_path)
    logger.info("Returning extracted metadata.")

    return jsonify(metadata)

# New risk analysis endpoint
@metadata_bp.route('/analyze', methods=['POST'])
def analyze_metadata():
    logger.info("Received request at /metadata/analyze endpoint.")
    
    # Handle JSON data
    if request.is_json:
        try:
            metadata = request.get_json(force=True)
            logger.debug(f"Received JSON metadata: {json.dumps(metadata, indent=2)}")
        except Exception as e:
            logger.error(f"JSON parsing error: {str(e)}")
            return jsonify({'error': 'Invalid JSON format'}), 400
            
    # Handle file upload
    elif 'file' in request.files:
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
            
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        try:
            file.save(file_path)
            metadata = extract_metadata(file_path)
        except Exception as e:
            logger.error(f"File processing error: {str(e)}")
            return jsonify({'error': 'File processing failed'}), 400
            
    else:
        logger.error("No valid input provided - missing both file and JSON")
        return jsonify({'error': 'No valid input provided'}), 400

    # Perform risk analysis
    try:
        risk_report = analyze_metadata_risks(metadata)
        logger.info("Risk analysis completed successfully")
        return jsonify({
            'metadata': metadata,
            'risk_analysis': risk_report
        })
    except Exception as e:
        logger.error(f"Risk analysis failed: {str(e)}")
        return jsonify({'error': 'Risk analysis failed'}), 500

def convert_gps_to_decimal(gps_data):
    """Convert GPS coordinates to decimal format (backend option)"""
    try:
        lat = gps_data['GPSLatitude']
        lat_ref = gps_data['GPSLatitudeRef']
        lon = gps_data['GPSLongitude']
        lon_ref = gps_data['GPSLongitudeRef']

        lat_decimal = lat[0] + lat[1]/60 + lat[2]/3600
        lon_decimal = lon[0] + lon[1]/60 + lon[2]/3600
        
        return {
            'latitude': lat_decimal * (-1 if lat_ref in ['S', 'W'] else 1),
            'longitude': lon_decimal * (-1 if lon_ref in ['S', 'W'] else 1),
            'map_link': f"https://www.openstreetmap.org/?mlat={lat_decimal}&mlon={lon_decimal}"
        }
    except KeyError as e:
        logger.warning(f"Missing GPS data component: {str(e)}")
        return None