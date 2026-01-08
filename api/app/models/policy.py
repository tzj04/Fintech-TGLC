from pydantic import BaseModel

class CreditPolicy(BaseModel):
    """
    Represents a bank's deterministic credit policy.

    Use case:
    - Used by the Bank Credit Agent to evaluate liquidity requests.
    - Defines limits such as maximum duration, allowable default rate, and exposure caps.

    Purpose:
    - Encodes bank policy into machine-executable rules.
    - Ensures consistent, auditable, and safe decision-making.
    """
    max_duration_days: int
    max_default_rate: float
    max_exposure: float