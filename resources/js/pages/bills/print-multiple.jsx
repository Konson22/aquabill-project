import PrintBillCard from '@/components/print-bill-card';
import { Head } from '@inertiajs/react';
import { useEffect } from 'react';

export default function PrintMultipleBills({ bills }) {
    useEffect(() => {
        // Auto-print when component loads
        if (bills.length > 0) {
            setTimeout(() => {
                window.print();
            }, 500);
        }
    }, [bills]);

    return (
        <>
            <Head title="Print Bills" />
            <div className="min-h-screen bg-white p-0 print:p-0">
                {bills.map((bill, index) => (
                    <div key={bill.id} className="print:block">
                        <PrintBillCard bill={bill} />
                        {/* Optional page break logic if needed, but PrintBillCard aims to fit 3 per page. 
                            If we want to force breaks every 3 items, we can do that here. 
                        */}
                    </div>
                ))}
            </div>
        </>
    );
}
