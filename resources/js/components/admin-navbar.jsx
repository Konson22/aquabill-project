import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link, router, usePage } from '@inertiajs/react';
import { AlertCircle, FileWarning, LogOut, Settings, User } from 'lucide-react';
import { route } from 'ziggy-js';

export default function AdminNavbar() {
    const {
        auth,
        overdue_reading_count = 0,
        overdue_bill_count = 0,
    } = usePage().props;
    const user = auth?.user;

    return (
        <header
            className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-end border-b border-border/80 bg-white px-4 shadow-sm"
            role="banner"
        >
            <div className="flex items-center gap-2 sm:gap-3">
                {Number(overdue_reading_count) > 0 && (
                    <Link
                        href={route('meter-readings')}
                        className="relative flex items-center gap-1.5 rounded-lg bg-amber-100 px-2.5 py-2 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-200 dark:hover:bg-amber-900/60"
                        title="Overdue readings (no reading in the last month)"
                    >
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span className="hidden sm:inline">
                            Overdue readings
                        </span>
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-600 px-1.5 text-xs font-semibold text-white">
                            {overdue_reading_count}
                        </span>
                    </Link>
                )}
                {Number(overdue_bill_count) > 0 && (
                    <Link
                        href={route('bills')}
                        className="relative flex items-center gap-1.5 rounded-lg bg-red-100 px-2.5 py-2 text-sm font-medium text-red-800 transition-colors hover:bg-red-200 dark:bg-red-900/40 dark:text-red-200 dark:hover:bg-red-900/60"
                        title="Overdue bills (unpaid for more than a month)"
                    >
                        <FileWarning className="h-4 w-4 shrink-0" />
                        <span className="hidden sm:inline">Overdue bills</span>
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-semibold text-white">
                            {overdue_bill_count}
                        </span>
                    </Link>
                )}
                <div className="ml-1 h-6 w-px bg-border" aria-hidden />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className="flex items-center gap-2 rounded-lg border border-transparent px-2.5 py-2 transition-colors outline-none hover:bg-muted focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                        >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                <User className="h-4 w-4 text-primary" />
                            </div>
                            <p className="max-w-[120px] truncate text-sm font-medium text-foreground sm:max-w-[160px]">
                                {user?.name ?? 'User'}
                            </p>
                            <span className="sr-only">Open user menu</span>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        side="top"
                        className="w-48"
                    >
                        <DropdownMenuItem asChild>
                            <Link href={route('settings.index')}>
                                <Settings className="h-4 w-4" />
                                Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={route('profile.edit')}>
                                <User className="h-4 w-4" />
                                Profile
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-red-600 focus:bg-red-50 focus:text-red-700 [&_svg]:text-red-600"
                            onSelect={(e) => {
                                e.preventDefault();
                                router.post(route('logout'));
                            }}
                        >
                            <LogOut className="h-4 w-4" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
