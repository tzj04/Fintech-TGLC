'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PortfolioSummaryCard from './components/PortfolioSummary';
import FilterBar from './components/FilterBar';
import ActiveLoanRow from './components/ActiveLoanRow';
import RecentActivityCard from './components/RecentActivityCard';
import QuickActionButton from './components/QuickActionButton';
import AppIcon from '@/components/AppIcon';
import { useWallet } from '@/lib/use-wallet';
import { useNavigation } from '@/context/NavigationContext';

const MOCK_LOANS = [
  { id: 'loan_001', borrowerName: 'John Doe', borrowerId: 'BOR-001', borrowerAvatar: '', borrowerAvatarAlt: 'John Doe', creditRating: 'good', amount: '$5,000', interestRate: '8.5%', status: 'current', remainingTerm: '12 months', nextPayment: 'Jan 15, 2026' },
  { id: 'loan_002', borrowerName: 'Jane Smith', borrowerId: 'BOR-002', borrowerAvatar: '', borrowerAvatarAlt: 'Jane Smith', creditRating: 'excellent', amount: '$10,000', interestRate: '7.2%', status: 'current', remainingTerm: '18 months', nextPayment: 'Jan 20, 2026' },
];

const MOCK_ACTIVITIES = [
  { id: 'act_001', type: 'payment', title: 'Payment Received', description: 'John Doe made a payment of $500', time: '2 hours ago', verified: true },
  { id: 'act_002', type: 'credit_change', title: 'Credit Score Updated', description: 'Jane Smith credit score increased by 15 points', time: '5 hours ago', verified: true },
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

export default function AgentDashboard() {
  const router = useRouter();
  const { isConnected, address } = useWallet();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { userRole } = useNavigation();

   useEffect(() => {
      router.push(userRole === 'agent' ? '/agent-dashboard' : '/borrower-dashboard');
    }, [router, userRole]);
  



  const filteredLoans = MOCK_LOANS.filter((loan) => {
    if (activeFilter !== 'all' && loan.status !== activeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return loan.borrowerName.toLowerCase().includes(q) || loan.borrowerId.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-12">
        <div className="mb-6 md:mb-8 lg:mb-12">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">Agent Dashboard</h1>
              <p className="text-sm md:text-base text-muted-foreground">Manage your lending portfolio</p>
            </div>
            <WalletStatus isConnected={isConnected} address={address} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6">
            <QuickActionButton icon="Plus" label="Create New Loan" description="Set up a new loan offer" onClick={() => router.push('/create-loan')} variant="default" />
            <QuickActionButton icon="FileText" label="Review Applications" description="Process pending requests" onClick={() => router.push('/loan-details')} variant="success" />
            <QuickActionButton icon="TrendingUp" label="View Analytics" description="Portfolio performance insights" onClick={() => router.push('/credit-profile')} variant="warning" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <PortfolioSummaryCard icon="DollarSign" label="Total Portfolio Value" value="$150,000" subValue="Active loans" trend="+12%" trendDirection="up" iconBgColor="bg-primary/10" iconColor="text-primary" />
          <PortfolioSummaryCard icon="Users" label="Active Borrowers" value="24" subValue="Current clients" trend="+3" trendDirection="up" iconBgColor="bg-success/10" iconColor="text-success" />
          <PortfolioSummaryCard icon="TrendingUp" label="Average Interest Rate" value="8.2%" subValue="Portfolio average" iconBgColor="bg-accent/10" iconColor="text-accent" />
          <PortfolioSummaryCard icon="Clock" label="Pending Payments" value="5" subValue="Require attention" trend="+2" trendDirection="up" iconBgColor="bg-warning/10" iconColor="text-warning" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mb-6 md:mb-8">
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-xl shadow-glow-md overflow-hidden">
              <div className="p-4 md:p-6 border-b border-border">
                <h2 className="text-lg md:text-xl font-semibold text-foreground">Active Loans</h2>
              </div>
              <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/30">
                    <tr>
                      {['Borrower', 'Credit', 'Amount', 'Rate', 'Status', 'Term', 'Next Payment', 'Actions'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLoans.map((loan) => (
                      <ActiveLoanRow
                        key={loan.id}
                        loan={loan}
                        onViewDetails={(l) => router.push(`/loan-details?id=${l.id}`)}
                        onProcessPayment={(l) => router.push(`/payment-processing?loanId=${l.id}`)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-glow-md">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className="text-base md:text-lg font-semibold text-foreground">Recent Activity</h3>
                <AppIcon name="Activity" size={20} className="text-primary" />
              </div>
              <div className="space-y-3">
                {MOCK_ACTIVITIES.map((activity) => (
                  <RecentActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
