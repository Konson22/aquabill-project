import Card from '@/components/card';
import {
    Gauge,
    Home,
    UserCheck,
    UserMinus,
    UserPlus,
    Users,
} from 'lucide-react';

export default function CustomerSection({ stats = {} }) {
    const totalCustomers = stats.totalCustomers ?? 0;
    const activeCustomers = stats.activeCustomers ?? 0;
    const suspendedCustomers = stats.suspendedCustomers ?? 0;
    const totalMeters = stats.totalMeters ?? 0;
    const metersActive = stats.metersActive ?? 0;
    const metersInactive = stats.metersInactive ?? 0;
    const metersMaintenance = stats.metersMaintenance ?? 0;

    return (
        <Card
            title="Customers & meters"
            icon={<Users className="h-5 w-5" />}
            iconClassName="bg-sky-500 text-white border border-sky-200"
        >
                {/* Customer KPIs */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="flex items-start gap-4 rounded-xl border border-sky-200/60 bg-sky-50 p-4 shadow-sm">
                        <div className="rounded-lg bg-sky-100 p-2.5">
                            <UserPlus className="h-5 w-5 text-sky-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium uppercase tracking-wider text-sky-700/80">
                                Total customers
                            </p>
                            <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">
                                {totalCustomers.toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 rounded-xl border border-emerald-200/60 bg-emerald-50 p-4 shadow-sm">
                        <div className="rounded-lg bg-emerald-100 p-2.5">
                            <UserCheck className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium uppercase tracking-wider text-emerald-700/80">
                                Active supply
                            </p>
                            <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-600">
                                {activeCustomers.toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 rounded-xl border border-amber-200/60 bg-amber-50 p-4 shadow-sm">
                        <div className="rounded-lg bg-amber-100 p-2.5">
                            <UserMinus className="h-5 w-5 text-amber-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium uppercase tracking-wider text-amber-700/80">
                                Suspended
                            </p>
                            <p className="mt-1 text-2xl font-bold tabular-nums text-amber-600">
                                {suspendedCustomers.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Meter status */}
                <div className="mt-6 rounded-xl border border-slate-200/60 bg-slate-50/50 p-5">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                        <Gauge className="h-4 w-4 text-slate-500" />
                        Meter status
                    </h3>
                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                        <div className="flex items-center justify-between rounded-lg border border-slate-200/60 bg-slate-100/80 px-4 py-3">
                            <div className="flex items-center gap-3">
                                <Home className="h-4 w-4 text-slate-500" />
                                <span className="text-sm text-slate-700">
                                    Total meters
                                </span>
                            </div>
                            <span className="font-semibold tabular-nums text-slate-900">
                                {totalMeters.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-emerald-200/60 bg-emerald-50 px-4 py-3">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                <span className="text-sm text-emerald-700/90">
                                    Active
                                </span>
                            </div>
                            <span className="font-semibold tabular-nums text-emerald-600">
                                {metersActive.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-slate-200/60 bg-slate-100/80 px-4 py-3">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-slate-400" />
                                <span className="text-sm text-slate-700">
                                    Inactive / maintenance
                                </span>
                            </div>
                            <span className="font-semibold tabular-nums text-slate-700">
                                {(metersInactive + metersMaintenance).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
        </Card>
    );
}
