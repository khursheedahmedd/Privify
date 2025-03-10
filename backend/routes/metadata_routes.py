from flask import Blueprint, request, jsonify, current_app
import os
import logging

from config import UPLOAD_FOLDER
from services.exif_service import extract_metadata

metadata_bp = Blueprint('metadata', __name__)
logger = logging.getLogger(__name__)

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
