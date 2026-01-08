import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { Checkbox } from '../../../components/ui/Checkbox';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const AdvancedOptionsSection = ({ 
  collateralRequired, 
  setCollateralRequired,
  collateralPercentage,
  setCollateralPercentage,
  earlyPaymentAllowed,
  setEarlyPaymentAllowed,
  earlyPaymentPenalty,
  setEarlyPaymentPenalty,
  autoRenewal,
  setAutoRenewal
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const collateralOptions = [
    { value: '50', label: '50% Collateral', description: 'Lower risk' },
    { value: '75', label: '75% Collateral', description: 'Moderate risk' },
    { value: '100', label: '100% Collateral', description: 'Minimal risk' },
    { value: '125', label: '125% Collateral', description: 'Over-collateralized' }
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-4 md:p-6 lg:p-8">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-accent/10">
            <Icon name="Settings" size={20} className="text-accent" />
          </div>
          <div className="text-left">
            <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-foreground">Advanced Options</h2>
            <p className="text-sm md:text-base text-muted-foreground">Configure additional loan parameters</p>
          </div>
        </div>
        <Icon 
          name={isExpanded ? "ChevronUp" : "ChevronDown"} 
          size={24} 
          className="text-muted-foreground transition-smooth" 
        />
      </button>
      {isExpanded && (
        <div className="space-y-4 md:space-y-6 pt-4 border-t border-border">
          <div className="space-y-4">
            <Checkbox
              label="Require Collateral"
              description="Borrowers must provide collateral to secure the loan"
              checked={collateralRequired}
              onChange={(e) => setCollateralRequired(e?.target?.checked)}
            />

            {collateralRequired && (
              <div className="ml-6 pl-4 border-l-2 border-primary/20">
                <Select
                  label="Collateral Percentage"
                  description="Percentage of loan amount required as collateral"
                  options={collateralOptions}
                  value={collateralPercentage}
                  onChange={setCollateralPercentage}
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Checkbox
              label="Allow Early Payment"
              description="Borrowers can repay the loan before the term ends"
              checked={earlyPaymentAllowed}
              onChange={(e) => setEarlyPaymentAllowed(e?.target?.checked)}
            />

            {earlyPaymentAllowed && (
              <div className="ml-6 pl-4 border-l-2 border-primary/20">
                <Input
                  type="number"
                  label="Early Payment Penalty (%)"
                  description="Percentage fee for early repayment (0 for no penalty)"
                  placeholder="Enter penalty percentage"
                  value={earlyPaymentPenalty}
                  onChange={(e) => setEarlyPaymentPenalty(e?.target?.value)}
                  min="0"
                  max="10"
                  step="0.1"
                />
              </div>
            )}
          </div>

          <Checkbox
            label="Enable Auto-Renewal"
            description="Automatically renew loan terms at maturity if both parties agree"
            checked={autoRenewal}
            onChange={(e) => setAutoRenewal(e?.target?.checked)}
          />

          <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
            <div className="flex items-start gap-3">
              <Icon name="AlertTriangle" size={20} className="text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-warning mb-1">Advanced Settings Notice</p>
                <p className="text-xs text-muted-foreground">
                  These options will be encoded in the smart contract and cannot be changed after loan publication. Review carefully before proceeding.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedOptionsSection;