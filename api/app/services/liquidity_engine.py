# api/services/liquidity_engine.py
from typing import Dict
from ..models.credentials import CreditCredential
from ..models.requests import LiquidityRequest

class LiquidityEngine:
    """
    Service that estimates liquidity gaps for a business and prepares
    LiquidityRequest objects to submit to banks.

    Responsibilities:
    - Analyse expected inflows and outflows
    - Respect pre-issued credit limits
    - Produce deterministic, policy-compliant LiquidityRequest
    """

    def __init__(self):
        pass  # No state needed for this simple engine

    def estimate_gap(self, cashflow: Dict[str, float]) -> float:
        """
        Estimate liquidity gap based on expected inflows and outflows.

        :param cashflow: dict with 'expected_inflows' and 'expected_outflows' sums
        :return: positive gap amount; 0 if no shortfall
        """
        inflow = float(cashflow.get("expected_inflows", 0.0))
        outflow = float(cashflow.get("expected_outflows", 0.0))
        gap = max(0.0, outflow - inflow)
        return gap

    def prepare_request(
        self, cashflow: Dict[str, float], credential: CreditCredential
    ) -> LiquidityRequest:
        """
        Prepare a LiquidityRequest for a bank based on projected cashflow and credit limits.

        :param cashflow: dict containing expected inflows and outflows
        :param credential: CreditCredential that constrains max request amount
        :return: LiquidityRequest ready to submit to a bank agent
        """
        gap = self.estimate_gap(cashflow)
        # Do not exceed credit limit
        requested_amount = min(gap, credential.credit_limit)

        return LiquidityRequest(
            business_id=credential.business_id,
            requested_amount=requested_amount,
            duration_days=7,  # default, can be parameterized
            metrics={
                "default_rate": 0.004,  # example, can be dynamic
                "volatility": 0.12       # example metric
            }
        )
