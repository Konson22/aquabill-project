import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { UserMenuContent } from '@/components/user-menu-content';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePage } from '@inertiajs/react';
import { ChevronsUpDown, Crown, User } from 'lucide-react';

export function NavUser() {
    const { auth } = usePage().props;
    const { state } = useSidebar();
    const isMobile = useIsMobile();

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="group h-16 rounded-xl border-t border-slate-700/60 text-slate-200 transition-all duration-300 hover:bg-gradient-to-r hover:from-slate-700 hover:to-slate-600 hover:shadow-md dark:border-slate-700/60"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <div className="rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-2.5 shadow-lg transition-all duration-300 group-hover:shadow-xl">
                                        <User className="h-4 w-4 text-white" />
                                    </div>
                                    <div className="absolute -top-1 -right-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 p-0.5">
                                        <Crown className="h-2 w-2 text-white" />
                                    </div>
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-sm font-bold">{auth.user.name}</span>
                                    <span className="text-xs font-medium text-slate-300 dark:text-slate-400">Administrator</span>
                                </div>
                                <ChevronsUpDown className="ml-auto h-4 w-4 text-slate-400 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                            </div>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-64 rounded-xl border border-slate-200/60 bg-white/95 shadow-xl backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/95"
                        align="end"
                        side={isMobile ? 'bottom' : state === 'collapsed' ? 'left' : 'bottom'}
                        sideOffset={8}
                    >
                        <UserMenuContent user={auth.user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
