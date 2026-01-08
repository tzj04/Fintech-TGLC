# api/services/policy_engine.py
from ..models.requests import LiquidityRequest
from ..models.policy import CreditPolicy
from ..models.exposure_state import ExposureState

class PolicyEngine:
    """
    Evaluates LiquidityRequest objects against bank policy and exposure limits.

    Responsibilities:
    - Check maximum duration
    - Check maximum default rate
    - Check cumulative exposure
    - Return True/False for approval
    """

    def __init__(self, policy: CreditPolicy):
        self.policy = policy

    def allows(
        self,
        request: LiquidityRequest,
        exposure: ExposureState
    ) -> bool:
        """
        Evaluate if a liquidity request complies with policy.

        :param request: LiquidityRequest to evaluate
        :param exposure: current exposure of the business to the bank
        :return: True if request is allowed, False otherwise
        """
        # Check duration
        if request.duration_days > self.policy.max_duration_days:
            return False

        # Check default rate metric
        default_rate = request.metrics.get("default_rate", 1.0)
        if default_rate > self.policy.max_default_rate:
            return False

        # Check cumulative exposure
        if (exposure.current_exposure + request.requested_amount) > self.policy.max_exposure:
            return False

        return True
