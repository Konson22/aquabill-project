import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function InvoiceShow({ invoice }) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('dashboard') },
                { title: 'Invoices', href: route('invoices') },
                { title: `Invoice #${invoice.invoice_number}`, href: '#' },
            ]}
        >
            <Head title={`Invoice ${invoice.invoice_number}`} />
            <div className="p-4">
                <h1 className="text-2xl font-bold">
                    Invoice #{invoice.invoice_number}
                </h1>
                <p>Details coming soon...</p>
            </div>
        </AppLayout>
    );
}
