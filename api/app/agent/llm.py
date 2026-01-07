import os
from dotenv import load_dotenv

load_dotenv()

class LLMService:
    def __init__(self, provider: str = "openai"):
        self.provider = provider
        self.api_key = os.getenv(f"{provider.upper()}_API_KEY")
    
    def generate_decision(self, prompt: str, context: dict = None):
        return {
            "decision": "approve",
            "confidence": 0.85
        }
