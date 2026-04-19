import React from 'react';

const statusConfig = {
  low: { bg: 'bg-neon-green/20', text: 'text-neon-green', border: 'border-neon-green/30', label: 'Low' },
  moderate: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'Moderate' },
  high: { bg: 'bg-neon-orange/20', text: 'text-neon-orange', border: 'border-neon-orange/30', label: 'High' },
  critical: { bg: 'bg-neon-red/20', text: 'text-neon-red', border: 'border-neon-red/30', label: 'Critical' },
};

export default function DensityBadge({ status, size = 'sm' }) {
  const config = statusConfig[status] || statusConfig.low;
  const sizeClasses = size === 'lg' ? 'px-3 py-1.5 text-sm' : 'px-2 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'critical' ? 'animate-pulse' : ''}`}
        style={{ backgroundColor: 'currentColor' }} />
      {config.label}
    </span>
  );
}
