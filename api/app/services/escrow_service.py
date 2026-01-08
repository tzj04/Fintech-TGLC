# /api/app/services/escrow_service.py

from typing import Optional
import logging

from xrpl.models.transactions import EscrowCreate, EscrowFinish, EscrowCancel
from xrpl.utils import xrp_to_drops
from xrpl.transaction import submit_and_wait
from .xrpl_client import XRPLClient
from xrpl.wallet import Wallet
from ..utils.validators import validate_xrpl_address, validate_xrp_amount, validate_condition, validate_fulfillment

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class EscrowService:
    def __init__(self):
        self.xrpl_client = XRPLClient().client

    # =====================
    # EscrowCreate
    # =====================
    def create_escrow(self, from_wallet: Wallet, to_address: str, amount_xrp: float, condition: Optional[str] = None) -> EscrowCreate:
        validate_xrpl_address(from_wallet.classic_address)
        validate_xrpl_address(to_address)
        validate_xrp_amount(amount_xrp)
        validate_condition(condition)

        tx = EscrowCreate(
            account=from_wallet.classic_address,
            destination=to_address,
            amount=xrp_to_drops(amount_xrp),
            condition=condition
        )
        logger.info(f"Prepared EscrowCreate from {from_wallet.classic_address} to {to_address}, amount={amount_xrp} XRP")
        return tx

    def submit_escrow_create(self, from_wallet: Wallet, to_address: str, amount_xrp: float, condition: Optional[str] = None) -> dict:
        tx = self.create_escrow(from_wallet, to_address, amount_xrp, condition)
        try:
            response = submit_and_wait(tx, self.xrpl_client, from_wallet)
            logger.info(f"EscrowCreate submitted successfully. Hash: {response.result.get('hash')}")
            return response.result
        except Exception as e:
            logger.error(f"Failed to submit EscrowCreate: {e}")
            raise

    # =====================
    # EscrowFinish
    # =====================
    def finish_escrow(self, owner_wallet: Wallet, offer_sequence: int, fulfillment: Optional[str] = None) -> EscrowFinish:
        validate_fulfillment(fulfillment)
        tx = EscrowFinish(
            account=owner_wallet.classic_address,
            owner=owner_wallet.classic_address,
            offer_sequence=offer_sequence,
            fulfillment=fulfillment
        )
        logger.info(f"Prepared EscrowFinish for offer_sequence={offer_sequence} by {owner_wallet.classic_address}")
        return tx

    def submit_escrow_finish(self, owner_wallet: Wallet, offer_sequence: int, fulfillment: Optional[str] = None) -> dict:
        tx = self.finish_escrow(owner_wallet, offer_sequence, fulfillment)
        try:
            response = submit_and_wait(tx, self.xrpl_client, owner_wallet)
            logger.info(f"EscrowFinish submitted successfully. Hash: {response.result.get('hash')}")
            return response.result
        except Exception as e:
            logger.error(f"Failed to submit EscrowFinish: {e}")
            raise

    # =====================
    # EscrowCancel
    # =====================
    def cancel_escrow(self, owner_wallet: Wallet, offer_sequence: int) -> EscrowCancel:
        tx = EscrowCancel(
            account=owner_wallet.classic_address,
            owner=owner_wallet.classic_address,
            offer_sequence=offer_sequence
        )
        logger.info(f"Prepared EscrowCancel for offer_sequence={offer_sequence} by {owner_wallet.classic_address}")
        return tx

    def submit_escrow_cancel(self, owner_wallet: Wallet, offer_sequence: int) -> dict:
        tx = self.cancel_escrow(owner_wallet, offer_sequence)
        try:
            response = submit_and_wait(tx, self.xrpl_client, owner_wallet)
            logger.info(f"EscrowCancel submitted successfully. Hash: {response.result.get('hash')}")
            return response.result
        except Exception as e:
            logger.error(f"Failed to submit EscrowCancel: {e}")
            raise
