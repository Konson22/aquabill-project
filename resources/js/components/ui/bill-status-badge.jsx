import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertTriangle, DollarSign, ArrowRight } from 'lucide-react';

const statusConfig = {
    paid: {
        label: 'Paid',
        icon: CheckCircle,
        className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-700',
        iconClassName: 'text-green-600 dark:text-green-400'
    },
    unpaid: {
        label: 'Unpaid',
        icon: Clock,
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700',
        iconClassName: 'text-yellow-600 dark:text-yellow-400'
    },
    overdue: {
        label: 'Overdue',
        icon: AlertTriangle,
        className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-700',
        iconClassName: 'text-red-600 dark:text-red-400'
    },
    partially_paid: {
        label: 'Partially Paid',
        icon: DollarSign,
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-700',
        iconClassName: 'text-blue-600 dark:text-blue-400'
    },
    balance_forwarded: {
        label: 'Balance Forwarded',
        icon: ArrowRight,
        className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-purple-200 dark:border-purple-700',
        iconClassName: 'text-purple-600 dark:text-purple-400'
    }
};

export default function BillStatusBadge({ 
    status, 
    showIcon = true, 
    size = 'default',
    className = '' 
}) {
    const config = statusConfig[status] || statusConfig.unpaid;
    const Icon = config.icon;
    
    const sizeClasses = {
        sm: 'text-xs px-2 py-1',
        default: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-2'
    };

    return (
        <Badge 
            className={`${config.className} ${sizeClasses[size]} ${className} flex items-center gap-1.5 border font-medium`}
        >
            {showIcon && <Icon className={`h-3 w-3 ${config.iconClassName}`} />}
            {config.label}
        </Badge>
    );
}
