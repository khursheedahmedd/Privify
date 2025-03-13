import logging
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS
from PIL.TiffImagePlugin import IFDRational  # needed to check for IFDRational

logger = logging.getLogger(__name__)

def extract_metadata(filepath):
    """
    Extract EXIF metadata from an image using Pillow, converting non-JSON-serializable
    data types (bytes, IFDRational, etc.) to serializable forms.
    """
    logger.info("Extracting EXIF metadata from file: %s", filepath)

    metadata = {}
    try:
        with Image.open(filepath) as img:
            exif_data = img._getexif()
            if exif_data:
                for tag, value in exif_data.items():
                    tag_name = TAGS.get(tag, tag)
                    if tag_name == "GPSInfo":
                        # GPSInfo is a dict of sub-tags
                        gps_data = {}
                        for gps_tag, gps_value in value.items():
                            sub_tag_name = GPSTAGS.get(gps_tag, gps_tag)
                            gps_data[sub_tag_name] = _safe_convert(gps_value)
                        metadata["GPSInfo"] = gps_data
                    else:
                        metadata[tag_name] = _safe_convert(value)
    except Exception as e:
        logger.error("Error extracting metadata: %s", e)

    logger.info("Metadata extraction complete. Number of tags: %d", len(metadata))
    return metadata

def _safe_convert(value):
    """
    Convert non-JSON-serializable data (like IFDRational, bytes) to a serializable form.
    Recursively handles dicts, lists, tuples.
    """
    # 1. Convert IFDRational to float
    if isinstance(value, IFDRational):
        return float(value)

    # 2. Convert bytes to string
    if isinstance(value, bytes):
        try:
            return value.decode('utf-8', errors='replace')
        except Exception:
            return str(value)

    # 3. If it's a dict, recursively convert its values
    if isinstance(value, dict):
        return {k: _safe_convert(v) for k, v in value.items()}

    # 4. If it's a list or tuple, recursively convert each element
    if isinstance(value, (list, tuple)):
        return [_safe_convert(item) for item in value]

    # 5. Otherwise return the value as-is
    return value
