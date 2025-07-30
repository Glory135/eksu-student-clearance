import React from 'react';
import { Badge } from '../ui/badge';
import { CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed' | 'active' | 'inactive';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function StatusBadge({ status, size = 'md', showIcon = true }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'approved':
      case 'completed':
        return {
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          text: status === 'approved' ? 'Approved' : 'Completed'
        };
      case 'pending':
      case 'processing':
        return {
          variant: 'secondary' as const,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
          text: status === 'pending' ? 'Pending' : 'Processing'
        };
      case 'rejected':
        return {
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          text: 'Rejected'
        };
      case 'active':
        return {
          variant: 'default' as const,
          className: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: CheckCircle,
          text: 'Active'
        };
      case 'inactive':
        return {
          variant: 'secondary' as const,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: AlertTriangle,
          text: 'Inactive'
        };
      default:
        return {
          variant: 'secondary' as const,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Clock,
          text: 'Unknown'
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  return (
    <Badge 
      variant={config.variant} 
      className={`${config.className} ${sizeClasses[size]} flex items-center gap-1`}
    >
      {showIcon && <IconComponent className={`h-3 w-3 ${size === 'lg' ? 'h-4 w-4' : ''}`} />}
      {config.text}
    </Badge>
  );
} 