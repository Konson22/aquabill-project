import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { CalendarRange } from 'lucide-react';

export default function MonthlyReport() {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Finance', href: route('finance') },
                { title: 'Reports', href: route('finance.reports.index') },
                { title: 'Monthly report', href: route('finance.reports.monthly') },
            ]}
        >
            <Head title="Monthly Report" />

            <div className="p-4 sm:p-6">
                <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
                    <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                        <CalendarRange className="h-6 w-6 text-primary" />
                        Monthly report
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Monthly finance summary view is ready for KPI and export integration.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
