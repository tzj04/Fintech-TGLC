from pydantic import BaseModel

class ExposureState(BaseModel):
    """
    Tracks the current exposure of a business to a bank.

    Use case:
    - Updated whenever a liquidity request is approved.
    - Used to prevent exceeding cumulative exposure limits.

    Purpose:
    - Ensures safe, auditable credit allocation.
    - Provides a single source of truth for business-bank exposure.
    """
    business_id: str
    bank_id: str
    current_exposure: float
