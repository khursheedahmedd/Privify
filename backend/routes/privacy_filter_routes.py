# routes/privacy_filter_routes.py
from flask import Blueprint, request, jsonify, send_file
import os
import logging
from config import UPLOAD_FOLDER, PROCESSED_FOLDER
from services.blur_service import remove_text_from_image

# Initialize the Blueprint FIRST
privacy_filter_bp = Blueprint('privacy_filter', __name__)
logger = logging.getLogger(__name__)

@privacy_filter_bp.route('/filter', methods=['POST'])
def privacy_filter():
    logger.info("Received privacy filter request")
    
    if 'file' not in request.files:
        logger.error("No file part in request")
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if file.filename == '':
        logger.error("Empty filename")
        return jsonify({'error': 'No selected file'}), 400

    # Create necessary directories
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(PROCESSED_FOLDER, exist_ok=True)

    try:
        input_path = os.path.join(UPLOAD_FOLDER, file.filename)
        output_path = os.path.join(PROCESSED_FOLDER, f"processed_{file.filename}")
        
        logger.info(f"Saving file to {input_path}")
        file.save(input_path)
        
        logger.info("Processing image...")
        if not remove_text_from_image(input_path, output_path):
            return jsonify({'error': 'Text removal failed'}), 500
            
        return send_file(output_path, mimetype='image/jpeg')
        
    except Exception as e:
        logger.error(f"Processing failed: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500