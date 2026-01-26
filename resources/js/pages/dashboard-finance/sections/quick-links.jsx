import { Card } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import {
    ArrowUpRight,
    FileBarChart,
    FilePieChart,
    FileSpreadsheet,
} from 'lucide-react';

export default function QuickLinks() {
    const links = [
        {
            title: 'Payment Reports',
            description: 'View settlement trends, tariff revenue, and zone.',
            icon: FileBarChart,
            href: route('payments.report'),
            bgColor: 'bg-blue-500',
            iconBg: 'bg-blue-400/30',
            iconColor: 'text-white',
            borderColor: 'hover:border-blue-300',
            shadowColor: 'group-hover:shadow-blue-500/25',
        },
        {
            title: 'Meter Reading Reports',
            description: 'Analyze consumption patterns by tariff and zone.',
            icon: FilePieChart,
            href: route('meter-readings.report'),
            bgColor: 'bg-emerald-500',
            iconBg: 'bg-emerald-400/30',
            iconColor: 'text-white',
            borderColor: 'hover:border-emerald-300',
            shadowColor: 'group-hover:shadow-emerald-500/25',
        },
        {
            title: 'Billing Reports',
            description: 'Track billing performance, paid vs unpaid trends.',
            icon: FileSpreadsheet,
            href: route('bills.report'),
            bgColor: 'bg-amber-500',
            iconBg: 'bg-amber-400/30',
            iconColor: 'text-white',
            borderColor: 'hover:border-amber-300',
            shadowColor: 'group-hover:shadow-amber-500/25',
        },
    ];

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold tracking-tight text-foreground/90">
                    Quick Reports
                </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {links.map((link) => (
                    <Link key={link.title} href={link.href} className="group">
                        <Card
                            className={`relative flex min-h-[110px] flex-col justify-between overflow-hidden border-border/10 ${link.bgColor} p-4 transition-all duration-500 hover:shadow-2xl ${link.shadowColor} hover:-translate-y-1 ${link.borderColor}`}
                        >
                            {/* Decorative Background Icon */}
                            <div className="absolute -top-4 -right-4 opacity-10 transition-transform duration-700 group-hover:scale-125 group-hover:rotate-12">
                                <link.icon className="h-24 w-24 text-white" />
                            </div>

                            <div className="relative flex items-start justify-between">
                                <div
                                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${link.iconBg} backdrop-blur-md transition-transform duration-300 group-hover:scale-110`}
                                >
                                    <link.icon
                                        className={`h-5 w-5 ${link.iconColor}`}
                                    />
                                </div>
                                <ArrowUpRight className="h-4 w-4 text-white/30 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white" />
                            </div>

                            <div className="relative mt-auto pt-4">
                                <h4 className="text-[13px] font-bold tracking-tight text-white">
                                    {link.title}
                                </h4>
                                <p className="mt-1 line-clamp-1 text-[11px] leading-relaxed text-white/70">
                                    {link.description}
                                </p>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </section>
    );
}
