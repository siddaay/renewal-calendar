import requests
import json
import logging
from datetime import datetime
from dateutil import parser
from flask import current_app

logger = logging.getLogger(__name__)

def extract_agreement_data(pdf_text):
    """Use OpenRouter API to extract structured data from PDF text"""
    
    prompt = f"""
You are an expert at extracting key information from purchase agreements and contracts. 
Extract the following information from this document and return it as JSON:

Required fields:
- vendor: Company selling/providing service
- buyer: Company purchasing service  
- order_date: Date the order was placed
- effective_date: When the agreement becomes effective
- end_date: When the agreement expires
- term_length_months: Length of the contract in months
- total_value: Total dollar value (just the number)
- important_dates: Array of important dates with format:
  [
    {{
      "type": "renewal_date|notice_deadline|expiration_date", 
      "date": "YYYY-MM-DD",
      "description": "Human readable description",
      "is_recurring": true/false,
      "recurrence_interval_months": number or null
    }}
  ]

For auto-renewal contracts, calculate both the renewal date AND the notice deadline.
For example, if a contract renews on Jan 15, 2027 but requires 90 days notice, 
add both dates: renewal_date (2027-01-15) and notice_deadline (2026-10-17).

Document text:
{pdf_text}

Return only valid JSON, no other text.
"""

    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {current_app.config['OPENROUTER_API_KEY']}",
                "Content-Type": "application/json"
            },
            json={
                "model": "anthropic/claude-3.5-sonnet",  # or "openai/gpt-4"
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.1
            }
        )
        
        if response.status_code != 200:
            logger.error(f"OpenRouter API error: {response.status_code} - {response.text}")
            return {}
        
        result = response.json()
        ai_response = result['choices'][0]['message']['content']
        
        # Parse the JSON response
        extracted_data = json.loads(ai_response)
        
        # Convert date strings to date objects
        date_fields = ['order_date', 'effective_date', 'end_date']
        for field in date_fields:
            if extracted_data.get(field):
                try:
                    extracted_data[field] = parser.parse(extracted_data[field]).date()
                except:
                    extracted_data[field] = None
        
        # Convert important_dates
        if 'important_dates' in extracted_data:
            for date_info in extracted_data['important_dates']:
                try:
                    date_info['date'] = parser.parse(date_info['date']).date()
                except:
                    continue
        
        logger.info(f"Successfully extracted data: {extracted_data}")
        return extracted_data
        
    except Exception as e:
        logger.error(f"Error extracting data with AI: {str(e)}")
        return {}