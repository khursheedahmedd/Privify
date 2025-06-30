# services/blur_service.py
import os
import logging
import requests
import base64
import cv2
import numpy as np
from PIL import Image, ImageFilter
from io import BytesIO

logger = logging.getLogger(__name__)

SEGMIND_API_KEY = os.getenv("SEGMIND_API_KEY")
WORKFLOW_URL = "https://api.segmind.com/workflows/67a326c2d52cfa65374963ab-v4"

class ImageBlurService:
    def __init__(self):
        self.blur_intensities = {
            'light': 15,
            'medium': 31,
            'heavy': 51
        }
    
    def blur_license_plate_region(self, image_path, output_path, intensity='medium'):
        """
        Blur the bottom region of the image where license plates are typically located.
        This is a simple approach that blurs the entire bottom portion.
        """
        try:
            # Read the image
            img = cv2.imread(image_path)
            if img is None:
                raise ValueError("Could not read image")
            
            height, width = img.shape[:2]
            
            # Define the region to blur (bottom 30% of the image)
            blur_height = int(height * 0.3)
            blur_region = img[height - blur_height:height, :]
            
            # Apply Gaussian blur
            blur_kernel = self.blur_intensities.get(intensity, 31)
            blurred_region = cv2.GaussianBlur(blur_region, (blur_kernel, blur_kernel), 0)
            
            # Replace the region with blurred version
            img[height - blur_height:height, :] = blurred_region
            
            # Save the result
            cv2.imwrite(output_path, img)
            logger.info(f"License plate region blurred and saved to {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error blurring license plate region: {str(e)}")
            return False
    
    def blur_text_regions(self, image_path, output_path, intensity='medium'):
        """
        Blur regions where text is likely to be found (top, center, bottom areas).
        """
        try:
            img = cv2.imread(image_path)
            if img is None:
                raise ValueError("Could not read image")
            
            height, width = img.shape[:2]
            blur_kernel = self.blur_intensities.get(intensity, 31)
            
            # Define multiple regions where text might be found
            regions = [
                (0, int(height * 0.2)),  # Top 20%
                (int(height * 0.4), int(height * 0.6)),  # Center 20%
                (int(height * 0.7), height)  # Bottom 30%
            ]
            
            for start_y, end_y in regions:
                region = img[start_y:end_y, :]
                blurred_region = cv2.GaussianBlur(region, (blur_kernel, blur_kernel), 0)
                img[start_y:end_y, :] = blurred_region
            
            cv2.imwrite(output_path, img)
            logger.info(f"Text regions blurred and saved to {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error blurring text regions: {str(e)}")
            return False
    
    def blur_faces(self, image_path, output_path, intensity='medium'):
        """
        Simple face blurring by detecting skin-tone regions.
        This is a basic implementation - for production, use a proper face detection model.
        """
        try:
            img = cv2.imread(image_path)
            if img is None:
                raise ValueError("Could not read image")
            
            # Convert to HSV for better skin detection
            hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
            
            # Define skin color range (basic approximation)
            lower_skin = np.array([0, 20, 70], dtype=np.uint8)
            upper_skin = np.array([20, 255, 255], dtype=np.uint8)
            
            # Create mask for skin regions
            skin_mask = cv2.inRange(hsv, lower_skin, upper_skin)
            
            # Apply morphological operations to clean up the mask
            kernel = np.ones((5, 5), np.uint8)
            skin_mask = cv2.morphologyEx(skin_mask, cv2.MORPH_CLOSE, kernel)
            skin_mask = cv2.morphologyEx(skin_mask, cv2.MORPH_OPEN, kernel)
            
            # Blur the entire image
            blur_kernel = self.blur_intensities.get(intensity, 31)
            blurred_img = cv2.GaussianBlur(img, (blur_kernel, blur_kernel), 0)
            
            # Apply blur only to skin regions
            skin_mask_3d = cv2.cvtColor(skin_mask, cv2.COLOR_GRAY2BGR)
            result = np.where(skin_mask_3d == 255, blurred_img, img)
            
            cv2.imwrite(output_path, result)
            logger.info(f"Faces blurred and saved to {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error blurring faces: {str(e)}")
            return False
    
    def blur_custom_region(self, image_path, output_path, x, y, width, height, intensity='medium'):
        """
        Blur a specific rectangular region in the image.
        """
        try:
            img = cv2.imread(image_path)
            if img is None:
                raise ValueError("Could not read image")
            
            # Ensure coordinates are within image bounds
            img_height, img_width = img.shape[:2]
            x = max(0, min(x, img_width - 1))
            y = max(0, min(y, img_height - 1))
            width = min(width, img_width - x)
            height = min(height, img_height - y)
            
            # Extract the region to blur
            region = img[y:y+height, x:x+width]
            
            # Apply blur
            blur_kernel = self.blur_intensities.get(intensity, 31)
            blurred_region = cv2.GaussianBlur(region, (blur_kernel, blur_kernel), 0)
            
            # Replace the region
            img[y:y+height, x:x+width] = blurred_region
            
            cv2.imwrite(output_path, img)
            logger.info(f"Custom region blurred and saved to {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error blurring custom region: {str(e)}")
            return False
    
    def blur_based_on_content_type(self, image_path, output_path, content_type, intensity='medium'):
        """
        Apply appropriate blur based on detected content type.
        """
        try:
            if content_type == 'license_plate':
                return self.blur_license_plate_region(image_path, output_path, intensity)
            elif content_type == 'text':
                return self.blur_text_regions(image_path, output_path, intensity)
            elif content_type == 'face':
                return self.blur_faces(image_path, output_path, intensity)
            else:
                # Default to text blurring for unknown content types
                return self.blur_text_regions(image_path, output_path, intensity)
                
        except Exception as e:
            logger.error(f"Error in content-based blurring: {str(e)}")
            return False
    
    def get_blur_preview(self, image_path, content_type, intensity='medium'):
        """
        Create a preview of the blur effect without saving the file.
        Returns base64 encoded image.
        """
        try:
            # Create a temporary output path
            temp_output = image_path.replace('.', '_blurred.')
            
            # Apply blur
            success = self.blur_based_on_content_type(image_path, temp_output, content_type, intensity)
            
            if success and os.path.exists(temp_output):
                # Convert to base64
                with open(temp_output, 'rb') as img_file:
                    img_data = img_file.read()
                    base64_img = base64.b64encode(img_data).decode('utf-8')
                
                # Clean up temporary file
                os.remove(temp_output)
                
                return f"data:image/jpeg;base64,{base64_img}"
            else:
                return None
                
        except Exception as e:
            logger.error(f"Error creating blur preview: {str(e)}")
            return None

# Global instance
blur_service = ImageBlurService()