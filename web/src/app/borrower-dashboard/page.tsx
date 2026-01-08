'use client';

import { useRouter } from 'next/navigation';
import CreditScoreCard from './components/CreditScoreCard';
import ActiveLoanCard from './components/ActiveLoanCard';
import PaymentHistory from './components/PaymentHistory';
import QuickActionsPanel from './components/QuickActionsPanel';
import UpcomingPaymentsWidget from './components/UpcomingPaymentsWidget';
import ImprovementRecommendations from './components/ImprovementRecommendations';
import AppIcon from '@/components/AppIcon';
import { useWallet } from '@/lib/use-wallet';
import { useEffect } from 'react';
import { useNavigation } from '@/context/NavigationContext';
import { LiquidityForm } from '@/components/LiquidityForm';

const MOCK_CREDIT = { score: 720, rating: 'Good', trend: 'up' as const };

const MOCK_LOANS = [
  { id: 'loan_001', loanId: 'DFL-2026-001', loanName: 'Personal Development Loan', status: 'Active', totalAmount: 5000, paidAmount: 2000, remainingAmount: 3000, interestRate: 8.5, nextPaymentAmount: 500, nextPaymentDue: '2026-01-15T00:00:00' },
  { id: 'loan_002', loanId: 'DFL-2026-002', loanName: 'Business Expansion Loan', status: 'Active', totalAmount: 10000, paidAmount: 3500, remainingAmount: 6500, interestRate: 9.2, nextPaymentAmount: 750, nextPaymentDue: '2026-01-20T00:00:00' },
];

const MOCK_PAYMENTS = [
  { id: 'pay_001', date: '12/28/2025', time: '14:32 PM', amount: 500, type: 'Principal + Interest', status: 'Completed', txHash: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb8A1c9D4e3F2a1B0c9D8e7F6a5' },
  { id: 'pay_002', date: '11/28/2025', time: '10:15 AM', amount: 500, type: 'Principal + Interest', status: 'Completed', txHash: '0x8e7F6a5B4c3D2e1F0a9B8c7D6e5F4a3B2c1D0e9F8a7B6c5D4e3F2a1B0c9D8e7' },
];

const MOCK_UPCOMING = [
  { id: 'upcoming_001', loanId: 'DFL-2026-001', loanName: 'Personal Development Loan', amount: 500, dueDate: '2026-01-15T00:00:00' },
  { id: 'upcoming_002', loanId: 'DFL-2026-002', loanName: 'Business Expansion Loan', amount: 750, dueDate: '2026-01-20T00:00:00' },
];

const MOCK_RECOMMENDATIONS: Array<{ id: string; title: string; description: string; impact: string; potentialIncrease: number; icon: string; priority: 'high' | 'medium' | 'low' }> = [
  { id: 'rec_001', title: 'Make Early Payments', description: 'Pay your next installment 5 days early to demonstrate reliability and improve your payment history score.', impact: 'High', potentialIncrease: 15, icon: 'Clock', priority: 'high' },
  { id: 'rec_002', title: 'Reduce Outstanding Balance', description: 'Paying down 20% of your remaining balance will significantly improve your credit utilization ratio.', impact: 'High', potentialIncrease: 25, icon: 'TrendingDown', priority: 'high' },
  { id: 'rec_003', title: 'Maintain Payment Streak', description: 'You have 4 consecutive on-time payments. Continue this streak to boost your reliability score.', impact: 'Medium', potentialIncrease: 10, icon: 'Target', priority: 'medium' },
];

function WalletStatus({ isConnected, address }: { isConnected: boolean; address: string | null }) {
  return isConnected && address ? (
    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-success/10 rounded-lg border border-success/20">
      <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
      <span className="text-sm text-success font-medium">Wallet Connected</span>
    </div>
  ) : (
    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-lg border border-border">
      <div className="w-2 h-2 rounded-full bg-muted-foreground" />
      <span className="text-sm text-muted-foreground font-medium">Wallet Not Connected</span>
    </div>
  );
}

const STATS = [
  { icon: 'DollarSign', label: 'Total Borrowed', value: '$15,000', bg: 'bg-primary/10', color: 'text-primary' },
  { icon: 'CheckCircle2', label: 'Total Paid', value: '$5,500', bg: 'bg-success/10', color: 'text-success' },
  { icon: 'Clock', label: 'Remaining', value: '$9,500', bg: 'bg-warning/10', color: 'text-warning' },
  { icon: 'TrendingUp', label: 'On-Time Rate', value: '100%', bg: 'bg-accent/10', color: 'text-accent' },
];

export default function BorrowerDashboard() {
  const router = useRouter();
  const { isConnected, address } = useWallet();

  const { userRole } = useNavigation();
   useEffect(() => {
      router.push(userRole === 'agent' ? '/agent-dashboard' : '/borrower-dashboard');
    }, [router, userRole]);
  

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-12">
        <div className="mb-6 md:mb-8 lg:mb-12">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">Welcome Back, Borrower</h1>
              <p className="text-sm md:text-base text-muted-foreground">Manage your loans and track your credit journey</p>
            </div>
            <WalletStatus isConnected={isConnected} address={address} />
          </div>
          <QuickActionsPanel onBrowseLoans={() => router.push('/loan-details')} onMakePayment={() => router.push('/payment-processing')} onViewCredit={() => router.push('/credit-profile')} />
        </div>

        {/* Request Liquidity */}
        <div className="mb-6 md:mb-8">
          <LiquidityForm />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mb-6 md:mb-8 lg:mb-12">
          <div className="lg:col-span-1">
            <CreditScoreCard creditScore={MOCK_CREDIT.score} rating={MOCK_CREDIT.rating} trend={MOCK_CREDIT.trend} onViewReport={() => router.push('/credit-profile')} />
          </div>
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-foreground">Active Loans</h2>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs md:text-sm font-medium">{MOCK_LOANS.length} Active</span>
            </div>
            {MOCK_LOANS.map((loan) => (
              <ActiveLoanCard key={loan.id} loan={loan} onMakePayment={() => router.push('/payment-processing')} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mb-6 md:mb-8 lg:mb-12">
          <div className="lg:col-span-1">
            <UpcomingPaymentsWidget payments={MOCK_UPCOMING} onPayNow={() => router.push('/payment-processing')} />
          </div>
          <div className="lg:col-span-2">
            <ImprovementRecommendations recommendations={MOCK_RECOMMENDATIONS} />
          </div>
        </div>

        <div className="mb-6 md:mb-8">
          <PaymentHistory payments={MOCK_PAYMENTS} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
          {STATS.map((stat) => (
            <div key={stat.label} className="p-4 md:p-6 bg-card border border-border rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg ${stat.bg}`}>
                  <AppIcon name={stat.icon} size={20} className={stat.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground mb-1">{stat.label}</div>
                  <div className="text-lg md:text-xl lg:text-2xl font-bold text-foreground">{stat.value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
