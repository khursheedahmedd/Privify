import logging
import requests
import json
import os
import traceback

logger = logging.getLogger(__name__)

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "YOUR_GROQ_API_KEY")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

def analyze_metadata_risks(metadata):
    """Analyze metadata using Groq/Llama 3 for security risks with enhanced parsing"""
    logger.info("Starting metadata risk analysis with Groq/Llama 3")
    
    if not GROQ_API_KEY or GROQ_API_KEY == "YOUR_GROQ_API_KEY":
        logger.error("Groq API key not configured properly")
        return None

    try:
        logger.debug(f"Raw metadata input: {json.dumps(metadata, indent=2)}")

        system_prompt = """You are a cybersecurity expert analyzing image metadata.If there is exact location mark the risk high,  if there is date and time mark the risk moderate, if there is device info makr the risk low. Return JSON response with:
- overall_risk (low/moderate/high)
- overall_description
- risks array containing type, severity, description, recommendation
ONLY respond with valid JSON, no commentary."""

        user_prompt = f"Analyze this image metadata:\n{json.dumps(metadata, indent=2)}"
        
        request_payload = {
            "model": "llama3-70b-8192",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.1,
            "response_format": {"type": "json_object"},
            "max_tokens": 1024
        }

        logger.info(f"Sending request to Groq API: {GROQ_API_URL}")
        response = requests.post(
            GROQ_API_URL,
            headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
            json=request_payload,
            timeout=30
        )

        logger.info(f"Received response: HTTP {response.status_code}")
        
        if response.status_code != 200:
            logger.error(f"API error {response.status_code}: {response.text}")
            return None

        response_data = response.json()
        llm_response = response_data["choices"][0]["message"]["content"]
        logger.debug(f"Raw LLM response: {llm_response}")

        # Clean JSON response
        json_str = llm_response.strip()
        if '```json' in json_str:
            json_str = json_str.split('```json')[1].split('```')[0]
        elif '```' in json_str:
            json_str = json_str.split('```')[1].split('```')[0]
        
        # Find first { and last } to handle any remaining text
        json_start = json_str.find('{')
        json_end = json_str.rfind('}') + 1
        clean_json = json_str[json_start:json_end]

        # Parse and validate
        parsed = json.loads(clean_json)
        
        if not all(key in parsed for key in ['overall_risk', 'risks']):
            raise ValueError("Missing required fields in response")
            
        for risk in parsed['risks']:
            if not all(k in risk for k in ['type', 'severity']):
                raise ValueError("Invalid risk format")

        logger.info("Successfully parsed and validated LLM response")
        return parsed

    except json.JSONDecodeError as e:
        logger.error(f"JSON parse failed: {str(e)}\nContent: {clean_json[:500]}")
        return None
        
    except KeyError as e:
        logger.error(f"Missing key in response: {str(e)}\nData: {response_data}")
        return None
        
    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}\n{traceback.format_exc()}")
        return None