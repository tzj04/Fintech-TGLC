import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PaymentConfirmationModal = ({ isOpen, onClose, onConfirm, paymentAmount, isProcessing }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-glow-xl max-w-md w-full animate-slide-down">
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-full bg-warning/10">
            <Icon name="AlertTriangle" size={32} className="text-warning md:w-10 md:h-10" />
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-foreground text-center mb-2">Confirm Payment</h2>
          <p className="text-sm md:text-base text-muted-foreground text-center mb-6">
            You are about to process a payment of <span className="font-bold text-primary">${paymentAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> USDC
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Icon name="Shield" size={18} className="text-success flex-shrink-0" />
              <p className="text-xs md:text-sm text-muted-foreground">Transaction will be recorded on blockchain</p>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Icon name="Lock" size={18} className="text-primary flex-shrink-0" />
              <p className="text-xs md:text-sm text-muted-foreground">Payment is secure and irreversible</p>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Icon name="TrendingUp" size={18} className="text-accent flex-shrink-0" />
              <p className="text-xs md:text-sm text-muted-foreground">Credit score will be updated automatically</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              fullWidth
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              fullWidth
              iconName="Check"
              iconPosition="left"
              onClick={onConfirm}
              loading={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Confirm Payment'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmationModal;