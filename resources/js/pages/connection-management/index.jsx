import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, PowerOff, User } from 'lucide-react';

export default function ConnectionManagementIndex({ disconnections, stats }) {
    const items = disconnections?.data ?? [];
    const disconnectedItems = items.filter((item) => item?.status === 'disconnected');
    const waitingItems = items.filter((item) => item?.status !== 'disconnected');

    const formatDate = (value) => {
        if (!value) {
            return '—';
        }

        return new Date(value).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Notified Customers', href: '/disconnections' }]}>
            <Head title="Notified Customers" />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
                            <PowerOff className="h-6 w-6 text-destructive" />
                            Notified Customers
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Customers currently in the disconnection notice period.
                        </p>
                    </div>

                    <Link
                        href="/admin"
                        className="inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Admin Dashboard
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Disconnected</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-black">{stats?.disconnected ?? 0}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Notified</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-black">{stats?.notified ?? 0}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Grace Period</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-black">{stats?.grace_period ?? 0}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Reconnected (Month)</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-black">{stats?.reconnected ?? 0}</CardContent>
                    </Card>
                </div>

                
                <WaitingCustomersTable rows={waitingItems} formatDate={formatDate} />

                <DisconnectedCustomersTable rows={disconnectedItems} formatDate={formatDate} />

               
            </div>
        </AppLayout>
    );
}

function DisconnectedCustomersTable({ rows, formatDate }) {
    if (!rows.length) {
        return (
            <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                No disconnected customers found.
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Disconnected</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                                <th className="px-3 py-2">Customer</th>
                                <th className="px-3 py-2">Account</th>
                                <th className="px-3 py-2">Zone</th>
                                <th className="px-3 py-2">Disconnected On</th>
                                <th className="px-3 py-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((item) => (
                                <tr key={item.id} className="border-b">
                                    <td className="px-3 py-2 font-medium">
                                        <Link
                                            href={`/customers/${item.customer?.id}`}
                                            className="inline-flex items-center gap-1 text-primary hover:underline"
                                        >
                                            <User className="h-4 w-4" />
                                            {item.customer?.name ?? 'Unknown'}
                                        </Link>
                                    </td>
                                    <td className="px-3 py-2 font-mono">{item.customer?.account_number ?? '—'}</td>
                                    <td className="px-3 py-2">{item.customer?.zone?.name ?? '—'}</td>
                                    <td className="px-3 py-2">{formatDate(item?.disconnected_at)}</td>
                                    <td className="px-3 py-2">
                                        <Badge variant="destructive" className="uppercase">
                                            {item.status}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}

function WaitingCustomersTable({ rows, formatDate }) {
    const getDaysLeft = (item) => {
        const endDate = item?.grace_period_ends_at ?? item?.notice_ends_at;

        if (!endDate) {
            return '—';
        }

        const now = new Date();
        const target = new Date(endDate);
        const millisecondsPerDay = 1000 * 60 * 60 * 24;
        const daysLeft = Math.ceil((target.getTime() - now.getTime()) / millisecondsPerDay);

        if (daysLeft < 0) {
            return 'Overdue';
        }

        return `${daysLeft} day${daysLeft === 1 ? '' : 's'}`;
    };

    if (!rows.length) {
        return (
            <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                No waiting customers found.
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Waiting</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                                <th className="px-3 py-2">Customer</th>
                                <th className="px-3 py-2">Notified On</th>
                                <th className="px-3 py-2">Notification End</th>
                                <th className="px-3 py-2">Days Left</th>
                                <th className="px-3 py-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((item) => (
                                <tr key={item.id} className="border-b">
                                    <td className="px-3 py-2 font-medium">
                                        <Link
                                            href={`/customers/${item.customer?.id}`}
                                            className="inline-flex items-center gap-1 text-primary hover:underline"
                                        >
                                            <User className="h-4 w-4" />
                                            {item.customer?.name ?? 'Unknown'}
                                        </Link>
                                    </td>
                                    <td className="px-3 py-2">{formatDate(item?.notified_at)}</td>
                                    <td className="px-3 py-2">{formatDate(item?.notice_ends_at)}</td>
                                    <td className="px-3 py-2">{getDaysLeft(item)}</td>
                                    <td className="px-3 py-2">
                                        <Badge variant="secondary" className="uppercase">
                                            {item.status}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}