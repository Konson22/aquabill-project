import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import {
    PaymentReportHeader,
    PaymentReportSummary,
    ReportKpiCard,
    SettlementTrendChart,
    TariffBreakdownTable,
} from '@/pages/admin/payments/components';
import { Receipt } from 'lucide-react';
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

    useEffect(() => {
        const query = {};
        if (tariffId && tariffId !== 'all') query.tariff_id = tariffId;
        if (zoneId && zoneId !== 'all') query.zone_id = zoneId;
        const same =
            (filters.tariff_id ?? 'all') === tariffId &&
            (filters.zone_id ?? 'all') === zoneId;
        if (same) return;
        router.get(route('payments.report'), query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, [tariffId, zoneId]);

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
    const collectionRateRaw =
        totalBilled > 0 ? (totalCollected / totalBilled) * 100 : 0;
    const collectionRate =
        totalOutstanding > 0 && collectionRateRaw > 99.9
            ? Math.min(collectionRateRaw, 99.9)
            : collectionRateRaw;

    const unpaidInvoicesCount = Number(invoiceKpis?.unpaidCount) || 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payment Reports" />
            <div className="flex flex-col gap-6 pb-8">
                <PaymentReportHeader />

                <PaymentReportSummary
                    billStatusCounts={billKpis?.billStatusCounts ?? {}}
                    unpaidInvoices={unpaidInvoicesCount}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                    <ReportKpiCard
                        icon={Receipt}
                        iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        title="Water & service revenue"
                        waterConsumptionTotal={Number(billKpis?.waterConsumptionTotal ?? 0)}
                        fixChargesTotal={Number(billKpis?.fixChargesTotal ?? 0)}
                        totalBilled={totalBilled}
                        collected={totalCollected}
                        outstanding={totalOutstanding}
                        collectionRatePct={collectionRate}
                    />
                    <TariffBreakdownTable tariffRevenue={tariffRevenue} />
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

              
            </div>
        </AppLayout>
    );
}
