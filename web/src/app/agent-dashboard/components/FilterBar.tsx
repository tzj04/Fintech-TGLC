'use client';

import AppIcon from '@/components/AppIcon';

interface FilterBarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function FilterBar({ activeFilter, onFilterChange, searchQuery, onSearchChange }: FilterBarProps) {
  const filters = [
    { id: 'all', label: 'All Loans', icon: 'List' },
    { id: 'current', label: 'Current', icon: 'CheckCircle2' },
    { id: 'pending', label: 'Pending', icon: 'Clock' },
    { id: 'overdue', label: 'Overdue', icon: 'AlertCircle' },
  ];

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4 mb-6">
      <div className="flex-1 relative">
        <AppIcon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by borrower name or ID..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-muted/30 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
        />
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-smooth ${
              activeFilter === filter.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            }`}
          >
            <AppIcon name={filter.icon} size={16} />
            <span>{filter.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

