from datetime import datetime
from pydantic import BaseModel

class ProofPayload(BaseModel):
    """
    Represents verifiable proof of business metrics submitted with a liquidity request.

    Use case:
    - Contains financial or operational metrics used to justify the liquidity request.
    - Includes source and timestamp to allow verification.
    - Optionally signed by a trusted oracle or authority.

    Purpose:
    - Enables deterministic verification by the Bank Credit Agent.
    - Ensures requests are auditable and non-repudiable.
    """
    metrics: dict
    timestamp: datetime
    source: str        # oracle / internal / audited
    signature: str | None
