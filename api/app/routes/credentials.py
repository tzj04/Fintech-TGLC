from fastapi import APIRouter, HTTPException
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel, Field, field_validator
from ..services.credential_service import CredentialService
from ..utils.validators import validate_xrpl_address
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/credentials", tags=["credentials"])

class IssueRequest(BaseModel):
    principal_address: str = Field(..., min_length=25, max_length=35)
    amount: str = Field(default="1000000", pattern=r'^\d+(\.\d+)?$') # XRPL regex can be in decimal
    currency: str = Field(
        default="CORRIDOR_ELIGIBLE",
        min_length=3,
        max_length=40,
        pattern=r'^[A-Z0-9]+$'
    )

    @field_validator('principal_address')
    @classmethod
    def validate_address(cls, v: str) -> str:
        return validate_xrpl_address(v)

@router.post("/issue")
async def issue_credential(req: IssueRequest):
    try:
        service = CredentialService()
        
        # For concurrency
        result = await run_in_threadpool(
            service.submit_trust_set,
            req.principal_address,
            req.amount,
            req.currency
        )
        
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Credential issuance failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
