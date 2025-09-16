import BillPrint from '@/components/BillPrint';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import { useEffect } from 'react';

export default function BillingPrint({ bill }) {
    useEffect(() => {
        // Auto-print when page loads
        window.print();
    }, []);

    const handlePrint = () => {
        window.print();
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Billing', href: '/billing' },
                { title: `Print #${bill?.id}`, href: `/billing/${bill?.id}/print` },
            ]}
        >
            <Head title={`Print Bill #${bill?.id}`} />
            <style>
                {`@media print {
                    body * { visibility: hidden; }
                    #printable, #printable * { visibility: visible; }
                    #printable { position: relative; padding: 0 !important; }
                    .bill-item { break-inside: avoid; page-break-inside: avoid; margin: 0; }
                    .bill-item:nth-child(3n):not(:last-child) { break-after: page; page-break-after: always; }
                    .bill-item .bill-print-root { padding: 0.5rem !important; }
                }`}
            </style>
            <div className="mb-4 flex items-center justify-between px-6 print:hidden">
                <h1 className="text-xl font-semibold">Print Bill #{bill?.id}</h1>
                <Button className="gap-2" onClick={handlePrint}>
                    <Printer className="h-4 w-4" /> Print
                </Button>
            </div>
            <div id="printable" className="space-y-10 px-6">
                <div className="bill-item">
                    <BillPrint bill={bill} />
                </div>
            </div>
        </AppLayout>
    );
}
