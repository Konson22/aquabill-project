import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    BarChart3,
    Bell,
    CreditCard,
    FileText,
    Gauge,
    LayoutGrid,
    MapPin,
    Receipt,
    Shield,
    Smartphone,
    Tag,
    Users,
} from 'lucide-react';

const toc = [
    { id: 'overview', label: 'Overview' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'customers', label: 'Customers & homes' },
    { id: 'billing', label: 'Water billing' },
    { id: 'service-fees', label: 'Service fees' },
    { id: 'payments', label: 'Payments' },
    { id: 'meters', label: 'Meters & readings' },
    { id: 'geography', label: 'Zones & areas' },
    { id: 'tariffs', label: 'Tariffs' },
    { id: 'reporting', label: 'Reporting' },
    { id: 'users', label: 'Users & access' },
    { id: 'api', label: 'API & mobile' },
];

function Section({
    id,
    icon: Icon,
    title,
    children,
}) {
    return (
        <section id={id} className="scroll-mt-8 space-y-4">
            <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                </span>
                <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                    {title}
                </h2>
            </div>
            <div className="space-y-3 pl-0 text-muted-foreground md:pl-[52px]">
                {children}
            </div>
        </section>
    );
}

export default function SystemCoreFunctionalitiesDoc() {
    const breadcrumbs = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Documentation', href: route('docs.index') },
        {
            title: 'System core functionalities',
            href: route('docs.system-core-functionalities'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System core functionalities — Aquabill" />

            <div className="mx-auto max-w-4xl space-y-10 pb-8">
                <div>
                    <Link
                        href={route('docs.index')}
                        className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-primary"
                    >
                        <ArrowLeft className="mr-1 h-3 w-3" />
                        Back to Documentation Hub
                    </Link>
                    <h1 className="scroll-m-20 text-3xl font-bold tracking-tight">
                        System core functionalities
                    </h1>
                    <p className="mt-2 text-lg text-muted-foreground">
                        High-level map of what Aquabill (SSUWC Billing) does: from
                        customer records and meters through billing, service fees,
                        payments, and reporting—plus how departments and the
                        mobile app fit in.
                    </p>
                </div>

                <Card className="border-border/60 bg-muted/20 ring-1 ring-border/30">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">On this page</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="flex flex-col flex-wrap gap-2 sm:flex-row sm:gap-x-4 sm:gap-y-2">
                            {toc.map((item, i) => (
                                <li key={item.id} className="flex items-center gap-2 text-sm">
                                    {i > 0 && (
                                        <span
                                            className="hidden text-muted-foreground sm:inline"
                                            aria-hidden
                                        >
                                            ·
                                        </span>
                                    )}
                                    <a
                                        href={`#${item.id}`}
                                        className="text-primary underline-offset-4 hover:underline"
                                    >
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                <Separator />

                <Section id="overview" icon={LayoutGrid} title="Overview">
                    <p className="leading-7">
                        Aquabill supports end-to-end water utility billing: master
                        data (customers, homes, geography, tariffs, meters),
                        operational data (readings, bills, service fee documents,
                        payments), and analytics. Access is split by{' '}
                        <strong className="text-foreground">department</strong>{' '}
                        (Admin, Finance, Meters) with tailored sidebars and
                        dashboards.
                    </p>
                </Section>

                <Separator />

                <Section id="notifications" icon={Bell} title="Notifications">
                    <p className="leading-7">
                        Aquabill highlights operational risk in three areas: missing
                        reads, unpaid water bills, and overdue service fee
                        invoices. What you see depends on role and screen.
                    </p>
                    <ul className="ml-6 list-disc space-y-2 leading-7">
                        <li>
                            <strong className="text-foreground">Overdue readings</strong>{' '}
                            — The header shows an alert that links to{' '}
                            <strong className="text-foreground">Meter Readings</strong>.
                            It reflects active meters that have been read before but
                            have <strong className="text-foreground">no reading in the
                            last 30 days</strong>, so teams can schedule field visits
                            or follow-up.
                        </li>
                        <li>
                            <strong className="text-foreground">Overdue bills</strong>{' '}
                            — The header shows an alert that links to{' '}
                            <strong className="text-foreground">Billing</strong>. It
                            counts water bills that are still{' '}
                            <strong className="text-foreground">pending or partially
                            paid</strong> and whose{' '}
                            <strong className="text-foreground">due date has passed</strong>.
                        </li>
                        <li>
                            <strong className="text-foreground">
                                Service fees / invoices (dashboard &amp; lists)
                            </strong>{' '}
                            — Overdue <strong className="text-foreground">pending
                            invoices</strong> (past due date) are not separate
                            header chips; they appear in{' '}
                            <strong className="text-foreground">finance dashboard</strong>{' '}
                            KPIs and invoice statistics, and you work them from the{' '}
                            <strong className="text-foreground">Invoices</strong> list
                            (filter by status, due date, or overdue views where
                            available).
                        </li>
                    </ul>
                </Section>

                <Separator />

                <Section id="customers" icon={Users} title="Customers & homes">
                    <ul className="ml-6 list-disc space-y-2 leading-7">
                        <li>
                            Register and maintain{' '}
                            <strong className="text-foreground">customers</strong>{' '}
                            and their <strong className="text-foreground">homes</strong>{' '}
                            (service points) used for billing.
                        </li>
                        <li>
                            Assign <strong className="text-foreground">zones</strong>,{' '}
                            <strong className="text-foreground">areas</strong>, and{' '}
                            <strong className="text-foreground">tariffs</strong> per
                            account.
                        </li>
                        <li>
                            View linked meters, bills, service fee records
                            (invoices), and payment history from the customer
                            profile.
                        </li>
                        <li>
                            Search, filters, and exports where implemented on list
                            screens.
                        </li>
                    </ul>
                </Section>

                <Separator />

                <Section id="billing" icon={Receipt} title="Water billing (bills)">
                    <ul className="ml-6 list-disc space-y-2 leading-7">
                        <li>
                            Bills are generated from meter consumption, tariff rates,
                            fixed charges, and{' '}
                            <strong className="text-foreground">previous balance</strong>{' '}
                            carried from prior periods. Readings—and therefore bill
                            creation—can be driven in{' '}
                            <strong className="text-foreground">two ways</strong>: enter
                            readings in the <strong className="text-foreground">web app</strong>{' '}
                            (Meter Readings), or use the{' '}
                            <strong className="text-foreground">mobile field app</strong>{' '}
                            to submit readings that sync to Aquabill. The mobile flow
                            typically includes capturing a{' '}
                            <strong className="text-foreground">photo of the meter</strong>{' '}
                            with the reading for evidence.
                        </li>
                        <li>
                            Each bill has a <strong className="text-foreground">
                                view bill
                            </strong>{' '}
                            page (detail screen) showing line items, amounts, and
                            status. Water bills are{' '}
                            <strong className="text-foreground">
                                linked to the meter reading
                            </strong>{' '}
                            that produced the consumption for that billing period, so
                            you can trace from bill back to the source read.
                        </li>
                        <li>
                            Track payment status via payments applied to bills
                            (including partial payments).
                        </li>
                        <li>
                            Print individual bills, bulk print where available, and
                            export lists for operations or audit.
                        </li>
                    </ul>
                </Section>

                <Separator />

                <Section
                    id="service-fees"
                    icon={FileText}
                    title="Service fees (invoices)"
                >
                    <ul className="ml-6 list-disc space-y-2 leading-7">
                        <li>
                            Manage <strong className="text-foreground">
                                non-water charges
                            </strong>{' '}
                            as invoice records (e.g. fixed or ad-hoc service fees),
                            separate from consumption-based water bills.
                        </li>
                        <li>
                            Issue prints, bulk print flows where configured, and
                            record payments against outstanding invoice balances.
                        </li>
                    </ul>
                </Section>

                <Separator />

                <Section id="payments" icon={CreditCard} title="Payments">
                    <ul className="ml-6 list-disc space-y-2 leading-7">
                        <li>
                            Record <strong className="text-foreground">payments</strong>{' '}
                            against bills and/or invoice (service fee) payables.
                        </li>
                        <li>
                            At the cashier, staff enter a{' '}
                            <strong className="text-foreground">reference number</strong>{' '}
                            (and typically payment method, amount, and who received
                            the payment) so receipts can be traced and reconciled.
                        </li>
                        <li>
                            If a bill is not fully settled, the{' '}
                            <strong className="text-foreground">remaining balance</strong>{' '}
                            is <strong className="text-foreground">carried forward</strong>{' '}
                            to the <strong className="text-foreground">next bill</strong>{' '}
                            as previous balance, so nothing is lost between billing
                            cycles.
                        </li>
                        <li>
                            Revenue and payment reports for finance oversight
                            (routes vary by role).
                        </li>
                    </ul>
                </Section>

                <Separator />

                <Section id="meters" icon={Gauge} title="Meters & readings">
                    <ul className="ml-6 list-disc space-y-2 leading-7">
                        <li>
                            <strong className="text-foreground">Meters</strong>: assign
                            to homes, track meter numbers, and set{' '}
                            <strong className="text-foreground">status</strong> — for
                            example <strong className="text-foreground">active</strong>,{' '}
                            <strong className="text-foreground">inactive</strong>,{' '}
                            <strong className="text-foreground">maintenance</strong>,{' '}
                            <strong className="text-foreground">disconnect</strong>, or{' '}
                            <strong className="text-foreground">damage</strong> — so
                            operations know whether a meter is in service, offline,
                            under repair, removed, or faulty. History is kept as
                            needed.
                        </li>
                        <li>
                            <strong className="text-foreground">Meter readings</strong>:{' '}
                            capture on the <strong className="text-foreground">web</strong>{' '}
                            or via the <strong className="text-foreground">mobile</strong>{' '}
                            field workflow; readings drive consumption and billing
                            where configured.
                        </li>
                        <li>
                            Overdue-reading indicators in the UI help operations
                            follow up on missing periodic reads.
                        </li>
                    </ul>
                </Section>

                <Separator />

                <Section id="geography" icon={MapPin} title="Zones & areas">
                    <ul className="ml-6 list-disc space-y-2 leading-7">
                        <li>
                            Model <strong className="text-foreground">zones</strong> and
                            nested <strong className="text-foreground">areas</strong>{' '}
                            for organizing customers and supporting zone-based
                            reporting.
                        </li>
                        <li>
                            Maintained by Admin / Meters roles depending on your
                            deployment rules.
                        </li>
                    </ul>
                </Section>

                <Separator />

                <Section id="tariffs" icon={Tag} title="Tariffs">
                    <ul className="ml-6 list-disc space-y-2 leading-7">
                        <li>
                            Define <strong className="text-foreground">water rates</strong>{' '}
                            (volume price) and <strong className="text-foreground">
                                fixed charges
                            </strong>{' '}
                            used when generating bills from readings.
                        </li>
                        <li>
                            Tariffs link to customer accounts for correct billing
                            calculation.
                        </li>
                        <li>
                            <strong className="text-foreground">Tariffs history</strong>{' '}
                            keeps a record of tariff data over time so you can audit
                            changes and see what rates and charges applied in the
                            past.
                        </li>
                    </ul>
                </Section>

                <Separator />

                <Section id="reporting" icon={BarChart3} title="Reporting & dashboards">
                    <ul className="ml-6 list-disc space-y-2 leading-7">
                        <li>
                            <strong className="text-foreground">Dashboards</strong> are
                            role-specific: finance KPIs, admin analytics, or meter
                            operations as applicable.
                        </li>
                        <li>
                            <strong className="text-foreground">General Report</strong>{' '}
                            gives a broad system-wide overview (admin entry point
                            from the dashboard).
                        </li>
                        <li>
                            <strong className="text-foreground">Revenue report</strong>{' '}
                            — Payment and settlement analysis (e.g. from Payments →
                            Reports or the dashboard). Includes reporting{' '}
                            <strong className="text-foreground">by 12 months</strong>,{' '}
                            <strong className="text-foreground">by tariff</strong>, and{' '}
                            <strong className="text-foreground">by category</strong>{' '}
                            (revenue type / segment), plus KPIs and charts for finance
                            review.
                        </li>
                        <li>
                            <strong className="text-foreground">Water usage report</strong>{' '}
                            — Consumption from meter readings (e.g. Meter Readings →
                            Reports or the dashboard). Includes reporting{' '}
                            <strong className="text-foreground">by 12 months</strong>{' '}
                            (monthly trend),{' '}
                            <strong className="text-foreground">by tariff</strong>, and{' '}
                            <strong className="text-foreground">by category</strong>{' '}
                            (usage share / segments), with zone and other breakdowns
                            on the same screen.
                        </li>
                        <li>
                            Additional report screens (e.g. meter readings report)
                            and exports on major list screens where implemented (bills,
                            payments, customers, meters, readings).
                        </li>
                    </ul>
                </Section>

                <Separator />

                <Section id="users" icon={Shield} title="Users & access control">
                    <ul className="ml-6 list-disc space-y-2 leading-7">
                        <li>
                            <strong className="text-foreground">Administrators</strong>{' '}
                            create <strong className="text-foreground">user accounts</strong>{' '}
                            in the Users module, assign name, department, and role,
                            then provide <strong className="text-foreground">
                                login credentials
                            </strong>{' '}
                            (username/email and initial password or reset link) to the
                            staff member according to your security practice.
                        </li>
                        <li>
                            Admins can <strong className="text-foreground">suspend</strong>{' '}
                            or <strong className="text-foreground">delete</strong>{' '}
                            accounts when access must be withdrawn (e.g. staff
                            leaving or policy breach), so the person can no longer sign
                            in.
                        </li>
                        <li>
                            <strong className="text-foreground">Departments</strong>{' '}
                            (Admin, Finance, Meters) control which modules appear in
                            the sidebar and which dashboards load.
                        </li>
                        <li>
                            Authentication uses login, password, and session; admin-only
                            tools include user administration and certain reports.
                        </li>
                    </ul>
                </Section>

                <Separator />

                <Section id="api" icon={Smartphone} title="API & mobile integration">
                    <ul className="ml-6 list-disc space-y-2 leading-7">
                        <li>
                            <strong className="text-foreground">REST API</strong> (e.g.
                            Sanctum-authenticated) for field apps: customer listings
                            and meter reading submission/sync aligned with server
                            rules.
                        </li>
                        <li>
                            Supports offline-first or batch sync patterns on the
                            client side; server validates and persists readings and
                            related billing outcomes as implemented.
                        </li>
                    </ul>
                </Section>

                <Separator />

                <p className="text-sm text-muted-foreground">
                    For day-to-day navigation and workflows, see the{' '}
                    <Link
                        href={route('docs.user-manual')}
                        className="text-primary underline underline-offset-4 hover:text-primary/80"
                    >
                        System User Manual
                    </Link>
                    . For technical stack detail, see{' '}
                    <Link
                        href={route('docs.system')}
                        className="text-primary underline underline-offset-4 hover:text-primary/80"
                    >
                        System documentation
                    </Link>
                    .
                </p>
            </div>
        </AppLayout>
    );
}
