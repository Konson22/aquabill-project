import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    Calculator,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    DollarSign,
    Droplets,
    FileText,
    Home,
    Receipt,
    UserCheck,
    Users,
} from 'lucide-react';
import { useState } from 'react';

const allNavItems = [
    {
        title: 'Dashboard',
        href: '/',
        icon: Home,
        description: 'Overview and analytics',
        key: 'dashboard',
    },
    {
        title: 'Customers',
        href: '/customers',
        icon: Users,
        description: 'Customer management',
        key: 'customers',
    },
    {
        title: 'Finance',
        href: '/finance',
        icon: DollarSign,
        description: 'overview and management',
        key: 'finance',
    },
    {
        title: 'Bills',
        href: '/billing',
        icon: FileText,
        description: 'Water bill management',
        key: 'bills',
    },
    {
        title: 'Invoices',
        href: '/invoices',
        icon: Receipt,
        description: 'Invoice management',
        key: 'invoices',
    },
    {
        title: 'Payments',
        href: '/payments',
        icon: CreditCard,
        description: 'Payment processing',
        key: 'payments',
    },
    {
        title: 'Meters',
        href: '/meters',
        icon: Droplets,
        description: 'Water meter management',
        key: 'meters',
    },
    {
        title: 'Readings',
        href: '/readings',
        icon: Activity,
        description: 'Meter readings',
        key: 'readings',
    },
    {
        title: 'Tariffs',
        href: '/categories',
        icon: Calculator,
        description: 'Pricing structures',
        key: 'tariffs',
    },
    {
        title: 'Users',
        href: '/users',
        icon: UserCheck,
        description: 'User management',
        key: 'users',
    },
    // {
    //     title: 'Inventory',
    //     href: '/inventory',
    //     icon: Package,
    //     description: 'Inventory management',
    // },
];

export function AppSidebar({ onCollapseChange }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [hoveredItem, setHoveredItem] = useState(null);
    const page = usePage();
    const { auth } = page.props;

    // Filter navigation items based on user department
    const userDepartment = auth.user?.department?.name;
    const filteredNavItems = allNavItems.filter((item) => {
        // Always show dashboard
        if (item.key === 'dashboard') return true;

        // For Billing department, hide Finance, Categories & Tariffs, Users Management, Invoices, and Payments
        // Only show Bills, Customers, Meters, and Readings
        if (userDepartment === 'Billing') {
            if (item.key === 'finance' || item.key === 'tariffs' || item.key === 'users' || item.key === 'invoices' || item.key === 'payments')
                return false;
        }

        // For Finance department, hide Users Management
        // Show all financial items including Bills, Invoices, and Payments
        if (userDepartment === 'Finance') {
            if (item.key === 'users') return false;
        }

        // For other departments, show all items (or implement more specific logic)
        return true;
    });

    const toggleSidebar = () => {
        const newCollapsedState = !isCollapsed;
        setIsCollapsed(newCollapsedState);
        if (onCollapseChange) {
            onCollapseChange(newCollapsedState);
        }
    };

    return (
        <div
            className={`fixed top-0 left-0 z-[60] h-screen overflow-hidden bg-gradient-to-b from-[#2975a1] to-[#1e3a5f] text-white shadow-xl transition-all duration-300 ease-in-out ${
                isCollapsed ? 'w-16' : 'w-48'
            }`}
        >
            {/* Header */}
            <div className="flex h-16 items-center justify-between border-b border-[#3d6b9a]/50 bg-[#2975a1]/90 px-4 backdrop-blur-sm">
                {!isCollapsed && (
                    <div className="flex items-center space-x-2">
                        <div className="flex h-8 w-9 items-center justify-center overflow-hidden rounded-xl bg-white shadow-lg ring-2 ring-[#b3d9f2]">
                            <img src="/logo.jpg" className="h-full w-full text-[#2975a1]" />
                        </div>
                        <span className="text-lg font-bold text-white">AquaBill</span>
                    </div>
                )}
                <button
                    onClick={toggleSidebar}
                    className="rounded-md p-1.5 transition-all duration-200 hover:bg-[#2d5a8a] hover:shadow-md active:scale-95"
                    title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </button>
            </div>

            {/* Navigation Items - Fixed height container */}
            <nav className="h-[calc(100vh-4rem)] overflow-hidden px-2">
                <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#3d6b9a]/50 hover:scrollbar-thumb-[#3d6b9a]/70 h-full overflow-y-auto">
                    <div className="py-4">
                        {filteredNavItems.map((item) => {
                            const isActive = item.href === page.url;

                            return (
                                <div
                                    key={item.title}
                                    className="relative mb-1"
                                    onMouseEnter={() => setHoveredItem(item.title)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                >
                                    <Link
                                        href={item.href}
                                        className={`group flex items-center rounded-lg px-3 py-2 transition-all duration-200 ${
                                            isActive
                                                ? 'scale-[1.02] transform border border-[#3d6b9a] bg-gradient-to-r from-[#2975a1] to-[#2d5a8a] text-white shadow-lg ring-2 ring-[#b3d9f2]'
                                                : 'text-[#e8f4fd] hover:bg-[#b3d9f2] hover:text-[#1e3a5f] hover:shadow-md'
                                        }`}
                                    >
                                        <div className="flex h-6 w-6 items-center justify-center">
                                            <item.icon
                                                className={`h-5 w-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
                                            />
                                        </div>

                                        {!isCollapsed && (
                                            <div className="ml-3 flex-1 overflow-hidden">
                                                <div className="flex items-center justify-between">
                                                    <span className="truncate text-sm font-medium">{item.title}</span>
                                                    {item.badge && (
                                                        <span className="ml-2 rounded-full bg-yellow-400 px-2 py-1 text-xs font-bold text-[#1e3a5f] shadow-sm">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </Link>

                                    {/* Tooltip for collapsed state */}
                                    {isCollapsed && hoveredItem === item.title && (
                                        <div className="animate-in slide-in-from-left-2 absolute top-0 left-full z-[70] ml-2 w-48 rounded-lg border border-[#3d6b9a] bg-[#1e3a5f] text-white shadow-xl duration-200">
                                            <div className="p-3">
                                                <div className="text-sm font-medium">{item.title}</div>
                                            </div>
                                            <div className="absolute top-1/2 left-0 h-2 w-2 -translate-x-1 -translate-y-1/2 rotate-45 transform bg-[#1e3a5f]"></div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </nav>
        </div>
    );
}
