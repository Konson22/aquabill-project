import BillPrint from '@/components/BillPrint';
import { Button } from '@/components/ui/button';
import { Head } from '@inertiajs/react';
import { Printer } from 'lucide-react';

export default function BillingPrintMultipleOnly({ bills = [] }) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <Head title={`Print ${bills?.length || 0} Bills`} />
            <style>
                {`@media print {
                    @page { margin: 0.3in; }
                    /* Ensure three cards per page and spacing per card */
                    .bill-item { 
                        break-inside: avoid; 
                        page-break-inside: avoid; 
                        margin-bottom: 0.5rem !important;
                        height: calc(100vh / 3 - 0.55in); /* Adjusted for smaller font */
                        display: flex;
                        flex-direction: column;
                    }
                    .bill-item:nth-child(3n):not(:last-child) { 
                        page-break-after: always; 
                        break-after: page; 
                    }

                    /* Make the card fill available height and smaller print font */
                    .bill-item .bill-print-root,
                    .bill-item .bill-print-root * {
                        font-size: 10px !important;   /* smaller font size for all elements */
                        line-height: 1.15 !important;
                    }
                    .bill-item .bill-print-root {
                        flex: 1 1 auto;
                        display: flex;
                        flex-direction: column;
                        padding: 0.4rem !important; /* tighter padding for smaller font */
                    }
                }`}
            </style>
            <div className="min-h-screen bg-white">
                {/* Print button - hidden when printing */}
                <div className="border-b bg-gray-100 p-4 print:hidden">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-semibold">Print {bills?.length || 0} Bills</h1>
                        <Button onClick={handlePrint} className="gap-2">
                            <Printer className="h-4 w-4" /> Print All
                        </Button>
                    </div>
                </div>

                {/* Bills content */}
                <div className="p-4">
                    {(bills || []).map((bill, index) => (
                        <div key={bill.id} className="bill-item">
                            <BillPrint bill={bill} />
                            {/* Page break after every 3 bills (except for the last bill) */}
                            {(index + 1) % 3 === 0 && index < bills.length - 1 && <div className="page-break hidden print:block"></div>}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
