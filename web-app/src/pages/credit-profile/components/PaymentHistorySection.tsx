import React from 'react';
import Icon from '../../../components/AppIcon';

const PaymentHistorySection = ({ payments, onTimePercentage }) => {
  const getStatusConfig = (status) => {
    const configs = {
      completed: {
        icon: 'CheckCircle2',
        color: 'text-success',
        bg: 'bg-success/10',
        label: 'On Time'
      },
      late: {
        icon: 'Clock',
        color: 'text-warning',
        bg: 'bg-warning/10',
        label: 'Late'
      },
      missed: {
        icon: 'XCircle',
        color: 'text-error',
        bg: 'bg-error/10',
        label: 'Missed'
      }
    };
    return configs?.[status] || configs?.completed;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-glow-md">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg md:text-xl font-semibold text-foreground mb-1">Payment History</h3>
          <p className="text-sm text-muted-foreground">Blockchain-verified transactions</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-success/10 rounded-lg border border-success/20">
          <Icon name="CheckCircle2" size={18} className="text-success" />
          <span className="text-sm font-semibold text-success">{onTimePercentage}% On-Time</span>
        </div>
      </div>
      <div className="space-y-3">
        {payments?.map((payment) => {
          const config = getStatusConfig(payment?.status);
          return (
            <div 
              key={payment?.id} 
              className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-muted/30 rounded-lg border border-border hover:border-primary/30 transition-smooth"
            >
              <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${config?.bg} flex-shrink-0`}>
                <Icon name={config?.icon} size={20} className={config?.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{payment?.loanId}</h4>
                    <p className="text-xs text-muted-foreground">{formatDate(payment?.date)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${config?.bg} ${config?.color}`}>
                      {config?.label}
                    </span>
                    <span className="text-sm font-bold text-foreground">${payment?.amount?.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  <div className="flex items-center gap-2">
                    <Icon name="Shield" size={14} className="text-primary" />
                    <span className="text-xs font-mono text-muted-foreground truncate">{payment?.txHash}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Impact:</span>
                    <span className={`text-xs font-medium ${payment?.creditImpact > 0 ? 'text-success' : 'text-error'}`}>
                      {payment?.creditImpact > 0 ? '+' : ''}{payment?.creditImpact} pts
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentHistorySection;