'use client';

import { useRouter } from 'next/navigation';
import AppIcon from '@/components/AppIcon';

export default function PaymentProcessing() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-12">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-smooth">
            <AppIcon name="ArrowLeft" size={18} />
            <span className="text-sm">Back</span>
          </button>
        </div>
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <AppIcon name="CreditCard" size={48} className="text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-foreground mb-2">Payment Processing</h1>
          <p className="text-muted-foreground">Payment processing page coming soon...</p>
        </div>
      </div>
    </div>
  );
}

