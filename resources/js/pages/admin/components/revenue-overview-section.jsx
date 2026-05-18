import { RevenueCharts } from '@/components/reports/revenue-charts';

/**
 * @param {{ chartData?: { date: string, collection_rate_percent: number }[], zoneRevenueComparison?: { zone: string, collected: number }[] }} props
 */
export default function RevenueOverviewSection({ chartData = [], zoneRevenueComparison = [] }) {
    return (
        <div className="my-6">
            <RevenueCharts chartData={chartData} zoneRevenueComparison={zoneRevenueComparison} />
        </div>
    );
}
