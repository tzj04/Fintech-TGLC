'use client';

import AppIcon from '@/components/AppIcon';
import Input from '@/components/ui/Input';

interface InterestRateSectionProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function InterestRateSection({ value, onChange, error }: InterestRateSectionProps) {
  const marketRates = [
    { label: 'Conservative', rate: 5.5, description: 'Lower risk, stable returns' },
    { label: 'Moderate', rate: 8.5, description: 'Balanced risk-reward' },
    { label: 'Aggressive', rate: 12.0, description: 'Higher risk, maximum returns' },
  ];

  const handleRateSelect = (rate: number) => {
    onChange(rate.toString());
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 md:p-6 lg:p-8">
      <div className="flex items-start justify-between mb-4 md:mb-6">
        <div>
          <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-foreground">Interest Rate</h2>
          <p className="text-sm md:text-base text-muted-foreground mt-1">Set your annual percentage rate (APR)</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 rounded-lg">
          <AppIcon name="TrendingUp" size={16} className="text-accent" />
          <span className="text-sm font-medium text-accent">APR</span>
        </div>
      </div>
      <div className="space-y-4 md:space-y-6">
        <Input
          type="number"
          label="Annual Interest Rate (%)"
          placeholder="Enter rate"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          error={error}
          required
          min="0.1"
          max="50"
          step="0.1"
        />

        <div>
          <p className="text-sm font-medium text-foreground mb-3">Market Rate Suggestions</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {marketRates.map((rate) => (
              <button
                key={rate.label}
                type="button"
                onClick={() => handleRateSelect(rate.rate)}
                className={`p-4 rounded-lg border transition-smooth text-left ${
                  parseFloat(value) === rate.rate
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-muted/30 hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{rate.label}</span>
                  <span className="text-lg font-bold text-primary">{rate.rate}%</span>
                </div>
                <p className="text-xs text-muted-foreground">{rate.description}</p>
              </button>
            ))}
          </div>
        </div>

        {value && parseFloat(value) > 0 && (
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-start gap-3">
              <AppIcon name="Info" size={20} className="text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground mb-1">Rate Analysis</p>
                <p className="text-xs text-muted-foreground">
                  {parseFloat(value) < 7 &&
                    'Your rate is below market average. This may attract more borrowers but yield lower returns.'}
                  {parseFloat(value) >= 7 &&
                    parseFloat(value) <= 10 &&
                    'Your rate is competitive with current market conditions. Good balance of risk and reward.'}
                  {parseFloat(value) > 10 && 'Your rate is above market average. Higher returns but may limit borrower interest.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

