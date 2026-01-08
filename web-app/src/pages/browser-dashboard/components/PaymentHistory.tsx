import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PaymentHistoryTable = ({ payments }) => {
  const [expandedRow, setExpandedRow] = useState(null);

  const getStatusConfig = (status) => {
    const configs = {
      'Completed': { icon: 'CheckCircle2', color: 'text-success', bg: 'bg-success/10' },
      'Pending': { icon: 'Clock', color: 'text-warning', bg: 'bg-warning/10' },
      'Failed': { icon: 'XCircle', color: 'text-error', bg: 'bg-error/10' }
    };
    return configs?.[status] || configs?.['Pending'];
  };

  const truncateHash = (hash) => {
    return `${hash?.slice(0, 8)}...${hash?.slice(-6)}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-glow-md">
      <div className="p-4 md:p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base md:text-lg font-semibold text-foreground mb-1">Payment History</h3>
            <p className="text-xs md:text-sm text-muted-foreground">Blockchain-verified transactions</p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg bg-primary/10">
            <Icon name="History" size={20} className="text-primary" />
          </div>
        </div>
      </div>
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Transaction Hash</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {payments?.map((payment) => {
              const statusConfig = getStatusConfig(payment?.status);
              return (
                <tr key={payment?.id} className="hover:bg-muted/20 transition-smooth">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-foreground">{payment?.date}</div>
                    <div className="text-xs text-muted-foreground">{payment?.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-foreground">${payment?.amount?.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-foreground">{payment?.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig?.bg} ${statusConfig?.color}`}>
                      <Icon name={statusConfig?.icon} size={14} />
                      {payment?.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-muted-foreground">{truncateHash(payment?.txHash)}</code>
                      <button 
                        onClick={() => copyToClipboard(payment?.txHash)}
                        className="p-1 hover:bg-muted/50 rounded transition-smooth"
                      >
                        <Icon name="Copy" size={14} className="text-muted-foreground" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button variant="ghost" size="sm" iconName="ExternalLink" iconPosition="left">
                      View
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Mobile Card View */}
      <div className="lg:hidden divide-y divide-border">
        {payments?.map((payment) => {
          const statusConfig = getStatusConfig(payment?.status);
          const isExpanded = expandedRow === payment?.id;
          
          return (
            <div key={payment?.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground mb-1">${payment?.amount?.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{payment?.date} • {payment?.time}</div>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig?.bg} ${statusConfig?.color} flex-shrink-0`}>
                  <Icon name={statusConfig?.icon} size={14} />
                  {payment?.status}
                </span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground">Type</span>
                <span className="text-sm text-foreground">{payment?.type}</span>
              </div>
              <button
                onClick={() => setExpandedRow(isExpanded ? null : payment?.id)}
                className="w-full flex items-center justify-between p-3 bg-muted/30 rounded-lg transition-smooth"
              >
                <span className="text-xs text-muted-foreground">Transaction Hash</span>
                <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-muted-foreground" />
              </button>
              {isExpanded && (
                <div className="mt-3 p-3 bg-muted/30 rounded-lg animate-slide-down">
                  <div className="flex items-center gap-2 mb-2">
                    <code className="text-xs font-mono text-muted-foreground break-all">{payment?.txHash}</code>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      fullWidth
                      iconName="Copy" 
                      iconPosition="left"
                      onClick={() => copyToClipboard(payment?.txHash)}
                    >
                      Copy
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      fullWidth
                      iconName="ExternalLink" 
                      iconPosition="left"
                    >
                      View
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentHistoryTable;