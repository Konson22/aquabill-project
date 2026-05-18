import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import {
    ArrowLeft,
    CheckCircle2,
    Printer,
    UserPlus,
    XCircle,
} from 'lucide-react';

function formatDate(value) {
    if (!value) {
        return '—';
    }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
        return String(value);
    }
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function statusBadge(status) {
    const variants = {
        pending: 'border-amber-300 bg-amber-50 text-amber-900',
        paid: 'border-blue-300 bg-blue-50 text-blue-900',
        completed: 'border-emerald-300 bg-emerald-50 text-emerald-900',
        cancelled: 'border-slate-300 bg-slate-50 text-slate-700',
    };
    return (
        <Badge variant="outline" className={`capitalize ${variants[status] ?? ''}`}>
            {status}
        </Badge>
    );
}

export default function ConnectionRequestShow({ connectionRequest: req }) {
    const items = req.items ?? [];
    const isPending = req.status === 'pending';
    const isPaid = req.status === 'paid';
    const isCompleted = req.status === 'completed';
    const isCancelled = req.status === 'cancelled';

    const breadcrumbs = [
        { title: 'Connection requests', href: route('connection-requests.index') },
        { title: req.request_number, href: route('connection-requests.show', req.id) },
    ];

    const markPaid = () => {
        if (!confirm('Mark this connection request as paid?')) {
            return;
        }
        router.post(route('connection-requests.mark-paid', req.id));
    };

    const convert = () => {
        if (!confirm('Create a customer account from this request? Service charges will be created for catalogue line items.')) {
            return;
        }
        router.post(route('connection-requests.convert', req.id));
    };

    const cancel = () => {
        if (!confirm('Cancel this connection request?')) {
            return;
        }
        router.post(route('connection-requests.cancel', req.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Connection request ${req.request_number}`} />

            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                        <Button variant="ghost" size="sm" className="-ml-2 w-fit gap-1 px-2 text-muted-foreground" asChild>
                            <Link href={route('connection-requests.index')}>
                                <ArrowLeft className="h-4 w-4" />
                                Back to list
                            </Link>
                        </Button>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="font-mono text-2xl font-bold">{req.request_number}</h1>
                            {statusBadge(req.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Issued {formatDate(req.issued_date)}
                            {req.issuer?.name ? ` by ${req.issuer.name}` : ''}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link
                                href={route('connection-requests.print', req.id)}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Printer className="mr-2 h-4 w-4" />
                                Print invoice
                            </Link>
                        </Button>
                        {isPending && (
                            <Button size="sm" onClick={markPaid}>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Mark paid
                            </Button>
                        )}
                        {isPaid && (
                            <Button size="sm" onClick={convert}>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Convert to customer
                            </Button>
                        )}
                        {!isCompleted && !isCancelled && (
                            <Button variant="destructive" size="sm" onClick={cancel}>
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancel
                            </Button>
                        )}
                    </div>
                </div>

                {isCompleted && req.customer && (
                    <Card className="border-emerald-200 bg-emerald-50/50">
                        <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                            <p className="text-sm text-emerald-900">
                                Converted to customer account{' '}
                                <span className="font-mono font-semibold">{req.customer.account_number}</span>
                            </p>
                            <Button size="sm" variant="outline" asChild>
                                <Link href={route('customers.show', req.customer.id)}>View customer</Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Applicant</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <dl className="grid gap-3 text-sm sm:grid-cols-2">
                            <div>
                                <dt className="text-muted-foreground">Name</dt>
                                <dd className="font-medium">{req.name}</dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Phone</dt>
                                <dd className="font-medium">{req.phone}</dd>
                            </div>
                            {req.email && (
                                <div>
                                    <dt className="text-muted-foreground">Email</dt>
                                    <dd>{req.email}</dd>
                                </div>
                            )}
                            {req.national_id && (
                                <div>
                                    <dt className="text-muted-foreground">National ID</dt>
                                    <dd className="font-mono">{req.national_id}</dd>
                                </div>
                            )}
                            <div className="sm:col-span-2">
                                <dt className="text-muted-foreground">Address</dt>
                                <dd>{req.address}</dd>
                            </div>
                            {req.plot_no && (
                                <div>
                                    <dt className="text-muted-foreground">Plot</dt>
                                    <dd>{req.plot_no}</dd>
                                </div>
                            )}
                            <div>
                                <dt className="text-muted-foreground">Type</dt>
                                <dd className="capitalize">{req.customer_type}</dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Zone</dt>
                                <dd>{req.zone?.name ?? '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Tariff</dt>
                                <dd>{req.tariff?.name ?? '—'}</dd>
                            </div>
                            {req.paid_at && (
                                <div>
                                    <dt className="text-muted-foreground">Paid at</dt>
                                    <dd>{formatDate(req.paid_at)}</dd>
                                </div>
                            )}
                            {req.notes && (
                                <div className="sm:col-span-2">
                                    <dt className="text-muted-foreground">Notes</dt>
                                    <dd className="whitespace-pre-line">{req.notes}</dd>
                                </div>
                            )}
                        </dl>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Fee line items</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Unit price</TableHead>
                                    <TableHead className="text-right">Qty</TableHead>
                                    <TableHead className="text-right">Line total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item) => {
                                    const lineTotal =
                                        (Number(item.amount) || 0) * (Number(item.quantity) || 1);
                                    return (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.description}</TableCell>
                                            <TableCell className="text-right font-mono">
                                                {formatCurrency(item.amount)}
                                            </TableCell>
                                            <TableCell className="text-right">{item.quantity}</TableCell>
                                            <TableCell className="text-right font-mono font-semibold">
                                                {formatCurrency(lineTotal)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                <TableRow>
                                    <TableCell colSpan={3} className="text-right font-semibold">
                                        Total due
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-lg font-bold">
                                        {formatCurrency(req.total_amount)}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
