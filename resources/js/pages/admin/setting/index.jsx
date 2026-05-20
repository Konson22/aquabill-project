import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import {
    Building2,
    Calendar,
    ChevronRight,
    CreditCard,
    Landmark,
    MapPin,
    Receipt,
    Settings,
    ShieldCheck,
    Users,
} from 'lucide-react';

const breadcrumbs = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Settings', href: route('admin.settings') },
];

const SETTING_SECTIONS = [
    {
        id: 'access',
        title: 'Access control',
        description: 'Staff accounts, roles, and login departments.',
        items: [
            {
                title: 'Users',
                description: 'Create accounts, assign departments, and manage access.',
                icon: Users,
                href: route('users.index'),
                tone: 'sky',
            },
            {
                title: 'Roles & permissions',
                description: 'Control what each role can view and change.',
                icon: ShieldCheck,
                href: route('roles.index'),
                tone: 'indigo',
            },
            {
                title: 'Departments',
                description: 'Organize staff into ledger, finance, admin, and other units.',
                icon: Building2,
                href: route('departments.index'),
                tone: 'violet',
            },
        ],
    },
    {
        id: 'billing',
        title: 'Billing & operations',
        description: 'Tariffs, zones, payment stations, and fee types.',
        items: [
            {
                title: 'Billing cycle',
                description: 'Billing frequency, period close day, and current reading period.',
                icon: Calendar,
                href: route('admin.billing-cycle.edit'),
                tone: 'violet',
            },
            {
                title: 'Tariffs',
                description: 'Water rates and fixed charges applied to bills.',
                icon: Receipt,
                href: route('tariffs.index'),
                tone: 'emerald',
            },
            {
                title: 'Zones',
                description: 'Supply areas, schedules, and customer geography.',
                icon: MapPin,
                href: route('zones.index'),
                tone: 'amber',
            },
            {
                title: 'Collection stations',
                description: 'Desks and offices where payments are recorded.',
                icon: Landmark,
                href: route('admin.stations.index'),
                tone: 'cyan',
            },
            {
                title: 'Service charge types',
                description: 'Connection, reconnection, and other one-off fees.',
                icon: CreditCard,
                href: route('admin.service-charges.index'),
                tone: 'rose',
            },
        ],
    },
];

const toneStyles = {
    sky: {
        icon: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
        hover: 'hover:border-sky-200 hover:bg-sky-50/50 dark:hover:border-sky-900 dark:hover:bg-sky-950/30',
    },
    indigo: {
        icon: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
        hover: 'hover:border-indigo-200 hover:bg-indigo-50/50 dark:hover:border-indigo-900 dark:hover:bg-indigo-950/30',
    },
    violet: {
        icon: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
        hover: 'hover:border-violet-200 hover:bg-violet-50/50 dark:hover:border-violet-900 dark:hover:bg-violet-950/30',
    },
    emerald: {
        icon: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
        hover: 'hover:border-emerald-200 hover:bg-emerald-50/50 dark:hover:border-emerald-900 dark:hover:bg-emerald-950/30',
    },
    amber: {
        icon: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
        hover: 'hover:border-amber-200 hover:bg-amber-50/50 dark:hover:border-amber-900 dark:hover:bg-amber-950/30',
    },
    cyan: {
        icon: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
        hover: 'hover:border-cyan-200 hover:bg-cyan-50/50 dark:hover:border-cyan-900 dark:hover:bg-cyan-950/30',
    },
    rose: {
        icon: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
        hover: 'hover:border-rose-200 hover:bg-rose-50/50 dark:hover:border-rose-900 dark:hover:bg-rose-950/30',
    },
};

/**
 * @param {{
 *   title: string,
 *   description: string,
 *   icon: import('lucide-react').LucideIcon,
 *   href: string,
 *   tone?: keyof typeof toneStyles,
 * }} props
 */
function SettingLink({ title, description, icon: Icon, href, tone = 'sky' }) {
    const styles = toneStyles[tone] ?? toneStyles.sky;

    return (
        <Link
            href={href}
            className={cn(
                'flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 transition-colors',
                styles.hover,
            )}
        >
            <div
                className={cn(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg',
                    styles.icon,
                )}
            >
                <Icon className="h-5 w-5" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">{title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground/60" aria-hidden />
        </Link>
    );
}

export default function Index() {
    const totalLinks = SETTING_SECTIONS.reduce((sum, section) => sum + section.items.length, 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System settings" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">System settings</h1>
                        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                            Configure users, billing rules, and operational master data for Aquabill.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                        <Settings className="h-4 w-4" />
                        <span>
                            <span className="font-semibold text-foreground">{totalLinks}</span> configuration areas
                        </span>
                    </div>
                </div>

                <div className="space-y-6">
                    {SETTING_SECTIONS.map((section) => (
                        <Card key={section.id} className="border-border/60 shadow-sm">
                            <CardHeader className="border-b bg-muted/20 pb-4">
                                <CardTitle className="text-base">{section.title}</CardTitle>
                                <CardDescription>{section.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
                                {section.items.map((item) => (
                                    <SettingLink key={item.href} {...item} />
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <p className="text-center text-xs text-muted-foreground">
                    Advanced values such as collection targets may also be set in{' '}
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">.env</code> and deployment
                    config.
                </p>
            </div>
        </AppLayout>
    );
}
