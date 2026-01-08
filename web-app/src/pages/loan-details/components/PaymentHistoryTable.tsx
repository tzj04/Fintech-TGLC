import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PaymentHistoryTable = ({ payments }) => {
  const [copiedHash, setCopiedHash] = useState(null);

  const handleCopyHash = (hash) => {
    navigator.clipboard?.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const getStatusConfig = (status) => {
    const configs = {
      verified: {
        icon: 'CheckCircle2',
        color: 'text-success',
        bgColor: 'bg-success/10',
        label: 'Verified'
      },
      pending: {
        icon: 'Clock',
        color: 'text-warning',
        bgColor: 'bg-warning/10',
        label: 'Pending'
      },
      failed: {
        icon: 'XCircle',
        color: 'text-error',
        bgColor: 'bg-error/10',
        label: 'Failed'
      }
    };
    return configs?.[status] || configs?.verified;
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 lg:p-8 shadow-glow-md">
      <div className="flex items-center gap-3 mb-6 lg:mb-8">
        <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg bg-accent/10">
          <Icon name="History" size={24} className="text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground">
            Payment History
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            All transactions recorded on blockchain
          </p>
        </div>
      </div>
      <div className="hidden lg:block overflow-x-auto scrollbar-custom">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                Date
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                Amount
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                Type
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                Transaction Hash
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                Status
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {payments?.map((payment) => {
              const statusConfig = getStatusConfig(payment?.status);
              return (
                <tr key={payment?.id} className="border-b border-border hover:bg-muted/30 transition-smooth">
                  <td className="py-4 px-4">
                    <span className="text-sm text-foreground">{payment?.date}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm font-semibold text-foreground">
                      ${payment?.amount?.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-muted-foreground capitalize">
                      {payment?.type}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <code className="text-xs font-mono text-primary">
                      {payment?.transactionHash?.slice(0, 16)}...
                    </code>
                  </td>
                  <td className="py-4 px-4">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg ${statusConfig?.bgColor}`}>
                      <Icon name={statusConfig?.icon} size={14} className={statusConfig?.color} />
                      <span className={`text-xs font-medium ${statusConfig?.color}`}>
                        {statusConfig?.label}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName={copiedHash === payment?.transactionHash ? 'Check' : 'Copy'}
                      onClick={() => handleCopyHash(payment?.transactionHash)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="lg:hidden space-y-4">
        {payments?.map((payment) => {
          const statusConfig = getStatusConfig(payment?.status);
          return (
            <div key={payment?.id} className="p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground mb-1">{payment?.date}</p>
                  <p className="text-lg font-semibold text-foreground">
                    ${payment?.amount?.toLocaleString()}
                  </p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${statusConfig?.bgColor}`}>
                  <Icon name={statusConfig?.icon} size={14} className={statusConfig?.color} />
                  <span className={`text-xs font-medium ${statusConfig?.color}`}>
                    {statusConfig?.label}
                  </span>
                </div>
              </div>
              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Type</span>
                  <span className="text-sm text-foreground capitalize">{payment?.type}</span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs text-muted-foreground">Hash</span>
                  <code className="text-xs font-mono text-primary text-right break-all">
                    {payment?.transactionHash}
                  </code>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                fullWidth
                iconName={copiedHash === payment?.transactionHash ? 'Check' : 'Copy'}
                iconPosition="left"
                onClick={() => handleCopyHash(payment?.transactionHash)}
              >
                {copiedHash === payment?.transactionHash ? 'Copied' : 'Copy Hash'}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentHistoryTable;