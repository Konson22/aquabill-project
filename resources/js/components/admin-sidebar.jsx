import { cn, resolveUrl } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Banknote,
    ClipboardList,
    CreditCard,
    FileText,
    Gauge,
    LayoutGrid,
    MapPin,
    PanelLeftClose,
    PanelLeft,
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
        title: 'Meter Readings',
        href: route('meter-readings'),
        icon: ClipboardList,
    },
    {
        title: 'Meters',
        href: route('meters'),
        icon: Gauge,
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
        title: 'Billing',
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

function NavSection({ items, label, collapsed, onLinkClick }) {
    const page = usePage();

    return (
        <div className="space-y-1">
            {label && !collapsed && (
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
                            title={collapsed ? item.title : undefined}
                            onClick={onLinkClick}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                collapsed && 'justify-center px-2',
                                isActive
                                    ? 'bg-primary-foreground/20 text-primary-foreground'
                                    : 'text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground',
                            )}
                        >
                            <Icon className="h-4 w-4 shrink-0" />
                            {!collapsed && <span>{item.title}</span>}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}

export default function AdminSidebar({
    mobileOpen = false,
    onMobileClose,
    collapsed = false,
    onCollapsedChange,
}) {
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

    const sidebarContent = (
        <>
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-primary-foreground/20 px-2 py-3">
                <Link
                    href={route('dashboard')}
                    onClick={onMobileClose}
                    className={cn(
                        'flex items-center gap-2 text-primary-foreground transition-opacity hover:opacity-80',
                        collapsed && 'justify-center px-2',
                    )}
                >
                    <div className="shrink-0 rounded-md bg-white p-0.5">
                        <img
                            src="/logo.png"
                            alt="Aquabill"
                            className="h-9 w-12 object-contain"
                        />
                    </div>
                    {!collapsed && (
                            <p className="font-">SSUWC </p>
                    )}
                </Link>
                {!collapsed && (
                    <button
                        type="button"
                        onClick={onCollapsedChange}
                        className="hidden shrink-0 rounded-lg p-1.5 text-primary-foreground/80 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground sm:block"
                        title="Toggle sidebar"
                        aria-label="Toggle sidebar"
                    >
                        <PanelLeftClose className="h-5 w-5" />
                    </button>
                )}
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <NavSection
                    items={items}
                    collapsed={collapsed}
                    onLinkClick={onMobileClose}
                />
            </div>
            {collapsed && (
                <div className="shrink-0 border-t border-primary-foreground/20 px-2 py-2">
                    <button
                        type="button"
                        onClick={onCollapsedChange}
                        className="flex w-full items-center justify-center rounded-lg p-2 text-primary-foreground/80 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
                        title="Expand sidebar"
                        aria-label="Expand sidebar"
                    >
                        <PanelLeft className="h-5 w-5" />
                    </button>
                </div>
            )}
        </>
    );

    return (
        <>
            {/* Mobile backdrop */}
            <div
                className={cn(
                    'fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden',
                    mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
                )}
                onClick={onMobileClose}
                onKeyDown={(e) => e.key === 'Escape' && onMobileClose?.()}
                aria-hidden
            />

            {/* Sidebar: overlay on mobile, inline on desktop */}
            <aside
                className={cn(
                    'flex shrink-0 flex-col border-r border-primary-foreground/20 bg-sky-800 transition-[width,transform] duration-200 ease-out',
                    'md:relative md:translate-x-0',
                    collapsed ? 'md:w-16' : 'md:w-56',
                    mobileOpen
                        ? 'fixed inset-y-0 left-0 z-50 w-56 translate-x-0'
                        : 'fixed inset-y-0 left-0 z-50 w-56 -translate-x-full md:relative md:translate-x-0 md:flex',
                )}
            >
                {sidebarContent}
            </aside>
        </>
    );
}
