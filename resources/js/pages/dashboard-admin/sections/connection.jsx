import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, LayoutGrid, MapPin, Tag } from 'lucide-react';
import { Link } from '@inertiajs/react';

const connectionCards = [
    {
        key: 'totalCustomers',
        title: 'Total Customers',
        icon: Activity,
        bgClass: 'bg-blue-100',
        iconClass: 'text-blue-600',
        href: 'customers.index',
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

export default function ConnectionSection({
    totalCustomers = 0,
    tariffCount = 0,
    zonesCount = 0,
    areasCount = 0,
}) {
    const values = {
        totalCustomers,
        tariffCount,
        zonesCount,
        areasCount,
    };

    function renderCard(card) {
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
                <CardTitle>Connections</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {connectionCards.map((card) => renderCard(card))}
                </div>
            </CardContent>
        </Card>
    );
}
