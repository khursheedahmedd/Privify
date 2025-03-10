from flask import Blueprint, request, jsonify, send_file, current_app
import os
import logging

from config import UPLOAD_FOLDER, PROCESSED_FOLDER
from services.blur_service import blur_faces

privacy_filter_bp = Blueprint('privacy_filter', __name__)
logger = logging.getLogger(__name__)

@privacy_filter_bp.route('/filter', methods=['POST'])
def privacy_filter():
    logger.info("Received request at /privacy/filter endpoint.")

    if 'file' not in request.files:
        logger.error("No file part found in the request.")
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    input_path = os.path.join(UPLOAD_FOLDER, file.filename)
    output_path = os.path.join(PROCESSED_FOLDER, 'processed_' + file.filename)

    logger.info("Saving uploaded file to: %s", input_path)
    file.save(input_path)

    logger.info("Calling blur_faces service.")
    blur_faces(input_path, output_path)

    logger.info("Sending processed file back to the client.")
    return send_file(output_path, mimetype='image/jpeg')
