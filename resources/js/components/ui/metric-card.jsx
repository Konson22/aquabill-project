import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function MetricCard({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    trend, 
    trendValue, 
    color = 'blue',
    className = '' 
}) {
    const colorClasses = {
        green: 'border-l-green-500',
        blue: 'border-l-blue-500',
        orange: 'border-l-orange-500',
        red: 'border-l-red-500',
        purple: 'border-l-purple-500',
        yellow: 'border-l-yellow-500'
    };

    const iconColorClasses = {
        green: 'bg-green-100 text-green-600 dark:bg-green-900/20',
        blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20',
        orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/20',
        red: 'bg-red-100 text-red-600 dark:bg-red-900/20',
        purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20',
        yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20'
    };

    const trendColorClasses = {
        up: 'text-green-600 dark:text-green-400',
        down: 'text-red-600 dark:text-red-400',
        neutral: 'text-slate-600 dark:text-slate-400'
    };

    const getTrendIcon = () => {
        switch (trend) {
            case 'up':
                return <ArrowUpRight className="h-3 w-3" />;
            case 'down':
                return <ArrowDownRight className="h-3 w-3" />;
            default:
                return <Minus className="h-3 w-3" />;
        }
    };

    return (
        <Card className={`border-l-4 ${colorClasses[color]} ${className}`}>
            <CardContent className="px-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            {title}
                        </p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                            {value}
                        </p>
                        {trendValue && (
                            <p className={`text-xs flex items-center gap-1 ${trendColorClasses[trend] || trendColorClasses.neutral}`}>
                                {getTrendIcon()}
                                {trendValue}
                            </p>
                        )}
                        {subtitle && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    {Icon && (
                        <div className={`rounded-full p-3 ${iconColorClasses[color]}`}>
                            <Icon className="h-6 w-6" />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
