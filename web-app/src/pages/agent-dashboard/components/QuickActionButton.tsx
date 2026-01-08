import React from 'react';
import Icon from '../../../components/AppIcon';

const QuickActionButton = ({ icon, label, description, onClick, variant = 'default' }) => {
  const variantStyles = {
    default: 'bg-primary/10 hover:bg-primary/20 text-primary',
    success: 'bg-success/10 hover:bg-success/20 text-success',
    warning: 'bg-warning/10 hover:bg-warning/20 text-warning'
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-start gap-3 p-4 rounded-xl border border-border transition-smooth ${variantStyles?.[variant]}`}
    >
      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-background/50">
        <Icon name={icon} size={24} />
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-semibold mb-1">{label}</p>
        <p className="text-xs opacity-80">{description}</p>
      </div>
    </button>
  );
};

export default QuickActionButton;