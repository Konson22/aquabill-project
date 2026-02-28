import Card from '@/components/card';
import { formatCurrency } from '@/lib/utils';
import { CircleDollarSign, Gauge, TrendingUp } from 'lucide-react';
import FinanceSummary from './FinanceSummary';

const paymentRate = (stats) =>
    Math.min(100, Math.max(0, Number(stats.paymentRate) || 0));
const totalBilled =
    (stats) => (stats.totalPaidAmount ?? 0) + (stats.outstandingAmount ?? 0);

export default function FinanceSection({ stats = {} }) {
    const rate = paymentRate(stats);
    const billed = totalBilled(stats);

    return (
        <Card
            title="Finance"
            icon={<CircleDollarSign className="h-5 w-5" />}
            iconClassName="bg-primary text-primary-foreground border border-primary/20"
        >
                <FinanceSummary stats={stats} />

                {/* Performance + Collection */}
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_320px]">
                    <div className="rounded-xl border border-slate-200/60 bg-slate-50/80 p-5">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                            <TrendingUp className="h-4 w-4 text-slate-500" />
                            Outstanding & collection
                        </h3>
                        <div className="mt-4 space-y-3">
                            <div className="flex items-center justify-between rounded-lg border border-slate-200/60 bg-white px-4 py-3">
                                <span className="text-sm text-slate-600">
                                    Outstanding balance
                                </span>
                                <span className="font-semibold tabular-nums text-slate-900">
                                    {formatCurrency(stats.outstandingAmount ?? 0)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-slate-200/60 bg-white px-4 py-3">
                                <span className="text-sm text-slate-600">
                                    Payment rate
                                </span>
                                <span className="font-semibold tabular-nums text-slate-900">
                                    {(stats.paymentRate ?? 0).toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col rounded-xl border border-emerald-200/60 bg-emerald-50/80 p-5">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
                            <Gauge className="h-4 w-4 text-emerald-600" />
                            Collection vs billed
                        </h3>
                        <div className="mt-4 flex flex-1 flex-col items-center justify-center">
                            <div className="relative flex h-32 w-32 items-center justify-center">
                                <svg
                                    className="h-full w-full -rotate-90"
                                    viewBox="0 0 36 36"
                                >
                                    <path
                                        className="text-emerald-100"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        fill="none"
                                        d="M18 2.5 a 15.5 15.5 0 0 1 0 31 a 15.5 15.5 0 0 1 0 -31"
                                    />
                                    <path
                                        className="text-emerald-500 transition-all duration-700 ease-out"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        fill="none"
                                        strokeDasharray={`${(rate / 100) * 97.39} 97.39`}
                                        d="M18 2.5 a 15.5 15.5 0 0 1 0 31 a 15.5 15.5 0 0 1 0 -31"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-xl font-bold tabular-nums text-emerald-800">
                                        {rate.toFixed(1)}%
                                    </span>
                                    <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-600/80">
                                        collected
                                    </span>
                                </div>
                            </div>
                            <div className="mt-4 w-full space-y-2 border-t border-emerald-200/60 pt-4 text-xs">
                                <div className="flex justify-between text-emerald-800/90">
                                    <span>Billed</span>
                                    <span className="font-medium text-emerald-900">
                                        {formatCurrency(billed)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-emerald-800/90">
                                    <span>Collected</span>
                                    <span className="font-medium text-emerald-900">
                                        {formatCurrency(
                                            stats.totalPaidAmount ?? 0,
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        </Card>
    );
}
