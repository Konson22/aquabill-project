import { cn, resolveUrl } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    ClipboardList,
    CreditCard,
    FileText,
    Gauge,
    LayoutGrid,
    MapPin,
    Receipt,
    Shield,
    Tag,
    Users,
} from 'lucide-react';
import { route } from 'ziggy-js';

const adminNavItems = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
        icon: LayoutGrid,
    },
    {
        title: 'General Report',
        href: route('general-report'),
        icon: BarChart3,
    },
    {
        title: 'Customers',
        href: route('customers.index'),
        icon: Users,
    },
    {
        title: 'Billing',
        href: route('bills'),
        icon: Receipt,
    },
    {
        title: 'Payments',
        href: route('payments'),
        icon: CreditCard,
    },
    {
        title: 'Invoices',
        href: route('invoices'),
        icon: FileText,
    },
    {
        title: 'Meters',
        href: route('meters'),
        icon: Gauge,
    },
    {
        title: 'Meter Readings',
        href: route('meter-readings'),
        icon: ClipboardList,
    },
    {
        title: 'Zones',
        href: route('zones.index'),
        icon: MapPin,
    },
    {
        title: 'Tariff',
        href: route('tariffs.index'),
        icon: Tag,
    },
    {
        title: 'Users',
        href: route('users.index'),
        icon: Shield,
    },
];

const financeNavItems = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
        icon: LayoutGrid,
    },
    {
        title: 'Bills',
        href: route('bills'),
        icon: Receipt,
    },
    {
        title: 'Invoices',
        href: route('invoices'),
        icon: FileText,
    },
    {
        title: 'Payments',
        href: route('payments'),
        icon: CreditCard,
    },
    {
        title: 'Customers',
        href: route('customers.index'),
        icon: Users,
    },
    {
        title: 'Tariff',
        href: route('tariffs.index'),
        icon: Tag,
    },
];

const metersNavItems = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
        icon: LayoutGrid,
    },
    {
        title: 'Meters',
        href: route('meters'),
        icon: Gauge,
    },
    {
        title: 'Meter Readings',
        href: route('meter-readings'),
        icon: ClipboardList,
    },
    {
        title: 'Zones',
        href: route('zones.index'),
        icon: MapPin,
    },
];

function NavSection({ items, label }) {
    const page = usePage();

    return (
        <div className="space-y-1">
            {label && (
                <p className="px-3 py-2 text-xs font-semibold tracking-wider text-primary-foreground/70 uppercase">
                    {label}
                </p>
            )}
            <nav className="space-y-0.5 px-2">
                {items.map((item) => {
                    const isActive = page.url.startsWith(resolveUrl(item.href));
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.title}
                            href={item.href}
                            prefetch
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-primary-foreground/20 text-primary-foreground'
                                    : 'text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground',
                            )}
                        >
                            <Icon className="h-4 w-4 shrink-0" />
                            <span>{item.title}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}

export default function AdminSidebar() {
    const { auth } = usePage().props;
    const user = auth?.user;

    const items =
        user?.department === 'admin'
            ? adminNavItems
            : user?.department === 'finance'
              ? financeNavItems
              : user?.department === 'meters'
                ? metersNavItems
                : adminNavItems;

    const label =
        user?.department === 'admin'
            ? 'Admin'
            : user?.department === 'finance'
              ? 'Finance'
              : user?.department === 'meters'
                ? 'Meters'
                : 'Navigation';

    return (
        <aside className="flex w-56 shrink-0 flex-col border-r border-primary-foreground/20 bg-primary">
            <Link
                href={route('dashboard')}
                className="flex shrink-0 items-center gap-2 px-4 py-4 text-primary-foreground transition-opacity hover:opacity-80"
            >
                <div className="p-.5 rounded-md bg-white">
                    <img
                        src="/logo.png"
                        alt="Aquabill"
                        className="object- h-9 w-12"
                    />
                </div>
                <span className="font-bold">SSUWC Billing</span>
            </Link>
            <div className="flex-1 py-4">
                <NavSection items={items} label={label} />
            </div>
        </aside>
    );
}
