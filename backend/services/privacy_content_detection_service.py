import logging
import os
import base64
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

def detect_privacy_sensitive_content(image_path):
    """
    Detect privacy-sensitive content in images using Groq vision.
    
    Args:
        image_path: Path to the image file
        
    Returns:
        dict: Contains detected sensitive content and recommendations
    """
    logger.info("Starting privacy-sensitive content detection")
    
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
        
        # Create the chat completion request with specific privacy-focused prompt
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text", 
                            "text": """Analyze this image for privacy-sensitive content that could be misused if shared publicly. Look for:

1. License plates and vehicle registration numbers
2. Credit card numbers, bank cards, or financial information
3. Personal identification documents (ID cards, passports, driver's licenses)
4. Phone numbers, email addresses, or personal contact information
5. Addresses, street signs, or location identifiers
6. Personal names, signatures, or handwriting
7. Medical documents, prescriptions, or health information
8. Business cards with personal information
9. Screenshots containing sensitive data
10. Any other personally identifiable information (PII)

Return the response as a JSON object with this structure:
{
  "sensitive_content_found": true/false,
  "detected_items": [
    {
      "type": "license_plate|credit_card|id_document|phone_number|address|name|medical|business_card|screenshot|other",
      "description": "Brief description of what was found",
      "risk_level": "high|medium|low",
      "recommendation": "What the user should do about this content"
    }
  ],
  "overall_risk": "high|medium|low",
  "summary": "Brief summary of privacy concerns found",
  "recommendations": ["List of general recommendations for the user"]
}

If no sensitive content is found, set sensitive_content_found to false and provide an empty detected_items array."""
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
            max_tokens=800,
            temperature=0.1,
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
            
            # Validate the response structure
            required_fields = ['sensitive_content_found', 'detected_items', 'overall_risk', 'summary', 'recommendations']
            for field in required_fields:
                if field not in parsed_response:
                    logger.warning(f"Missing field in response: {field}")
                    parsed_response[field] = None if field != 'detected_items' else []
            
            logger.info(f"Privacy content detection completed. Found {len(parsed_response.get('detected_items', []))} sensitive items")
            return {
                'success': True,
                'data': parsed_response
            }
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {str(e)}")
            # Fallback: try to extract information from text
            return {
                'success': True,
                'data': {
                    'sensitive_content_found': 'sensitive' in response_content.lower() or 'privacy' in response_content.lower(),
                    'detected_items': [],
                    'overall_risk': 'medium',
                    'summary': 'Analysis completed but response format was unexpected',
                    'recommendations': ['Review the image manually for any sensitive content before sharing']
                },
                'note': 'Parsed from text response due to JSON parsing error'
            }

    except Exception as e:
        logger.error(f"Privacy content detection failed: {str(e)}")
        return {
            'success': False,
            'error': f'Detection failed: {str(e)}'
        }

def get_privacy_risk_color(risk_level):
    """Get color class for risk level"""
    risk_colors = {
        'high': 'text-red-600 bg-red-50',
        'medium': 'text-orange-600 bg-orange-50', 
        'low': 'text-yellow-600 bg-yellow-50'
    }
    return risk_colors.get(risk_level.lower(), 'text-gray-600 bg-gray-50')

def get_content_type_icon(content_type):
    """Get icon for content type"""
    icons = {
        'license_plate': '🚗',
        'credit_card': '💳',
        'id_document': '🆔',
        'phone_number': '📞',
        'address': '📍',
        'name': '👤',
        'medical': '🏥',
        'business_card': '📇',
        'screenshot': '📱',
        'other': '⚠️'
    }
    return icons.get(content_type, '⚠️') 