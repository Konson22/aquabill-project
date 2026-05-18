import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    Store,
    Users,
    FileText,
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
    BarChart3,
    Globe2,
    Beaker,
    FlaskConical,
    Warehouse,
    FilePlus2,
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
            { title: 'Revenue report', url: route('revenue-report.index'), icon: PieChart },
            { title: 'Payments', url: route('payments-report.index'), icon: CreditCard },
            { title: 'Water report', url: route('water-report.index'), icon: Droplets },
            { title: 'Customers', url: route('customers.index'), icon: Users },
            { title: 'Connection requests', url: route('connection-requests.index'), icon: FilePlus2 },
            { title: 'Meter Readings', url: route('readings.index'), icon: MapPin },
            { title: 'Bills', url: route('bills.index'), icon: FileText },
            { title: 'Service Charges', url: route('service-charges.index'), icon: CreditCard },
            { title: 'Tariffs', url: route('tariffs.index'), icon: BookOpen },
            { title: 'Meters', url: route('meters.index'), icon: MapPin },
            { title: 'Zones', url: route('zones.index'), icon: MapPin },
            { title: 'GIS', url: route('gis.dashboard'), icon: Globe2 },
            { title: 'System Settings', url: route('admin.settings'), icon: Settings }
        ];
    }

    if (department === 'admin') {
        items.push(
            { title: 'Customers', url: route('customers.index'), icon: Users },
            { title: 'Connection requests', url: route('connection-requests.index'), icon: FilePlus2 },
            { title: 'Zones', url: route('zones.index'), icon: MapPin },
            { title: 'GIS', url: route('gis.dashboard'), icon: Globe2 },
            { title: 'Tariffs', url: route('tariffs.index'), icon: BookOpen },
            { title: 'Bills', url: route('bills.index'), icon: FileText },
            { title: 'Service Charges', url: route('service-charges.index'), icon: CreditCard },
            { title: 'System Logs', url: '#', icon: FileText },
            { title: 'System Settings', url: route('admin.settings'), icon: Settings }
        );
    } else if (department === 'finance') {
        items.push(
            { title: 'Tariffs', url: route('tariffs.index'), icon: BookOpen },
            { title: 'Revenue report', url: route('revenue-report.index'), icon: BarChart3 },
            { title: 'Payments', url: route('payments-report.index'), icon: CreditCard },
            { title: 'Bills', url: route('bills.index'), icon: FileText },
            { title: 'Service Charges', url: route('service-charges.index'), icon: CreditCard },

        );
    } else if (department === 'ledger') {
        items.push(
            { title: 'Customers', url: route('customers.index'), icon: Users },
            { title: 'Meters', url: route('meters.index'), icon: MapPin },
            { title: 'Meter Readings', url: route('readings.index'), icon: MapPin },
            { title: 'Zones', url: route('zones.index'), icon: MapPin },
            { title: 'GIS', url: route('gis.dashboard'), icon: Globe2 },
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
            { title: 'Connection requests', url: route('connection-requests.index'), icon: FilePlus2 },
            { title: 'Complaints', url: '#', icon: FileText },
            { title: 'Tickets', url: '#', icon: Clock }
        );
    } else if (department === 'distribution') {
        items.push(
            { title: 'Zones', url: route('zones.index'), icon: MapPin },
            { title: 'GIS', url: route('gis.dashboard'), icon: Globe2 }
        );
    } else if (department === 'water_quality') {
        items.push({ title: 'Department home', url: route('water-quality'), icon: Beaker });
    } else if (department === 'water_purification') {
        items.push({ title: 'Department home', url: route('water-purification'), icon: FlaskConical });
    } else if (department === 'stores') {
        items.push({ title: 'Department home', url: route('stores'), icon: Warehouse });
    }

    return items;
};

export function AppSidebar() {
    const { auth } = usePage().props;
    const mainNavItems = getNavItems(auth.user);

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
