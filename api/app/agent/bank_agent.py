from .base import BaseAgent
from ..services.proof_verifier import ProofVerifier
from ..services.policy_engine import PolicyEngine
from ..models.exposure_state import ExposureState
from ..models.responses import CreditDecision
from ..services.xrpl_client import XRPLClient, XRPLSubmissionError
from ..services.bank_service import BankService
from xrpl.models.transactions import EscrowCreate
from xrpl.transaction import autofill
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

    def auto_sign_escrow(self, tx_dict: dict, bank_seed: str) -> dict:
        """
        Auto-sign and submit an escrow transaction from a bank.
        
        Args:
            tx_dict: Transaction dictionary (prepared transaction)
            bank_seed: Bank's XRPL wallet seed
            
        Returns:
            Transaction result with hash and status
        """
        try:
            # Reconstruct transaction object from dict
            tx = EscrowCreate.from_dict(tx_dict)
            
            # Sign and submit with bank wallet
            result = self.xrpl_client.sign_and_submit_with_wallet(tx, bank_seed)
            
            logger.info(
                f"Escrow auto-signed and submitted: {result.get('hash', 'unknown')} "
                f"from {tx.account} to {tx.destination}"
            )
            
            return {
                "status": "signed",
                "tx_hash": result.get("hash"),
                "amount": tx.amount,
                "destination": tx.destination,
                "message": "Escrow auto-signed and submitted successfully"
            }
        except XRPLSubmissionError as e:
            logger.error(f"Failed to auto-sign escrow: {e}")
            return {
                "status": "failed",
                "error": str(e),
                "message": "Failed to auto-sign and submit escrow"
            }
        except Exception as e:
            logger.error(f"Unexpected error in auto_sign_escrow: {e}", exc_info=True)
            return {
                "status": "failed",
                "error": str(e),
                "message": "Unexpected error during escrow signing"
            }

    def evaluate_and_auto_sign_escrow(self, liquidity_request, tx_dict: dict, bank: dict, bank_seed: str) -> dict:
        """
        BankAgent decision process:
        1. Check bank policy (credit score thresholds)
        2. Evaluate bank exposure
        3. If APPROVED: Auto-sign and submit escrow
        4. If REJECTED: Return rejection with reason
        
        Args:
            liquidity_request: The liquidity request object
            tx_dict: Prepared escrow transaction dictionary
            bank: The matched bank object
            bank_seed: Bank's XRPL wallet seed for signing
            
        Returns:
            Decision dict with approval status and action taken
        """
        try:
            # Step 1: Check bank's credit policy
            # The liquidity endpoint already verified credit eligibility,
            # so we just confirm the bank's policy allows this amount
            bank_policy = bank.get("credit_policy", {})
            max_amount = bank_policy.get("max", 10000)
            amount_xrp = getattr(liquidity_request, 'amount_xrp', 0)
            
            logger.info(f"Policy check: max={max_amount}, requested={amount_xrp}")
            
            if amount_xrp > max_amount:
                logger.warning(f"Bank {bank['bank_name']} rejected due to amount exceeds max policy")
                return {
                    "status": "rejected",
                    "approved": False,
                    "bank_name": bank["bank_name"],
                    "reason": f"Request amount {amount_xrp} exceeds bank maximum {max_amount}",
                    "message": f"{bank['bank_name']} automatically rejected due to amount limits."
                }
            
            # Step 2: Exposure check - verify bank has sufficient balance
            amount_xrp = getattr(liquidity_request, 'amount_xrp', 0)
            bank_balance = bank.get("balance_xrp", 0)
            
            logger.info(f"Balance check: bank_balance={bank_balance}, requested={amount_xrp}")
            
            if bank_balance < amount_xrp:
                logger.warning(f"Bank {bank['bank_name']} rejected due to insufficient balance")
                return {
                    "status": "rejected",
                    "approved": False,
                    "bank_name": bank["bank_name"],
                    "reason": f"Insufficient balance: {bank_balance} < {amount_xrp}",
                    "message": f"{bank['bank_name']} automatically rejected due to insufficient balance."
                }
            
            # Step 3: APPROVED - Auto-sign the escrow
            logger.info(f"Bank {bank['bank_name']} approved the request. Auto-signing escrow...")
            sign_result = self.auto_sign_escrow(tx_dict, bank_seed)
            
            if sign_result["status"] == "signed":
                logger.info(f"Escrow auto-signed by {bank['bank_name']}: {sign_result['tx_hash']}")
                return {
                    "status": "approved",
                    "approved": True,
                    "bank_name": bank["bank_name"],
                    "tx_hash": sign_result["tx_hash"],
                    "message": f"{bank['bank_name']} automatically approved and signed the escrow."
                }
            else:
                logger.error(f"Auto-sign failed for {bank['bank_name']}: {sign_result.get('error')}")
                return {
                    "status": "signing_failed",
                    "approved": False,
                    "bank_name": bank["bank_name"],
                    "reason": sign_result.get("error"),
                    "message": f"{bank['bank_name']} approved but failed to sign the transaction."
                }
            
        except Exception as e:
            logger.error(f"Error in evaluate_and_auto_sign_escrow: {e}", exc_info=True)
            return {
                "status": "error",
                "approved": False,
                "bank_name": bank.get("bank_name", "Unknown"),
                "reason": str(e),
                "message": "BankAgent encountered an error during evaluation."
            }
