import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Droplets, FileText, ClipboardList, MapPin } from 'lucide-react';

const stats = [
    { name: 'Unread Meters', value: '154', icon: Droplets, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Bills Generated', value: '1,204', icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: 'Active Routes', value: '12', icon: MapPin, color: 'text-purple-600', bg: 'bg-purple-100' },
    { name: 'Pending Tasks', value: '28', icon: ClipboardList, color: 'text-amber-600', bg: 'bg-amber-100' },
];

export default function LedgerDashboard() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Ledger Dashboard', href: '/ledger' }]}>
            <Head title="Ledger Dashboard" />
            
            <div className="flex flex-col gap-8 p-4 sm:p-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Billing & Ledger</h1>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">Meter readings and billing cycles.</p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <div key={stat.name} className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.name}</p>
                                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                                </div>
                                <div className={`rounded-xl ${stat.bg} p-3`}>
                                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                        <div className="space-y-3">
                            <button className="w-full flex items-center justify-between p-4 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-colors">
                                <span className="font-medium">Generate Monthly Bills</span>
                                <FileText className="h-5 w-5" />
                            </button>
                            <button className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 transition-colors">
                                <span className="font-medium">Assign Meter Reading Route</span>
                                <MapPin className="h-5 w-5 text-slate-400" />
                            </button>
                        </div>
                    </div>
                    
                    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                        <h2 className="text-lg font-semibold mb-4">Billing Cycle Progress</h2>
                        <div className="relative pt-1">
                            <div className="flex mb-2 items-center justify-between">
                                <div>
                                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                                        Reading In Progress
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-semibold inline-block text-blue-600">
                                        70%
                                    </span>
                                </div>
                            </div>
                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
                                <div style={{ width: "70%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
