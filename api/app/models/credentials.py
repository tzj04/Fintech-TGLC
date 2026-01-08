from datetime import datetime
from pydantic import BaseModel
from typing import List

class CreditCredential(BaseModel):
    """
    Represents a verifiable credit credential issued by a bank to a business.

    Use case:
    - Issued by a bank and stored by a Business Liquidity Agent.
    - Defines maximum credit limit, allowed liquidity corridors, and expiry.
    - Used to constrain liquidity requests submitted to bank agents.

    Purpose:
    - Encodes trust and enforces limits in the TGLC system.
    - Enables automated, policy-compliant liquidity management.
    """
    issuer: str                 # Bank ID
    business_id: str
    credit_limit: float
    corridors: List[str]        # e.g. ["SGD-USDC"]
    expires_at: datetime