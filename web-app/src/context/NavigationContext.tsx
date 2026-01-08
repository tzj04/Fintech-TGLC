import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const NavigationContext = createContext(undefined);

export const NavigationProvider = ({ children }) => {
  const location = useLocation();
  const [userRole, setUserRole] = useState('agent');
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [transactionInProgress, setTransactionInProgress] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
    const savedRole = localStorage.getItem('defiloan_user_role');
    if (savedRole) {
      setUserRole(savedRole);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('defiloan_user_role', userRole);
  }, [userRole]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location?.pathname]);

  const toggleRole = () => {
    setUserRole(prev => prev === 'agent' ? 'borrower' : 'agent');
  };

  const connectWallet = (address) => {
    setWalletConnected(true);
    setWalletAddress(address);
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress('');
  };

  const startTransaction = (type) => {
    setTransactionInProgress(true);
    setTransactionStatus({ type, status: 'pending' });
  };

  const updateTransactionStatus = (status) => {
    setTransactionStatus(prev => ({ ...prev, status }));
    if (status === 'success' || status === 'error') {
      setTimeout(() => {
        setTransactionInProgress(false);
        setTransactionStatus(null);
      }, 3000);
    }
  };

  const value = {
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
    walletConnected,
    walletAddress,
    connectWallet,
    disconnectWallet,
    currentPath: location?.pathname,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};