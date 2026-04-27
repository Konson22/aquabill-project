import { Head } from '@inertiajs/react';
import { useEffect } from 'react';
import PrintBillCard from '@/components/print-bill-card';

export default function PrintSingle({ bill }) {
    useEffect(() => {
        // Delay slightly to ensure fonts/images are loaded if any
        const timer = setTimeout(() => {
            window.print();
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-white px-4 py-6 print:p-0">
            <Head
                title={`Print Bill #${bill?.bill_number ?? bill?.id ?? ''}`}
            />

            <div className="mx-auto w-full max-w-[21cm]">
                <PrintBillCard bill={bill} />
            </div>
            <style dangerouslySetInnerHTML={{ __html: `
                @page {
                    size: A4;
                    margin: 0;
                }
                body {
                    -webkit-print-color-adjust: exact;
                }
                @media print {
                    .min-h-screen { min-height: auto; }
                    body { background: white; }
                }
            ` }} />
        </div>
    );
}
