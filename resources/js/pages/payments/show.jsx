import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

const breadcrumbs = (payment) => [
    { title: 'Payments', href: '/payments' },
    { title: `Payment #${payment?.id}`, href: `/payments/${payment?.id}` },
];

export default function PaymentShow({ payment }) {
    const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
    const formatDate = (date) => (date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '');

    return (
        <AppLayout breadcrumbs={breadcrumbs(payment)}>
            <Head title={`Payment #${payment?.id}`} />

            <div className="mb-6 flex items-center justify-between">
                <Button variant="outline" asChild>
                    <Link href={route('payments.index')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Payment Details</CardTitle>
                    <CardDescription>Recorded payment information</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <div className="text-sm text-slate-500">Customer</div>
                        <div className="text-base font-medium">
                            {payment?.customer ? `${payment.customer.first_name} ${payment.customer.last_name}` : '—'}
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-slate-500">Bill</div>
                        <div className="text-base font-medium">{payment?.bill ? `Bill #${payment.bill.id}` : '—'}</div>
                    </div>
                    <div>
                        <div className="text-sm text-slate-500">Payment Date</div>
                        <div className="text-base font-medium">{formatDate(payment?.payment_date)}</div>
                    </div>
                    <div>
                        <div className="text-sm text-slate-500">Amount</div>
                        <div className="text-base font-medium">{formatCurrency(payment?.amount_paid)}</div>
                    </div>
                    <div>
                        <div className="text-sm text-slate-500">Method</div>
                        <div className="text-base font-medium capitalize">{String(payment?.payment_method || '').replace('_', ' ')}</div>
                    </div>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
