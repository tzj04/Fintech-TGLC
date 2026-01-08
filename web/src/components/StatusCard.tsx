'use client';

import { HealthStatus } from '@/lib/api';

interface StatusCardProps {
  health: HealthStatus | null;
  loading: boolean;
}

export function StatusCard({ health, loading }: StatusCardProps) {
  const statusColor = health?.status === 'online' || health?.status === 'healthy'
    ? 'bg-success/20 text-success'
    : 'bg-error/20 text-error';

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h2 className="text-lg font-semibold mb-4 text-foreground">System Status</h2>
      {loading ? (
        <div className="text-sm text-muted-foreground">Checking...</div>
      ) : health ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor}`}>
              {health.status}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Network</span>
            <span className="text-sm font-mono text-foreground">
              {health.network}
            </span>
          </div>
          {health.issuer_configured !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Issuer</span>
              <span className={`px-2 py-1 rounded text-xs ${
                health.issuer_configured
                  ? 'bg-success/20 text-success'
                  : 'bg-warning/20 text-warning'
              }`}>
                {health.issuer_configured ? 'Configured' : 'Not Set'}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-sm text-error">Unable to connect</div>
      )}
    </div>
  );
}

