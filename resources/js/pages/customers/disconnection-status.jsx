import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Activity, Printer } from 'lucide-react';
import DisconnectionStatusContent from './components/disconnection-status-content';

export default function CustomerDisconnectionStatus({ customer }) {
    const disconnections = customer?.disconnections ?? [];
    const activeNotice = disconnections.find((d) => d.status === 'notified' || d.status === 'grace_period');

    const breadcrumbs = [
        { title: 'Customers', href: '/customers' },
        {
            title: customer?.account_number ?? 'Customer',
            href: customer ? `/customers/${customer.id}` : '/customers',
        },
        {
            title: 'Disconnection',
            href: customer ? route('customers.disconnection-status', customer.id) : '/customers',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={customer ? `Disconnection • ${customer.account_number}` : 'Disconnection'} />

            <div className="mx-auto w-full max-w-4xl space-y-6 p-6 animate-in fade-in duration-500">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <Button variant="outline" size="sm" asChild className="w-fit">
                        <Link href={route('customers.show', customer.id)}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to customer
                        </Link>
                    </Button>
                    {activeNotice ? (
                        <Button variant="secondary" size="sm" asChild className="w-fit">
                            <a
                                href={route('customers.print-notification', customer.id)}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Printer className="mr-2 h-4 w-4" />
                                Print notice (new tab)
                            </a>
                        </Button>
                    ) : null}
                </div>

                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
                        <Activity className="h-7 w-7 text-primary" />
                        Disconnection status
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">{customer?.name}</span>
                        {customer?.account_number ? (
                            <span className="font-mono text-muted-foreground"> · {customer.account_number}</span>
                        ) : null}
                        {customer?.zone?.name ? (
                            <span className="text-muted-foreground"> · {customer.zone.name}</span>
                        ) : null}
                    </p>
                </div>

                <DisconnectionStatusContent customer={customer} />
            </div>
        </AppLayout>
    );
}
