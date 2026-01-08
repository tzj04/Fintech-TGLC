'use client';

import AppIcon from '@/components/AppIcon';
import Select from '@/components/ui/Select';

interface LoanTermSectionProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function LoanTermSection({ value, onChange, error }: LoanTermSectionProps) {
  const termOptions = [
    { value: '3', label: '3 Months', description: 'Short-term loan' },
    { value: '6', label: '6 Months', description: 'Medium-term loan' },
    { value: '12', label: '12 Months', description: 'Standard term' },
    { value: '24', label: '24 Months', description: 'Long-term loan' },
    { value: '36', label: '36 Months', description: 'Extended term' },
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-4 md:p-6 lg:p-8">
      <div className="mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-foreground">Loan Term</h2>
        <p className="text-sm md:text-base text-muted-foreground mt-1">Select the repayment period</p>
      </div>
      <div className="space-y-4 md:space-y-6">
        <Select
          label="Loan Term"
          description="Select the repayment period"
          options={termOptions}
          value={value}
          onChange={(val) => onChange(typeof val === 'string' ? val : String(val))}
          error={error}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div className="p-4 bg-success/10 rounded-lg border border-success/20">
            <div className="flex items-center gap-2 mb-2">
              <AppIcon name="CheckCircle2" size={16} className="text-success" />
              <p className="text-sm font-medium text-success">Flexible Terms</p>
            </div>
            <p className="text-xs text-muted-foreground">Borrowers can choose payment schedules</p>
          </div>
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <AppIcon name="Shield" size={16} className="text-primary" />
              <p className="text-sm font-medium text-primary">Smart Contract</p>
            </div>
            <p className="text-xs text-muted-foreground">Automated enforcement and security</p>
          </div>
        </div>
      </div>
    </div>
  );
}

