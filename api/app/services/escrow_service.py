from xrpl.models.transactions import EscrowCreate, EscrowFinish, EscrowCancel
from xrpl.utils import xrp_to_drops
from typing import Optional

class EscrowService:
    def create_escrow(self, from_address: str, to_address: str, amount_xrp: float, condition: Optional[str] = None):
        return EscrowCreate(
            account=from_address,
            destination=to_address,
            amount=xrp_to_drops(amount_xrp),
            condition=condition
        )
    
    def finish_escrow(self, owner: str, offer_sequence: int, fulfillment: Optional[str] = None):
        return EscrowFinish(
            account=owner,
            owner=owner,
            offer_sequence=offer_sequence,
            fulfillment=fulfillment
        )
    
    def cancel_escrow(self, owner: str, offer_sequence: int):
        return EscrowCancel(
            account=owner,
            owner=owner,
            offer_sequence=offer_sequence
        )
