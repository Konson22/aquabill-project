import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    ClipboardList,
    CreditCard,
    FileText,
    Gauge,
    LayoutGrid,
    MapPin,
    Receipt,
    Shield,
    Tag,
    Users,
} from 'lucide-react';

const sectionIconClass = 'h-5 w-5 shrink-0';

export default function UserManualDocumentation() {
    const breadcrumbs = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Documentation', href: route('docs.index') },
        { title: 'System User Manual', href: route('docs.user-manual') },
    ];

    const modules = [
        {
            title: 'Dashboard',
            description:
                'Role-specific KPIs. Admin: quick links to General Report, revenue, and water-usage reports.',
            icon: <LayoutGrid className={sectionIconClass} />,
        },
        {
            title: 'Customers',
            description:
                'Customer accounts (homes), zones, areas, tariffs, bills, and history.',
            icon: <Users className={sectionIconClass} />,
        },
        {
            title: 'Billing',
            description:
                'Water bills from meter readings and tariffs; print and export.',
            icon: <Receipt className={sectionIconClass} />,
        },
        {
            title: 'Payments',
            description:
                'Record payments against bills and service fee documents; reports.',
            icon: <CreditCard className={sectionIconClass} />,
        },
        {
            title: 'Service fee',
            description:
                'Non-water charges (invoices in the app); create, print, and allocate payments.',
            icon: <FileText className={sectionIconClass} />,
        },
        {
            title: 'Meters',
            description:
                'Register meters, assign to homes, and manage status.',
            icon: <Gauge className={sectionIconClass} />,
        },
        {
            title: 'Meter Readings',
            description:
                'Enter readings in the web app or sync from the mobile field app.',
            icon: <ClipboardList className={sectionIconClass} />,
        },
        {
            title: 'Zones',
            description:
                'Service areas for customers and reporting (admin / meters).',
            icon: <MapPin className={sectionIconClass} />,
        },
        {
            title: 'Tariff',
            description:
                'Water rates and fixed charges used in billing.',
            icon: <Tag className={sectionIconClass} />,
        },
        {
            title: 'Users',
            description:
                'Manage users and departments (admin only).',
            icon: <Shield className={sectionIconClass} />,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System User Manual" />

            <div className="mx-auto max-w-4xl space-y-10">
                <div>
                    <Link
                        href={route('docs.index')}
                        className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-primary"
                    >
                        <ArrowLeft className="mr-1 h-3 w-3" />
                        Back to Documentation Hub
                    </Link>
                    <h1 className="scroll-m-20 text-3xl font-bold tracking-tight">
                        SSUWC Billing — System User Manual
                    </h1>
                    <p className="mt-2 text-lg text-muted-foreground">
                        How to use Aquabill: navigation by department, main
                        modules, and typical workflows.
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        For the JICA meeting overview (scope, challenges,
                        schedule), see the{' '}
                        <Link
                            href={route('docs.development-status')}
                            className="text-primary underline underline-offset-4 hover:text-primary/80"
                        >
                            Development Status
                        </Link>{' '}
                        document.
                    </p>
                </div>

                <Separator />

                <section className="space-y-4">
                    <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                        Getting started
                    </h2>
                    <p className="leading-7 text-muted-foreground">
                        After sign-in you get a sidebar (collapsible on desktop,
                        drawer on small screens) and a top bar with alerts
                        (e.g. overdue readings or bills) and your user menu
                        (Settings, Profile, User manual link).
                    </p>
                    <h3 className="mt-4 text-xl font-semibold tracking-tight">
                        Sidebar by department
                    </h3>
                    <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
                        <li>
                            <strong className="text-foreground">Admin</strong> —
                            Dashboard, Customers, Billing, Payments, Invoices
                            (service fee), Meter Readings, Meters, Zones, Tariff,
                            Users. Use the dashboard for General Report and other
                            report shortcuts.
                        </li>
                        <li>
                            <strong className="text-foreground">Finance</strong>{' '}
                            — Dashboard, Billing, Invoices, Payments, Customers,
                            Tariff (no meters, meter readings, or zones).
                        </li>
                        <li>
                            <strong className="text-foreground">Meters</strong> —
                            Dashboard, Customers (meter scope), Meters, Meter
                            Readings, Zones.
                        </li>
                    </ul>
                </section>

                <Separator />

                <section className="space-y-4">
                    <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                        Main modules
                    </h2>
                    <p className="leading-7 text-muted-foreground">
                        Not every role sees every module. The grid below
                        describes what each area is for.
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {modules.map((module, idx) => (
                            <Card key={idx}>
                                <CardHeader className="flex flex-row items-start gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        {module.icon}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <CardTitle className="text-base">
                                            {module.title}
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            {module.description}
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </section>

                <Separator />

                <section className="space-y-4">
                    <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                        Typical workflows
                    </h2>
                    <h3 className="text-xl font-semibold tracking-tight">
                        Billing cycle
                    </h3>
                    <ol className="ml-6 list-decimal space-y-2 text-muted-foreground">
                        <li>
                            Set up customers, homes, meters, zones, and tariffs.
                        </li>
                        <li>
                            Enter meter readings on the web or via the mobile app
                            (API sync).
                        </li>
                        <li>Generate or review bills from consumption and tariffs.</li>
                        <li>Record payments against bills.</li>
                        <li>
                            Issue service fee documents and record payments as
                            needed (Invoices in the sidebar).
                        </li>
                    </ol>
                    <h3 className="mt-6 text-xl font-semibold tracking-tight">
                        New customer and meter
                    </h3>
                    <ol className="ml-6 list-decimal space-y-2 text-muted-foreground">
                        <li>Register the customer and home.</li>
                        <li>Assign or create the meter and link it to the home.</li>
                        <li>Capture readings when service starts.</li>
                        <li>Run billing on your normal cycle.</li>
                    </ol>
                </section>
            </div>
        </AppLayout>
    );
}
