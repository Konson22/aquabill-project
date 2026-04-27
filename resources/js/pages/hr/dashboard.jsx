import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Users, UserPlus, Calendar, Award } from 'lucide-react';

const stats = [
    { name: 'Total Employees', value: '42', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'On Leave Today', value: '3', icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-100' },
    { name: 'New Applications', value: '12', icon: UserPlus, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: 'Training Sessions', value: '2', icon: Award, color: 'text-purple-600', bg: 'bg-purple-100' },
];

export default function HRDashboard() {
    return (
        <AppLayout breadcrumbs={[{ title: 'HR Dashboard', href: '/hr' }]}>
            <Head title="HR Dashboard" />
            
            <div className="flex flex-col gap-8 p-4 sm:p-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Human Resources</h1>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">Staff management and attendance tracking.</p>
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

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                        <h2 className="text-lg font-semibold mb-6">Staff Attendance</h2>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                                            MK
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">Marvin K.</p>
                                            <p className="text-sm text-slate-500 text-xs">Finance Dept.</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-emerald-500">Present</p>
                                        <p className="text-xs text-slate-400">08:00 AM - 05:00 PM</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                        <h2 className="text-lg font-semibold mb-4">Upcoming Birthdays</h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-rose-500" />
                                <div>
                                    <p className="text-sm font-medium">Sarah Jane</p>
                                    <p className="text-xs text-slate-500">Tomorrow, April 25</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
