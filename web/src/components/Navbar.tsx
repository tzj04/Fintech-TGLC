'use client';

import { useWallet } from '@/lib/use-wallet';
import { Button } from './ui';
import AppIcon from './AppIcon';

export function Navbar() {
  const { address, isConnected, connect, disconnect } = useWallet();

  const handleConnect = async () => {
    try {
      await connect('crossmark');
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[1000] bg-card border-b border-border shadow-glow-md">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <a href="/" className="header-logo">
            <AppIcon name="Landmark" size={24} className="header-logo-icon" />
          </a>
          <h1 className="text-xl font-semibold text-foreground">TGLC Platform</h1>
        </div>

        <div className="flex items-center gap-3">
          {isConnected && address ? (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-lg border border-border">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span className="text-sm font-mono text-foreground">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={disconnect}>
                Disconnect
              </Button>
            </>
          ) : (
            <Button variant="default" size="sm" onClick={handleConnect} iconName="Wallet" iconPosition="left">
              Connect Crossmark
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}

