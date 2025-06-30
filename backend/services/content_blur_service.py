import cv2
import numpy as np
import os
import logging
from PIL import Image, ImageFilter
import base64
from io import BytesIO

logger = logging.getLogger(__name__)

class ImageBlurService:
    def __init__(self):
        self.blur_intensities = {
            'light': 101,
            'medium': 200,
            'heavy': 301
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
            
            # Define the region to blur (bottom 20% instead of 30%)
            blur_height = int(height * 0.2)
            blur_region = img[height - blur_height:height, :]
            
            # Apply Gaussian blur with stronger intensity
            blur_kernel = self.blur_intensities.get(intensity, 61)
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
        Blur specific small regions where text is commonly found.
        """
        try:
            img = cv2.imread(image_path)
            if img is None:
                raise ValueError("Could not read image")
            
            height, width = img.shape[:2]
            blur_kernel = self.blur_intensities.get(intensity, 61)
            
            # Ensure blur_kernel is odd
            if blur_kernel % 2 == 0:
                blur_kernel += 1
            
            # Define small, targeted regions where text might be found
            # Much smaller areas instead of large horizontal strips
            regions = [
                # Top center - small area for titles/headers
                (int(height * 0.02), int(height * 0.08), int(width * 0.25), int(width * 0.75)),
                # Top left - small area for logos/text
                (int(height * 0.02), int(height * 0.08), int(width * 0.02), int(width * 0.20)),
                # Top right - small area for timestamps/text
                (int(height * 0.02), int(height * 0.08), int(width * 0.80), int(width * 0.98)),
                # Center - small area for watermarks
                (int(height * 0.45), int(height * 0.55), int(width * 0.35), int(width * 0.65)),
                # Bottom center - small area for captions
                (int(height * 0.85), int(height * 0.92), int(width * 0.30), int(width * 0.70)),
                # Bottom left - small area for metadata
                (int(height * 0.88), int(height * 0.95), int(width * 0.05), int(width * 0.25)),
                # Bottom right - small area for metadata
                (int(height * 0.88), int(height * 0.95), int(width * 0.75), int(width * 0.95))
            ]
            
            for start_y, end_y, start_x, end_x in regions:
                # Ensure region is valid and not too small
                if end_y > start_y and end_x > start_x and end_y <= height and end_x <= width:
                    region = img[start_y:end_y, start_x:end_x]
                    if region.size > 0:  # Check if region is valid
                        blurred_region = cv2.GaussianBlur(region, (blur_kernel, blur_kernel), 0)
                        img[start_y:end_y, start_x:end_x] = blurred_region
            
            cv2.imwrite(output_path, img)
            logger.info(f"Text regions blurred and saved to {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error blurring text regions: {str(e)}")
            return False
    
    def blur_faces(self, image_path, output_path, intensity='medium'):
        """
        Enhanced face blurring with better skin detection and multiple blur passes.
        """
        try:
            img = cv2.imread(image_path)
            if img is None:
                raise ValueError("Could not read image")
            
            # Convert to HSV for better skin detection
            hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
            
            # Enhanced skin color range for better detection
            lower_skin = np.array([0, 30, 60], dtype=np.uint8)
            upper_skin = np.array([25, 255, 255], dtype=np.uint8)
            
            # Create mask for skin regions
            skin_mask = cv2.inRange(hsv, lower_skin, upper_skin)
            
            # Apply morphological operations to clean up the mask
            kernel = np.ones((7, 7), np.uint8)  # Increased kernel size
            skin_mask = cv2.morphologyEx(skin_mask, cv2.MORPH_CLOSE, kernel)
            skin_mask = cv2.morphologyEx(skin_mask, cv2.MORPH_OPEN, kernel)
            
            # Apply multiple blur passes for stronger effect
            blur_kernel = self.blur_intensities.get(intensity, 61)
            
            # Ensure blur_kernel is odd
            if blur_kernel % 2 == 0:
                blur_kernel += 1
            
            # First pass: heavy blur
            blurred_img = cv2.GaussianBlur(img, (blur_kernel, blur_kernel), 0)
            
            # Second pass: additional blur for stronger effect (ensure it's odd)
            second_kernel = max(3, blur_kernel // 2)
            if second_kernel % 2 == 0:
                second_kernel += 1
            blurred_img = cv2.GaussianBlur(blurred_img, (second_kernel, second_kernel), 0)
            
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
        Blur a specific rectangular region in the image with enhanced blur.
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
            
            # Apply multiple blur passes for stronger effect
            blur_kernel = self.blur_intensities.get(intensity, 61)
            
            # Ensure blur_kernel is odd
            if blur_kernel % 2 == 0:
                blur_kernel += 1
            
            # First pass: heavy blur
            blurred_region = cv2.GaussianBlur(region, (blur_kernel, blur_kernel), 0)
            
            # Second pass: additional blur for stronger effect (ensure it's odd)
            second_kernel = max(3, blur_kernel // 2)
            if second_kernel % 2 == 0:
                second_kernel += 1
            blurred_region = cv2.GaussianBlur(blurred_region, (second_kernel, second_kernel), 0)
            
            # Replace the region
            img[y:y+height, x:x+width] = blurred_region
            
            cv2.imwrite(output_path, img)
            logger.info(f"Custom region blurred and saved to {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error blurring custom region: {str(e)}")
            return False
    
    def blur_license_plate_precise(self, image_path, output_path, intensity='medium'):
        """
        More precise license plate blurring with small, targeted blur boxes using OpenCV only.
        """
        try:
            img = cv2.imread(image_path)
            if img is None:
                raise ValueError("Could not read image")
            
            height, width = img.shape[:2]
            blur_kernel = self.blur_intensities.get(intensity, 61)
            if blur_kernel % 2 == 0:
                blur_kernel += 1
            
            # Define multiple small, targeted regions where license plates might be
            regions = [
                # Bottom center - small rectangular area
                (int(height * 0.85), int(height * 0.95), int(width * 0.35), int(width * 0.65)),
                # Bottom left - small area
                (int(height * 0.85), int(height * 0.95), int(width * 0.05), int(width * 0.25)),
                # Bottom right - small area
                (int(height * 0.85), int(height * 0.95), int(width * 0.75), int(width * 0.95)),
                # Slightly higher center - for front license plates (smaller)
                (int(height * 0.75), int(height * 0.82), int(width * 0.35), int(width * 0.65)),
                # Additional small regions for better coverage
                (int(height * 0.88), int(height * 0.92), int(width * 0.25), int(width * 0.75)),
                (int(height * 0.78), int(height * 0.82), int(width * 0.30), int(width * 0.70))
            ]
            
            for start_y, end_y, start_x, end_x in regions:
                if end_y > start_y and end_x > start_x and end_y <= height and end_x <= width:
                    region = img[start_y:end_y, start_x:end_x]
                    if region.size > 0:
                        blurred_region = cv2.GaussianBlur(region, (blur_kernel, blur_kernel), 0)
                        second_kernel = max(3, blur_kernel // 2)
                        if second_kernel % 2 == 0:
                            second_kernel += 1
                        blurred_region = cv2.GaussianBlur(blurred_region, (second_kernel, second_kernel), 0)
                        img[start_y:end_y, start_x:end_x] = blurred_region
            
            cv2.imwrite(output_path, img)
            logger.info(f"Precise license plate blurring (OpenCV) completed and saved to {output_path}")
            return True
        except Exception as e:
            logger.error(f"Error in precise license plate blurring: {str(e)}")
            return False
    
    def blur_based_on_content_type(self, image_path, output_path, content_type, intensity='medium'):
        """
        Apply appropriate blur based on detected content type.
        """
        try:
            if content_type == 'license_plate':
                return self.blur_license_plate_precise(image_path, output_path, intensity)
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