import BillPrint from '@/components/BillPrint';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Printer } from 'lucide-react';

export default function BillingPrintMultiple({ bills = [] }) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Finance', href: '/finance' },
                { title: 'Billing', href: '/billing' },
                { title: 'Print Multiple', href: '/billing/print-multiple' },
            ]}
        >
            <Head title={`Print ${bills?.length || 0} Bills`} />
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
                <h1 className="text-xl font-semibold">Print {bills?.length || 0} Bills</h1>
                <Button className="gap-2" onClick={() => window.print()}>
                    <Printer className="h-4 w-4" /> Print
                </Button>
            </div>
            <div id="printable" className="space-y-10 px-6">
                {(bills || []).map((bill) => (
                    <div key={bill.id} className="bill-item">
                        <BillPrint bill={bill} />
                    </div>
                ))}
            </div>
        </AppLayout>
    );
}
