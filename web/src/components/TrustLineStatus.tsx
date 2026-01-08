'use client';

interface TrustLineStatusProps {
  trustLine: {
    currency: string;
    issuer: string;
    balance: string;
    limit: string;
  };
}

export function TrustLineStatus({ trustLine }: TrustLineStatusProps) {
  const isActive = parseFloat(trustLine.limit) > 0;

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-foreground">{trustLine.currency}</h3>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          isActive ? 'bg-success/20 text-success' : 'bg-muted/30 text-muted-foreground'
        }`}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
      <div className="space-y-1 text-sm text-muted-foreground">
        <p>Issuer: <span className="font-mono">{trustLine.issuer.slice(0, 8)}...</span></p>
        <p>Balance: {trustLine.balance}</p>
        <p>Limit: {trustLine.limit}</p>
      </div>
    </div>
  );
}
