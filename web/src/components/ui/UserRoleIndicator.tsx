'use client';

import AppIcon from '../AppIcon';
import { useNavigation } from '@/context/NavigationContext';

interface UserRoleIndicatorProps {
  compact?: boolean;
}

export default function UserRoleIndicator({ compact = false }: UserRoleIndicatorProps) {
  const { userRole, walletConnected, walletAddress } = useNavigation();

  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getRoleConfig = () => {
    return {
      agent: {
        icon: 'Briefcase',
        label: 'Agent',
        color: 'text-primary',
        bgColor: 'bg-primary/10',
      },
      borrower: {
        icon: 'User',
        label: 'Borrower',
        color: 'text-accent',
        bgColor: 'bg-accent/10',
      },
    }[userRole];
  };

  const config = getRoleConfig();

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${config.bgColor}`}>
          <AppIcon name={config.icon} size={16} className={config.color} />
        </div>
        {walletConnected && (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-mono text-muted-foreground">
              {truncateAddress(walletAddress)}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-card rounded-lg border border-border">
      <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${config.bgColor}`}>
        <AppIcon name={config.icon} size={20} className={config.color} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{config.label}</span>
          {walletConnected && (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-xs text-success">Connected</span>
            </div>
          )}
        </div>
        {walletConnected && (
          <span className="text-xs font-mono text-muted-foreground">
            {truncateAddress(walletAddress)}
          </span>
        )}
      </div>
    </div>
  );
}

