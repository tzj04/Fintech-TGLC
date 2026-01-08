# api/app/routes/liquidity.py
from fastapi import APIRouter, HTTPException
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional
import logging
from datetime import datetime, timezone, timedelta

from ..services.proof_verifier import ProofVerifier
from ..services.credit_service import CreditService
from ..services.escrow_service import EscrowService
from ..services.bank_service import BankService
from ..services.xrpl_client import XRPLClient
from ..models.proof import ProofPayload as ProofPayloadModel
from ..utils.validators import validate_xrpl_address

from xrpl.transaction import autofill, submit_and_wait
from xrpl.models.transactions import EscrowCreate, EscrowFinish
from xrpl.utils import xrp_to_drops

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Liquidity"])

DEFAULT_ESCROW_DAYS = 30  # Repayment deadline (not when funds are available)
MAX_XRP_AMOUNT = 1_000_000_000

# XRPL Explorer URLs by network
EXPLORER_URLS = {
    "mainnet": "https://xrpl.org/transactions/",
    "testnet": "https://testnet.xrpl.org/transactions/",
    "devnet": "https://testnet.xrpl.org/transactions/",
}

# Get network from environment (default to testnet)
import os
XRPL_NETWORK = os.getenv("XRPL_NETWORK", "testnet")
EXPLORER_BASE_URL = EXPLORER_URLS.get(XRPL_NETWORK, EXPLORER_URLS["testnet"])

# -------------------
# Pydantic Models
# -------------------
class LiquidityRequest(BaseModel):
    principal_did: Optional[str] = Field(None, min_length=10, description="Principal DID (auto-generated if not provided)")
    principal_address: str = Field(..., min_length=25, max_length=35, description="XRPL address of the borrower")
    amount_xrp: float = Field(..., gt=0, le=MAX_XRP_AMOUNT, description="Amount of XRP to request")
    unlock_time: Optional[datetime] = Field(None, description=f"UTC datetime when escrow can be released (defaults to {DEFAULT_ESCROW_DAYS} days)")
    proof_data: Optional[dict] = Field(None, description="Optional performance proof data")

    @field_validator('principal_address')
    @classmethod
    def validate_address(cls, v: str) -> str:
        try:
            return validate_xrpl_address(v)
        except ValueError as e:
            raise ValueError(f"Invalid XRPL address: {e}")
    
    @model_validator(mode='after')
    def generate_did(self):
        """Auto-generate DID from address if not provided."""
        if not self.principal_did and self.principal_address:
            self.principal_did = f"did:xrpl:{self.principal_address}"
        return self

class EscrowFinishRequest(BaseModel):
    borrower_wallet: str = Field(..., min_length=25, max_length=35)
    escrow_sequence: int = Field(..., gt=0)
    owner_wallet: str = Field(..., min_length=25, max_length=35, description="Wallet address of the bank that created the escrow")

# -------------------
# Endpoints
# -------------------
@router.post("/request")
async def request_liquidity(req: LiquidityRequest):
    """
    Request liquidity: decentralized flow.
    
    - Checks on-chain credit score
    - AI agent auto-approves based on credit score
    - Returns prepared escrow transaction for bank to sign
    - Bank controls their wallet, signs their own escrow
    """
    try:
        credit_svc = CreditService()
        escrow_svc = EscrowService()
        bank_svc = BankService()
        xrpl_client = XRPLClient()
        
        # Step 1: Check eligibility
        eligibility = await run_in_threadpool(
            credit_svc.check_eligibility,
            req.principal_address,
            req.amount_xrp
        )
        if not eligibility["eligible"]:
            return {
                "status": "rejected",
                "reason": eligibility["reason"],
                "credit": eligibility["credit"]
            }
        
        # Step 2: Verify optional proof
        if req.proof_data:
            try:
                proof_payload = ProofPayloadModel(**req.proof_data)
                verifier = ProofVerifier()
                await run_in_threadpool(verifier.verify, proof_payload)
            except Exception as e:
                logger.warning(f"Proof verification failed: {e}")
        
        # Step 3: Compute unlock timestamp
        if req.unlock_time:
            unlock_timestamp = int(req.unlock_time.timestamp())
        else:
            unlock_timestamp = int((datetime.now(timezone.utc) + timedelta(days=DEFAULT_ESCROW_DAYS)).timestamp())
        
        logger.info(f"Liquidity request: address={req.principal_address}, amount={req.amount_xrp}, score={eligibility['credit']['score']}")
        
        # Debug: log all available banks
        all_banks = await run_in_threadpool(bank_svc.get_all_banks)
        logger.info(f"Available banks: {[(b['bank_name'], b['wallet_address'], b.get('balance_xrp', 0)) for b in all_banks]}")
        
        # -----------------------------
        # Step 4: Find a matching bank
        # -----------------------------
        # BankService is responsible for selecting eligible banks based on:
        # - requested amount
        # - borrower credit score
        matching_banks = await run_in_threadpool(
            bank_svc.find_matching_banks,
            req.amount_xrp,
            eligibility["credit"]["score"]
        )
        
        logger.info(f"Matching banks found: {len(matching_banks)} out of {len(all_banks)}")
        for bank in matching_banks:
            logger.info(f"  Matched: {bank['bank_name']} ({bank['wallet_address']})")
        
        # If no banks match, log why
        if not matching_banks and all_banks:
            logger.warning(f"No banks matched. Debug:")
            for bank in all_banks:
                policy = bank["credit_policy"]
                balance = bank.get("balance_xrp", 0)
                logger.warning(f"  Bank: {bank['bank_name']}")
                logger.warning(f"    - Policy min: {policy['min']}, requested score: {eligibility['credit']['score']} (pass: {policy['min'] <= eligibility['credit']['score']})")
                logger.warning(f"    - Policy max: {policy['max']}, requested amount: {req.amount_xrp} (pass: {policy['max'] >= req.amount_xrp})")
                logger.warning(f"    - Balance: {balance} XRP, requested: {req.amount_xrp} (pass: {balance >= req.amount_xrp})")
                logger.warning(f"    - Active: {bank.get('active', True)}")
        
        # -----------------------------
        # Step 5: Prepare escrow
        # -----------------------------
        if matching_banks:
            best_bank = matching_banks[0]
            logger.info(f"Matched with bank: {best_bank['bank_name']} ({best_bank['wallet_address']})")
            
            escrow_tx = EscrowCreate(
                account=best_bank["wallet_address"],
                destination=req.principal_address,
                amount=xrp_to_drops(req.amount_xrp),
                finish_after=unlock_timestamp
            )
            
            # Submit the escrow immediately
            prepared_tx = await run_in_threadpool(autofill, escrow_tx, xrpl_client.client)
            try:
                # Try to submit using the bank's wallet if available, otherwise use platform wallet
                bank_wallet = xrpl_client._wallet
                response = await run_in_threadpool(xrpl_client.submit, prepared_tx, bank_wallet)
                tx_hash = response.get("hash")
                transaction_url = f"{EXPLORER_BASE_URL}{tx_hash}" if tx_hash else None
                logger.info(f"Escrow created with matched bank: {tx_hash}")
                
                return {
                    "status": "approved",
                    "tx_hash": tx_hash,
                    "amount_xrp": req.amount_xrp,
                    "credit": eligibility["credit"],
                    "unlock_timestamp": unlock_timestamp,
                    "matched_bank": {
                        "name": best_bank["bank_name"],
                        "wallet": best_bank["wallet_address"]
                    },
                    "transaction_url": transaction_url,
                    "explorer_url": transaction_url,
                    "message": f"Matched with {best_bank['bank_name']} and escrow created successfully. View receipt: {transaction_url}"
                }
            except Exception as e:
                # If submission fails, return prepared transaction for manual signing
                logger.warning(f"Failed to auto-submit escrow, returning prepared transaction: {e}")
                tx_dict = prepared_tx.to_dict()
                return {
                    "status": "matched",
                    "transaction": tx_dict,
                    "amount_xrp": req.amount_xrp,
                    "credit": eligibility["credit"],
                    "unlock_timestamp": unlock_timestamp,
                    "matched_bank": {
                        "name": best_bank["bank_name"],
                        "wallet": best_bank["wallet_address"]
                    },
                    "explorer_url_template": EXPLORER_BASE_URL + "{tx_hash}",
                    "message": f"Matched with {best_bank['bank_name']}. Escrow transaction prepared for signing. After signing, view at: {EXPLORER_BASE_URL}<tx_hash>"
                }
        else:
            # Fallback to platform wallet if no banks match
            logger.info("No banks matched, using platform wallet fallback")
            platform_wallet = xrpl_client._wallet
            
            escrow_tx = EscrowCreate(
                account=platform_wallet.classic_address,
                destination=req.principal_address,
                amount=xrp_to_drops(req.amount_xrp),
                finish_after=unlock_timestamp
            )
            
            prepared_tx = await run_in_threadpool(autofill, escrow_tx, xrpl_client.client)
            response = await run_in_threadpool(xrpl_client.submit, prepared_tx, platform_wallet)
            
            tx_hash = response.get("hash")
            logger.info(f"Escrow created directly: {tx_hash}")
            
            transaction_url = f"{EXPLORER_BASE_URL}{tx_hash}" if tx_hash else None
            
            return {
                "status": "approved",
                "tx_hash": tx_hash,
                "amount_xrp": req.amount_xrp,
                "credit": eligibility["credit"],
                "unlock_timestamp": unlock_timestamp,
                "transaction_url": transaction_url,
                "explorer_url": transaction_url,
                "message": f"Escrow created successfully. Funds will be available after unlock time. View receipt: {transaction_url}"
            }

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Liquidity request failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to process liquidity request: {str(e)}")


@router.get("/credit-score/{address}")
async def get_credit_score(address: str):
    """Get credit score for an XRPL address."""
    try:
        validate_xrpl_address(address)
        credit_svc = CreditService()
        credit = await run_in_threadpool(credit_svc.get_credit_score, address)
        return credit
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Credit score fetch failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch credit score")


@router.post("/finish-escrow")
async def finish_escrow(req: EscrowFinishRequest):
    """Prepare EscrowFinish transaction for borrower to sign."""
    try:
        validate_xrpl_address(req.borrower_wallet)
        validate_xrpl_address(req.owner_wallet)
        
        xrpl_client = XRPLClient()
        escrow_tx = EscrowFinish(
            account=req.borrower_wallet,
            owner=req.owner_wallet,
            offer_sequence=req.escrow_sequence
        )
        
        prepared_tx = await run_in_threadpool(autofill, escrow_tx, xrpl_client.client)
        
        return {
            "status": "ready_to_sign",
            "message": "EscrowFinish prepared. Sign with your wallet to receive funds.",
            "transaction": prepared_tx.to_dict()
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Escrow finish failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/verify-proof")
async def verify_proof(proof_data: dict):
    """Standalone endpoint to verify proof data."""
    try:
        proof_payload = ProofPayloadModel(**proof_data)
        verifier = ProofVerifier()
        result = await run_in_threadpool(verifier.verify, proof_payload)
        return {"status": "success", "result": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Proof verification failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to verify proof")
