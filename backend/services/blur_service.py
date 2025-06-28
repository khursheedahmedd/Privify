# services/blur_service.py
import os
import logging
import requests
import base64

logger = logging.getLogger(__name__)

SEGMIND_API_KEY = os.getenv("SEGMIND_API_KEY")
WORKFLOW_URL = "https://api.segmind.com/workflows/67a326c2d52cfa65374963ab-v4"

def remove_text_from_image(input_path, output_path, threshold=0.7):
    """Process image directly using base64 encoding"""
    try:
        # 1. Read and encode image
        with open(input_path, "rb") as image_file:
            base64_image = base64.b64encode(image_file.read()).decode('utf-8')

        # 2. Call Segmind API with base64
        response = requests.post(
            WORKFLOW_URL,
            headers={'x-api-key': SEGMIND_API_KEY},
            json={
                "input_image": f"data:image/jpeg;base64,{base64_image}",
                "Threshold": str(threshold)
            }
        )

        # 3. Handle response
        if response.status_code != 200:
            logger.error(f"API Error {response.status_code}: {response.text}")
            return False

        # 4. Save processed image
        with open(output_path, 'wb') as f:
            f.write(response.content)
            
        logger.info(f"Processed image saved to {output_path}")
        return True

    except Exception as e:
        logger.error(f"Text removal failed: {str(e)}")
        return False