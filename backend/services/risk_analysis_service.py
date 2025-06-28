import logging
import requests
import json
import os
import traceback  # Added missing import

logger = logging.getLogger(__name__)

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "YOUR_GROQ_API_KEY")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

def analyze_metadata_risks(metadata):
    """Analyze metadata using Groq/Llama 3 for security risks with enhanced logging"""
    logger.info("Starting metadata risk analysis with Groq/Llama 3")
    
    if not GROQ_API_KEY or GROQ_API_KEY == "YOUR_GROQ_API_KEY":
        logger.error("Groq API key not configured properly")
        return None

    try:
        # Log input metadata (redact sensitive fields if needed)
        logger.debug(f"Raw metadata input: {json.dumps(metadata, indent=2)}")

        system_prompt = """You are a cybersecurity expert analyzing image metadata. Identify security risks including:
- Location exposure through GPS data
- Device identification via Make/Model
- Sensitive timestamps
- Unique identifiers
- Technical specs aiding attacks

Return JSON response with this structure:
{
    "overall_risk": "low|moderate|high",
    "overall_description": "Summary of main risks",
    "risks": [
        {
            "type": "category",
            "severity": "high",
            "description": "Specific risk details",
            "recommendation": "Mitigation steps"
        }
    ]
}"""

        user_prompt = f"Analyze this image metadata:\n{json.dumps(metadata, indent=2)}"
        logger.debug(f"Generated user prompt: {user_prompt[:200]}...")

        request_payload = {
            "model": "llama3-70b-8192",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.3,
            "max_tokens": 1024,
            "stream": False
        }

        logger.info(f"Sending request to Groq API: {GROQ_API_URL}")
        logger.debug("Request headers: {'Authorization': 'Bearer ***', 'Content-Type': 'application/json'}")
        logger.debug(f"Request payload: {json.dumps(request_payload, indent=2)}")

        response = requests.post(
            GROQ_API_URL,
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json=request_payload,
            timeout=30
        )

        logger.info(f"Received response: HTTP {response.status_code}")
        logger.debug(f"Raw API response: {response.text[:500]}...")

        if response.status_code != 200:
            logger.error(f"Groq API error: {response.status_code} - {response.text}")
            return None

        response_data = response.json()
        
        if "choices" not in response_data or len(response_data["choices"]) == 0:
            logger.error("Invalid Groq response format - missing choices")
            logger.error(f"Full response: {json.dumps(response_data, indent=2)}")
            return None

        llm_response = response_data["choices"][0]["message"]["content"]
        logger.debug(f"Raw LLM response: {llm_response}")

        parsed_response = json.loads(llm_response)
        logger.info("Successfully parsed LLM response")
        logger.debug(f"Parsed risk analysis: {json.dumps(parsed_response, indent=2)}")

        return parsed_response

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse LLM response as JSON: {str(e)}")
        logger.error(f"Invalid JSON content: {llm_response[:500]}...")
        return None
        
    except KeyError as e:
        logger.error(f"Missing expected key in response: {str(e)}")
        logger.error(f"Response data: {json.dumps(response_data, indent=2)}")
        return None

    except Exception as e:
        logger.error(f"LLM analysis failed: {str(e)}")
        logger.error(f"Stack trace: {traceback.format_exc()}")
        return None