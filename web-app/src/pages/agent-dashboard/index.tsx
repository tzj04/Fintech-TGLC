import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ActiveLoanRow = ({ loan, onViewDetails, onProcessPayment }) => {
  const getStatusConfig = (status) => {
    const configs = {
      current: { label: 'Current', color: 'text-success', bgColor: 'bg-success/10', icon: 'CheckCircle2' },
      pending: { label: 'Pending', color: 'text-warning', bgColor: 'bg-warning/10', icon: 'Clock' },
      overdue: { label: 'Overdue', color: 'text-error', bgColor: 'bg-error/10', icon: 'AlertCircle' },
      completed: { label: 'Completed', color: 'text-primary', bgColor: 'bg-primary/10', icon: 'CheckCircle' }
    };
    return configs?.[status] || configs?.current;
  };

  const getCreditRatingConfig = (rating) => {
    const configs = {
      excellent: { label: 'Excellent', color: 'text-success', bgColor: 'bg-success/10' },
      good: { label: 'Good', color: 'text-primary', bgColor: 'bg-primary/10' },
      fair: { label: 'Fair', color: 'text-warning', bgColor: 'bg-warning/10' },
      poor: { label: 'Poor', color: 'text-error', bgColor: 'bg-error/10' }
    };
    return configs?.[rating] || configs?.fair;
  };

  const statusConfig = getStatusConfig(loan?.status);
  const creditConfig = getCreditRatingConfig(loan?.creditRating);

  return (
    <tr className="border-b border-border hover:bg-muted/30 transition-smooth">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <Image 
            src={loan?.borrowerAvatar} 
            alt={loan?.borrowerAvatarAlt}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{loan?.borrowerName}</p>
            <p className="text-xs text-muted-foreground">{loan?.borrowerId}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${creditConfig?.bgColor}`}>
          <div className={`w-2 h-2 rounded-full ${creditConfig?.color?.replace('text-', 'bg-')}`} />
          <span className={`text-xs font-medium ${creditConfig?.color}`}>{creditConfig?.label}</span>
        </div>
      </td>
      <td className="px-4 py-4">
        <p className="text-sm font-semibold text-foreground">{loan?.amount}</p>
      </td>
      <td className="px-4 py-4">
        <p className="text-sm text-foreground">{loan?.interestRate}</p>
      </td>
      <td className="px-4 py-4">
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${statusConfig?.bgColor}`}>
          <Icon name={statusConfig?.icon} size={14} className={statusConfig?.color} />
          <span className={`text-xs font-medium ${statusConfig?.color}`}>{statusConfig?.label}</span>
        </div>
      </td>
      <td className="px-4 py-4">
        <p className="text-sm text-foreground">{loan?.remainingTerm}</p>
      </td>
      <td className="px-4 py-4">
        <p className="text-sm text-muted-foreground">{loan?.nextPayment}</p>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            iconName="Eye"
            onClick={() => onViewDetails(loan)}
          >
            View
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            iconName="CreditCard"
            onClick={() => onProcessPayment(loan)}
          >
            Payment
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default ActiveLoanRow;