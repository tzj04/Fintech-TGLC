'use client';

import { useWallet } from '@/lib/use-wallet';
import { useState } from 'react';

export function Navbar() {
  const { address, isConnected, connect, disconnect } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connect('crossmark');
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
            TGLC Platform
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Trust-Gated Liquidity Corridors
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isConnected && address ? (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-mono text-zinc-700 dark:text-zinc-300">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
              </div>
              <button
                onClick={disconnect}
                className="px-4 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
              >
                Disconnect
              </button>
            </>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="px-4 py-1.5 text-sm font-medium bg-black dark:bg-zinc-50 text-white dark:text-black rounded hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isConnecting ? 'Connecting...' : 'Connect Crossmark'}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

