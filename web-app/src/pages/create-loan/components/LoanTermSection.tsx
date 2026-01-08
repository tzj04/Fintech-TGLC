import React from 'react';
import Icon from '../../../components/AppIcon';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

const LoanTermSection = ({ 
  loanTerm, 
  setLoanTerm, 
  minCreditScore, 
  setMinCreditScore, 
  errors 
}) => {
  const termOptions = [
    { value: '3', label: '3 Months', description: 'Short-term loan' },
    { value: '6', label: '6 Months', description: 'Medium-term loan' },
    { value: '12', label: '12 Months', description: 'Standard term' },
    { value: '24', label: '24 Months', description: 'Long-term loan' },
    { value: '36', label: '36 Months', description: 'Extended term' }
  ];

  const creditScoreRanges = [
    { min: 300, max: 579, label: 'Poor', color: 'text-error' },
    { min: 580, max: 669, label: 'Fair', color: 'text-warning' },
    { min: 670, max: 739, label: 'Good', color: 'text-accent' },
    { min: 740, max: 799, label: 'Very Good', color: 'text-success' },
    { min: 800, max: 850, label: 'Excellent', color: 'text-primary' }
  ];

  const getCreditScoreLabel = (score) => {
    const range = creditScoreRanges?.find(r => score >= r?.min && score <= r?.max);
    return range || creditScoreRanges?.[0];
  };

  const currentScoreRange = minCreditScore ? getCreditScoreLabel(parseInt(minCreditScore)) : null;

  return (
    <div className="bg-card rounded-xl border border-border p-4 md:p-6 lg:p-8">
      <div className="mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-foreground">Loan Terms & Requirements</h2>
        <p className="text-sm md:text-base text-muted-foreground mt-1">Define loan duration and borrower eligibility</p>
      </div>
      <div className="space-y-4 md:space-y-6">
        <Select
          label="Loan Term"
          description="Select the repayment period"
          options={termOptions}
          value={loanTerm}
          onChange={setLoanTerm}
          error={errors?.loanTerm}
          required
        />

        <div>
          <Input
            type="number"
            label="Minimum Credit Score"
            description="Set the minimum credit score requirement (300-850)"
            placeholder="Enter minimum score"
            value={minCreditScore}
            onChange={(e) => setMinCreditScore(e?.target?.value)}
            error={errors?.minCreditScore}
            required
            min="300"
            max="850"
          />

          {currentScoreRange && (
            <div className="mt-3 p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary/10">
                    <Icon name="Award" size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Credit Tier</p>
                    <p className={`text-base font-semibold ${currentScoreRange?.color}`}>
                      {currentScoreRange?.label}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Score Range</p>
                  <p className="text-sm font-medium text-foreground">
                    {currentScoreRange?.min} - {currentScoreRange?.max}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div className="p-4 bg-success/10 rounded-lg border border-success/20">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="CheckCircle2" size={16} className="text-success" />
              <p className="text-sm font-medium text-success">Flexible Terms</p>
            </div>
            <p className="text-xs text-muted-foreground">Borrowers can choose payment schedules</p>
          </div>
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Shield" size={16} className="text-primary" />
              <p className="text-sm font-medium text-primary">Smart Contract</p>
            </div>
            <p className="text-xs text-muted-foreground">Automated enforcement and security</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanTermSection;