'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import TransactionStatusIndicator from '../../components/ui/TransactionStatusIndicator';
import Button from '../../components/ui/Button';
import PaymentSummaryCard from './components/PaymentSummary';
import WalletConnectionCard from './components/WalletConnection';
import PaymentConfirmationModal from './components/PaymentConfirmation';
import { useNavigation } from '@/context/NavigationContext';
import xrplService from '../../services/xrplService';
import { useRouter } from 'next/navigation';

interface WalletDataType {
  address: string;
  balance: number;
  seed: string;
}

interface resultType {
    success: boolean;
    transactionHash: any;
    ledgerIndex: any;
    fee: number;
    amount: number;
    timestamp: string;
    network: string;
  
}

// 
export default function PaymentProcessing(){
  const navigate = useRouter();
  const { startTransaction, updateTransactionStatus } = useNavigation();

  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [xrplTransactionData, setXrplTransactionData] = useState<resultType | null>(null);
  const [xrplWalletData, setXrplWalletData] = useState<WalletDataType | null>(null);

  const loanData = {
    id: 1,
    loanAmount: 5000.00,
    interestRate: 8.5,
    loanTerm: "02/15/2026",
    destination: "Vincent Ong",
    collateralRequired: 100,
    collateralPercentage : 10,
    minCreditScore: 40
  };

  

  const paymentAmount = 458.33;
  const interestAmount = 35.42;
  const remainingBalance = 4541.67;

  const usdcBalance = "12450.75";
  const transactionFee = 2.50;

  const handleConnectWallet = async () => {
    try {
      const walletData = await xrplService?.createWallet();
      setXrplWalletData(walletData);
      setWalletAddress(walletData?.address);
      setIsWalletConnected(true);
    } catch (error) {
      console.error('Failed to connect XRPL wallet:', error);
      alert('Failed to connect wallet: ' + (error as Error)?.message);
    }
  };

  const handleDisconnectWallet = async () => {
    setWalletAddress('');
    setIsWalletConnected(false);
    setXrplWalletData(null);
    await xrplService?.disconnect();
  };

  const handleQuickPay = () => {
    setShowConfirmModal(true);
  };

  const handleProcessPayment = async () => {
    setIsProcessing(true);
    startTransaction('payment');

    try {
      const paymentData = {
        loanID: loanData?.id,
        paymentAmount: paymentAmount,
        interestAmount: interestAmount,
        principalAmount: paymentAmount - interestAmount,
        agentAddress: 'rsJdroyU5v5BX6gTDhc9dpgQuv3ve3bhKH'
      };

      const result = await xrplService?.processPayment(paymentData);
      
      if (result?.success) {
        setXrplTransactionData(result);
        setTimeout(() => {
          updateTransactionStatus('success');
          setIsProcessing(false);
          setPaymentComplete(true);
          setShowConfirmModal(false);
        }, 2000);
      }
    } catch (error) {
      console.error('XRPL payment failed:', error);
      updateTransactionStatus('error');
      setIsProcessing(false);
      alert('Payment failed: ' + (error as Error)?.message);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <TransactionStatusIndicator />
      <main className="pt-20 pb-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 md:mb-8">
            <button
              onClick={() => navigate.push('/loan-details')}
              className="flex items-center gap-2 text-sm md:text-base text-muted-foreground hover:text-foreground transition-smooth mb-4">
              <span>←</span>
              <span>Back to Loan Details</span>
            </button>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">Payment Processing</h1>
            <p className="text-sm md:text-base text-muted-foreground">Quick and secure XRPL payment</p>
          </div>

          {paymentComplete ? (
            <div className="bg-card border border-border rounded-xl p-6 md:p-8 lg:p-12 text-center shadow-glow-lg">
              <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 flex items-center justify-center rounded-full bg-success/10">
                <svg className="w-12 h-12 md:w-16 md:h-16 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">Payment Successful!</h2>
              <p className="text-base md:text-lg text-muted-foreground mb-8">Your payment of ${paymentAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} has been processed successfully</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-xs md:text-sm text-muted-foreground mb-2">Transaction Hash</p>
                  // Add Transaction hash 
                  <p className="text-xs font-mono text-foreground break-all">{ 'N/A'}</p> 
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-xs md:text-sm text-muted-foreground mb-2">Remaining Balance</p>
                  <p className="text-lg md:text-xl font-bold text-foreground">${remainingBalance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="outline"
                  iconName="FileText"
                  iconPosition="left"
                  onClick={() => navigate.push('/loan-details')}>
                  View Loan Details
                </Button>
                <Button
                  variant="default"
                  iconName="Home"
                  iconPosition="left"
                  onClick={() => navigate.push('/borrower-dashboard')}>
                  Back to Dashboard
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <PaymentSummaryCard
                loanData={loanData}
                paymentAmount={paymentAmount}
                interestAmount={interestAmount}
                remainingBalance={remainingBalance}
              />

              <WalletConnectionCard
                walletAddress={walletAddress}
                usdcBalance={usdcBalance}
                transactionFee={transactionFee}
                onConnect={handleConnectWallet}
                onDisconnect={handleDisconnectWallet}
                isConnected={isWalletConnected}
                onQuickPay={handleQuickPay}
                isProcessing={isProcessing}
              />
            </div>
          )}
        </div>
      </main>

      <PaymentConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleProcessPayment}
        paymentAmount={paymentAmount}
        isProcessing={isProcessing}
      />
    </div>
  );
};
