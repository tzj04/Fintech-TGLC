import React from 'react';
import Icon from '../../../components/AppIcon';

const PaymentSummaryCard = ({ loanData, paymentAmount, interestAmount, remainingBalance }) => {
  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 lg:p-8 shadow-glow-md">
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg bg-primary/10">
          <Icon name="FileText" size={20} className="text-primary md:w-6 md:h-6" />
        </div>
        <div>
          <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-foreground">Payment Summary</h2>
          <p className="text-xs md:text-sm text-muted-foreground">Loan ID: {loanData?.id}</p>
        </div>
      </div>
      <div className="space-y-3 md:space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-border">
          <span className="text-sm md:text-base text-muted-foreground">Loan Amount</span>
          <span className="text-base md:text-lg font-semibold text-foreground">${loanData?.amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-border">
          <span className="text-sm md:text-base text-muted-foreground">Interest Rate</span>
          <span className="text-base md:text-lg font-medium text-foreground">{loanData?.interestRate}%</span>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-border">
          <span className="text-sm md:text-base text-muted-foreground">Principal Payment</span>
          <span className="text-base md:text-lg font-medium text-foreground">${(paymentAmount - interestAmount)?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-border">
          <span className="text-sm md:text-base text-muted-foreground">Interest Payment</span>
          <span className="text-base md:text-lg font-medium text-accent">${interestAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        <div className="flex items-center justify-between py-4 bg-primary/5 rounded-lg px-4 mt-4">
          <span className="text-base md:text-lg font-semibold text-foreground">Total Payment</span>
          <span className="text-xl md:text-2xl lg:text-3xl font-bold text-primary">${paymentAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        <div className="flex items-center justify-between py-3 mt-4">
          <span className="text-sm md:text-base text-muted-foreground">Remaining Balance</span>
          <span className="text-base md:text-lg font-semibold text-foreground">${remainingBalance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummaryCard;