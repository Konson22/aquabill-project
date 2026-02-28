import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import {
    BarChart3,
    CreditCard,
    FileText,
    Gauge,
    LayoutGrid,
    LineChart,
    MapPin,
    Menu,
    Receipt,
    Shield,
    Tag,
    Users,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const sectionIconClass = 'h-5 w-5 shrink-0';

export default function DocumentationIndex() {
    const modules = [
        {
            title: 'Dashboard',
            description:
                'View key metrics, overdue readings and bills, and quick links to main tasks.',
            icon: <LayoutGrid className={sectionIconClass} />,
        },
        {
            title: 'Reports',
            description:
                'General Report (Admin): view summaries for customers, finance, and water usage. Use for oversight and period reviews.',
            icon: <LineChart className={sectionIconClass} />,
        },
        {
            title: 'Customers',
            description:
                'Manage customer profiles, link customers to homes and meters, and view service history.',
            icon: <Users className={sectionIconClass} />,
        },
        {
            title: 'Billing',
            description:
                'Create and manage bills from meter readings and tariffs. Track paid and unpaid bills.',
            icon: <Receipt className={sectionIconClass} />,
        },
        {
            title: 'Payments',
            description:
                'Record and track payments against bills. View payment history and methods.',
            icon: <CreditCard className={sectionIconClass} />,
        },
        {
            title: 'Invoices',
            description:
                'Generate and view invoices. Print or download for records.',
            icon: <FileText className={sectionIconClass} />,
        },
        {
            title: 'Meters',
            description:
                'Register water meters, assign them to homes, and manage meter status.',
            icon: <Gauge className={sectionIconClass} />,
        },
        {
            title: 'Meter Readings',
            description:
                'Enter and manage meter readings. System flags overdue or missing readings.',
            icon: <BarChart3 className={sectionIconClass} />,
        },
        {
            title: 'Zones',
            description:
                'Organize service areas into zones for reporting and management.',
            icon: <MapPin className={sectionIconClass} />,
        },
        {
            title: 'Tariff',
            description:
                'Define water tariffs and rates used for billing calculations.',
            icon: <Tag className={sectionIconClass} />,
        },
        {
            title: 'Users',
            description:
                'Manage system users, roles (Admin, Finance, Meters), and access. Admin only.',
            icon: <Shield className={sectionIconClass} />,
        },
    ];

    return (
        <AppLayout>
            <Head title="System User Manual" />

            <div className="mx-auto max-w-4xl space-y-10">
                <div>
                    <h1 className="scroll-m-20 text-3xl font-bold tracking-tight">
                        SSUWC Billing — System User Manual
                    </h1>
                    <p className="mt-2 text-lg text-muted-foreground">
                        How to use the Aquabill water billing system: navigation,
                        roles, and step-by-step guidance for daily tasks.
                    </p>
                </div>

                <Separator />

                {/* 1. Introduction */}
                <section id="introduction" className="space-y-4">
                    <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                        1. Introduction
                    </h2>
                    <p className="leading-7 text-muted-foreground">
                        This manual describes how to use the SSUWC Billing
                        (Aquabill) system for customer management, meter
                        readings, billing, payments, reports, and more. Use it for
                        training and as a day-to-day reference.
                    </p>
                </section>

                <Separator />

                {/* 2. Getting started */}
                <section id="getting-started" className="space-y-4">
                    <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                        2. Getting Started
                    </h2>
                    <p className="leading-7 text-muted-foreground">
                        After logging in, you will see the main application
                        layout: a sidebar on the left and the main content area
                        on the right with the top navbar.
                    </p>
                    <h3 className="mt-4 text-xl font-semibold tracking-tight">
                        Navigation &amp; sidebar
                    </h3>
                    <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
                        <li>
                            <strong className="text-foreground">Sidebar</strong>{' '}
                            — Contains links to Dashboard, General Report (admins), Customers, Billing,
                            Payments, Invoices, Meters, Meter Readings, Zones,
                            Tariff, and (for admins) Users. The list depends on
                            your role.
                        </li>
                        <li>
                            <strong className="text-foreground">
                                Toggle sidebar
                            </strong>{' '}
                            — On larger screens, use the panel icon in the
                            sidebar header to collapse or expand the sidebar
                            (icons-only vs full labels).
                        </li>
                        <li>
                            <strong className="text-foreground">
                                Mobile view
                            </strong>{' '}
                            — On small screens the sidebar is hidden by default.
                            Tap the <Menu className="inline h-4 w-4" /> menu
                            icon in the top navbar to open the sidebar. Tap a
                            link or the dark overlay to close it.
                        </li>
                    </ul>
                    <h3 className="mt-4 text-xl font-semibold tracking-tight">
                        Top navbar
                    </h3>
                    <p className="leading-7 text-muted-foreground">
                        The top bar shows alerts (e.g. overdue readings or
                        bills) and your user menu. From the user menu you can
                        open Settings, Profile, and Log out.
                    </p>
                </section>

                <Separator />

                {/* 3. User roles */}
                <section id="user-roles" className="space-y-4">
                    <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                        3. User Roles
                    </h2>
                    <p className="leading-7 text-muted-foreground">
                        Access to features is based on your assigned department
                        (role):
                    </p>
                    <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
                        <li>
                            <strong className="text-foreground">Admin</strong>{' '}
                            — Full access: Dashboard, General Report, Customers,
                            Billing, Payments, Invoices, Meters, Meter Readings,
                            Zones, Tariff, and User management.
                        </li>
                        <li>
                            <strong className="text-foreground">Finance</strong>{' '}
                            — Dashboard, Bills, Invoices, Payments, Customers,
                            and Tariff. No meter or zone management.
                        </li>
                        <li>
                            <strong className="text-foreground">Meters</strong>{' '}
                            — Dashboard, Meters, Meter Readings, and Zones.
                            No billing, payments, or user management.
                        </li>
                    </ul>
                </section>

                <Separator />

                {/* 4. Main modules */}
                <section id="modules" className="space-y-6">
                    <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                        4. Main Modules
                    </h2>
                    <p className="leading-7 text-muted-foreground">
                        Below is a short overview of each main area. Use the
                        sidebar to open the relevant page and follow the
                        on-screen actions (buttons, filters, tables).
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

                {/* 5. Typical workflows */}
                <section id="workflows" className="space-y-4">
                    <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                        5. Typical Workflows
                    </h2>
                    <h3 className="text-xl font-semibold tracking-tight">
                        Billing cycle
                    </h3>
                    <ol className="ml-6 list-decimal space-y-2 text-muted-foreground">
                        <li>Ensure customers, homes, and meters are set up (Customers, Meters).</li>
                        <li>Enter or import meter readings (Meter Readings).</li>
                        <li>Create or generate bills from readings and tariffs (Billing).</li>
                        <li>Record payments against bills (Payments).</li>
                        <li>Generate or print invoices as needed (Invoices).</li>
                    </ol>
                    <h3 className="mt-6 text-xl font-semibold tracking-tight">
                        New customer and meter
                    </h3>
                    <ol className="ml-6 list-decimal space-y-2 text-muted-foreground">
                        <li>Add the customer (Customers).</li>
                        <li>Add or select a home and link the meter (Meters).</li>
                        <li>Enter the first meter reading (Meter Readings).</li>
                        <li>Proceed with billing when the cycle runs.</li>
                    </ol>
                    <h3 className="mt-6 text-xl font-semibold tracking-tight">
                        Reports and period review (Admin)
                    </h3>
                    <p className="leading-7 text-muted-foreground">
                        Use <strong className="text-foreground">General Report</strong> from the sidebar to view customer, finance, and water usage summaries. Filter by date range for monthly or periodic reviews and oversight.
                    </p>
                </section>

                <Separator />

                {/* 6. Settings & profile */}
                <section id="settings" className="space-y-4">
                    <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                        6. Settings &amp; Profile
                    </h2>
                    <p className="leading-7 text-muted-foreground">
                        Open your name in the top-right corner to access
                        Settings, Profile, and Log out. In Settings you can
                        change password and update profile information. Use
                        these options to keep your account secure and your
                        details up to date.
                    </p>
                </section>

                <Separator />

                {/* 7. Need help */}
                <section id="help" className="space-y-4">
                    <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                        7. Need More Help?
                    </h2>
                    <p className="leading-7 text-muted-foreground">
                        For technical or system documentation (installation,
                        configuration, architecture), use the Documentation
                        section from the app menu or your dashboard if available.
                        For access or permission issues, contact your system
                        administrator.
                    </p>
                </section>
            </div>
        </AppLayout>
    );
}
