'use client';

import AppIcon from '@/components/AppIcon';
import AppImage from '@/components/AppImage';
import Button from '@/components/ui/Button';

interface Loan {
  id: string;
  borrowerName: string;
  borrowerId: string;
  borrowerAvatar?: string;
  borrowerAvatarAlt?: string;
  creditRating: string;
  amount: string;
  interestRate: string;
  status: string;
  remainingTerm: string;
  nextPayment: string;
}

interface ActiveLoanRowProps {
  loan: Loan;
  onViewDetails: (loan: Loan) => void;
  onProcessPayment: (loan: Loan) => void;
}

export default function ActiveLoanRow({ loan, onViewDetails, onProcessPayment }: ActiveLoanRowProps) {
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; bgColor: string; icon: string }> = {
      current: { label: 'Current', color: 'text-success', bgColor: 'bg-success/10', icon: 'CheckCircle2' },
      pending: { label: 'Pending', color: 'text-warning', bgColor: 'bg-warning/10', icon: 'Clock' },
      overdue: { label: 'Overdue', color: 'text-error', bgColor: 'bg-error/10', icon: 'AlertCircle' },
      completed: { label: 'Completed', color: 'text-primary', bgColor: 'bg-primary/10', icon: 'CheckCircle' },
    };
    return configs[status] || configs.current;
  };

  const getCreditRatingConfig = (rating: string) => {
    const configs: Record<string, { label: string; color: string; bgColor: string }> = {
      excellent: { label: 'Excellent', color: 'text-success', bgColor: 'bg-success/10' },
      good: { label: 'Good', color: 'text-primary', bgColor: 'bg-primary/10' },
      fair: { label: 'Fair', color: 'text-warning', bgColor: 'bg-warning/10' },
      poor: { label: 'Poor', color: 'text-error', bgColor: 'bg-error/10' },
    };
    return configs[rating] || configs.fair;
  };

  const statusConfig = getStatusConfig(loan.status);
  const creditConfig = getCreditRatingConfig(loan.creditRating);

  return (
    <tr className="border-b border-border hover:bg-muted/30 transition-smooth">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <AppImage src={loan.borrowerAvatar || ''} alt={loan.borrowerAvatarAlt || ''} className="w-10 h-10 rounded-full object-cover" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{loan.borrowerName}</p>
            <p className="text-xs text-muted-foreground">{loan.borrowerId}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${creditConfig.bgColor}`}>
          <div className={`w-2 h-2 rounded-full ${creditConfig.color.replace('text-', 'bg-')}`} />
          <span className={`text-xs font-medium ${creditConfig.color}`}>{creditConfig.label}</span>
        </div>
      </td>
      <td className="px-4 py-4">
        <p className="text-sm font-semibold text-foreground">{loan.amount}</p>
      </td>
      <td className="px-4 py-4">
        <p className="text-sm text-foreground">{loan.interestRate}</p>
      </td>
      <td className="px-4 py-4">
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${statusConfig.bgColor}`}>
          <AppIcon name={statusConfig.icon} size={14} className={statusConfig.color} />
          <span className={`text-xs font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
        </div>
      </td>
      <td className="px-4 py-4">
        <p className="text-sm text-foreground">{loan.remainingTerm}</p>
      </td>
      <td className="px-4 py-4">
        <p className="text-sm text-muted-foreground">{loan.nextPayment}</p>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" iconName="Eye" onClick={() => onViewDetails(loan)}>
            View
          </Button>
          <Button variant="outline" size="sm" iconName="CreditCard" onClick={() => onProcessPayment(loan)}>
            Payment
          </Button>
        </div>
      </td>
    </tr>
  );
}

