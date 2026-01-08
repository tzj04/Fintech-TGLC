import { create } from 'zustand';

let walletManager: any = null;
let initPromise: Promise<void> | null = null;

const initWalletManager = async () => {
  if (walletManager) return;
  if (typeof window === 'undefined') return;
  
  try {
    const xrplConnect = await import('xrpl-connect');
    const { WalletManager, CrossmarkAdapter } = xrplConnect;
    
    const networkName = (process.env.NEXT_PUBLIC_XRPL_NETWORK_NAME || 'testnet').toLowerCase();
    const targetNetwork = ['testnet', 'mainnet', 'devnet'].includes(networkName) 
      ? networkName as 'testnet' | 'mainnet' | 'devnet'
      : 'testnet';

    const adapters: any[] = [new CrossmarkAdapter()];
    
    if (process.env.NEXT_PUBLIC_XAMAN_API_KEY && xrplConnect.XamanAdapter) {
      adapters.push(new xrplConnect.XamanAdapter(process.env.NEXT_PUBLIC_XAMAN_API_KEY));
    }
    
    if (process.env.NEXT_PUBLIC_WC_PROJECT_ID && xrplConnect.WalletConnectAdapter) {
      adapters.push(new xrplConnect.WalletConnectAdapter({ 
        projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID 
      }));
    }

    walletManager = new WalletManager({
      network: targetNetwork,
      adapters
    });
  } catch (error) {
    console.error('Failed to initialize wallet manager:', error);
  }
};

if (typeof window !== 'undefined') {
  initPromise = initWalletManager();
}

interface WalletState {
  isConnected: boolean;
  address: string | null;
  connect: (id: string) => Promise<void>;
  disconnect: () => void;
  signAndSubmit: (tx: any) => Promise<any>;
}

export const useWallet = create<WalletState>((set, get) => {
  if (typeof window !== 'undefined' && initPromise) {
    initPromise.then(() => {
      if (walletManager) {
        walletManager.on('accountChanged', (newAccount: string) => {
          set({ address: newAccount, isConnected: !!newAccount });
        });

        walletManager.on('disconnect', () => {
          set({ address: null, isConnected: false });
        });
      }
    });
  }

  return {
    isConnected: false,
    address: null,

    connect: async (id: string) => {
      if (initPromise) await initPromise;
      if (!walletManager) {
        throw new Error('Wallet manager not initialized');
      }
      try {
        const result = await walletManager.connect(id);
        const address = typeof result === 'string' ? result : result?.address;
        if (address) {
          set({ isConnected: true, address });
        }
      } catch (error) {
        console.error('Connection failed:', error);
        throw error;
      }
    },

    disconnect: () => {
      if (!walletManager) return;
      walletManager.disconnect();
      set({ isConnected: false, address: null });
    },

    signAndSubmit: async (tx: any) => {
      if (initPromise) await initPromise;
      if (!walletManager || !get().isConnected) {
        throw new Error('Wallet not connected');
      }
      return await walletManager.signAndSubmit(tx);
    }
  };
});

