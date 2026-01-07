from xrpl.wallet import Wallet
from xrpl.models.transactions import TrustSet
from xrpl.models.amounts import IssuedCurrencyAmount
from .xrpl_client import XRPLClient
import os
import logging
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

class CredentialService:
    def __init__(self):
        self.xrpl_client = XRPLClient()
        seed = os.getenv("ISSUER_SEED")
        if not seed:
            raise ValueError("ISSUER_SEED not found")
        self.issuer_wallet = Wallet.from_seed(seed)
    
    def create_trust_set(self, principal_address: str, amount: str = "1000000", currency: str = "CORRIDOR_ELIGIBLE"):
        client = self.xrpl_client.client
        
        tx = TrustSet(
            account=principal_address,
            limit_amount=IssuedCurrencyAmount(
                currency=currency,
                issuer=self.issuer_wallet.classic_address,
                value=amount
            )
        )
        
        prepared = client.autofill(tx)
        logger.info(f"Prepared TrustSet transaction for {principal_address}")
        
        return {
            "transaction": prepared.to_dict(),
            "issuer": self.issuer_wallet.classic_address
        }
