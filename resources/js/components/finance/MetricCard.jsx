import { Card, CardContent } from '@/components/ui/card';

export default function MetricCard({ title, value, subtitle, icon: Icon, trend, trendValue, color = 'blue', className = '' }) {
    const colorClasses = {
        blue: {
            bg: 'from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900',
            text: 'text-blue-600 dark:text-blue-400',
            value: 'text-blue-900 dark:text-blue-100',
            subtitle: 'text-blue-700 dark:text-blue-300',
        },
        green: {
            bg: 'from-green-50 to-green-100 dark:from-green-950 dark:to-green-900',
            text: 'text-green-600 dark:text-green-400',
            value: 'text-green-900 dark:text-green-100',
            subtitle: 'text-green-700 dark:text-green-300',
        },
        orange: {
            bg: 'from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900',
            text: 'text-orange-600 dark:text-orange-400',
            value: 'text-orange-900 dark:text-orange-100',
            subtitle: 'text-orange-700 dark:text-orange-300',
        },
        red: {
            bg: 'from-red-50 to-red-100 dark:from-red-950 dark:to-red-900',
            text: 'text-red-600 dark:text-red-400',
            value: 'text-red-900 dark:text-red-100',
            subtitle: 'text-red-700 dark:text-red-300',
        },
        purple: {
            bg: 'from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900',
            text: 'text-purple-600 dark:text-purple-400',
            value: 'text-purple-900 dark:text-purple-100',
            subtitle: 'text-purple-700 dark:text-purple-300',
        },
    };

    const colors = colorClasses[color] || colorClasses.blue;

    return (
        <Card className={`border-0 shadow-sm ${className}`}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <p className={`text-sm font-medium ${colors.text}`}>{title}</p>
                        <p className={`text-3xl font-bold ${colors.value} mt-1`}>{value}</p>
                        {subtitle && <p className={`text-xs ${colors.subtitle} mt-1`}>{subtitle}</p>}
                        {trend && trendValue && (
                            <div className="mt-2 flex items-center">
                                <span
                                    className={`text-xs font-medium ${
                                        trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
                                    }`}
                                >
                                    {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trendValue}
                                </span>
                            </div>
                        )}
                    </div>
                    {Icon && (
                        <div className={`rounded-lg bg-gradient-to-r p-3 ${colors.bg}`}>
                            <Icon className={`h-6 w-6 ${colors.text}`} />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
