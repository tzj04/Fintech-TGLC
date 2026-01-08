import React from 'react';
import Icon from '../../../components/AppIcon';

const TrustSignals = ({ verifications }) => {
  return (
    <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-glow-md">
      <div className="mb-6">
        <h3 className="text-lg md:text-xl font-semibold text-foreground mb-1">Blockchain Verification</h3>
        <p className="text-sm text-muted-foreground">Cryptographic proof of credit history</p>
      </div>
      <div className="space-y-4">
        {verifications?.map((verification, index) => (
          <div 
            key={index} 
            className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20 hover:border-primary/40 transition-smooth"
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
              <Icon name="Shield" size={20} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-sm font-semibold text-foreground">{verification?.type}</h4>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-success/10 text-success">Verified</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Contract:</span>
                  <span className="text-xs font-mono text-primary truncate">{verification?.contractAddress}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Block:</span>
                  <span className="text-xs font-mono text-foreground">{verification?.blockNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Timestamp:</span>
                  <span className="text-xs text-foreground">{verification?.timestamp}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={18} className="text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-foreground mb-1 font-medium">Immutable Credit Record</p>
            <p className="text-xs text-muted-foreground">
              Your credit history is permanently recorded on the blockchain, ensuring transparency and preventing manipulation. All payment records are cryptographically verified and publicly auditable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustSignals;