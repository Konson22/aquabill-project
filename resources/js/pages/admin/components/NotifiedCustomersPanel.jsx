import { Link } from '@inertiajs/react';
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

/**
 * @param {object} props
 * @param {Array<{
 *   id: number,
 *   customer_id: number,
 *   customer_name?: string | null,
 *   account_number?: string | null,
 *   notified_at?: string | null,
 *   notice_ends_at?: string | null,
 * }>} [props.notifiedCustomers]
 * @param {string} [props.viewAllHref]
 */
export default function NotifiedCustomersPanel({ notifiedCustomers = [], viewAllHref = '/disconnections' }) {
    return (
        <Card className="shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 space-y-0 pb-4">
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Notified customers</CardTitle>
                <Link href={viewAllHref} className="text-sm font-medium text-primary hover:underline">
                    View all
                </Link>
            </CardHeader>
            <CardContent className="px-0 pb-6">
                {notifiedCustomers.length === 0 ? (
                    <p className="px-6 text-sm text-muted-foreground">
                        No customers are currently in the notified stage.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                                    <th className="px-6 py-3 font-medium">Customer</th>
                                    <th className="px-6 py-3 font-medium">Account</th>
                                    <th className="px-6 py-3 font-medium">Notified</th>
                                    <th className="px-6 py-3 font-medium">Notice ends</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {notifiedCustomers.map((row) => (
                                    <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                                        <td className="px-6 py-3">
                                            <Link
                                                href={`/customers/${row.customer_id}`}
                                                className="font-medium text-slate-900 hover:text-primary hover:underline dark:text-white"
                                            >
                                                {row.customer_name ?? 'Unknown customer'}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-3 text-muted-foreground">
                                            {row.account_number ?? '—'}
                                        </td>
                                        <td className="px-6 py-3 text-muted-foreground">
                                            {formatShortDate(row.notified_at)}
                                        </td>
                                        <td className="px-6 py-3 text-muted-foreground">
                                            {formatShortDate(row.notice_ends_at)}
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
