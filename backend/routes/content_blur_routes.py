from flask import Blueprint, request, jsonify, send_file
import os
import logging
import uuid
from datetime import datetime
from services.content_blur_service import blur_service
from config import UPLOAD_FOLDER, PROCESSED_FOLDER

content_blur_bp = Blueprint('content_blur', __name__)
logger = logging.getLogger(__name__)

@content_blur_bp.route('/blur-content', methods=['POST'])
def blur_sensitive_content():
    """
    Blur sensitive content in an image based on detected content type.
    """
    logger.info("Received request at /content-blur/blur-content endpoint.")
    
    try:
        # Check if file is uploaded
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Get parameters
        content_type = request.form.get('content_type', 'license_plate')
        intensity = request.form.get('intensity', 'medium')
        
        # Validate parameters
        valid_content_types = ['license_plate', 'text', 'face', 'custom']
        valid_intensities = ['light', 'medium', 'heavy']
        
        if content_type not in valid_content_types:
            return jsonify({'error': f'Invalid content_type. Must be one of: {valid_content_types}'}), 400
        
        if intensity not in valid_intensities:
            return jsonify({'error': f'Invalid intensity. Must be one of: {valid_intensities}'}), 400
        
        # Save uploaded file
        filename = f"{uuid.uuid4()}_{file.filename}"
        input_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(input_path)
        
        # Generate output filename
        output_filename = f"blurred_{filename}"
        output_path = os.path.join(PROCESSED_FOLDER, output_filename)
        
        # Ensure processed folder exists
        os.makedirs(PROCESSED_FOLDER, exist_ok=True)
        
        # Apply blur based on content type
        if content_type == 'custom':
            # For custom region, get coordinates from form
            x = int(request.form.get('x', 0))
            y = int(request.form.get('y', 0))
            width = int(request.form.get('width', 100))
            height = int(request.form.get('height', 100))
            
            success = blur_service.blur_custom_region(
                input_path, output_path, x, y, width, height, intensity
            )
        else:
            success = blur_service.blur_based_on_content_type(
                input_path, output_path, content_type, intensity
            )
        
        if success and os.path.exists(output_path):
            # Return the blurred image
            return send_file(
                output_path,
                mimetype='image/jpeg',
                as_attachment=True,
                download_name=output_filename
            )
        else:
            return jsonify({'error': 'Failed to blur image'}), 500
            
    except Exception as e:
        logger.error(f"Error in blur_content: {str(e)}")
        return jsonify({'error': f'Blur operation failed: {str(e)}'}), 500

@content_blur_bp.route('/blur-preview', methods=['POST'])
def get_blur_preview():
    """
    Get a preview of the blur effect without saving the file.
    Returns base64 encoded image.
    """
    logger.info("Received request at /content-blur/blur-preview endpoint.")
    
    try:
        # Check if file is uploaded
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Get parameters
        content_type = request.form.get('content_type', 'license_plate')
        intensity = request.form.get('intensity', 'medium')
        
        # Validate parameters
        valid_content_types = ['license_plate', 'text', 'face']
        valid_intensities = ['light', 'medium', 'heavy']
        
        if content_type not in valid_content_types:
            return jsonify({'error': f'Invalid content_type. Must be one of: {valid_content_types}'}), 400
        
        if intensity not in valid_intensities:
            return jsonify({'error': f'Invalid intensity. Must be one of: {valid_intensities}'}), 400
        
        # Save uploaded file temporarily
        filename = f"preview_{uuid.uuid4()}_{file.filename}"
        input_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(input_path)
        
        # Get blur preview
        preview_data = blur_service.get_blur_preview(input_path, content_type, intensity)
        
        # Clean up temporary file
        if os.path.exists(input_path):
            os.remove(input_path)
        
        if preview_data:
            return jsonify({
                'success': True,
                'preview': preview_data,
                'content_type': content_type,
                'intensity': intensity
            })
        else:
            return jsonify({'error': 'Failed to generate preview'}), 500
            
    except Exception as e:
        logger.error(f"Error in get_blur_preview: {str(e)}")
        return jsonify({'error': f'Preview generation failed: {str(e)}'}), 500

@content_blur_bp.route('/blur-options', methods=['GET'])
def get_blur_options():
    """
    Get available blur options and configurations.
    """
    return jsonify({
        'content_types': [
            {
                'value': 'license_plate',
                'label': 'License Plate',
                'description': 'Blur the bottom region where license plates are typically located'
            },
            {
                'value': 'text',
                'label': 'Text Content',
                'description': 'Blur regions where text is likely to be found'
            },
            {
                'value': 'face',
                'label': 'Faces',
                'description': 'Blur detected face regions using skin tone detection'
            },
            {
                'value': 'custom',
                'label': 'Custom Region',
                'description': 'Blur a specific rectangular region (requires coordinates)'
            }
        ],
        'intensities': [
            {
                'value': 'light',
                'label': 'Light Blur',
                'description': 'Subtle blur effect'
            },
            {
                'value': 'medium',
                'label': 'Medium Blur',
                'description': 'Standard blur effect'
            },
            {
                'value': 'heavy',
                'label': 'Heavy Blur',
                'description': 'Strong blur effect'
            }
        ]
    }) 