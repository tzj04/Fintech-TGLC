import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const UpcomingPaymentsWidget = ({ payments, onPayNow }) => {
  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyConfig = (days) => {
    if (days < 0) return { color: 'text-error', bg: 'bg-error/10', icon: 'AlertCircle', label: 'Overdue' };
    if (days <= 3) return { color: 'text-warning', bg: 'bg-warning/10', icon: 'Clock', label: 'Due Soon' };
    return { color: 'text-muted-foreground', bg: 'bg-muted/30', icon: 'Calendar', label: 'Upcoming' };
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-glow-md">
      <div className="flex items-start justify-between mb-4 md:mb-6">
        <div>
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-1">Upcoming Payments</h3>
          <p className="text-xs md:text-sm text-muted-foreground">{payments?.length} payment{payments?.length !== 1 ? 's' : ''} scheduled</p>
        </div>
        <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg bg-primary/10">
          <Icon name="CalendarClock" size={20} className="text-primary" />
        </div>
      </div>
      <div className="space-y-3 md:space-y-4">
        {payments?.map((payment) => {
          const daysUntil = getDaysUntilDue(payment?.dueDate);
          const urgency = getUrgencyConfig(daysUntil);

          return (
            <div key={payment?.id} className={`p-3 md:p-4 rounded-lg border ${urgency?.bg} border-border`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm md:text-base font-semibold text-foreground mb-1">{payment?.loanName}</div>
                  <div className="text-xs text-muted-foreground">Loan ID: {payment?.loanId}</div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${urgency?.bg} ${urgency?.color} flex items-center gap-1 flex-shrink-0`}>
                  <Icon name={urgency?.icon} size={12} />
                  {urgency?.label}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Amount Due</div>
                  <div className="text-lg md:text-xl font-bold text-foreground">${payment?.amount?.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Due Date</div>
                  <div className="text-sm md:text-base font-medium text-foreground">
                    {new Date(payment.dueDate)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3 p-2 bg-muted/30 rounded">
                <Icon name="Info" size={14} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {daysUntil < 0 
                    ? `${Math.abs(daysUntil)} days overdue` 
                    : daysUntil === 0 
                    ? 'Due today' 
                    : `${daysUntil} days remaining`}
                </span>
              </div>
              <Button 
                variant={daysUntil < 0 ? "destructive" : daysUntil <= 3 ? "default" : "outline"}
                size="sm"
                fullWidth
                iconName="CreditCard"
                iconPosition="left"
                onClick={() => onPayNow(payment)}
              >
                Pay Now
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UpcomingPaymentsWidget;