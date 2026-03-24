import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
    ArrowRightLeft,
    CheckCircle2,
    CircleDollarSign,
    Clock,
    FileText,
} from 'lucide-react';

function StatCard({ icon: Icon, iconWrapClass, iconClass, label, value, valueClassName }) {
    return (
        <Card
            className={cn(
                'min-w-0 gap-0 border border-border/80 bg-card py-4 shadow-sm',
                'rounded-md',
            )}
        >
            <div className="flex items-center gap-3 px-4">
                <div
                    className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                        iconWrapClass,
                    )}
                >
                    <Icon className={cn('h-5 w-5', iconClass)} />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {label}
                    </p>
                    <p className={cn('text-xl font-bold tabular-nums', valueClassName)}>
                        {value}
                    </p>
                </div>
            </div>
        </Card>
    );
}

const BILL_STATUS_CARDS = [
    {
        key: 'pending',
        label: 'Pending',
        icon: Clock,
        iconWrapClass: 'bg-sky-500/10',
        iconClass: 'text-sky-600 dark:text-sky-400',
        valueClassName: 'text-sky-600 dark:text-sky-400',
    },
    {
        key: 'fully_paid',
        label: 'Fully paid',
        icon: CheckCircle2,
        iconWrapClass: 'bg-emerald-500/10',
        iconClass: 'text-emerald-600 dark:text-emerald-400',
        valueClassName: 'text-emerald-600 dark:text-emerald-400',
    },
    {
        key: 'forwarded',
        label: 'Forwarded',
        icon: ArrowRightLeft,
        iconWrapClass: 'bg-violet-500/10',
        iconClass: 'text-violet-600 dark:text-violet-400',
        valueClassName: 'text-violet-600 dark:text-violet-400',
    },
    {
        key: 'partial_paid',
        label: 'Partial paid',
        icon: CircleDollarSign,
        iconWrapClass: 'bg-amber-500/10',
        iconClass: 'text-amber-600 dark:text-amber-400',
        valueClassName: 'text-amber-600 dark:text-amber-400',
    },
];

export default function PaymentReportSummary({
    billStatusCounts = {},
    unpaidInvoices = 0,
}) {
    return (
        <div className="w-full space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Bills & service fees
            </p>
            <div className="grid w-full grid-cols-2 gap-3 lg:grid-cols-5 lg:gap-2">
                {BILL_STATUS_CARDS.map(
                    ({
                        key,
                        label,
                        icon,
                        iconWrapClass,
                        iconClass,
                        valueClassName,
                    }) => (
                        <StatCard
                            key={key}
                            icon={icon}
                            iconWrapClass={iconWrapClass}
                            iconClass={iconClass}
                            label={label}
                            value={(Number(billStatusCounts[key]) || 0).toLocaleString()}
                            valueClassName={valueClassName}
                        />
                    ),
                )}
                <StatCard
                    icon={FileText}
                    iconWrapClass="bg-primary/10"
                    iconClass="text-primary"
                    label="Unpaid service fee"
                    value={(Number(unpaidInvoices) || 0).toLocaleString()}
                    valueClassName="text-primary"
                />
            </div>
        </div>
    );
}
