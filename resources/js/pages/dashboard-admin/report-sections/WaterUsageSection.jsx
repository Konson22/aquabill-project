import { Button } from '@/components/ui/button';
import Card from '@/components/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Calendar, Download, Droplets, Gauge, MapPin } from 'lucide-react';

export default function WaterUsageSection({
    stats = {},
    usageByZone = [],
    highlights = [],
    filters = {},
    monthOptions = [],
    onMonthChange,
    onDownloadReport,
}) {
    const totalConsumption = stats.totalConsumption ?? 0;

    const actions = (
        <div className="flex flex-wrap items-center gap-2">
            {monthOptions.length > 0 && typeof onMonthChange === 'function' && (
                <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <Select
                        value={filters.month || 'all'}
                        onValueChange={onMonthChange}
                    >
                        <SelectTrigger className="h-9 w-[160px] rounded-lg border-slate-200 bg-white text-sm">
                            <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All months</SelectItem>
                            {monthOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
            <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5"
                onClick={onDownloadReport}
            >
                <Download className="h-4 w-4" />
                Download report
            </Button>
        </div>
    );

    return (
        <Card
            title="Water Usage"
            icon={<Droplets className="h-6 w-6" />}
            iconClassName="border border-cyan-200 bg-cyan-500 text-white"
            actions={actions}
        >
                {/* Total consumption KPI */}
                <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-cyan-700">
                                Total water consumption
                            </p>
                            <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900">
                                {totalConsumption.toLocaleString()}{' '}
                                <span className="text-lg font-semibold text-cyan-700">
                                    m³
                                </span>
                            </p>
                            <p className="mt-1 text-xs text-cyan-600">
                                Volume recorded in period
                            </p>
                        </div>
                        <div className="rounded-lg border border-cyan-200 bg-white p-4">
                            <Droplets className="h-8 w-8 text-cyan-600" />
                        </div>
                    </div>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
                    {/* Consumption by Zone */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                            <MapPin className="h-4 w-4 text-slate-500" />
                            Consumption by zone
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                            Usage per zone (m³)
                        </p>
                        <div className="mt-4 space-y-2">
                            {usageByZone.length ? (
                                usageByZone.map((zone) => (
                                    <div
                                        key={zone.name}
                                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3"
                                    >
                                        <span className="text-sm font-medium text-slate-700">
                                            {zone.name}
                                        </span>
                                        <span className="font-semibold tabular-nums text-slate-900">
                                            {zone.value.toLocaleString()} m³
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="rounded-lg border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
                                    No zone consumption data available.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Meter Reading Status */}
                    {highlights.length > 0 ? (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-900">
                                <Gauge className="h-4 w-4 text-amber-600" />
                                Meter reading status
                            </h3>
                            <div className="mt-4 space-y-3">
                                {highlights.map((item) => (
                                    <div
                                        key={item.label}
                                        className="rounded-lg border border-amber-200 bg-white p-3"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-xs font-medium uppercase tracking-wider text-amber-800">
                                                {item.label}
                                            </p>
                                            <span className="text-lg font-bold tabular-nums text-amber-700">
                                                {item.value}
                                            </span>
                                        </div>
                                        <p className="mt-1.5 text-xs text-slate-600">
                                            {item.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                <Gauge className="h-4 w-4 text-slate-500" />
                                Meter reading status
                            </h3>
                            <p className="mt-4 text-sm text-slate-500">
                                No reading highlights for this period.
                            </p>
                        </div>
                    )}
                </div>
        </Card>
    );
}
