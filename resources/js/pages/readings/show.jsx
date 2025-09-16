import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, ExternalLink, FileText, Hash, User } from 'lucide-react';

const breadcrumbsBase = [{ title: 'Readings', href: '/readings' }];

export default function ReadingShow({ reading }) {
    const breadcrumbs = [...breadcrumbsBase, { title: `Reading #${reading?.id}`, href: `/readings/${reading?.id}` }];

    const formatDate = (date) => (date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '');
    const formatNumber = (n) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n || 0);

    const previous = reading?.previous || 0;
    const current = reading?.value || 0;
    const consumption = reading?.consumption ?? current - previous;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Reading #${reading?.id}`} />

            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="outline" asChild>
                        <Link href="/readings">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Reading #{reading?.id}</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader className="flex items-center justify-between sm:flex-row">
                        <div>
                            <CardTitle>Reading Details</CardTitle>
                            <CardDescription>Snapshot of this meter reading</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <div className="text-sm text-slate-500">Date</div>
                            <div className="flex items-center gap-2 text-base font-medium">
                                <Calendar className="h-4 w-4 text-slate-500" />
                                {formatDate(reading?.date)}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-slate-500">Previous</div>
                            <div className="text-base font-medium">{formatNumber(previous)}</div>
                        </div>
                        <div>
                            <div className="text-sm text-slate-500">Current</div>
                            <div className="text-base font-medium">{formatNumber(current)}</div>
                        </div>
                        <div>
                            <div className="text-sm text-slate-500">Consumption</div>
                            <div className="text-base font-semibold">{formatNumber(consumption)} m³</div>
                        </div>
                        <div>
                            <div className="text-sm text-slate-500">Source</div>
                            <div className="text-base font-medium capitalize">{reading?.source || 'manual'}</div>
                        </div>
                        <div>
                            <div className="text-sm text-slate-500">Billing Officer</div>
                            <div className="text-base font-medium">{reading?.billing_officer || reading?.recorded_by?.name || '—'}</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Meter & Customer</CardTitle>
                        <CardDescription>Related entities</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-md border p-2">
                                <Hash className="h-4 w-4 text-slate-500" />
                            </div>
                            <div>
                                <div className="text-sm text-slate-500">Meter</div>
                                <div className="text-base font-medium">{reading?.meter?.serial || '—'}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="rounded-md border p-2">
                                <User className="h-4 w-4 text-slate-500" />
                            </div>
                            <div>
                                <div className="text-sm text-slate-500">Customer</div>
                                <div className="text-base font-medium">
                                    {reading?.meter?.customer ? `${reading.meter.customer.first_name} ${reading.meter.customer.last_name}` : '—'}
                                </div>
                            </div>
                        </div>
                        {reading?.meter?.customer?.account_number && (
                            <div className="text-sm text-slate-500">Acct #{reading.meter.customer.account_number}</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Associated Bills Section */}
            {reading?.bills && reading.bills.length > 0 && (
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Associated Bills
                        </CardTitle>
                        <CardDescription>Bills generated from this meter reading</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {reading.bills.map((bill) => (
                                <div key={bill.id} className="rounded-lg border p-6 hover:bg-slate-50 dark:hover:bg-slate-800">
                                    <div className="mb-4 flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-md border p-2">
                                                <FileText className="h-5 w-5 text-slate-500" />
                                            </div>
                                            <div>
                                                <div className="text-lg font-semibold">Bill #{bill.id}</div>
                                                <div className="text-sm text-slate-500">Generated: {formatDate(bill.created_at)}</div>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/billing/${bill.id}`}>
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                View Bill
                                            </Link>
                                        </Button>
                                    </div>

                                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        <div>
                                            <div className="mb-1 text-sm text-slate-500">Billing Period</div>
                                            <div className="text-sm font-medium">
                                                {formatDate(bill.billing_period_start)} - {formatDate(bill.billing_period_end)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="mb-1 text-sm text-slate-500">Consumption</div>
                                            <div className="text-sm font-medium">{formatNumber(bill.consumption)} m³</div>
                                        </div>
                                        <div>
                                            <div className="mb-1 text-sm text-slate-500">Unit Price</div>
                                            <div className="text-sm font-medium">${formatNumber(bill.unit_price)}</div>
                                        </div>
                                        <div>
                                            <div className="mb-1 text-sm text-slate-500">Fixed Charge</div>
                                            <div className="text-sm font-medium">${formatNumber(bill.fixed_charge)}</div>
                                        </div>
                                        <div>
                                            <div className="mb-1 text-sm text-slate-500">Other Charges</div>
                                            <div className="text-sm font-medium">${formatNumber(bill.other_charge)}</div>
                                        </div>
                                        <div>
                                            <div className="mb-1 text-sm text-slate-500">Previous Balance</div>
                                            <div className="text-sm font-medium">${formatNumber(bill.prev_balance)}</div>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="mb-1 text-sm text-slate-500">Total Amount</div>
                                                <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                                    ${formatNumber(bill.total_amount)}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="mb-1 text-sm text-slate-500">Current Balance</div>
                                                <div className="text-lg font-semibold">${formatNumber(bill.current_balance)}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="mb-1 text-sm text-slate-500">Status</div>
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                                                        bill.status === 'paid'
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                            : bill.status === 'unpaid'
                                                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                                              : bill.status === 'overdue'
                                                                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                                                                : bill.status === 'partially_paid'
                                                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                                                  : bill.status === 'balance_forwarded'
                                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                                                    }`}
                                                >
                                                    {bill.status?.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* No Bills Message */}
            {reading?.bills && reading.bills.length === 0 && (
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Associated Bills
                        </CardTitle>
                        <CardDescription>Bills generated from this meter reading</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="py-8 text-center">
                            <FileText className="mx-auto h-12 w-12 text-slate-300" />
                            <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">No bills found</h3>
                            <p className="mt-1 text-sm text-slate-500">No bills have been generated from this meter reading yet.</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </AppLayout>
    );
}
