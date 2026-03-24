import AppLayout from '@/layouts/app-layout';

const breadcrumbs = [
    {
        title: 'Dashboard',
        href: '#',
    },
    {
        title: 'Meter Department',
        href: '#',
    },
];

export default function DashboardMeterDepartment() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">
                        Meter Department Dashboard
                    </h1>
                </div>
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="aspect-video rounded-xl bg-blue-100/50 p-6">
                        <h3 className="font-semibold text-blue-900">
                            Total Meters
                        </h3>
                        <p className="mt-2 text-3xl font-bold text-blue-700">
                            1,234
                        </p>
                    </div>
                    <div className="aspect-video rounded-xl bg-purple-100/50 p-6">
                        <h3 className="font-semibold text-purple-900">
                            Readings Today
                        </h3>
                        <p className="mt-2 text-3xl font-bold text-purple-700">
                            89
                        </p>
                    </div>
                    <div className="aspect-video rounded-xl bg-indigo-100/50 p-6">
                        <h3 className="font-semibold text-indigo-900">
                            Pending Installs
                        </h3>
                        <p className="mt-2 text-3xl font-bold text-indigo-700">
                            12
                        </p>
                    </div>
                </div>
                <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 p-6 md:min-h-min">
                    <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
                        <span className="text-gray-500">
                            Meter department metrics and charts will go here
                        </span>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
