from flask import Blueprint, request, jsonify, send_file
import os
import logging
from config import UPLOAD_FOLDER, PROCESSED_FOLDER
from services.metadata_removal_service import remove_metadata_from_image, remove_specific_metadata, verify_metadata_removal
from services.exif_service import extract_metadata

metadata_removal_bp = Blueprint('metadata_removal', __name__)
logger = logging.getLogger(__name__)

@metadata_removal_bp.route('/remove-all', methods=['POST'])
def remove_all_metadata():
    """
    Remove all metadata from an uploaded image and return the clean image.
    """
    logger.info("Received request to remove all metadata")
    
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
        output_filename = f"clean_{file.filename}"
        output_path = os.path.join(PROCESSED_FOLDER, output_filename)
        
        logger.info(f"Saving file to {input_path}")
        file.save(input_path)
        
        # Extract original metadata for comparison
        original_metadata = extract_metadata(input_path)
        
        logger.info("Removing all metadata from image...")
        success = remove_metadata_from_image(input_path, output_path)
        
        if not success:
            return jsonify({'error': 'Metadata removal failed'}), 500
        
        # Verify metadata removal
        verification = verify_metadata_removal(output_path)
        
        # Return the clean image and verification results
        response_data = {
            'message': 'Metadata removed successfully',
            'original_metadata_count': len(original_metadata),
            'verification': verification,
            'filename': output_filename
        }
        
        return send_file(
            output_path, 
            mimetype='image/jpeg',
            as_attachment=True,
            download_name=output_filename
        )
        
    except Exception as e:
        logger.error(f"Metadata removal failed: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@metadata_removal_bp.route('/remove-selective', methods=['POST'])
def remove_selective_metadata():
    """
    Remove specific types of metadata from an uploaded image.
    """
    logger.info("Received request for selective metadata removal")
    
    if 'file' not in request.files:
        logger.error("No file part in request")
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if file.filename == '':
        logger.error("Empty filename")
        return jsonify({'error': 'No selected file'}), 400

    # Get metadata types to remove from request
    metadata_types = request.form.getlist('metadata_types[]')
    if not metadata_types:
        # Default to removing sensitive metadata
        metadata_types = ['GPSInfo', 'DateTime', 'DateTimeOriginal', 'Make', 'Model', 'Software']

    # Create necessary directories
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(PROCESSED_FOLDER, exist_ok=True)

    try:
        input_path = os.path.join(UPLOAD_FOLDER, file.filename)
        output_filename = f"selective_clean_{file.filename}"
        output_path = os.path.join(PROCESSED_FOLDER, output_filename)
        
        logger.info(f"Saving file to {input_path}")
        file.save(input_path)
        
        # Extract original metadata for comparison
        original_metadata = extract_metadata(input_path)
        
        logger.info(f"Removing selective metadata: {metadata_types}")
        success = remove_specific_metadata(input_path, output_path, metadata_types)
        
        if not success:
            return jsonify({'error': 'Selective metadata removal failed'}), 500
        
        # Verify metadata removal
        verification = verify_metadata_removal(output_path)
        
        # Return the clean image and verification results
        response_data = {
            'message': 'Selective metadata removal completed',
            'removed_types': metadata_types,
            'original_metadata_count': len(original_metadata),
            'verification': verification,
            'filename': output_filename
        }
        
        return send_file(
            output_path, 
            mimetype='image/jpeg',
            as_attachment=True,
            download_name=output_filename
        )
        
    except Exception as e:
        logger.error(f"Selective metadata removal failed: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@metadata_removal_bp.route('/analyze-and-remove', methods=['POST'])
def analyze_and_remove_metadata():
    """
    Analyze metadata for risks and provide options to remove sensitive data.
    """
    logger.info("Received request for metadata analysis and removal")
    
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
        file.save(input_path)
        
        # Extract and analyze metadata
        metadata = extract_metadata(input_path)
        
        # Identify sensitive metadata types
        sensitive_types = []
        if 'GPSInfo' in metadata:
            sensitive_types.append('GPSInfo')
        if 'DateTime' in metadata:
            sensitive_types.append('DateTime')
        if 'DateTimeOriginal' in metadata:
            sensitive_types.append('DateTimeOriginal')
        if 'Make' in metadata or 'Model' in metadata:
            sensitive_types.extend(['Make', 'Model'])
        if 'Software' in metadata:
            sensitive_types.append('Software')
        
        # Create clean version if sensitive data found
        clean_image_path = None
        if sensitive_types:
            output_filename = f"secure_{file.filename}"
            clean_image_path = os.path.join(PROCESSED_FOLDER, output_filename)
            
            success = remove_specific_metadata(input_path, clean_image_path, sensitive_types)
            if not success:
                logger.warning("Failed to create clean version")
                clean_image_path = None
        
        return jsonify({
            'metadata': metadata,
            'sensitive_types_found': sensitive_types,
            'clean_image_available': clean_image_path is not None,
            'clean_image_filename': os.path.basename(clean_image_path) if clean_image_path else None,
            'recommendations': {
                'high_risk': ['GPSInfo'],
                'moderate_risk': ['DateTime', 'DateTimeOriginal'],
                'low_risk': ['Make', 'Model', 'Software']
            }
        })
        
    except Exception as e:
        logger.error(f"Analysis and removal failed: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@metadata_removal_bp.route('/download-clean/<filename>', methods=['GET'])
def download_clean_image(filename):
    """
    Download a previously processed clean image.
    """
    try:
        file_path = os.path.join(PROCESSED_FOLDER, filename)
        
        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found'}), 404
        
        return send_file(
            file_path,
            mimetype='image/jpeg',
            as_attachment=True,
            download_name=filename
        )
        
    except Exception as e:
        logger.error(f"Download failed: {str(e)}")
        return jsonify({'error': 'Download failed'}), 500 