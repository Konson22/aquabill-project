import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { usePage } from '@inertiajs/react';
import { ChevronsUpDown } from 'lucide-react';

export function AppSidebarHeader({ breadcrumbs = [] }) {
    const { auth } = usePage().props;
    const getInitials = useInitials();

    return (
        <header className="sticky top-0 right-0 left-0 z-50 flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
            <div className="flex items-center gap-2">
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="flex items-center">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex h-10 items-center space-x-3 rounded-xl px-3 py-2 hover:bg-[#f1f9ff]">
                            <Avatar className="size-8 overflow-hidden rounded-full">
                                <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                <AvatarFallback className="rounded-lg bg-gradient-to-r from-[#2975a1] to-[#1e3a5f] font-semibold text-white">
                                    {getInitials(auth.user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden flex-col items-start md:flex">
                                <span className="text-sm font-semibold text-gray-900">{auth.user.name}</span>
                                <span className="text-xs text-gray-600">Administrator</span>
                            </div>
                            <ChevronsUpDown className="h-4 w-4 text-gray-500" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="z-[70] w-64 rounded-xl border border-gray-200 bg-white shadow-xl" align="end">
                        <UserMenuContent user={auth.user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
