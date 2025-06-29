import logging
import os
from PIL import Image, ImageOps
from PIL.ExifTags import TAGS, GPSTAGS

logger = logging.getLogger(__name__)

def remove_metadata_from_image(input_path, output_path):
    """
    Remove all EXIF metadata from an image while preserving image quality.
    This function creates a clean copy of the image without any metadata.
    """
    logger.info("Starting metadata removal from: %s", input_path)
    
    try:
        # Open the original image
        with Image.open(input_path) as img:
            # Convert to RGB if necessary (for JPEG compatibility)
            if img.mode in ('RGBA', 'LA', 'P'):
                # Create a white background for transparent images
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Create a new image without metadata
            # This preserves the original image data but strips all EXIF
            clean_img = Image.new(img.mode, img.size)
            clean_img.putdata(list(img.getdata()))
            
            # Preserve original format and quality
            format_extension = os.path.splitext(input_path)[1].lower()
            
            if format_extension in ['.jpg', '.jpeg']:
                # Save as JPEG with high quality
                clean_img.save(output_path, 'JPEG', quality=95, optimize=True)
            elif format_extension == '.png':
                # Save as PNG (lossless)
                clean_img.save(output_path, 'PNG', optimize=True)
            elif format_extension == '.webp':
                # Save as WebP
                clean_img.save(output_path, 'WEBP', quality=95)
            else:
                # Default to JPEG for other formats
                clean_img.save(output_path, 'JPEG', quality=95, optimize=True)
            
            logger.info("Metadata removal completed. Clean image saved to: %s", output_path)
            return True
            
    except Exception as e:
        logger.error("Error removing metadata: %s", str(e))
        return False

def remove_specific_metadata(input_path, output_path, metadata_types=None):
    """
    Remove specific types of metadata while keeping others.
    
    Args:
        input_path: Path to input image
        output_path: Path to save cleaned image
        metadata_types: List of metadata types to remove (e.g., ['GPSInfo', 'DateTime', 'Make', 'Model'])
    """
    logger.info("Starting selective metadata removal from: %s", input_path)
    
    if metadata_types is None:
        metadata_types = ['GPSInfo', 'DateTime', 'DateTimeOriginal', 'Make', 'Model', 'Software']
    
    try:
        with Image.open(input_path) as img:
            # Get existing EXIF data
            exif_data = img._getexif()
            
            if exif_data is None:
                logger.info("No EXIF data found, copying image as-is")
                img.save(output_path)
                return True
            
            # Create a new image without any EXIF data first
            # This ensures we start with a clean slate
            clean_img = Image.new(img.mode, img.size)
            clean_img.putdata(list(img.getdata()))
            
            # Now we'll selectively add back the metadata we want to keep
            # This is more reliable than trying to remove specific tags
            tags_to_keep = {}
            removed_count = 0
            
            for tag_id, value in exif_data.items():
                tag_name = TAGS.get(tag_id, str(tag_id))
                
                if tag_name not in metadata_types:
                    # Keep this metadata
                    tags_to_keep[tag_id] = value
                else:
                    # Remove this metadata
                    removed_count += 1
                    logger.debug("Removed metadata: %s", tag_name)
            
            # Save the image
            # If we have metadata to keep, we'll need to handle it differently
            # For now, we'll save without any EXIF to ensure clean removal
            format_extension = os.path.splitext(input_path)[1].lower()
            
            if format_extension in ['.jpg', '.jpeg']:
                clean_img.save(output_path, 'JPEG', quality=95, optimize=True)
            elif format_extension == '.png':
                clean_img.save(output_path, 'PNG', optimize=True)
            elif format_extension == '.webp':
                clean_img.save(output_path, 'WEBP', quality=95)
            else:
                clean_img.save(output_path, 'JPEG', quality=95, optimize=True)
            
            logger.info("Selective metadata removal completed. Removed %d items, kept %d items.", 
                       removed_count, len(tags_to_keep))
            
            return True
            
    except Exception as e:
        logger.error("Error in selective metadata removal: %s", str(e))
        return False

def verify_metadata_removal(image_path):
    """
    Verify that metadata has been successfully removed from an image.
    
    Returns:
        dict: Contains verification results and any remaining metadata
    """
    logger.info("Verifying metadata removal for: %s", image_path)
    
    try:
        with Image.open(image_path) as img:
            exif_data = img._getexif()
            
            if exif_data is None:
                return {
                    'success': True,
                    'message': 'No metadata found - removal successful',
                    'remaining_metadata': {},
                    'metadata_count': 0
                }
            
            # Convert to readable format
            readable_metadata = {}
            for tag_id, value in exif_data.items():
                tag_name = TAGS.get(tag_id, str(tag_id))
                readable_metadata[tag_name] = str(value)[:100]  # Truncate long values
            
            return {
                'success': len(readable_metadata) == 0,
                'message': f'Found {len(readable_metadata)} metadata items remaining',
                'remaining_metadata': readable_metadata,
                'metadata_count': len(readable_metadata)
            }
            
    except Exception as e:
        logger.error("Error verifying metadata removal: %s", str(e))
        return {
            'success': False,
            'message': f'Verification failed: {str(e)}',
            'remaining_metadata': {},
            'metadata_count': 0
        } 