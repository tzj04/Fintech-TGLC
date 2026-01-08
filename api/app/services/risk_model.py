class RiskModel:
    def estimate_gap(self, cashflow):
        inflow = sum(cashflow["expected_inflows"])
        outflow = sum(cashflow["expected_outflows"])
        return max(0, outflow - inflow)

    def export_metrics(self):
        return {
            "default_rate": 0.004,
            "volatility": 0.12
        }
