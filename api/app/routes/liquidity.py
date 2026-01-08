from fastapi import APIRouter, HTTPException
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel, Field, field_validator
from typing import Optional
import logging, re
from datetime import datetime

from ..services.proof_verifier import ProofVerifier
from ..services.risk_model import RiskModel
from ..services.liquidity_engine import LiquidityEngine
from ..services.credential_service import CredentialService
from ..services.policy_engine import PolicyEngine
from ..models.exposure_state import ExposureState
from ..services.xrpl_client import XRPLClient
from ..agent.business_agent import BusinessAgent
from ..agent.bank_agent import BankAgent

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/liquidity", tags=["Liquidity"])

# -------------------
# Utilities
# -------------------
def validate_xrpl_address(address: str) -> str:
    if not re.match(r'^r[1-9A-HJ-NP-Za-km-z]{25,34}$', address):
        raise ValueError("Invalid XRPL address format")
    return address

# -------------------
# Pydantic Models
# -------------------
class ProofPayload(BaseModel):
    metrics: dict

class LiquidityRequest(BaseModel):
    principal_did: str = Field(..., min_length=10)
    principal_address: str = Field(..., min_length=25, max_length=35)
    amount_xrp: float = Field(..., gt=0, le=1_000_000_000)
    unlock_time: datetime = Field(..., description="UTC datetime when escrow can be released")
    proof_data: Optional[ProofPayload] = None

    @field_validator('principal_address')
    @classmethod
    def validate_address(cls, v: str) -> str:
        return validate_xrpl_address(v)

# -------------------
# Endpoints
# -------------------
@router.post("/request")
async def request_liquidity(req: LiquidityRequest):
    try:
        # Step 1: Verify proof data (optional)
        proof_result = {}
        if req.proof_data:
            verifier = ProofVerifier()
            proof_result = await run_in_threadpool(verifier.verify, req.proof_data)

        # Step 2: Business prepares liquidity request
        business_agent = BusinessAgent(
            risk_model=RiskModel(),
            liquidity_engine=LiquidityEngine(),
            credential_service=CredentialService()
        )
        liquidity_request_internal = business_agent.act(
            business_id=req.principal_did,
            unlock_time=req.unlock_time
        )

        # Step 3: Bank evaluates the request
        bank_agent = BankAgent(
            proof_verifier=ProofVerifier(),
            policy_engine=PolicyEngine(),
            exposure_state=ExposureState(),
            xrpl_client=XRPLClient()
        )
        decision = bank_agent.act(liquidity_request_internal)

        if not decision.approved:
            raise HTTPException(status_code=400, detail=decision.reason)

        return {"status": "approved", "decision": decision.dict()}

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Liquidity request failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to process liquidity request")


@router.post("/verify-proof")
async def verify_proof(proof_data: ProofPayload):
    """
    Standalone endpoint to verify proof data.
    """
    try:
        # proof_data is already a ProofPayload with all attributes
        verifier = ProofVerifier()
        result = await run_in_threadpool(
            verifier.verify,
            proof_data  # pass the object directly
        )
        return {"status": "success", "result": result}
    except Exception as e:
        logger.error(f"Proof verification failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to verify proof")
