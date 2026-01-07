from typing import Dict, Any

class ProofVerifier:
    def verify(self, proof_data: Dict[str, Any]) -> Dict[str, Any]:
        if not isinstance(proof_data, dict):
            raise ValueError("Proof data must be a dictionary")
        
        metrics = proof_data.get("metrics", {})
        if not isinstance(metrics, dict):
            raise ValueError("Metrics must be a dictionary")
        
        default_rate = float(metrics.get("default_rate", 1.0))
        if default_rate < 0 or default_rate > 1:
            raise ValueError("Default rate must be between 0 and 1")
        
        score = 100 if default_rate < 0.05 else (75 if default_rate < 0.1 else 50)
        
        return {
            "valid": score >= 50,
            "confidence_score": score,
            "default_rate": default_rate
        }
