from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator
from ..services.credential_service import CredentialService
import re
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/credentials", tags=["credentials"])

def validate_xrpl_address(address: str) -> str:
    if not re.match(r'^r[1-9A-HJ-NP-Za-km-z]{25,34}$', address):
        raise ValueError("Invalid XRPL address format")
    return address

class IssueRequest(BaseModel):
    principal_address: str = Field(..., min_length=25, max_length=35)
    amount: str = Field(default="1000000", pattern=r'^\d+$')
    currency: str = Field(default="CORRIDOR_ELIGIBLE", min_length=3, max_length=3)

    @field_validator('principal_address')
    @classmethod
    def validate_address(cls, v: str) -> str:
        return validate_xrpl_address(v)

@router.post("/issue")
async def issue_credential(req: IssueRequest):
    try:
        service = CredentialService()
        result = service.create_trust_set(req.principal_address, req.amount, req.currency)
        return {
            "transaction": result["transaction"],
            "issuer": result["issuer"],
            "status": "submitted"
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Credential issuance failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to issue credential")
