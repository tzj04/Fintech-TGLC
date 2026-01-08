from .base import BaseAgent
from ..services.proof_verifier import ProofVerifier
from ..services.policy_engine import PolicyEngine
from ..models.exposure_state import ExposureState
from ..models.responses import CreditDecision
from ..services.xrpl_client import XRPLClient
from ..services.bank_service import BankService
import logging

logger = logging.getLogger(__name__)

class BankAgent(BaseAgent):
    def __init__(
        self,
        proof_verifier: ProofVerifier,
        policy_engine: PolicyEngine,
        exposure_state: ExposureState,
        xrpl_client: XRPLClient,
        bank_service: BankService
    ):
        self.proof_verifier = proof_verifier
        self.policy_engine = policy_engine
        self.exposure_state = exposure_state
        self.xrpl_client = xrpl_client
        self.bank_service = bank_service

    def act(self, liquidity_request) -> CreditDecision:
        """
        Main orchestration for TGLC:
        1. Verify proofs
        2. Check policy
        3. Evaluate exposure
        4. Select eligible bank
        5. Submit escrow + clawback on XRPL if approved
        """
        # Step 1: verify proofs from credentials
        proof_result = self.proof_verifier.verify(liquidity_request.credentials)

        # Step 2: policy check
        policy_ok = self.policy_engine.check(liquidity_request, proof_result)

        # Step 3: exposure check
        exposure_ok = self.exposure_state.can_lend(
            liquidity_request.business_id,
            liquidity_request.amount
        )

        # Step 4: select eligible bank
        eligible_banks = self.bank_service.find_matching_banks(
            liquidity_request.amount,
            proof_result.get("credit_score", 0)
        )

        if not policy_ok or not exposure_ok or not eligible_banks:
            reason = "Policy or exposure violation" if not (policy_ok and exposure_ok) else "No eligible banks"
            return CreditDecision(
                business_id=liquidity_request.business_id,
                approved=False,
                amount=0,
                reason=reason
            )

        selected_bank = eligible_banks[0]  # pick the top match
        liquidity_request.selected_bank = selected_bank  # store for reference
        bank_wallet_address = selected_bank["wallet_address"]

        # Step 5: XRPL transactions (escrow + clawback)
        approved = True
        try:
            finish_after = int(liquidity_request.unlock_time.timestamp())

            # Escrow from bank wallet to borrower
            self.xrpl_client.create_escrow(
                destination=liquidity_request.business_id,
                amount=liquidity_request.amount,
                finish_after=finish_after
            )

            # Clawback from borrower to bank if needed
            self.xrpl_client.clawback(
                from_account=liquidity_request.business_id,
                amount=liquidity_request.amount
            )

            logger.info(
                f"Liquidity approved: {liquidity_request.amount} XRP from {selected_bank['bank_name']} to {liquidity_request.business_id}"
            )

        except Exception as e:
            approved = False
            logger.error(f"XRPL transaction failed: {e}", exc_info=True)

        return CreditDecision(
            business_id=liquidity_request.business_id,
            approved=approved,
            amount=liquidity_request.amount if approved else 0,
            reason=None if approved else "XRPL transaction failed"
        )
