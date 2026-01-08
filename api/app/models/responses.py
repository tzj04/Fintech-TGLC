from pydantic import BaseModel

class CreditDecision(BaseModel):
    """
    Represents the outcome of a bank agent's evaluation of a liquidity request.

    Use case:
    - Returned by the Bank Credit Agent after verifying proofs and applying policy.
    - Contains approval status, approved amount, interest rate, or rejection reason.

    Purpose:
    - Ensures credit decisions are deterministic, transparent, and auditable.
    """
    approved: bool
    approved_amount: float | None = None
    rate: str | None = None
    reason: str | None = None