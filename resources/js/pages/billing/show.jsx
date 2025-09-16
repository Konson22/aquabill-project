import PaymentFormModal from '@/components/payments/PaymentFormModal';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CreditCard, Download, Printer } from 'lucide-react';
import { useMemo, useState } from 'react';

const statusColors = {
    paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    unpaid: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    partially_paid: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    balance_forwarded: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

export default function BillingShow({ bill }) {
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const breadcrumbs = useMemo(
        () => [
            { title: 'Billing', href: '/billing' },
            { title: `Bill #${bill?.id}`, href: `/billing/${bill?.id}` },
        ],
        [bill?.id],
    );

    const formatCurrency = (amount) => `SSP ${(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatDate = (date) => (date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '');
    const formatDateLong = (date) => (date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' }) : '');

    const previousReading = Number(bill?.reading?.previous ?? 0);
    const currentReading = Number(bill?.reading?.value ?? 0);
    const consumption = Math.max(0, currentReading - previousReading);
    const unitPrice = bill?.customer?.category != null ? Number(bill?.customer?.category?.tariff ?? 0) : 0;
    const volumetricCharge = consumption * unitPrice;
    const fixedCharge = Number(bill?.fixed_charge ?? 0);
    const otherCharge = Number(bill?.other_charge ?? 0);
    const prevBalance = Number(bill?.prev_balance ?? 0);
    const totalAmount = Number(bill?.total_amount);

    const subTotal = totalAmount + prevBalance;
    const submitPayment = (data) => {
        const payload = {
            bill_id: data.bill_id,
            customer_id: data.customer_id,
            payment_date: data.date,
            amount_paid: data.amount,
            payment_method: data.method,
            reference_number: data.reference_number || 'N/A', // Fix field name mismatch
        };

        return new Promise((resolve) => {
            router.post('/payments', payload, {
                onSuccess: () => resolve(),
                onError: (errors) => {
                    console.error('Payment submission error:', errors);
                    resolve();
                },
                onFinish: () => resolve(),
            });
        });
    };

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title={`Bill #${bill?.id}`} />

                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" asChild>
                            <Link href={route('billing.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Bill #{bill?.id}</h1>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline" className="gap-2">
                            <Link href={route('billing.print', bill.id)} target="_blank" rel="noopener noreferrer">
                                <Printer className="h-4 w-4" /> Print
                            </Link>
                        </Button>
                        <Button variant="outline" className="gap-2">
                            <Download className="h-4 w-4" /> PDF
                        </Button>
                        <Button className="gap-2" onClick={() => setPaymentModalOpen(true)}>
                            <CreditCard className="h-4 w-4" /> Pay
                        </Button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div className="rounded-lg border bg-white p-4 shadow-sm">
                            <div className="text-xs text-slate-500">Status</div>
                            <div className="mt-1 text-base font-semibold capitalize">{bill?.status || '—'}</div>
                        </div>
                        <div className="rounded-lg border bg-white p-4 shadow-sm">
                            <div className="text-xs text-slate-500">Consumption</div>
                            <div className="mt-1 text-base font-semibold">{consumption} m³</div>
                        </div>
                        <div className="rounded-lg border bg-white p-4 shadow-sm">
                            <div className="text-xs text-slate-500">Amount Due</div>
                            <div className="mt-1 text-base font-semibold">{formatCurrency(bill?.current_balance ?? totalAmount)}</div>
                        </div>
                        <div className="rounded-lg border bg-white p-4 shadow-sm">
                            <div className="text-xs text-slate-500">Total (incl. outstanding)</div>
                            <div className="mt-1 text-base font-semibold">{formatCurrency(bill.total_amount)}</div>
                        </div>
                    </div>

                    {/* Payment Summary */}
                    {bill?.payments && bill.payments.length > 0 && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="rounded-lg border bg-white p-4 shadow-sm">
                                <div className="text-xs text-slate-500">Total Paid</div>
                                <div className="mt-1 text-lg font-semibold text-green-600">
                                    {formatCurrency(bill.payments.reduce((sum, p) => sum + (p.amount_paid ?? p.amount ?? 0), 0))}
                                </div>
                            </div>
                            <div className="rounded-lg border bg-white p-4 shadow-sm">
                                <div className="text-xs text-slate-500">Payment Count</div>
                                <div className="mt-1 text-lg font-semibold">{bill.payments.length}</div>
                            </div>
                            <div className="rounded-lg border bg-white p-4 shadow-sm">
                                <div className="text-xs text-slate-500">Last Payment</div>
                                <div className="mt-1 text-lg font-semibold">
                                    {bill.payments.length > 0
                                        ? formatDate(
                                              bill.payments.sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date))[0].payment_date,
                                          )
                                        : '—'}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="rounded-lg border bg-white p-4 shadow-sm">
                            <div className="mb-3 text-sm font-semibold">Customer</div>
                            <dl className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-slate-600">Name</dt>
                                    <dd className="font-medium">{bill?.customer ? `${bill.customer.first_name} ${bill.customer.last_name}` : '—'}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-600">Account</dt>
                                    <dd className="font-medium">{bill?.customer?.account_number ?? '—'}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-600">Type</dt>
                                    <dd className="font-medium">{bill?.customer?.category?.type_id ?? '—'}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-600">Address</dt>
                                    <dd className="font-medium">{bill?.customer?.address ?? '—'}</dd>
                                </div>
                            </dl>
                        </div>

                        <div className="rounded-lg border bg-white p-4 shadow-sm">
                            <div className="mb-3 text-sm font-semibold">Meter & Reading</div>
                            <dl className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-slate-600">Meter Serial</dt>
                                    <dd className="font-medium">{bill?.meter?.serial ?? '—'}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-600">Previous Reading</dt>
                                    <dd className="font-medium">{previousReading}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-600">Current Reading</dt>
                                    <dd className="font-medium">{currentReading}</dd>
                                </div>
                            </dl>
                        </div>

                        <div className="rounded-lg border bg-white p-4 shadow-sm">
                            <div className="mb-3 text-sm font-semibold">Billing</div>
                            <dl className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-slate-600">Period Start</dt>
                                    <dd className="font-medium">{formatDateLong(bill?.billing_period_start)}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-600">Period End</dt>
                                    <dd className="font-medium">{formatDateLong(bill?.billing_period_end)}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-600">Unit Price</dt>
                                    <dd className="font-medium">{formatCurrency(unitPrice)}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-600">Billing Officer</dt>
                                    <dd className="font-medium">{bill?.generated_by?.name ?? bill?.reading?.billing_officer ?? '—'}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    <div className="rounded-lg border bg-white p-4 shadow-sm">
                        <div className="mb-3 text-sm font-semibold">Charges</div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-slate-600">
                                        <th className="py-2">Item</th>
                                        <th className="py-2">Units</th>
                                        <th className="py-2">Rate</th>
                                        <th className="py-2 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-t">
                                        <td className="py-2">Volumetric Charge</td>
                                        <td className="py-2">{consumption} m³</td>
                                        <td className="py-2">{formatCurrency(unitPrice)}</td>
                                        <td className="py-2 text-right">{formatCurrency(volumetricCharge)}</td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="py-2">Fixed Charge</td>
                                        <td className="py-2">—</td>
                                        <td className="py-2">—</td>
                                        <td className="py-2 text-right">{formatCurrency(fixedCharge)}</td>
                                    </tr>

                                    {otherCharge ? (
                                        <tr className="border-t">
                                            <td className="py-2">Other Charge</td>
                                            <td className="py-2">—</td>
                                            <td className="py-2">—</td>
                                            <td className="py-2 text-right">{formatCurrency(otherCharge)}</td>
                                        </tr>
                                    ) : null}
                                    <tr className="border-t font-semibold">
                                        <td className="py-2">Subtotal</td>
                                        <td className="py-2" />
                                        <td className="py-2" />
                                        <td className="py-2 text-right">{formatCurrency(subTotal)}</td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="py-2">Outstanding (Previous Balance)</td>
                                        <td className="py-2" />
                                        <td className="py-2" />
                                        <td className="py-2 text-right">{formatCurrency(prevBalance)}</td>
                                    </tr>
                                    <tr className="border-t font-bold">
                                        <td className="py-2">Grand Total</td>
                                        <td className="py-2" />
                                        <td className="py-2" />
                                        <td className="py-2 text-right">{formatCurrency(totalAmount)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Payments Section */}
                    <div className="rounded-lg border bg-white p-4 shadow-sm">
                        <div className="mb-3 flex items-center justify-between">
                            <div className="text-sm font-semibold">Payments</div>
                            {bill?.payments && bill.payments.length > 0 && (
                                <div className="text-xs text-slate-500">
                                    Total Paid: {formatCurrency(bill.payments.reduce((sum, p) => sum + (p.amount_paid ?? p.amount ?? 0), 0))}
                                </div>
                            )}
                        </div>

                        {Array.isArray(bill?.payments) && bill.payments.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-slate-600">
                                            <th className="py-2">Date</th>
                                            <th className="py-2">Method</th>
                                            <th className="py-2">Reference</th>
                                            <th className="py-2">Received By</th>
                                            <th className="py-2 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bill.payments
                                            .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date))
                                            .map((p) => (
                                                <tr key={p.id} className="border-t hover:bg-slate-50">
                                                    <td className="py-2">{formatDate(p.payment_date)}</td>
                                                    <td className="py-2">
                                                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 capitalize">
                                                            {String(p.payment_method || '').replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="py-2 font-mono text-xs">
                                                        <Link href={`/bills/${p.bill_id}`}>{p.bill_id || '—'}</Link>
                                                    </td>
                                                    <td className="py-2">{p.received_by?.name || '—'}</td>
                                                    <td className="py-2 text-right font-medium">{formatCurrency(p.amount_paid ?? p.amount)}</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-8 text-center text-slate-500">
                                <div className="mb-2">
                                    <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1}
                                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                        />
                                    </svg>
                                </div>
                                <p className="text-sm">No payments recorded for this bill</p>
                                <p className="mt-1 text-xs text-slate-400">Click "Pay" button to record a payment</p>
                            </div>
                        )}
                    </div>
                </div>
            </AppLayout>

            <PaymentFormModal
                open={paymentModalOpen}
                onOpenChange={setPaymentModalOpen}
                defaultValues={{
                    bill_id: bill?.id,
                    customer_id: bill?.customer?.id || '',
                    customer_name: bill?.customer ? `${bill.customer.first_name} ${bill.customer.last_name}` : '',
                    prev_balance: bill?.prev_balance || 0,
                    total_amount: bill?.total_amount || 0,
                    amount: bill?.current_balance || '',
                    date: new Date().toISOString().split('T')[0],
                    method: 'cash',
                }}
                onSubmit={submitPayment}
                trigger={<span />}
                methods={[
                    { value: 'cash', label: 'Cash' },
                    { value: 'mobile_money', label: 'Mobile Money' },
                    { value: 'bank_transfer', label: 'Bank Transfer' },
                ]}
            />
        </>
    );
}
