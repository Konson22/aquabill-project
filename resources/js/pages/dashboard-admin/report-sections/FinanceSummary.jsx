import { AlertCircle, Receipt, Wallet } from 'lucide-react';

export default function FinanceSummary({ stats = {} }) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-start gap-4 rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm">
                <div className="rounded-lg bg-blue-100 p-2.5">
                    <Receipt className="h-5 w-5 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        Bills generated
                    </p>
                    <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">
                        {(stats.totalBills ?? 0).toLocaleString()}
                    </p>
                </div>
            </div>
            <div className="flex items-start gap-4 rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm">
                <div className="rounded-lg bg-emerald-100 p-2.5">
                    <Wallet className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        Paid / Unpaid
                    </p>
                    <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">
                        <span className="text-emerald-600">
                            {(stats.paidBills ?? 0).toLocaleString()}
                        </span>
                        <span className="mx-1.5 text-slate-300">/</span>
                        <span className="text-amber-600">
                            {(stats.unpaidBills ?? 0).toLocaleString()}
                        </span>
                    </p>
                </div>
            </div>
            <div className="flex items-start gap-4 rounded-xl border border-amber-200/60 bg-white p-4 shadow-sm">
                <div className="rounded-lg bg-amber-100 p-2.5">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        Overdue bills
                    </p>
                    <p className="mt-1 text-2xl font-bold tabular-nums text-amber-700">
                        {(stats.overdueBillsCount ?? 0).toLocaleString()}
                    </p>
                </div>
            </div>
        </div>
    );
}
