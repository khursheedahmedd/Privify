import exifread
import logging

logger = logging.getLogger(__name__)

def extract_metadata(filepath):
    logger.info("Extracting EXIF metadata from file: %s", filepath)
    with open(filepath, 'rb') as file:
        tags = exifread.process_file(file)
    metadata = {}
    for tag in tags.keys():
        metadata[tag] = str(tags[tag])
    logger.info("Metadata extraction complete. Number of tags: %d", len(metadata))
    return metadata
