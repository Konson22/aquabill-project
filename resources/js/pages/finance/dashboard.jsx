import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import { CreditCard, DollarSign, TrendingUp, PieChart } from 'lucide-react';

const stats = [
    {
        name: 'Total Revenue',
        value: formatCurrency(84250),
        icon: DollarSign,
        color: 'text-emerald-600',
        bg: 'bg-emerald-100',
    },
    {
        name: 'Outstanding',
        value: formatCurrency(12400),
        icon: CreditCard,
        color: 'text-rose-600',
        bg: 'bg-rose-100',
    },
    { name: 'Growth', value: '+12.5%', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-100' },
    {
        name: 'Expenses',
        value: formatCurrency(24100),
        icon: PieChart,
        color: 'text-amber-600',
        bg: 'bg-amber-100',
    },
];

export default function FinanceDashboard() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Finance Dashboard', href: '/finance' }]}>
            <Head title="Finance Dashboard" />
            
            <div className="flex flex-col gap-8 p-4 sm:p-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Finance Overview</h1>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">Revenue tracking and financial reporting.</p>
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

                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                    <h2 className="text-lg font-semibold mb-6">Recent Transactions</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800">
                                    <th className="py-3 font-semibold">Date</th>
                                    <th className="py-3 font-semibold">Description</th>
                                    <th className="py-3 font-semibold">Category</th>
                                    <th className="py-3 font-semibold">Amount</th>
                                    <th className="py-3 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                <tr>
                                    <td className="py-3 text-slate-500">Apr 24, 2026</td>
                                    <td className="py-3 font-medium">Customer Payment #9234</td>
                                    <td className="py-3">Water Bill</td>
                                    <td className="py-3 text-emerald-600 font-bold">
                                        +{formatCurrency(45)}
                                    </td>
                                    <td className="py-3"><span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">Completed</span></td>
                                </tr>
                                <tr>
                                    <td className="py-3 text-slate-500">Apr 23, 2026</td>
                                    <td className="py-3 font-medium">Maintenance Fee</td>
                                    <td className="py-3">Equipment</td>
                                    <td className="py-3 text-rose-600 font-bold">
                                        -{formatCurrency(1200)}
                                    </td>
                                    <td className="py-3"><span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">Pending</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
