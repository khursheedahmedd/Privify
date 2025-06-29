from flask import Blueprint, request, jsonify
import os
import logging
from config import UPLOAD_FOLDER
from services.vision_analysis_service import analyze_image_description, detect_objects_in_image, analyze_image_comprehensive

vision_analysis_bp = Blueprint('vision_analysis', __name__)
logger = logging.getLogger(__name__)

@vision_analysis_bp.route('/description', methods=['POST'])
def get_image_description():
    """
    Get a short description of the uploaded image.
    """
    logger.info("Received request for image description")
    
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
        
        logger.info("Analyzing image description...")
        result = analyze_image_description(input_path)
        
        if not result['success']:
            return jsonify({'error': result['error']}), 500
        
        return jsonify({
            'success': True,
            'description': result['description']
        })
        
    except Exception as e:
        logger.error(f"Image description analysis failed: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@vision_analysis_bp.route('/objects', methods=['POST'])
def get_detected_objects():
    """
    Detect objects in the uploaded image.
    """
    logger.info("Received request for object detection")
    
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
        
        logger.info("Detecting objects in image...")
        result = detect_objects_in_image(input_path)
        
        if not result['success']:
            return jsonify({'error': result['error']}), 500
        
        return jsonify({
            'success': True,
            'objects': result['objects'],
            'object_count': result['object_count'],
            'note': result.get('note', '')
        })
        
    except Exception as e:
        logger.error(f"Object detection failed: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@vision_analysis_bp.route('/comprehensive', methods=['POST'])
def get_comprehensive_analysis():
    """
    Get comprehensive analysis including description and object detection.
    """
    logger.info("Received request for comprehensive vision analysis")
    
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
        
        logger.info("Performing comprehensive vision analysis...")
        result = analyze_image_comprehensive(input_path)
        
        if not result['success']:
            return jsonify({
                'success': False,
                'errors': result['errors'],
                'partial_results': {
                    'description': result.get('description', ''),
                    'objects': result.get('objects', []),
                    'object_count': result.get('object_count', 0)
                }
            }), 500
        
        return jsonify({
            'success': True,
            'description': result['description'],
            'objects': result['objects'],
            'object_count': result['object_count']
        })
        
    except Exception as e:
        logger.error(f"Comprehensive vision analysis failed: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500 