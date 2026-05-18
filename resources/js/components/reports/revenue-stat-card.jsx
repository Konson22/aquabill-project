import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * Compact KPI card for revenue / bill-period metrics (counts, currency, or %).
 *
 * @param {object} props
 * @param {string} props.title
 * @param {import('react').ReactNode} props.children
 * @param {string} [props.className] — Card root
 * @param {string} [props.valueClassName] — Value typography / color
 */
export function RevenueStatCard({ title, children, className, valueClassName }) {
    return (
        <Card className={className}>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            </CardHeader>
            <CardContent className={cn('text-2xl font-bold tabular-nums tracking-tight', valueClassName)}>{children}</CardContent>
        </Card>
    );
}
