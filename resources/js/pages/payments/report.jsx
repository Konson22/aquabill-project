import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import {
    PaymentReportHeader,
    PaymentReportSummary,
    ReportKpiCard,
    SettlementTrendChart,
    TariffBreakdownTable,
} from './components';
import { CreditCard, Receipt } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function PaymentReport({
    revenueByType,
    tariffRevenue,
    zoneRevenue,
    monthlyTrend,
    billKpis,
    invoiceKpis,
    totalRevenue,
    tariffs = [],
    zones = [],
    filters = {},
}) {
    const [tariffId, setTariffId] = useState(filters.tariff_id ?? 'all');
    const [zoneId, setZoneId] = useState(filters.zone_id ?? 'all');
    const [month, setMonth] = useState(filters.month ?? 'all');

    useEffect(() => {
        const query = {};
        if (tariffId && tariffId !== 'all') query.tariff_id = tariffId;
        if (zoneId && zoneId !== 'all') query.zone_id = zoneId;
        if (month && month !== 'all') query.month = month;
        const same =
            (filters.tariff_id ?? 'all') === tariffId &&
            (filters.zone_id ?? 'all') === zoneId &&
            (filters.month ?? 'all') === month;
        if (same) return;
        router.get(route('payments.report'), query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, [tariffId, zoneId, month]);

    const breadcrumbs = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Payments', href: route('payments') },
        { title: 'Reports', href: route('payments.report') },
    ];

    const totalCollected =
        (Number(billKpis?.totalCollected) || 0) +
        (Number(invoiceKpis?.totalCollected) || 0);
    const totalBilled =
        (Number(billKpis?.totalBilled) || 0) +
        (Number(invoiceKpis?.totalBilled) || 0);
    const totalOutstanding =
        (Number(billKpis?.totalUnpaid) || 0) +
        (Number(invoiceKpis?.totalUnpaid) || 0);
    const collectionRate =
        totalBilled > 0 ? (totalCollected / totalBilled) * 100 : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payment Reports" />
            <div className="flex flex-col gap-6 pb-8">
                <PaymentReportHeader />

                <PaymentReportSummary
                    totalCollected={totalCollected}
                    totalBilled={totalBilled}
                    totalOutstanding={totalOutstanding}
                    collectionRate={collectionRate}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                    <ReportKpiCard
                        icon={Receipt}
                        iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        title="Water Consumption revenue"
                        billed={billKpis?.totalBilled}
                        collected={billKpis?.totalCollected}
                        due={billKpis?.totalUnpaid}
                        billedSuffix={`${billKpis?.totalCount?.toLocaleString() ?? 0} bills`}
                        collectedSuffix={`${billKpis?.paidCount?.toLocaleString() ?? 0} paid`}
                        dueSuffix={`${billKpis?.unpaidCount?.toLocaleString() ?? 0} unpaid`}
                    />
                    <ReportKpiCard
                        icon={CreditCard}
                        iconClassName="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                        title="Services & other fees"
                        billed={invoiceKpis?.totalBilled}
                        collected={invoiceKpis?.totalCollected}
                        due={invoiceKpis?.totalUnpaid}
                        billedSuffix={`${invoiceKpis?.totalCount?.toLocaleString() ?? 0} invs`}
                        collectedSuffix={`${invoiceKpis?.paidCount?.toLocaleString() ?? 0} paid`}
                        dueSuffix={`${invoiceKpis?.unpaidCount?.toLocaleString() ?? 0} unpaid`}
                    />
                </div>

                    <SettlementTrendChart
                        monthlyTrend={monthlyTrend}
                        tariffs={tariffs}
                        zones={zones}
                        tariffId={tariffId}
                        zoneId={zoneId}
                        onTariffChange={setTariffId}
                        onZoneChange={setZoneId}
                    />

                <TariffBreakdownTable
                    tariffRevenue={tariffRevenue}
                    month={month}
                    onMonthChange={setMonth}
                />
            </div>
        </AppLayout>
    );
}
