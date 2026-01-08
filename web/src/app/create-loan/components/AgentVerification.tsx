'use client';

import AppIcon from '@/components/AppIcon';
import AppImage from '@/components/AppImage';

export default function AgentVerification() {
  const agentData = {
    name: 'Michael Rodriguez',
    avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_1bcb2d1e0-1763295028811.png',
    avatarAlt: 'Professional headshot of Hispanic male agent with short black hair wearing navy blue business suit',
    verificationStatus: 'Verified Agent',
    totalLoans: 47,
    successRate: 98.5,
    totalLent: 2450000,
    averageRate: 8.2,
    memberSince: 'March 2024',
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 md:p-6 lg:p-8">
      <div className="flex items-start gap-4 mb-4 md:mb-6">
        <div className="relative flex-shrink-0">
          <AppImage src={agentData.avatar} alt={agentData.avatarAlt} className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-primary" />

          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full border-2 border-card flex items-center justify-center">
            <AppIcon name="CheckCircle2" size={14} className="text-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg md:text-xl font-semibold text-foreground">{agentData.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <AppIcon name="Shield" size={16} className="text-primary" />
            <span className="text-sm text-primary font-medium">{agentData.verificationStatus}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Member since {agentData.memberSince}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2 mb-1">
            <AppIcon name="FileText" size={16} className="text-primary" />
            <p className="text-xs text-muted-foreground">Total Loans</p>
          </div>
          <p className="text-lg md:text-xl font-bold text-primary">{agentData.totalLoans}</p>
        </div>

        <div className="p-3 bg-success/10 rounded-lg border border-success/20">
          <div className="flex items-center gap-2 mb-1">
            <AppIcon name="TrendingUp" size={16} className="text-success" />
            <p className="text-xs text-muted-foreground">Success Rate</p>
          </div>
          <p className="text-lg md:text-xl font-bold text-success">{agentData.successRate}%</p>
        </div>

        <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
          <div className="flex items-center gap-2 mb-1">
            <AppIcon name="DollarSign" size={16} className="text-accent" />
            <p className="text-xs text-muted-foreground">Total Lent</p>
          </div>
          <p className="text-base md:text-lg font-bold text-accent">{formatCurrency(agentData.totalLent)}</p>
        </div>

        <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
          <div className="flex items-center gap-2 mb-1">
            <AppIcon name="Percent" size={16} className="text-warning" />
            <p className="text-xs text-muted-foreground">Avg Rate</p>
          </div>
          <p className="text-lg md:text-xl font-bold text-warning">{agentData.averageRate}%</p>
        </div>
      </div>
      <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border">
        <div className="flex items-start gap-2">
          <AppIcon name="Award" size={18} className="text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground mb-1">Top Performer Badge</p>
            <p className="text-xs text-muted-foreground">Recognized for maintaining excellent repayment rates and borrower satisfaction</p>
          </div>
        </div>
      </div>
    </div>
  );
}

