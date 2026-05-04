import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { Link, usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Droplets, FileText, LayoutGrid, Menu, Search, Users, Settings, Folder, BookOpen, Clock } from 'lucide-react';
import AppLogo from './app-logo';
import AppLogoIcon from './app-logo-icon';

const getNavItems = (department) => {
    const items = [
        { title: 'Dashboard', url: route('dashboard'), icon: LayoutGrid }
    ];

    if (department === 'admin') {
        items.push(
            { title: 'Users', url: route('users.index'), icon: Users },
            { title: 'Roles', url: route('roles.index'), icon: Settings },
            { title: 'Departments', url: route('departments.index'), icon: Folder }
        );
    } else if (department === 'finance') {
        items.push(
            { title: 'Revenue', url: '#', icon: FileText },
            { title: 'Invoices', url: '#', icon: FileText }
        );
    } else if (department === 'ledger') {
        items.push(
            { title: 'Meter Readings', url: '#', icon: Droplets },
            { title: 'Billing Cycles', url: '#', icon: FileText }
        );
    } else if (department === 'hr') {
        items.push(
            { title: 'HR Home', url: route('hr'), icon: LayoutGrid },
            { title: 'Staff', url: route('hr.staff.index'), icon: Users },
            { title: 'Attendance', url: route('hr.attendance.index'), icon: Clock },
            { title: 'Leave', url: route('hr.leave.index'), icon: FileText }
        );
    } else if (department === 'customer_care') {
        items.push(
            { title: 'Complaints', url: '#', icon: FileText },
            { title: 'Tickets', url: '#', icon: Clock }
        );
    }

    return items;
};

const rightNavItems = [
    {
        title: 'Help',
        url: '#',
        icon: BookOpen,
    },
];

const activeItemStyles = 'text-blue-600 bg-white/10 dark:bg-blue-600/10 dark:text-blue-500';

export function AppHeader({ breadcrumbs = [] }) {
    const page = usePage();
    const { auth } = page.props;
    const userDepartment = auth.user?.department?.name || 'admin';
    const mainNavItems = getNavItems(userDepartment);
    const getInitials = useInitials();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black backdrop-blur-lg">
            <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">
                {/* Mobile Menu */}
                <div className="lg:hidden text-white">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="mr-2 h-[34px] w-[34px] text-white hover:text-blue-500">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex h-full w-64 flex-col items-stretch justify-between bg-black text-white border-white/10">
                            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                            <SheetHeader className="flex justify-start text-left border-b border-white/10 pb-4">
                                <AppLogoIcon className="h-6 w-6 fill-current text-blue-600" />
                            </SheetHeader>
                            <div className="mt-6 flex h-full flex-1 flex-col space-y-4">
                                <div className="flex h-full flex-col justify-between text-sm">
                                    <div className="flex flex-col space-y-4">
                                        {mainNavItems.map((item) => (
                                            <Link key={item.title} href={item.url} className="flex items-center space-x-2 font-medium hover:text-blue-500">
                                                {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                                <span>{item.title}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                <Link href="/dashboard" prefetch className="flex items-center space-x-2 mr-6">
                    <AppLogo />
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden h-full items-center space-x-4 lg:flex">
                    <NavigationMenu className="flex h-full items-stretch">
                        <NavigationMenuList className="flex h-full items-stretch space-x-1">
                            {mainNavItems.map((item, index) => (
                                <NavigationMenuItem key={index} className="relative flex h-full items-center">
                                    <Link
                                        href={item.url}
                                        className={cn(
                                            navigationMenuTriggerStyle(),
                                            page.url === item.url ? "text-blue-500 bg-white/5" : "text-white opacity-80 hover:opacity-100 hover:text-blue-400",
                                            'h-9 cursor-pointer px-3 bg-transparent',
                                        )}
                                    >
                                        {item.icon && <Icon iconNode={item.icon} className="mr-2 h-4 w-4" />}
                                        {item.title}
                                    </Link>
                                    {page.url === item.url && (
                                        <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-blue-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]"></div>
                                    )}
                                </NavigationMenuItem>
                            ))}
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                <div className="ml-auto flex items-center space-x-2">
                    <div className="relative flex items-center space-x-1">
                        <Button variant="ghost" size="icon" className="group h-9 w-9 cursor-pointer text-white hover:text-blue-500">
                            <Search className="!size-5 opacity-80 group-hover:opacity-100" />
                        </Button>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="size-10 rounded-full p-1 border-2 border-transparent hover:border-blue-600 transition-all">
                                <Avatar className="size-8 overflow-hidden rounded-full ring-2 ring-blue-600/20 group-hover:ring-blue-600">
                                    <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                    <AvatarFallback className="rounded-lg bg-blue-600 text-white font-bold">
                                        {getInitials(auth.user.name)}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end">
                            <UserMenuContent user={auth.user} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            {breadcrumbs.length > 1 && (
                <div className="flex bg-white w-full border-t border-neutral-100 bg-transparent">
                    <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-neutral-500 md:max-w-7xl font-bold text-xs uppercase tracking-widest">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </header>
    );
}
