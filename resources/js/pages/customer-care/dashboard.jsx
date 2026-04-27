import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { MessageSquare, Phone, CheckCircle, Clock } from 'lucide-react';

const stats = [
    { name: 'Total Complaints', value: '1,284', icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Resolved Today', value: '24', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: 'Pending Calls', value: '5', icon: Phone, color: 'text-purple-600', bg: 'bg-purple-100' },
    { name: 'Avg. Response', value: '14m', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
];

export default function CustomerCareDashboard() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Customer Care Dashboard', href: '/customer-care' }]}>
            <Head title="Customer Care Dashboard" />
            
            <div className="flex flex-col gap-8 p-4 sm:p-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Customer Support</h1>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">Handle complaints and customer inquiries.</p>
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
                    <h2 className="text-lg font-semibold mb-6">Recent Tickets</h2>
                    <div className="space-y-4">
                        {[
                            { id: '#TK-2034', user: 'Alice W.', topic: 'High Bill Inquiry', status: 'In Progress', priority: 'High' },
                            { id: '#TK-2035', user: 'Bob M.', topic: 'Meter Leakage', status: 'Pending', priority: 'Urgent' },
                            { id: '#TK-2036', user: 'Charlie D.', topic: 'Payment Verification', status: 'Resolved', priority: 'Low' },
                        ].map((ticket) => (
                            <div key={ticket.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                                        {ticket.user[0]}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">{ticket.topic}</p>
                                        <p className="text-xs text-slate-500">{ticket.user} • {ticket.id}</p>
                                    </div>
                                </div>
                                <div className="text-right flex items-center gap-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        ticket.priority === 'Urgent' ? 'bg-rose-100 text-rose-700' : 
                                        ticket.priority === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                                    }`}>
                                        {ticket.priority}
                                    </span>
                                    <span className="text-sm font-medium text-slate-900 dark:text-white">{ticket.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
