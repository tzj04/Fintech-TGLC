from .base import BaseAgent
from ..services.liquidity_engine import LiquidityEngine
from ..services.risk_model import RiskModel
from ..services.credential_service import CredentialService
from ..models.requests import LiquidityRequest

class BusinessAgent(BaseAgent):
    def __init__(self, risk_model: RiskModel, liquidity_engine: LiquidityEngine, credential_service: CredentialService):
        self.risk_model = risk_model
        self.liquidity_engine = liquidity_engine
        self.credential_service = credential_service

    def act(self, business_id: str) -> LiquidityRequest:
        """
        Main orchestration:
        1. Pull credentials
        2. Evaluate risk
        3. Produce liquidity request
        """
        # Step 1: pull credentials
        credentials = self.credential_service.get_credentials(business_id)
        
        # Step 2: evaluate risk
        risk_score = self.risk_model.evaluate(credentials)
        
        # Step 3: determine liquidity
        liquidity_amount = self.liquidity_engine.calculate_liquidity(credentials, risk_score)
        
        # Step 4: construct LiquidityRequest
        request = LiquidityRequest(
            business_id=business_id,
            amount=liquidity_amount,
            risk_score=risk_score,
            credentials=credentials
        )
        
        return request
