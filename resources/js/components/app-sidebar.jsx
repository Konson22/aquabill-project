import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
} from '@/components/ui/sidebar';
import { usePage } from '@inertiajs/react';
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
        icon: FileText,
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
        icon: FileText,
    },
];

const metersNavItems = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
        icon: LayoutGrid,
    },
    {
        title: 'Customers',
        href: route('dashboard-meter-department.customers.index'),
        icon: Users,
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

export function AppSidebar() {
    const { auth } = usePage().props;
    const user = auth.user;

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="bg-sidebar pt-20 text-white"
        >
            <SidebarContent>
                {/* <NavMain items={dashboardItems} label="Platform" /> */}
                {user && user.department === 'admin' && (
                    <NavMain items={adminNavItems} label="Admin Department" />
                )}
                {user && user.department === 'finance' && (
                    <NavMain items={financeNavItems} label="" />
                )}
                {user && user.department === 'meters' && (
                    <NavMain items={metersNavItems} label="Meters Department" />
                )}
            </SidebarContent>

            <SidebarFooter>{/* <NavUser /> */}</SidebarFooter>
        </Sidebar>
    );
}
