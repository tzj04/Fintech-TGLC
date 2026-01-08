'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useWallet } from '@/lib/use-wallet';

interface TransactionStatus {
  type?: string;
  status: 'pending' | 'success' | 'error';
}

interface NavigationContextType {
  userRole: 'agent' | 'borrower';
  setUserRole: (role: 'agent' | 'borrower') => void;
  toggleRole: () => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  transactionInProgress: boolean;
  transactionStatus: TransactionStatus | null;
  startTransaction: (type: string) => void;
  updateTransactionStatus: (status: 'pending' | 'success' | 'error') => void;
  walletConnected: boolean;
  walletAddress: string;
  connectWallet: (address: string) => void;
  disconnectWallet: () => void;
  currentPath: string;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { address, isConnected } = useWallet();
  const [userRole, setUserRole] = useState<'agent' | 'borrower'>('agent');
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [transactionInProgress, setTransactionInProgress] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus | null>(null);

  useEffect(() => {
    const savedRole = localStorage.getItem('defiloan_user_role');
    if (savedRole === 'agent' || savedRole === 'borrower') {
      setUserRole(savedRole);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('defiloan_user_role', userRole);
  }, [userRole]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const toggleRole = () => {
    setUserRole((prev) => (prev === 'agent' ? 'borrower' : 'agent'));
  };

  const startTransaction = (type: string) => {
    setTransactionInProgress(true);
    setTransactionStatus({ type, status: 'pending' });
  };

  const updateTransactionStatus = (status: 'pending' | 'success' | 'error') => {
    setTransactionStatus((prev) => (prev ? { ...prev, status } : null));
    if (status === 'success' || status === 'error') {
      setTimeout(() => {
        setTransactionInProgress(false);
        setTransactionStatus(null);
      }, 3000);
    }
  };

  const value: NavigationContextType = {
    userRole,
    setUserRole,
    toggleRole,
    isAuthenticated,
    setIsAuthenticated,
    mobileMenuOpen,
    setMobileMenuOpen,
    transactionInProgress,
    transactionStatus,
    startTransaction,
    updateTransactionStatus,
    walletConnected: isConnected,
    walletAddress: address || '',
    connectWallet: () => {},
    disconnectWallet: () => {},
    currentPath: pathname || '/',
  };

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

