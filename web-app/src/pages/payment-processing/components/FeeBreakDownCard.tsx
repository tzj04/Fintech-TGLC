import React from 'react';
import Icon from '../../../components/AppIcon';

const FeeBreakdownCard = ({ platformFee, networkFee, totalFees, paymentAmount }) => {
  const feePercentage = ((totalFees / paymentAmount) * 100)?.toFixed(2);

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 lg:p-8 shadow-glow-md">
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg bg-warning/10">
          <Icon name="Receipt" size={20} className="text-warning md:w-6 md:h-6" />
        </div>
        <div>
          <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-foreground">Fee Breakdown</h2>
          <p className="text-xs md:text-sm text-muted-foreground">Transaction Costs</p>
        </div>
      </div>
      <div className="space-y-3 md:space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Icon name="Building2" size={16} className="text-muted-foreground" />
            <span className="text-sm md:text-base text-muted-foreground">Platform Fee</span>
          </div>
          <span className="text-base md:text-lg font-medium text-foreground">${platformFee?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Icon name="Zap" size={16} className="text-muted-foreground" />
            <span className="text-sm md:text-base text-muted-foreground">Network Fee (Gas)</span>
          </div>
          <span className="text-base md:text-lg font-medium text-foreground">${networkFee?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        <div className="flex items-center justify-between py-4 bg-warning/5 rounded-lg px-4 mt-4">
          <div className="flex items-center gap-2">
            <Icon name="Calculator" size={18} className="text-warning" />
            <span className="text-base md:text-lg font-semibold text-foreground">Total Fees</span>
          </div>
          <div className="text-right">
            <p className="text-xl md:text-2xl font-bold text-warning">${totalFees?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-xs md:text-sm text-muted-foreground">{feePercentage}% of payment</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg mt-4">
          <Icon name="Info" size={16} className="text-primary flex-shrink-0" />
          <p className="text-xs md:text-sm text-muted-foreground">Fees are automatically deducted from your wallet balance</p>
        </div>
      </div>
    </div>
  );
};

export default FeeBreakdownCard;