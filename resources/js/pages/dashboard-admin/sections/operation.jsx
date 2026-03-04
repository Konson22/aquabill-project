import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertTriangle, Droplets, MapPin, LayoutGrid, Tag, Users, ZapOff } from 'lucide-react';
import { Link } from '@inertiajs/react';

const operationCards = [
    {
        key: 'activeCustomers',
        title: 'Active Customers',
        icon: Users,
        bgClass: 'bg-emerald-100',
        iconClass: 'text-emerald-600',
        href: 'customers.index',
    },
    {
        key: 'totalCustomers',
        title: 'Total Customers',
        icon: Activity,
        bgClass: 'bg-blue-100',
        iconClass: 'text-blue-600',
        href: 'customers.index',
    },
    {
        key: 'suspendedCustomers',
        title: 'Suspended Customers',
        icon: ZapOff,
        bgClass: 'bg-orange-100',
        iconClass: 'text-orange-600',
    },
    {
        key: 'damageMeters',
        title: 'Damage Meters',
        icon: AlertTriangle,
        bgClass: 'bg-red-100',
        iconClass: 'text-red-600',
    },
    {
        key: 'consumption',
        title: 'Consumption (YTD)',
        icon: Droplets,
        bgClass: 'bg-cyan-100',
        iconClass: 'text-cyan-600',
    },
    {
        key: 'tariffCount',
        title: 'Tariffs',
        icon: Tag,
        bgClass: 'bg-violet-100',
        iconClass: 'text-violet-600',
        href: 'tariffs.index',
    },
    {
        key: 'zonesCount',
        title: 'Zones',
        icon: MapPin,
        bgClass: 'bg-sky-100',
        iconClass: 'text-sky-600',
        href: 'zones.index',
    },
    {
        key: 'areasCount',
        title: 'Areas',
        icon: LayoutGrid,
        bgClass: 'bg-teal-100',
        iconClass: 'text-teal-600',
    },
];

function formatConsumption(value) {
    if (value == null || Number.isNaN(value)) return '0';
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return String(Math.round(value));
}

export default function Operation({
    activeCustomers = 0,
    totalCustomers = 0,
    suspendedCustomers = 0,
    damageMeters = 0,
    consumption = 0,
    tariffCount = 0,
    zonesCount = 0,
    areasCount = 0,
}) {
    const values = {
        activeCustomers,
        totalCustomers,
        suspendedCustomers,
        damageMeters,
        consumption: formatConsumption(consumption),
        tariffCount,
        zonesCount,
        areasCount,
    };

    function renderStatCard(card) {
        const Icon = card.icon;
        const value = values[card.key];
        const content = (
            <div className="flex flex-col items-center justify-center space-y-3 rounded-xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg">
                <div
                    className={`rounded-2xl p-3 transition-transform duration-300 group-hover:scale-110 ${card.bgClass}`}
                >
                    <Icon className={`h-6 w-6 ${card.iconClass}`} />
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{value}</p>
                    <p className="text-xs font-medium text-muted-foreground">
                        {card.title}
                    </p>
                </div>
            </div>
        );
        return card.href ? (
            <Link
                key={card.key}
                href={route(card.href)}
                className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-xl"
            >
                {content}
            </Link>
        ) : (
            <div key={card.key}>{content}</div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Operation</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
                    {operationCards.map((card) => renderStatCard(card))}
                </div>
            </CardContent>
        </Card>
    );
}
