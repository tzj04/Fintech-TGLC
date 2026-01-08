import React from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';

const LoanAmountSection = ({ 
  loanAmount, 
  setLoanAmount, 
  walletBalance, 
  errors 
}) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })?.format(value);
  };

  const handleMaxClick = () => {
    setLoanAmount(walletBalance?.toString());
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 md:p-6 lg:p-8">
      <div className="flex items-start justify-between mb-4 md:mb-6">
        <div>
          <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-foreground">Loan Amount</h2>
          <p className="text-sm md:text-base text-muted-foreground mt-1">Specify the USDC amount you want to lend</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
          <Icon name="Wallet" size={16} className="text-primary" />
          <span className="text-sm font-medium text-primary">USDC</span>
        </div>
      </div>
      <div className="space-y-4">
        <Input
          type="number"
          label="Loan Amount (USDC)"
          placeholder="Enter amount"
          value={loanAmount}
          onChange={(e) => setLoanAmount(e?.target?.value)}
          error={errors?.loanAmount}
          required
          min="100"
          step="0.01"
        />

        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary/10">
              <Icon name="Wallet" size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Available Balance</p>
              <p className="text-base md:text-lg font-semibold text-foreground">{formatCurrency(walletBalance)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleMaxClick}
            className="px-3 py-1.5 text-sm font-medium text-primary hover:text-primary-foreground hover:bg-primary rounded-lg transition-smooth"
          >
            Use Max
          </button>
        </div>

        {loanAmount && parseFloat(loanAmount) > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <div className="p-3 md:p-4 bg-success/10 rounded-lg border border-success/20">
              <p className="text-xs text-muted-foreground mb-1">Minimum Loan</p>
              <p className="text-sm md:text-base font-semibold text-success">{formatCurrency(100)}</p>
            </div>
            <div className="p-3 md:p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-xs text-muted-foreground mb-1">Your Amount</p>
              <p className="text-sm md:text-base font-semibold text-primary">{formatCurrency(parseFloat(loanAmount) || 0)}</p>
            </div>
            <div className="p-3 md:p-4 bg-accent/10 rounded-lg border border-accent/20">
              <p className="text-xs text-muted-foreground mb-1">Remaining Balance</p>
              <p className="text-sm md:text-base font-semibold text-accent">{formatCurrency(walletBalance - (parseFloat(loanAmount) || 0))}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanAmountSection;