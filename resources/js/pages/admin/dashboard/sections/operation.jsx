import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Users, ZapOff } from 'lucide-react';
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
];

export default function Operation({
    activeCustomers = 0,
    suspendedCustomers = 0,
    damageMeters = 0,
}) {
    const values = {
        activeCustomers,
        suspendedCustomers,
        damageMeters,
    };

    function renderStatCard(card) {
        const Icon = card.icon;
        const value = values[card.key];
        const content = (
            <Card className="group flex flex-col items-center justify-center space-y-3 rounded-xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg">
                <CardContent className="flex flex-col items-center space-y-3 p-0">
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
                </CardContent>
            </Card>
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
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {operationCards.map((card) => renderStatCard(card))}
                </div>
            </CardContent>
        </Card>
    );
}
