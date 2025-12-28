"""
AI Response Parser and Intermediary
Parses AI responses, extracts structured commands, and decides action routing
"""
import json
import re
from typing import Dict, Optional, Any
from datetime import datetime, timedelta


class AIResponseParser:
    """Parses AI responses and extracts actionable commands"""
    
    TASK_OPERATIONS = ["create_task", "update_task", "delete_task"]
    
    def __init__(self):
        self.last_parsed_response = None
    
    def parse_relative_date(self, date_str: str) -> str:
        """Convert relative dates like 'tomorrow', 'next week' to ISO format"""
        date_str = date_str.lower().strip()
        now = datetime.now()
        
        date_mappings = {
            'today': now,
            'now': now,
            'tomorrow': now + timedelta(days=1),
            'next week': now + timedelta(weeks=1),
            'next month': now + timedelta(days=30),
        }
        
        # Check exact matches
        if date_str in date_mappings:
            return date_mappings[date_str].isoformat()
        
        # Check for "in X days/weeks"
        match = re.search(r'in\s+(\d+)\s+(day|week|month)s?', date_str)
        if match:
            amount = int(match.group(1))
            unit = match.group(2)
            if unit == 'day':
                return (now + timedelta(days=amount)).isoformat()
            elif unit == 'week':
                return (now + timedelta(weeks=amount)).isoformat()
            elif unit == 'month':
                return (now + timedelta(days=amount * 30)).isoformat()
        
        # Check for "X days from now"
        match = re.search(r'(\d+)\s+(day|week|month)s?\s+from\s+now', date_str)
        if match:
            amount = int(match.group(1))
            unit = match.group(2)
            if unit == 'day':
                return (now + timedelta(days=amount)).isoformat()
            elif unit == 'week':
                return (now + timedelta(weeks=amount)).isoformat()
            elif unit == 'month':
                return (now + timedelta(days=amount * 30)).isoformat()
        
        # If already ISO format or can't parse, return as is
        return date_str
    
    def extract_json_from_text(self, text: str) -> Optional[Dict[str, Any]]:
        """Extract JSON object from AI response text"""
        try:
            # Strategy 1: Look for JSON object with curly braces
            json_match = re.search(r'\{[\s\S]*\}', text)
            if json_match:
                json_str = json_match.group()
                parsed = json.loads(json_str)
                return parsed
        except json.JSONDecodeError:
            pass
        
        return None
    
    def is_function_call(self, parsed_json: Dict[str, Any]) -> bool:
        """Determine if parsed JSON represents a function call"""
        if not parsed_json:
            return False
        
        # Check for explicit function_call action
        if parsed_json.get("action") == "function_call":
            return True
        
        # Check if action is a known task operation
        action = parsed_json.get("action", "")
        if action in self.TASK_OPERATIONS:
            return True
        
        # Check if has both 'function' and 'parameters' keys
        if "function" in parsed_json and "parameters" in parsed_json:
            return True
        
        return False
    
    def normalize_function_call(self, parsed_json: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize function call to standard format"""
        normalized = parsed_json.copy()
        
        # Ensure 'action' field exists
        if "action" not in normalized:
            if "function" in normalized:
                normalized["action"] = "function_call"
            else:
                normalized["action"] = "function_call"
        
        # Ensure 'function' field exists
        if "function" not in normalized:
            # Try to infer from action
            if normalized.get("action") in self.TASK_OPERATIONS:
                normalized["function"] = normalized["action"]
            else:
                normalized["function"] = "create_task"  # default
        
        # Process relative dates in parameters
        if "parameters" in normalized and "due_date" in normalized["parameters"]:
            normalized["parameters"]["due_date"] = self.parse_relative_date(
                normalized["parameters"]["due_date"]
            )
        
        return normalized
    
    def parse(self, ai_response: str) -> Dict[str, Any]:
        """
        Main parsing method
        Returns a dict with:
        - 'type': 'text' or 'function_call'
        - 'content': the text response or None
        - 'function_call': the normalized function call dict or None
        """
        result = {
            'type': 'text',
            'content': ai_response,
            'function_call': None
        }
        
        # Try to extract JSON
        parsed_json = self.extract_json_from_text(ai_response)
        
        if parsed_json and self.is_function_call(parsed_json):
            # It's a function call!
            normalized = self.normalize_function_call(parsed_json)
            result['type'] = 'function_call'
            result['function_call'] = normalized
            # Keep the original response as content for logging
        
        self.last_parsed_response = result
        return result


# Singleton instance
parser = AIResponseParser()


def parse_ai_response(ai_response: str) -> Dict[str, Any]:
    """Convenience function to parse AI response"""
    return parser.parse(ai_response)
