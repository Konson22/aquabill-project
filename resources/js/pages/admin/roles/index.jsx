import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function RolesIndex() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Role Management', href: '/admin/roles' }]}>
            <Head title="Role Management" />
            <div className="flex flex-col gap-8 p-4 sm:p-8">
                <h1 className="text-3xl font-bold">Role Management</h1>
                <p className="text-slate-500">Manage system roles and permissions here.</p>
            </div>
        </AppLayout>
    );
}
