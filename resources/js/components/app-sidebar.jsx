import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import { 
    LayoutGrid, 
    Store, 
    Users, 
    FileText, 
    ShoppingCart, 
    Package, 
    CreditCard, 
    Clock, 
    MapPin,
    Bed,
    Calendar,
    LogOut,
    BookOpen,
    Settings
} from 'lucide-react';
import AppLogo from './app-logo';

const getNavItems = (user) => {
    const department = user?.department?.name || 'admin';
    const isAdmin = user?.email === 'admin@gmail.com';

    const items = [
        { title: 'Dashboard', url: route('dashboard'), icon: LayoutGrid }
    ];

    // System Admin sees everything
    if (isAdmin) {
        return [
            ...items,
            { title: 'User Management', url: route('users.index'), icon: Users },
            { title: 'Customers', url: route('customers.index'), icon: Users },
            { title: 'Zones', url: route('zones.index'), icon: MapPin },
            { title: 'Meters', url: route('meters.index'), icon: MapPin },
            { title: 'Meter Readings', url: route('readings.index'), icon: MapPin },
            { title: 'Bills', url: route('bills.index'), icon: FileText },
            { title: 'Service Charges', url: route('service-charges.index'), icon: CreditCard },
            { title: 'Tariffs', url: route('tariffs.index'), icon: BookOpen },
            { title: 'Staff List', url: '#', icon: Users },
            { title: 'Revenue', url: '#', icon: CreditCard },
            { title: 'System Logs', url: '#', icon: FileText },
            { title: 'System Settings', url: route('admin.settings'), icon: Settings }
        ];
    }

    if (department === 'admin') {
        items.push(
            { title: 'User Management', url: route('users.index'), icon: Users },
            { title: 'Customers', url: route('customers.index'), icon: Users },
            { title: 'Zones', url: route('zones.index'), icon: MapPin },
            { title: 'Tariffs', url: route('tariffs.index'), icon: BookOpen },
            { title: 'Bills', url: route('bills.index'), icon: FileText },
            { title: 'Service Charges', url: route('service-charges.index'), icon: CreditCard },
            { title: 'System Logs', url: '#', icon: FileText },
            { title: 'System Settings', url: route('admin.settings'), icon: Settings }
        );
    } else if (department === 'finance') {
        items.push(
            { title: 'Tariffs', url: route('tariffs.index'), icon: BookOpen },
            { title: 'Revenue', url: '#', icon: CreditCard },
            { title: 'Bills', url: route('bills.index'), icon: FileText },
            { title: 'Service Charges', url: route('service-charges.index'), icon: CreditCard }
        );
    } else if (department === 'ledger') {
        items.push(
            { title: 'Zones', url: route('zones.index'), icon: MapPin },
            { title: 'Meters', url: route('meters.index'), icon: MapPin },
            { title: 'Meter Readings', url: route('readings.index'), icon: MapPin },
            { title: 'Billing Cycles', url: '#', icon: Calendar }
        );
    } else if (department === 'hr') {
        items.push(
            { title: 'Staff List', url: '#', icon: Users },
            { title: 'Attendance', url: '#', icon: Clock }
        );
    } else if (department === 'customer_care') {
        items.push(
            { title: 'Customers', url: route('customers.index'), icon: Users },
            { title: 'Complaints', url: '#', icon: FileText },
            { title: 'Tickets', url: '#', icon: Clock }
        );
    }

    return items;
};

export function AppSidebar() {
    const { auth } = usePage().props;
    const mainNavItems = getNavItems(auth.user);

    const footerNavItems = [
        {
            title: 'Help Center',
            url: '#',
            icon: BookOpen,
        }
    ];

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={route('dashboard')}>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

        </Sidebar>
    );
}
