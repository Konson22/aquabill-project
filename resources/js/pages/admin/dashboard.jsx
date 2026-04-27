import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Shield, Building, Users, Droplets, TriangleAlert, TrendingUp } from 'lucide-react';

const stats = [
    { name: 'Revenue Report', value: 'View', icon: TrendingUp, color: 'text-emerald-700', bg: 'bg-emerald-100', href: '/reports/revenue' },
    { name: 'Overdue Bills', value: 'View', icon: TriangleAlert, color: 'text-amber-700', bg: 'bg-amber-100', href: '/bills/overdue-bills' },
    { name: 'Water Usage Report', value: 'View', icon: Droplets, color: 'text-cyan-700', bg: 'bg-cyan-100', href: '/reports/water-usage' },
    { name: 'Departments', value: '5', icon: Building, color: 'text-purple-600', bg: 'bg-purple-100', href: '/admin/departments' },
];

export default function AdminDashboard() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Admin Dashboard', href: '/admin' }]}>
            <Head title="Admin Dashboard" />
            
            <div className="flex flex-col gap-8 p-4 sm:p-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Control Center</h1>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">System-wide monitoring and configuration.</p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <Link
                            key={stat.name}
                            href={stat.href}
                            className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-slate-50 dark:bg-slate-900 dark:ring-slate-800 dark:hover:bg-slate-800"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.name}</p>
                                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                                </div>
                                <div className={`rounded-xl ${stat.bg} p-3 transition-transform group-hover:scale-105`}>
                                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                        <h2 className="text-lg font-semibold mb-4">Quick Management</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <Link
                                href="/admin/users"
                                className="p-4 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 transition-colors text-left"
                            >
                                <Users className="h-6 w-6 text-blue-600 mb-2" />
                                <span className="block font-medium">Manage Users</span>
                            </Link>
                            <Link
                                href="/admin/roles"
                                className="p-4 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 transition-colors text-left"
                            >
                                <Shield className="h-6 w-6 text-purple-600 mb-2" />
                                <span className="block font-medium">Roles & Perms</span>
                            </Link>
                        </div>
                    </div>
                    
                    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                        <h2 className="text-lg font-semibold mb-4">Recent System Logs</h2>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                <span className="text-slate-500">10:45 AM</span>
                                <span className="font-medium">User login: admin@aquabill.com</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                <span className="text-slate-500">09:30 AM</span>
                                <span className="font-medium">Backup completed successfully</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
