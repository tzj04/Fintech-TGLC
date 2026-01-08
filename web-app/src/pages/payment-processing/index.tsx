import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import TransactionStatusIndicator from '../../components/ui/TransactionStatusIndicator';
import Button from '../../components/ui/Button';
import PaymentSummaryCard from './components/PaymentSummaryCard';
import WalletConnectionCard from './components/WalletConnectionCard';
import PaymentProgressSteps from './components/PaymentProgressSteps';
import TransactionDetailsCard from './components/TransactionDetailsCard';
import FeeBreakdownCard from './components/FeeBreakdownCard';
import CreditImpactCard from './components/CreditImpactCard';
import PaymentConfirmationModal from './components/PaymentConfirmationModal';
import { useNavigation } from '../../contexts/NavigationContext';

const PaymentProcessing = () => {
  const navigate = useNavigate();
  const { startTransaction, updateTransactionStatus } = useNavigation();

  const [currentStep, setCurrentStep] = useState(1);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const loanData = {
    id: "LOAN-2026-00142",
    amount: 5000.00,
    interestRate: 8.5,
    dueDate: "02/15/2026",
    agentName: "Sarah Mitchell",
    agentImage: "https://img.rocket.new/generatedImages/rocket_gen_img_116492473-1763296099355.png",
    agentImageAlt: "Professional headshot of woman with shoulder-length brown hair in navy blazer smiling warmly"
  };

  const paymentAmount = 458.33;
  const interestAmount = 35.42;
  const remainingBalance = 4541.67;

  const usdcBalance = 12450.75;
  const transactionFee = 2.50;
  const platformFee = 4.58;
  const networkFee = 2.50;
  const totalFees = platformFee + networkFee;

  const transactionHash = "0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385";
  const smartContractAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb";
  const blockchainNetwork = "Ethereum Mainnet";
  const gasEstimate = "45.2";
  const timestamp = "01/08/2026 03:37:34 UTC";

  const currentScore = 720;
  const projectedScore = 735;
  const scoreChange = 15;

  const impactFactors = [
  {
    icon: "Calendar",
    label: "On-Time Payment",
    description: "Making payment before due date positively impacts your score",
    impact: "positive"
  },
  {
    icon: "TrendingDown",
    label: "Debt Reduction",
    description: "Reducing outstanding balance improves credit utilization",
    impact: "positive"
  },
  {
    icon: "History",
    label: "Payment History",
    description: "Consistent payment record strengthens creditworthiness",
    impact: "positive"
  }];


  const handleConnectWallet = () => {
    const mockAddress = '0x' + Math.random()?.toString(16)?.substr(2, 40);
    setWalletAddress(mockAddress);
    setIsWalletConnected(true);
    setCurrentStep(2);
  };

  const handleDisconnectWallet = () => {
    setWalletAddress('');
    setIsWalletConnected(false);
    setCurrentStep(1);
  };

  const handlePaymentConfirm = () => {
    setShowConfirmModal(true);
  };

  const handleProcessPayment = () => {
    setIsProcessing(true);
    startTransaction('payment');
    setCurrentStep(3);

    setTimeout(() => {
      setCurrentStep(4);
      setTimeout(() => {
        updateTransactionStatus('success');
        setIsProcessing(false);
        setPaymentComplete(true);
        setShowConfirmModal(false);
      }, 2000);
    }, 3000);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <TransactionStatusIndicator />
      <main className="pt-20 pb-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 md:mb-8">
            <button
              onClick={() => navigate('/loan-details')}
              className="flex items-center gap-2 text-sm md:text-base text-muted-foreground hover:text-foreground transition-smooth mb-4">

              <span>←</span>
              <span>Back to Loan Details</span>
            </button>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">Payment Processing</h1>
            <p className="text-sm md:text-base text-muted-foreground">Secure USDC payment with blockchain verification</p>
          </div>

          <div className="mb-6 md:mb-8">
            <PaymentProgressSteps currentStep={currentStep} />
          </div>

          {paymentComplete ?
          <div className="bg-card border border-border rounded-xl p-6 md:p-8 lg:p-12 text-center shadow-glow-lg">
              <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 flex items-center justify-center rounded-full bg-success/10">
                <svg className="w-12 h-12 md:w-16 md:h-16 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">Payment Successful!</h2>
              <p className="text-base md:text-lg text-muted-foreground mb-8">Your payment of ${paymentAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} has been processed successfully</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-xs md:text-sm text-muted-foreground mb-2">Transaction Hash</p>
                  <p className="text-xs font-mono text-foreground break-all">{transactionHash?.slice(0, 20)}...</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-xs md:text-sm text-muted-foreground mb-2">New Balance</p>
                  <p className="text-lg md:text-xl font-bold text-foreground">${remainingBalance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-xs md:text-sm text-muted-foreground mb-2">Credit Score</p>
                  <p className="text-lg md:text-xl font-bold text-accent">{projectedScore} (+{scoreChange})</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                variant="outline"
                iconName="FileText"
                iconPosition="left"
                onClick={() => navigate('/loan-details')}>

                  View Loan Details
                </Button>
                <Button
                variant="default"
                iconName="TrendingUp"
                iconPosition="left"
                onClick={() => navigate('/credit-profile')}>

                  View Credit Profile
                </Button>
              </div>
            </div> :

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-6 md:space-y-8">
                <PaymentSummaryCard
                loanData={loanData}
                paymentAmount={paymentAmount}
                interestAmount={interestAmount}
                remainingBalance={remainingBalance} />


                <WalletConnectionCard
                walletAddress={walletAddress}
                usdcBalance={usdcBalance}
                transactionFee={transactionFee}
                onConnect={handleConnectWallet}
                onDisconnect={handleDisconnectWallet}
                isConnected={isWalletConnected} />


                <FeeBreakdownCard
                platformFee={platformFee}
                networkFee={networkFee}
                totalFees={totalFees}
                paymentAmount={paymentAmount} />

              </div>

              <div className="space-y-6 md:space-y-8">
                {isWalletConnected &&
              <>
                    <TransactionDetailsCard
                  transactionHash={transactionHash}
                  smartContractAddress={smartContractAddress}
                  blockchainNetwork={blockchainNetwork}
                  timestamp={timestamp}
                  gasEstimate={gasEstimate} />


                    <CreditImpactCard
                  currentScore={currentScore}
                  projectedScore={projectedScore}
                  scoreChange={scoreChange}
                  impactFactors={impactFactors} />

                  </>
              }
              </div>
            </div>
          }

          {!paymentComplete && isWalletConnected &&
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
              variant="outline"
              size="lg"
              iconName="X"
              iconPosition="left"
              onClick={() => navigate('/loan-details')}>

                Cancel Payment
              </Button>
              <Button
              variant="default"
              size="lg"
              iconName="Send"
              iconPosition="left"
              onClick={handlePaymentConfirm}
              disabled={isProcessing}>

                Proceed to Payment
              </Button>
            </div>
          }
        </div>
      </main>
      <PaymentConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleProcessPayment}
        paymentAmount={paymentAmount}
        isProcessing={isProcessing} />

    </div>);

};

export default PaymentProcessing;