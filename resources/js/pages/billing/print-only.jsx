import BillPrint from '@/components/BillPrint';
import { Button } from '@/components/ui/button';
import { Head } from '@inertiajs/react';
import { Printer } from 'lucide-react';

export default function BillingPrintOnly({ bill }) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <Head title={`Print Bill #${bill?.id}`} />
            <style>
                {`@media print {
                    .bill-item .bill-print-root,
                    .bill-item .bill-print-root * {
                        font-size: 14px !important;
                        line-height: 1.4 !important;
                    }
                    .bill-item .bill-print-root .text-xs {
                        font-size: 12px !important;
                    }
                    .bill-item .bill-print-root .text-sm {
                        font-size: 13px !important;
                    }
                    .bill-item .bill-print-root h1, 
                    .bill-item .bill-print-root h2, 
                    .bill-item .bill-print-root h3 {
                        font-size: 16px !important;
                    }
                }`}
            </style>
            <div className="min-h-screen bg-white">
                {/* Print button - hidden when printing */}
                <div className="border-b bg-gray-100 p-4 print:hidden">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-semibold">Print Bill #{bill?.id}</h1>
                        <Button onClick={handlePrint} className="gap-2">
                            <Printer className="h-4 w-4" /> Print
                        </Button>
                    </div>
                </div>

                {/* Bill content */}
                <div className="p-4">
                    <div className="bill-item">
                        <BillPrint bill={bill} />
                    </div>
                </div>
            </div>
        </>
    );
}
