import React from 'react';

// StatusBadge
export const StatusBadge = ({ status }: { status: string }) => {
  const getColors = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'completed':
      case 'approved':
      case 'above expectations':
        return 'bg-success/10 text-success';
      case 'pending':
      case 'pending approval':
      case 'pending completion approval':
      case 'meets expectations':
      case 'day 30':
      case 'day 60':
        return 'bg-warning/10 text-warning';
      case 'rejected':
      case 'danger':
      case 'below expectations':
      case 'overdue':
      case 'hard':
        return 'bg-danger/10 text-danger';
      case 'draft':
      case 'archived':
      case 'none':
        return 'bg-text-muted/10 text-text-muted';
      default:
        return 'bg-primary/10 text-primary';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-badge text-[10px] font-bold uppercase tracking-wider ${getColors(status)}`}>
      {status}
    </span>
  );
};

// KPICard
interface KPICardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
  color?: string;
}

export const KPICard = ({ label, value, icon: Icon, trend, trendUp, color = 'primary' }: KPICardProps) => {
  return (
    <div className="bg-white p-6 rounded-card shadow-sm border border-border hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-${color}-light text-${color} group-hover:scale-110 transition-transform`}>
          <Icon size={24} />
        </div>
        {trend && (
          <div className={`flex items-center text-xs font-bold ${trendUp ? 'text-success' : 'text-danger'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </div>
        )}
      </div>
      <p className="text-text-muted text-sm font-medium mb-1">{label}</p>
      <h3 className="text-2xl font-bold text-text-primary tracking-tight">{value}</h3>
    </div>
  );
};

// ProgressBar
export const ProgressBar = ({ progress, label, color = 'primary' }: { progress: number; label?: string; color?: string }) => {
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-2">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{label}</span>
          <span className="text-xs font-bold text-text-primary">{progress}%</span>
        </div>
      )}
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-${color} transition-all duration-1000 ease-out`} 
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
