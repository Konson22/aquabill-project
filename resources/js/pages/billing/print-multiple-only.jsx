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
                    body { margin: 0 !important; padding: 0 !important; }
                    .min-h-screen { min-height: auto !important; }
                    
                    /* Aggressive font size reduction for printers */
                    .bill-print-root { font-size: 10px !important; }
                    .bill-print-root .text-sm { font-size: 9px !important; }
                    .bill-print-root .text-xs { font-size: 8px !important; }
                    .bill-print-root .text-base { font-size: 10px !important; }
                    .bill-print-root .leading-4 { line-height: 1.1 !important; }
                    .bill-print-root .leading-5 { line-height: 1.2 !important; }
                    
                    /* Reduce spacing for print */
                    .bill-print-root .mb-4 { margin-bottom: 0.5rem !important; }
                    .bill-print-root .mb-3 { margin-bottom: 0.375rem !important; }
                    .bill-print-root .gap-4 { gap: 0.5rem !important; }
                    .bill-print-root .gap-2 { gap: 0.25rem !important; }
                    .bill-print-root .p-6 { padding: 0.5rem !important; }
                    .bill-print-root .px-2 { padding-left: 0.25rem !important; padding-right: 0.25rem !important; }
                    .bill-print-root .py-0\\.5 { padding-top: 0.125rem !important; padding-bottom: 0.125rem !important; }
                    
                    /* Logo size reduction */
                    .bill-print-root .h-16 { height: 2rem !important; }
                    .bill-print-root .w-16 { width: 2rem !important; }
                    
                    /* Page breaks for multiple bills - exactly 3 cards per page */
                    .bill-item { 
                        break-inside: avoid; 
                        page-break-inside: avoid; 
                        margin: 0; 
                        height: calc(100vh / 3 - 0.3in); /* Slightly reduced height to ensure disclaimer fits */
                        display: flex;
                        flex-direction: column;
                        overflow: hidden;
                    }
                    .bill-item:nth-child(3n):not(:last-child) { 
                        break-after: page; 
                        page-break-after: always; 
                    }
                    .bill-item:nth-child(3n+1) {
                        page-break-before: always;
                    }
                    .bill-item:first-child {
                        page-break-before: auto;
                    }
                    
                    /* Ensure bill content fits within allocated space */
                    .bill-item .bill-print-root {
                        height: 100%;
                        overflow: hidden;
                        display: flex;
                        flex-direction: column;
                    }
                    
                    /* Ensure disclaimer section is always visible */
                    .bill-print-root ul {
                        margin-top: auto !important;
                        margin-bottom: 0 !important;
                        padding-bottom: 0.25rem !important;
                    }
                    
                    .bill-print-root ul li {
                        font-size: 7px !important;
                        line-height: 1.1 !important;
                        margin-bottom: 0.125rem !important;
                    }
                    
                    /* Force disclaimer to be visible */
                    .bill-print-root ul {
                        display: block !important;
                        visibility: visible !important;
                    }
                    
                    /* Divider styling for print */
                    .bill-item .border-t-2 {
                        border-top: 2px solid #4b5563 !important;
                        margin: 0.5rem 0 !important;
                        width: 100% !important;
                        opacity: 0.8 !important;
                    }
                    
                    @page { margin: 0.25in !important; }
                    
                    /* Page break for 3 bills per page */
                    .page-break {
                        page-break-after: always;
                        break-after: page;
                    }
                    
                    /* Ensure each bill takes up appropriate space */
                    .bill-item {
                        page-break-inside: avoid;
                        break-inside: avoid;
                    }
                    
                    /* Adjust spacing for better 3-per-page layout */
                    .bill-item:not(:last-child) {
                        margin-bottom: 1rem;
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
