import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const WalletConnectionCard = ({ walletAddress, usdcBalance, transactionFee, onConnect, onDisconnect, isConnected }) => {
  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address?.slice(0, 8)}...${address?.slice(-6)}`;
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 lg:p-8 shadow-glow-md">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg bg-accent/10">
            <Icon name="Wallet" size={20} className="text-accent md:w-6 md:h-6" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-foreground">Wallet Connection</h2>
            <p className="text-xs md:text-sm text-muted-foreground">Web3 Payment Gateway</p>
          </div>
        </div>
        {isConnected && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 rounded-full border border-success/20">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs md:text-sm font-medium text-success">Connected</span>
          </div>
        )}
      </div>
      {isConnected ? (
        <div className="space-y-4 md:space-y-6">
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs md:text-sm text-muted-foreground">Wallet Address</span>
              <button className="text-primary hover:text-primary/80 transition-smooth">
                <Icon name="Copy" size={16} />
              </button>
            </div>
            <p className="text-sm md:text-base font-mono text-foreground break-all">{truncateAddress(walletAddress)}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="DollarSign" size={16} className="text-accent" />
                <span className="text-xs md:text-sm text-muted-foreground">USDC Balance</span>
              </div>
              <p className="text-xl md:text-2xl font-bold text-foreground">${usdcBalance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>

            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Zap" size={16} className="text-warning" />
                <span className="text-xs md:text-sm text-muted-foreground">Transaction Fee</span>
              </div>
              <p className="text-xl md:text-2xl font-bold text-foreground">${transactionFee?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>

          <Button
            variant="outline"
            fullWidth
            iconName="LogOut"
            iconPosition="left"
            onClick={onDisconnect}
          >
            Disconnect Wallet
          </Button>
        </div>
      ) : (
        <div className="text-center py-6 md:py-8">
          <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 flex items-center justify-center rounded-full bg-muted/30">
            <Icon name="Wallet" size={32} className="text-muted-foreground md:w-10 md:h-10" />
          </div>
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">Connect Your Wallet</h3>
          <p className="text-sm md:text-base text-muted-foreground mb-6">Connect your Web3 wallet to process USDC payments</p>
          <Button
            variant="default"
            iconName="Wallet"
            iconPosition="left"
            onClick={onConnect}
            className="mx-auto"
          >
            Connect Wallet
          </Button>
        </div>
      )}
    </div>
  );
};

export default WalletConnectionCard;