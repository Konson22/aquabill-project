import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

function titleFromSlug(name) {
    if (!name) {
        return 'Department';
    }

    return name
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

export default function DepartmentWorkspace({ department = {} }) {
    const heading = titleFromSlug(department.name);
    const breadcrumbs = [{ title: heading, href: route('dashboard') }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={heading} />

            <div className="flex flex-col gap-4 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">{heading}</h1>
                    {department.description ? (
                        <p className="mt-1 text-muted-foreground">{department.description}</p>
                    ) : null}
                </div>
                <p className="text-sm text-muted-foreground">
                    Your account is linked to this department. Use the sidebar for tools assigned to your role; more
                    screens can be added here as modules are built out.
                </p>
            </div>
        </AppLayout>
    );
}
