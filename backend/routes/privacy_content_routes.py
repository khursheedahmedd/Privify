from flask import Blueprint, request, jsonify
import os
import logging
from config import UPLOAD_FOLDER
from services.privacy_content_detection_service import detect_privacy_sensitive_content

privacy_content_bp = Blueprint('privacy_content', __name__)
logger = logging.getLogger(__name__)

@privacy_content_bp.route('/detect', methods=['POST'])
def detect_privacy_content():
    """
    Detect privacy-sensitive content in uploaded images.
    """
    logger.info("Received request for privacy content detection")
    
    if 'file' not in request.files:
        logger.error("No file part in request")
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if file.filename == '':
        logger.error("Empty filename")
        return jsonify({'error': 'No selected file'}), 400

    # Create necessary directories
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    try:
        input_path = os.path.join(UPLOAD_FOLDER, file.filename)
        
        logger.info(f"Saving file to {input_path}")
        file.save(input_path)
        
        logger.info("Detecting privacy-sensitive content...")
        result = detect_privacy_sensitive_content(input_path)
        
        if not result['success']:
            return jsonify({'error': result['error']}), 500
        
        return jsonify({
            'success': True,
            'privacy_analysis': result['data'],
            'note': result.get('note', '')
        })
        
    except Exception as e:
        logger.error(f"Privacy content detection failed: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500 