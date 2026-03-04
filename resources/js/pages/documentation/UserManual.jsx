import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';

export default function UserManualDocs() {
    return (
        <AppLayout>
            <Head title="User Manuals" />
            <div className="mx-auto max-w-4xl space-y-10">
                <header className="space-y-2">
                    <h1 className="scroll-m-20 text-3xl font-bold tracking-tight">
                        User Manuals
                    </h1>
                    <p className="text-muted-foreground">
                        Step-by-step guides for daily work in Aquabill: customers,
                        billing, meter readings, payments, and reports – with
                        notes for finance, meter and admin users.
                    </p>
                </header>

                <section className="space-y-3">
                    <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                        1. Customers
                    </h2>
                    <p className="text-muted-foreground">
                        The Customers module is the starting point for all
                        billing and meter activities.
                    </p>
                    <ol className="ml-6 list-decimal space-y-2 text-muted-foreground">
                        <li>
                            Open{' '}
                            <Link
                                href={route('customers.index')}
                                className="text-primary underline underline-offset-4"
                            >
                                Customers
                            </Link>{' '}
                            from the sidebar.
                        </li>
                        <li>Use the search box to find a customer by name or account.</li>
                        <li>
                            Click <span className="font-semibold">New customer</span> to
                            register a new account. Fill in name, address, zone and tariff.
                        </li>
                        <li>
                            From a customer detail page you can see active meters, bills,
                            invoices and payment history.
                        </li>
                    </ol>
                </section>

                <section className="space-y-3">
                    <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                        2. Meter Readings
                    </h2>
                    <p className="text-muted-foreground">
                        Meter readings are the basis for water consumption bills.
                        You can add readings directly in Aquabill or via the
                        mobile app used by meter readers.
                    </p>
                    <ol className="ml-6 list-decimal space-y-2 text-muted-foreground">
                        <li>
                            <span className="font-semibold">From the web app</span> — Open{' '}
                            <Link
                                href={route('meter-readings')}
                                className="text-primary underline underline-offset-4"
                            >
                                Meter Readings
                            </Link>{' '}
                            from the sidebar.
                        </li>
                        <li>
                            Click <span className="font-semibold">Add Reading</span> and
                            select a meter. The last reading is shown for reference.
                        </li>
                        <li>Enter reading date and the new current reading value.</li>
                        <li>
                            Save the reading. A bill for that period will be generated
                            automatically for the linked customer.
                        </li>
                        <li>
                            <span className="font-semibold">From the mobile app</span> — The
                            meter reader uses the SSUWC mobile app (works offline) to scan
                            or select a meter, enter the reading, and capture a photo of
                            the meter.
                        </li>
                        <li>
                            When the device is back on the SSUWC network, the app syncs
                            all pending readings (and photos) to Aquabill, where bills are
                            then generated in the same way as manual readings.
                        </li>
                    </ol>
                </section>

                <section className="space-y-3">
                    <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                        3. Billing &amp; Payments
                    </h2>
                    <p className="text-muted-foreground">
                        Bills are created from meter readings and tariff settings;
                        payments are applied against outstanding balances.
                    </p>
                    <ol className="ml-6 list-decimal space-y-2 text-muted-foreground">
                        <li>
                            Open{' '}
                            <Link
                                href={route('bills')}
                                className="text-primary underline underline-offset-4"
                            >
                                Bills
                            </Link>{' '}
                            to review generated bills, print, or export.
                        </li>
                        <li>
                            Use the status and month filters to focus on pending or
                            overdue bills.
                        </li>
                        <li>
                            To record a payment, open a bill and choose{' '}
                            <span className="font-semibold">Record payment</span> or go to{' '}
                            <Link
                                href={route('payments')}
                                className="text-primary underline underline-offset-4"
                            >
                                Payments
                            </Link>{' '}
                            and select the related bill.
                        </li>
                        <li>
                            Enter amount, date, method and reference number, then save.
                            The bill status and balance are updated automatically.
                        </li>
                    </ol>
                </section>

                <section className="space-y-3">
                    <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                        4. Reports
                    </h2>
                    <p className="text-muted-foreground">
                        Reports help management and finance track revenue and
                        consumption trends.
                    </p>
                    <ol className="ml-6 list-decimal space-y-2 text-muted-foreground">
                        <li>
                            For a high-level overview open{' '}
                            <Link
                                href={route('general-report')}
                                className="text-primary underline underline-offset-4"
                            >
                                General Report
                            </Link>{' '}
                            (admin only).
                        </li>
                        <li>
                            To see detailed revenue trends open{' '}
                            <Link
                                href={route('payments.report')}
                                className="text-primary underline underline-offset-4"
                            >
                                Payment Reports
                            </Link>
                            .
                        </li>
                        <li>
                            Use date range and filter options (tariff, zone, month) to
                            refine the results.
                        </li>
                    </ol>
                </section>
            </div>
        </AppLayout>
    );
}
