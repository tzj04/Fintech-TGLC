import React from 'react';
import Icon from '../../../components/AppIcon';

const TransactionDetailsCard = ({ transactionHash, smartContractAddress, blockchainNetwork, timestamp, gasEstimate }) => {
  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 lg:p-8 shadow-glow-md">
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg bg-success/10">
          <Icon name="Shield" size={20} className="text-success md:w-6 md:h-6" />
        </div>
        <div>
          <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-foreground">Transaction Details</h2>
          <p className="text-xs md:text-sm text-muted-foreground">Blockchain Verification</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs md:text-sm text-muted-foreground">Transaction Hash</span>
            <button 
              onClick={() => copyToClipboard(transactionHash)}
              className="text-primary hover:text-primary/80 transition-smooth"
            >
              <Icon name="Copy" size={16} />
            </button>
          </div>
          <p className="text-xs md:text-sm font-mono text-foreground break-all">{transactionHash}</p>
        </div>

        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs md:text-sm text-muted-foreground">Smart Contract</span>
            <button 
              onClick={() => copyToClipboard(smartContractAddress)}
              className="text-primary hover:text-primary/80 transition-smooth"
            >
              <Icon name="Copy" size={16} />
            </button>
          </div>
          <p className="text-xs md:text-sm font-mono text-foreground break-all">{smartContractAddress}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Network" size={16} className="text-primary" />
              <span className="text-xs md:text-sm text-muted-foreground">Network</span>
            </div>
            <p className="text-sm md:text-base font-medium text-foreground">{blockchainNetwork}</p>
          </div>

          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Fuel" size={16} className="text-warning" />
              <span className="text-xs md:text-sm text-muted-foreground">Gas Estimate</span>
            </div>
            <p className="text-sm md:text-base font-medium text-foreground">{gasEstimate} Gwei</p>
          </div>
        </div>

        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="Clock" size={16} className="text-muted-foreground" />
            <span className="text-xs md:text-sm text-muted-foreground">Timestamp</span>
          </div>
          <p className="text-sm md:text-base font-medium text-foreground">{timestamp}</p>
        </div>

        <div className="flex items-center gap-2 p-4 bg-success/10 rounded-lg border border-success/20">
          <Icon name="CheckCircle2" size={20} className="text-success flex-shrink-0" />
          <p className="text-xs md:text-sm text-success">Transaction verified on blockchain</p>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailsCard;