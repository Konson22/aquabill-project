import { PrintServiceChargeReceipt } from './components/print-service-charge-receipt';
import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import { useEffect } from 'react';

/**
 * @param {{ charge: Record<string, unknown> }} props
 */
export default function ServiceChargePrint({ charge }) {
    useEffect(() => {
        const timeout = setTimeout(() => window.print(), 500);

        return () => clearTimeout(timeout);
    }, []);

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900 print:bg-white print:p-0">
            <Head title={`Print ${charge.id}`} />

            <div className="no-print sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur print:hidden">
                <div className="mx-auto flex max-w-[21cm] flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">Review the receipt, then print or save as PDF.</p>
                    <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="default" size="sm" onClick={() => window.print()}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('service-charges.show', charge.id)}>Back to charge</Link>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="mx-auto w-full max-w-[21cm] px-4 py-8 print:px-0 print:py-0">
                <PrintServiceChargeReceipt charge={charge} />
            </div>
        </div>
    );
}
