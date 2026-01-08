'use client';

interface EscrowCardProps {
  escrow: {
    escrow_id: string;
    amount: string;
    status: 'pending' | 'completed' | 'cancelled';
    created_at: string;
  };
}

export function EscrowCard({ escrow }: EscrowCardProps) {
  const statusColors = {
    pending: 'bg-warning/20 text-warning',
    completed: 'bg-success/20 text-success',
    cancelled: 'bg-error/20 text-error',
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-glow-sm">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-foreground">Escrow #{escrow.escrow_id.slice(0, 8)}</h3>
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[escrow.status]}`}>
          {escrow.status}
        </span>
      </div>
      <div className="space-y-1 text-sm text-muted-foreground">
        <p>Amount: {escrow.amount} XRP</p>
        <p>Created: {new Date(escrow.created_at).toLocaleDateString()}</p>
      </div>
    </div>
  );
}
