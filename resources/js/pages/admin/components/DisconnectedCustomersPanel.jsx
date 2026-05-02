import { Link } from '@inertiajs/react';
import { PowerOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function formatShortDate(value) {
    if (!value) {
        return '—';
    }

    return new Date(value).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function formatDisconnectionMethod(type) {
    if (!type) {
        return '—';
    }

    return String(type)
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * @param {object} props
 * @param {Array<{
 *   id: number,
 *   customer_id: number,
 *   customer_name?: string | null,
 *   account_number?: string | null,
 *   disconnected_at?: string | null,
 *   disconnection_type?: string | null,
 * }>} [props.disconnectedCustomers]
 * @param {string} [props.viewAllHref]
 */
export default function DisconnectedCustomersPanel({ disconnectedCustomers = [], viewAllHref = '/disconnections' }) {
    return (
        <Card className="shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 space-y-0 pb-4">
                <div className="flex items-center gap-2">
                    <PowerOff className="h-5 w-5 shrink-0 text-rose-600" aria-hidden />
                    <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Disconnected customers</CardTitle>
                </div>
                <Link href={viewAllHref} className="text-sm font-medium text-primary hover:underline">
                    View all
                </Link>
            </CardHeader>
            <CardContent className="px-0 pb-6">
                {disconnectedCustomers.length === 0 ? (
                    <p className="px-6 text-sm text-muted-foreground">No customers are currently disconnected.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                                    <th className="px-6 py-3 font-medium">Customer</th>
                                    <th className="px-6 py-3 font-medium">Account</th>
                                    <th className="px-6 py-3 font-medium">Disconnected</th>
                                    <th className="px-6 py-3 font-medium">Method</th>
                                    <th className="px-6 py-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {disconnectedCustomers.map((row) => (
                                    <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                                        <td className="px-6 py-3">
                                            <Link
                                                href={`/customers/${row.customer_id}`}
                                                className="font-medium text-slate-900 hover:text-primary hover:underline dark:text-white"
                                            >
                                                {row.customer_name ?? 'Unknown customer'}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-3 text-muted-foreground">{row.account_number ?? '—'}</td>
                                        <td className="px-6 py-3 text-muted-foreground">{formatShortDate(row.disconnected_at)}</td>
                                        <td className="px-6 py-3 text-muted-foreground">{formatDisconnectionMethod(row.disconnection_type)}</td>
                                        <td className="px-6 py-3">
                                            <Badge variant="destructive" className="font-normal uppercase tracking-wide">
                                                Off supply
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
