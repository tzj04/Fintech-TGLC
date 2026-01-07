from ..services.xrpl_client import XRPLClient
from ..services.credential_service import CredentialService
from ..services.escrow_service import EscrowService
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

class AgentBot:
    def __init__(self):
        self.xrpl_client = XRPLClient()
        self.credential_service = CredentialService()
        self.escrow_service = EscrowService()
    
    def evaluate(self, principal_did: str, principal_address: str, amount_xrp: float, proof_result: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        logger.info(f"Evaluating liquidity request for {principal_did}")
        
        if proof_result and not proof_result.get("valid"):
            logger.warning(f"Proof verification failed for {principal_did}")
            return {"status": "rejected", "reason": "proof_invalid"}
        
        if amount_xrp <= 0:
            logger.warning(f"Invalid amount: {amount_xrp}")
            return {"status": "rejected", "reason": "invalid_amount"}
        
        logger.info(f"Approved. Creating escrow for {amount_xrp} XRP")
        escrow_tx = self.escrow_service.create_escrow(
            self.credential_service.issuer_wallet.classic_address,
            principal_address,
            amount_xrp
        )
        
        return {
            "status": "approved",
            "escrow": escrow_tx.to_dict(),
            "amount_xrp": amount_xrp
        }
