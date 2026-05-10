import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

/**
 * Fallback when the signed-in user has no matching department dashboard (see DashboardController).
 */
export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-4 p-6">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
                <p className="text-muted-foreground">Use the sidebar to open billing, customers, GIS, or other tools.</p>
            </div>
        </AppLayout>
    );
}
