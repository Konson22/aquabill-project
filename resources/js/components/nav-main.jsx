import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarGroup, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';

export function NavMain({ items = [] }) {
    const page = usePage();

    return (
        <SidebarGroup className="space-y-3 p-0">
            {items.map((item) => {
                const isActive = item.href === page.url;

                // If item has nested items, render as a dropdown
                if (item.items && item.items.length > 0) {
                    const hasActiveChild = item.items.some((subItem) => subItem.href === page.url);

                    return (
                        <SidebarMenuItem key={item.title}>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton
                                        className={`group h-12 w-full justify-between rounded-xl text-sm font-medium transition-all duration-300 ${
                                            hasActiveChild
                                                ? 'border-l-4 border-l-yellow-400 bg-sky-200/80 text-sky-900'
                                                : 'text-sky-700 hover:bg-sky-200/60 hover:text-sky-900'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="relative">
                                                <item.icon
                                                    className={`h-4 w-4 transition-colors ${
                                                        hasActiveChild ? 'text-yellow-600' : 'text-sky-500 group-hover:text-sky-700'
                                                    }`}
                                                />
                                            </div>
                                            <div className="flex flex-col items-start">
                                                <span className="font-semibold">{item.title}</span>
                                                <span className="text-xs text-sky-600 dark:text-sky-500">{item.description}</span>
                                            </div>
                                        </div>
                                        <ChevronDown className="h-4 w-4 text-sky-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-72 rounded-xl border border-sky-200 bg-white shadow-xl backdrop-blur-xl"
                                    align="start"
                                    side="right"
                                    sideOffset={8}
                                >
                                    <div className="p-4">
                                        <div className="mb-4">
                                            <h3 className="text-sm font-bold text-sky-900">{item.title}</h3>
                                            <p className="mt-1 text-xs text-sky-600">{item.description}</p>
                                        </div>
                                        <div className="space-y-1">
                                            {item.items.map((subItem) => (
                                                <DropdownMenuItem key={subItem.title} asChild>
                                                    <Link
                                                        href={subItem.href}
                                                        prefetch
                                                        className={`group flex items-center space-x-3 rounded-lg p-3 transition-all duration-200 ${
                                                            subItem.href === page.url
                                                                ? 'bg-sky-100 text-sky-900'
                                                                : 'text-sky-700 hover:bg-sky-50 hover:text-sky-900'
                                                        }`}
                                                    >
                                                        <subItem.icon
                                                            className={`h-3.5 w-3.5 transition-colors ${
                                                                subItem.href === page.url
                                                                    ? 'text-yellow-600'
                                                                    : 'text-sky-500 group-hover:text-yellow-500'
                                                            }`}
                                                        />
                                                        <div className="flex flex-col items-start">
                                                            <span className="text-sm font-semibold">{subItem.title}</span>
                                                            <span className="text-xs text-sky-600">{subItem.description}</span>
                                                        </div>
                                                    </Link>
                                                </DropdownMenuItem>
                                            ))}
                                        </div>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    );
                }

                // If item is a simple link, render normally
                return (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            tooltip={item.title}
                            className={`group h-12 rounded-xl text-sm font-medium transition-all duration-300 ${
                                isActive
                                    ? 'border-l-4 border-l-yellow-400 bg-sky-200/80 text-sky-900'
                                    : 'text-sky-700 hover:bg-sky-200/60 hover:text-sky-900'
                            }`}
                        >
                            <Link href={item.href} prefetch>
                                <div className="flex items-center space-x-3">
                                    <div className="relative">
                                        <item.icon
                                            className={`h-4 w-4 transition-colors ${
                                                isActive ? 'text-yellow-600' : 'text-sky-500 group-hover:text-sky-700'
                                            }`}
                                        />
                                        {item.badge && (
                                            <div className="absolute -top-1 -right-1 flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-sky-900 shadow-lg ring-2 ring-sky-200">
                                                {item.badge}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="font-semibold">{item.title}</span>
                                        <span className="text-xs text-sky-600 dark:text-sky-500">{item.description}</span>
                                    </div>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                );
            })}
        </SidebarGroup>
    );
}
