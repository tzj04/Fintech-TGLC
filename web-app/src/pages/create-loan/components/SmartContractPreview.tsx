import React, { useMemo } from 'react';
import Icon from '../../../components/AppIcon';

const SmartContractPreview = ({ 
  loanAmount, 
  interestRate, 
  loanTerm, 
  minCreditScore,
  collateralRequired,
  collateralPercentage 
}) => {
  const contractData = useMemo(() => {
    const mockAddress = '0x' + Math.random()?.toString(16)?.substr(2, 40);
    const gasFee = (Math.random() * 0.005 + 0.002)?.toFixed(6);
    const deploymentTime = new Date(Date.now() + 30000)?.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return {
      address: mockAddress,
      gasFee,
      deploymentTime,
      network: 'Ethereum Mainnet',
      version: 'v2.1.0'
    };
  }, []);

  const hasRequiredData = loanAmount && interestRate && loanTerm && minCreditScore;

  return (
    <div className="bg-card rounded-xl border border-border p-4 md:p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-accent/10">
          <Icon name="FileCode" size={20} className="text-accent" />
        </div>
        <div>
          <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-foreground">Smart Contract Preview</h2>
          <p className="text-sm md:text-base text-muted-foreground">Generated contract terms and deployment details</p>
        </div>
      </div>
      {!hasRequiredData ? (
        <div className="flex items-center justify-center py-8 md:py-12">
          <div className="text-center">
            <Icon name="FileCode" size={48} className="text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Complete required fields to preview contract</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 md:space-y-6">
          <div className="p-4 bg-muted/30 rounded-lg border border-border font-mono text-xs md:text-sm">
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <span className="text-muted-foreground">Contract Address:</span>
                <span className="text-foreground break-all ml-2">{contractData?.address}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-muted-foreground">Network:</span>
                <span className="text-foreground ml-2">{contractData?.network}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-muted-foreground">Version:</span>
                <span className="text-foreground ml-2">{contractData?.version}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Contract Terms</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-muted/30 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground mb-1">Principal Amount</p>
                <p className="text-sm font-semibold text-foreground">${parseFloat(loanAmount)?.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDC</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground mb-1">Interest Rate</p>
                <p className="text-sm font-semibold text-foreground">{interestRate}% APR</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground mb-1">Loan Term</p>
                <p className="text-sm font-semibold text-foreground">{loanTerm} Months</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground mb-1">Min Credit Score</p>
                <p className="text-sm font-semibold text-foreground">{minCreditScore}</p>
              </div>
              {collateralRequired && (
                <div className="p-3 bg-muted/30 rounded-lg border border-border md:col-span-2">
                  <p className="text-xs text-muted-foreground mb-1">Collateral Requirement</p>
                  <p className="text-sm font-semibold text-foreground">{collateralPercentage}% of loan amount</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-start gap-3">
              <Icon name="Zap" size={20} className="text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground mb-2">Deployment Estimate</p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Estimated Gas Fee:</span>
                    <span className="font-medium text-foreground">{contractData?.gasFee} ETH</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Deployment Time:</span>
                    <span className="font-medium text-foreground">{contractData?.deploymentTime}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-success/10 rounded-lg border border-success/20">
            <div className="flex items-start gap-3">
              <Icon name="Shield" size={20} className="text-success flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-success mb-1">Security Features</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li className="flex items-center gap-2">
                    <Icon name="Check" size={14} className="text-success" />
                    <span>Automated payment enforcement</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="Check" size={14} className="text-success" />
                    <span>Immutable terms and conditions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="Check" size={14} className="text-success" />
                    <span>Transparent transaction history</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="Check" size={14} className="text-success" />
                    <span>Multi-signature security</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartContractPreview;