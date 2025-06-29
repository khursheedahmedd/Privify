import logging
import os
import base64
import requests
import json
from groq import Groq

logger = logging.getLogger(__name__)

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "YOUR_GROQ_API_KEY")

def encode_image(image_path):
    """Encode image to base64 string"""
    try:
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')
    except Exception as e:
        logger.error(f"Error encoding image: {str(e)}")
        return None

def analyze_image_description(image_path):
    """
    Generate a short description of the image using Groq vision.
    
    Args:
        image_path: Path to the image file
        
    Returns:
        dict: Contains description and success status
    """
    logger.info("Starting image description analysis")
    
    if not GROQ_API_KEY or GROQ_API_KEY == "YOUR_GROQ_API_KEY":
        logger.error("Groq API key not configured properly")
        return {
            'success': False,
            'error': 'Groq API key not configured'
        }

    try:
        # Encode the image
        base64_image = encode_image(image_path)
        if not base64_image:
            return {
                'success': False,
                'error': 'Failed to encode image'
            }

        # Create Groq client
        client = Groq(api_key=GROQ_API_KEY)
        
        # Create the chat completion request
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text", 
                            "text": "Provide a concise, professional description of this image in 2-3 sentences. Focus on the main subject, setting, and any notable details."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}",
                            },
                        },
                    ],
                }
            ],
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            max_tokens=200,
            temperature=0.3
        )

        description = chat_completion.choices[0].message.content
        
        logger.info("Image description analysis completed successfully")
        return {
            'success': True,
            'description': description.strip()
        }

    except Exception as e:
        logger.error(f"Image description analysis failed: {str(e)}")
        return {
            'success': False,
            'error': f'Analysis failed: {str(e)}'
        }

def detect_objects_in_image(image_path):
    """
    Detect objects in the image using Groq vision.
    
    Args:
        image_path: Path to the image file
        
    Returns:
        dict: Contains detected objects and success status
    """
    logger.info("Starting object detection analysis")
    
    if not GROQ_API_KEY or GROQ_API_KEY == "YOUR_GROQ_API_KEY":
        logger.error("Groq API key not configured properly")
        return {
            'success': False,
            'error': 'Groq API key not configured'
        }

    try:
        # Encode the image
        base64_image = encode_image(image_path)
        if not base64_image:
            return {
                'success': False,
                'error': 'Failed to encode image'
            }

        # Create Groq client
        client = Groq(api_key=GROQ_API_KEY)
        
        # Create the chat completion request
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text", 
                            "text": "List all the objects you can detect in this image. Return the response as a JSON array of objects with 'object' and 'confidence' fields. For example: [{'object': 'person', 'confidence': 'high'}, {'object': 'car', 'confidence': 'medium'}]. Only include objects that are clearly visible and identifiable."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}",
                            },
                        },
                    ],
                }
            ],
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            max_tokens=300,
            temperature=0.2,
            response_format={"type": "json_object"}
        )

        response_content = chat_completion.choices[0].message.content
        
        # Parse the JSON response
        try:
            # Clean the response if it contains markdown formatting
            if '```json' in response_content:
                response_content = response_content.split('```json')[1].split('```')[0]
            elif '```' in response_content:
                response_content = response_content.split('```')[1].split('```')[0]
            
            # Find first { and last } to handle any remaining text
            json_start = response_content.find('{')
            json_end = response_content.rfind('}') + 1
            clean_json = response_content[json_start:json_end]
            
            parsed_response = json.loads(clean_json)
            
            # Extract objects array
            if 'objects' in parsed_response:
                objects = parsed_response['objects']
            elif isinstance(parsed_response, list):
                objects = parsed_response
            else:
                # If the response is a different format, try to extract objects
                objects = []
                for key, value in parsed_response.items():
                    if isinstance(value, dict) and 'object' in value:
                        objects.append(value)
                    elif isinstance(value, str):
                        objects.append({'object': key, 'confidence': value})
            
            logger.info(f"Object detection completed. Found {len(objects)} objects")
            return {
                'success': True,
                'objects': objects,
                'object_count': len(objects)
            }
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {str(e)}")
            # Fallback: try to extract objects from text
            objects = []
            lines = response_content.split('\n')
            for line in lines:
                line = line.strip()
                if line and not line.startswith('{') and not line.startswith('}'):
                    # Try to extract object name
                    if ':' in line:
                        obj_name = line.split(':')[0].strip()
                        confidence = 'medium'
                        if 'high' in line.lower():
                            confidence = 'high'
                        elif 'low' in line.lower():
                            confidence = 'low'
                        objects.append({'object': obj_name, 'confidence': confidence})
            
            return {
                'success': True,
                'objects': objects,
                'object_count': len(objects),
                'note': 'Parsed from text response'
            }

    except Exception as e:
        logger.error(f"Object detection analysis failed: {str(e)}")
        return {
            'success': False,
            'error': f'Analysis failed: {str(e)}'
        }

def analyze_image_comprehensive(image_path):
    """
    Perform comprehensive image analysis including description and object detection.
    
    Args:
        image_path: Path to the image file
        
    Returns:
        dict: Contains both description and object detection results
    """
    logger.info("Starting comprehensive image analysis")
    
    # Get image description
    description_result = analyze_image_description(image_path)
    
    # Get object detection
    objects_result = detect_objects_in_image(image_path)
    
    # Combine results
    result = {
        'success': description_result['success'] and objects_result['success'],
        'description': description_result.get('description', ''),
        'objects': objects_result.get('objects', []),
        'object_count': objects_result.get('object_count', 0),
        'errors': []
    }
    
    if not description_result['success']:
        result['errors'].append(f"Description analysis failed: {description_result.get('error', 'Unknown error')}")
    
    if not objects_result['success']:
        result['errors'].append(f"Object detection failed: {objects_result.get('error', 'Unknown error')}")
    
    logger.info("Comprehensive image analysis completed")
    return result 