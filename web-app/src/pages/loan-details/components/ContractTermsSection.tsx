import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ContractTermsSection = ({ contractTerms }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard?.writeText(contractTerms?.smartContractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 lg:p-8 shadow-glow-md">
      <div className="flex items-center gap-3 mb-6 lg:mb-8">
        <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg bg-primary/10">
          <Icon name="FileText" size={24} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground">
            Contract Terms
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Blockchain-verified loan agreement
          </p>
        </div>
      </div>
      <div className="space-y-4 md:space-y-6">
        <div className="p-4 md:p-6 bg-muted/30 rounded-lg border border-border">
          <div className="flex items-start gap-3 mb-4">
            <Icon name="Calendar" size={20} className="text-primary mt-1" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm md:text-base font-semibold text-foreground mb-2">
                Payment Schedule
              </h3>
              <div className="space-y-2">
                {contractTerms?.paymentSchedule?.map((payment, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-card rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${payment?.paid ? 'bg-success' : 'bg-warning'}`} />
                      <span className="text-sm text-foreground">Payment #{payment?.number}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">{payment?.dueDate}</span>
                      <span className="text-sm font-semibold text-foreground">
                        ${payment?.amount?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="p-4 md:p-6 bg-muted/30 rounded-lg border border-border">
            <div className="flex items-start gap-3">
              <Icon name="AlertCircle" size={20} className="text-warning mt-1" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm md:text-base font-semibold text-foreground mb-2">
                  Late Fees
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {contractTerms?.lateFees?.description}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-lg md:text-xl font-semibold text-warning">
                    {contractTerms?.lateFees?.percentage}%
                  </span>
                  <span className="text-xs text-muted-foreground">per day</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6 bg-muted/30 rounded-lg border border-border">
            <div className="flex items-start gap-3">
              <Icon name="Zap" size={20} className="text-success mt-1" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm md:text-base font-semibold text-foreground mb-2">
                  Early Payment
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {contractTerms?.earlyPayment?.description}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-lg md:text-xl font-semibold text-success">
                    {contractTerms?.earlyPayment?.discount}%
                  </span>
                  <span className="text-xs text-muted-foreground">discount</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-start gap-3">
            <Icon name="Shield" size={20} className="text-primary mt-1" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm md:text-base font-semibold text-foreground mb-2">
                Smart Contract Address
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <code className="flex-1 px-3 py-2 bg-card rounded-lg text-xs md:text-sm font-mono text-primary break-all">
                  {contractTerms?.smartContractAddress}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  iconName={copied ? 'Check' : 'Copy'}
                  iconPosition="left"
                  onClick={handleCopyAddress}
                  className="sm:flex-shrink-0"
                >
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs text-success">Verified on Blockchain</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractTermsSection;