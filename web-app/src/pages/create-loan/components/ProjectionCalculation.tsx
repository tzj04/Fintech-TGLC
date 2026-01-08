import React, { useMemo } from 'react';
import Icon from '../../../components/AppIcon';

const ProjectionCalculator = ({ 
  loanAmount, 
  interestRate, 
  loanTerm 
}) => {
  const calculations = useMemo(() => {
    const amount = parseFloat(loanAmount) || 0;
    const rate = parseFloat(interestRate) || 0;
    const months = parseInt(loanTerm) || 12;

    const totalInterest = (amount * rate * months) / (12 * 100);
    const totalReturn = amount + totalInterest;
    const monthlyReturn = totalReturn / months;
    const annualizedReturn = (totalInterest / amount) * (12 / months) * 100;

    return {
      totalInterest,
      totalReturn,
      monthlyReturn,
      annualizedReturn
    };
  }, [loanAmount, interestRate, loanTerm]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })?.format(value);
  };

  const formatPercentage = (value) => {
    return `${value?.toFixed(2)}%`;
  };

  if (!loanAmount || !interestRate || !loanTerm) {
    return (
      <div className="bg-card rounded-xl border border-border p-4 md:p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary/10">
            <Icon name="Calculator" size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-foreground">Return Projections</h2>
            <p className="text-sm md:text-base text-muted-foreground">Complete the form to see calculations</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-8 md:py-12">
          <div className="text-center">
            <Icon name="TrendingUp" size={48} className="text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Enter loan details to view projected returns</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-4 md:p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary/10">
          <Icon name="Calculator" size={20} className="text-primary" />
        </div>
        <div>
          <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-foreground">Return Projections</h2>
          <p className="text-sm md:text-base text-muted-foreground">Estimated earnings from this loan</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="p-4 md:p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="DollarSign" size={18} className="text-primary" />
            <p className="text-sm text-muted-foreground">Total Interest</p>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-primary">{formatCurrency(calculations?.totalInterest)}</p>
        </div>

        <div className="p-4 md:p-6 bg-gradient-to-br from-success/10 to-success/5 rounded-lg border border-success/20">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="TrendingUp" size={18} className="text-success" />
            <p className="text-sm text-muted-foreground">Total Return</p>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-success">{formatCurrency(calculations?.totalReturn)}</p>
        </div>

        <div className="p-4 md:p-6 bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg border border-accent/20">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="Calendar" size={18} className="text-accent" />
            <p className="text-sm text-muted-foreground">Monthly Return</p>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-accent">{formatCurrency(calculations?.monthlyReturn)}</p>
        </div>

        <div className="p-4 md:p-6 bg-gradient-to-br from-warning/10 to-warning/5 rounded-lg border border-warning/20">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="Percent" size={18} className="text-warning" />
            <p className="text-sm text-muted-foreground">Annualized Return</p>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-warning">{formatPercentage(calculations?.annualizedReturn)}</p>
        </div>
      </div>
      <div className="mt-4 md:mt-6 p-4 bg-muted/30 rounded-lg border border-border">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={20} className="text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground mb-1">Calculation Methodology</p>
            <p className="text-xs text-muted-foreground">
              Projections based on simple interest calculation. Actual returns may vary based on payment schedule, early repayment, and default risk. Smart contract ensures automated interest accrual and payment enforcement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectionCalculator;