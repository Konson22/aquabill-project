import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function PaymentReportHeader() {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-lg font-semibold tracking-tight text-foreground">
                    Payment Report
                </h1>
                <p className="text-sm text-muted-foreground">
                    Billing, collection, and revenue by bills, invoices, and
                    tariff.
                </p>
            </div>
            <Button
                variant="outline"
                className="h-9 gap-2 border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 hover:text-emerald-900"
                onClick={() =>
                    (window.location.href = route('payments.export'))
                }
            >
                <Download className="h-4 w-4" />
                Export
            </Button>
        </div>
    );
}
