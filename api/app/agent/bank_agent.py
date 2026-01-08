from .base import BaseAgent
from ..services.proof_verifier import ProofVerifier
from ..services.policy_engine import PolicyEngine
from ..models.exposure_state import ExposureState
from ..models.responses import CreditDecision
from ..services.xrpl_client import XRPLClient


class BankAgent(BaseAgent):
    def __init__(
        self,
        proof_verifier: ProofVerifier,
        policy_engine: PolicyEngine,
        exposure_state: ExposureState,
        xrpl_client: XRPLClient
    ):
        self.proof_verifier = proof_verifier
        self.policy_engine = policy_engine
        self.exposure_state = exposure_state
        self.xrpl_client = xrpl_client

    def act(self, liquidity_request) -> CreditDecision:
        """
        Main orchestration for TGLC:
        1. Verify proofs
        2. Check policy
        3. Evaluate exposure
        4. Produce CreditDecision
        5. Always submit escrow + clawback on XRPL if approved
        """
        # Step 1: verify proofs from credentials
        proof_result = self.proof_verifier.verify(liquidity_request.credentials)
        
        # Step 2: policy check
        policy_ok = self.policy_engine.check(liquidity_request, proof_result)
        
        # Step 3: exposure check
        exposure_ok = self.exposure_state.can_lend(liquidity_request.business_id, liquidity_request.amount)
        
        # Step 4: make decision
        approved = policy_ok and exposure_ok
        decision = CreditDecision(
            business_id=liquidity_request.business_id,
            approved=approved,
            amount=liquidity_request.amount if approved else 0,
            reason=None if approved else "Policy or exposure violation"
        )
        
        # Step 5: XRPL transactions (always escrow + clawback)
        if approved:
            try:
                # Time till clawback initiates if contract unpaid
                finish_after = int(liquidity_request.unlock_time.timestamp())
                
                # Create escrow for the approved amount
                self.xrpl_client.create_escrow(
                    destination=liquidity_request.business_id,
                    amount=liquidity_request.amount,
                    finish_after=finish_after
                )

                # Prepare clawback transaction
                self.xrpl_client.clawback(
                    from_account=liquidity_request.business_id,
                    amount=liquidity_request.amount
                )
            except Exception as e:
                decision.approved = False
                decision.reason = f"XRPL transaction failed: {e}"
        
        return decision
