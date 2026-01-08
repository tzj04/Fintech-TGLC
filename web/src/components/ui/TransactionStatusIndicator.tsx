'use client';

import { useEffect, useState } from 'react';
import AppIcon from '../AppIcon';
import { useNavigation } from '@/context/NavigationContext';

export default function TransactionStatusIndicator() {
  const { transactionInProgress, transactionStatus } = useNavigation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (transactionInProgress) {
      setVisible(true);
    } else {
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [transactionInProgress]);

  if (!visible) return null;

  const getStatusConfig = () => {
    if (!transactionStatus) return null;

    switch (transactionStatus.status) {
      case 'pending':
        return {
          icon: 'Loader2',
          iconClass: 'animate-spin text-primary',
          bgClass: 'bg-primary/10 border-primary/20',
          text: 'Processing transaction...',
        };
      case 'success':
        return {
          icon: 'CheckCircle2',
          iconClass: 'text-success',
          bgClass: 'bg-success/10 border-success/20',
          text: 'Transaction successful',
        };
      case 'error':
        return {
          icon: 'XCircle',
          iconClass: 'text-error',
          bgClass: 'bg-error/10 border-error/20',
          text: 'Transaction failed',
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  return (
    <div className="fixed top-20 right-6 z-[1100] animate-slide-down">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${config.bgClass} shadow-glow-lg backdrop-blur-sm`}>
        <AppIcon name={config.icon} size={20} className={config.iconClass} />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">{config.text}</span>
          {transactionStatus?.type && (
            <span className="text-xs text-muted-foreground capitalize">
              {transactionStatus.type}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

