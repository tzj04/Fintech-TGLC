# api/services/proof_verifier.py
from datetime import datetime, timedelta
from ..models.proofs import ProofPayload

class ProofVerifier:
    """
    Service that verifies ProofPayload objects submitted with liquidity requests.

    Responsibilities:
    - Validate structure and types
    - Optionally check timestamp freshness
    - Compute confidence score based on default_rate
    """

    # Thresholds for scoring default_rate
    SCORE_THRESHOLDS = [
        (0.05, 100),
        (0.1, 75),
    ]

    def __init__(self, max_age_minutes: int = 60):
        """
        :param max_age_minutes: maximum allowed age for the proof timestamp
        """
        self.max_age = timedelta(minutes=max_age_minutes)

    def verify(self, proof: ProofPayload) -> dict:
        """
        Verify a ProofPayload object and compute confidence score.

        :param proof: ProofPayload instance containing metrics, timestamp, source, signature
        :return: dict with keys 'valid', 'confidence_score', 'default_rate', 'reason'
        :raises ValueError: if proof is invalid
        """

        # --- Type & structure checks ---
        if not isinstance(proof.metrics, dict):
            raise ValueError("Proof metrics must be a dictionary")

        try:
            default_rate = float(proof.metrics.get("default_rate", 1.0))
        except (TypeError, ValueError):
            raise ValueError("Default rate must be a number between 0 and 1")

        if not 0 <= default_rate <= 1:
            raise ValueError("Default rate must be between 0 and 1")

        # --- Optional timestamp freshness check ---
        if proof.timestamp:
            if not isinstance(proof.timestamp, datetime):
                raise ValueError("Proof timestamp must be a datetime object")
            age = datetime.utcnow() - proof.timestamp
            if age > self.max_age:
                raise ValueError(f"Proof timestamp is too old: {age} > {self.max_age}")

        # --- Compute confidence score ---
        score = 50  # default
        for threshold, s in self.SCORE_THRESHOLDS:
            if default_rate < threshold:
                score = s
                break

        reason = (
            "Low default rate" if score >= 75
            else "Moderate default rate" if score == 50
            else "High default rate"
        )

        return {
            "valid": score >= 50,
            "confidence_score": score,
            "default_rate": default_rate,
            "reason": reason
        }
