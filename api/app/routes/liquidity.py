from fastapi import APIRouter, HTTPException
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel, Field, field_validator
from typing import Optional
import logging
from ..services.proof_verifier import ProofVerifier
from ..agent.bot import AgentBot
from ..utils.validators import validate_xrpl_address

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/liquidity", tags=["liquidity"])

class ProofPayload(BaseModel):
    metrics: dict

class LiquidityRequest(BaseModel):
    principal_did: str = Field(..., min_length=10)
    principal_address: str = Field(..., min_length=25, max_length=35)
    amount_xrp: float = Field(..., gt=0, le=1000000000)
    proof_data: Optional[ProofPayload] = None

    @field_validator('principal_address')
    @classmethod
    def validate_address(cls, v: str) -> str:
        return validate_xrpl_address(v)

@router.post("/request")
async def request_liquidity(req: LiquidityRequest):
    try:
        verifier = ProofVerifier()
        proof_result = None
        if req.proof_data:
            proof_result = await run_in_threadpool(
                verifier.verify,
                req.proof_data.model_dump() if hasattr(req.proof_data, 'model_dump') else req.proof_data
            )
        
        # NOTE:
        # BackgroundTasks is used as a temporary async mechanism.
        # In production, this will be replaced with a durable task queue.
        agent = AgentBot()
        result = agent.evaluate(
            req.principal_did,
            req.principal_address,
            req.amount_xrp,
            proof_result
        )
        
        if result.get("status") == "rejected":
            raise HTTPException(status_code=400, detail=result.get("reason", "Request rejected"))
        
        return result
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Liquidity request failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to process liquidity request")

@router.post("/verify-proof")
async def verify_proof(proof_data: ProofPayload):
    verifier = ProofVerifier()
    return verifier.verify(proof_data.model_dump())