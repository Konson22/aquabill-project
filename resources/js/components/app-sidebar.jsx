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
    Settings,
    GraduationCap,
    PieChart,
    Droplets,
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
            { title: 'Revenue', url: route('reports.revenue'), icon: CreditCard },
            { title: 'Water usage', url: route('reports.water-usage'), icon: Droplets },
            { title: 'Customers', url: route('customers.index'), icon: Users },
            { title: 'Meter Readings', url: route('readings.index'), icon: MapPin },
            { title: 'Bills', url: route('bills.index'), icon: FileText },
            { title: 'Service Charges', url: route('service-charges.index'), icon: CreditCard },
            { title: 'Tariffs', url: route('tariffs.index'), icon: BookOpen },
            { title: 'Meters', url: route('meters.index'), icon: MapPin },
            { title: 'Zones', url: route('zones.index'), icon: MapPin },
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
            { title: 'Revenue', url: route('reports.revenue'), icon: CreditCard },
            { title: 'Water usage', url: route('reports.water-usage'), icon: Droplets },
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
            { title: 'HR Home', url: route('hr'), icon: LayoutGrid },
            { title: 'Departments', url: route('hr.departments.index'), icon: Store },
            { title: 'Staff', url: route('hr.staff.index'), icon: Users },
            { title: 'Attendance', url: route('hr.attendance.index'), icon: Clock },
            { title: 'Leave', url: route('hr.leave.index'), icon: Calendar },
            { title: 'Payroll', url: route('hr.payroll.index'), icon: CreditCard },
            { title: 'Documents', url: route('hr.documents.index'), icon: FileText },
            { title: 'Training', url: route('hr.training.programs.index'), icon: GraduationCap },
            { title: 'Training reports', url: route('hr.training.reports.index'), icon: PieChart },
            { title: 'Reports', url: route('hr.reports.index'), icon: BookOpen },
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
