import { formatCurrency } from '@/lib/utils';

const SSUWC_LEGAL_NAME = 'South Sudan Urban Water Corporation (SSUWC)';
const SSUWC_STATION_NAME = 'Juba Station';

/**
 * @param {string | null | undefined} value
 */
function formatDateLong(value) {
    if (!value) {
        return '—';
    }

    try {
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) {
            return String(value);
        }

        return d.toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch {
        return String(value);
    }
}

/**
 * @param {{ id?: number | string }} charge
 */
export function chargeReference(charge) {
    const id = charge?.id ?? '—';

    return `SC-${String(id).padStart(6, '0')}`;
}

/**
 * @param {{ charge: Record<string, unknown>, className?: string }} props
 */
export function PrintServiceChargeReceipt({ charge, className = '' }) {
    const customer = charge.customer ?? {};
    const chargeType = charge.service_charge_type ?? {};
    const baseAmount = Number(charge.amount ?? 0);
    const otherCharges = Number(charge.other_charges ?? 0);
    const totalDue = Number(charge.total_due ?? baseAmount + otherCharges);
    const payments = Array.isArray(charge.payments) ? charge.payments : [];
    const latestPayment = payments[0] ?? null;

    return (
        <article
            className={`sc-print-root rounded-lg border border-slate-200 bg-white p-8 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none ${className}`}
        >
            <header className="border-b border-slate-200 pb-6 text-center">
                <div className="mx-auto inline-flex rounded-2xl bg-white">
                    <img
                        src="/logo.png"
                        alt="SSUWC"
                        width={112}
                        height={112}
                        className="h-24 w-24 rounded-lg object-contain print:h-[7.5rem] print:w-[7.5rem]"
                        decoding="async"
                    />
                </div>
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    {SSUWC_LEGAL_NAME}
                </p>
                <p className="mt-1.5 text-sm font-medium text-slate-600">
                    <span className="text-slate-800">{SSUWC_STATION_NAME}</span>
                </p>
                <h1 className="mt-3 text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
                    Service charge receipt
                </h1>
                <p className="mt-2 font-mono text-sm text-slate-600">Ref: {chargeReference(charge)}</p>
            </header>

            <section className="mt-8 grid gap-2 text-sm leading-relaxed sm:grid-cols-2">
                <p>
                    <span className="font-semibold text-slate-800">Status:</span>{' '}
                    <span className="capitalize">{charge.status ?? '—'}</span>
                </p>
                <p>
                    <span className="font-semibold text-slate-800">Issued:</span>{' '}
                    <span className="tabular-nums">{formatDateLong(charge.issued_date)}</span>
                </p>
                <p className="sm:col-span-2">
                    <span className="font-semibold text-slate-800">Customer:</span> {customer.name ?? '—'}
                </p>
                <p>
                    <span className="font-semibold text-slate-800">Account:</span>{' '}
                    <span className="font-mono">{customer.account_number ?? '—'}</span>
                </p>
                {customer.zone?.name ? (
                    <p>
                        <span className="font-semibold text-slate-800">Zone:</span> {customer.zone.name}
                    </p>
                ) : null}
                <p className="sm:col-span-2">
                    <span className="font-semibold text-slate-800">Charge type:</span> {chargeType.name ?? '—'}
                    {chargeType.code ? (
                        <span className="text-slate-600"> ({chargeType.code})</span>
                    ) : null}
                </p>
                {charge.issuer?.name ? (
                    <p>
                        <span className="font-semibold text-slate-800">Issued by:</span> {charge.issuer.name}
                    </p>
                ) : null}
                {charge.due_date ? (
                    <p>
                        <span className="font-semibold text-slate-800">Due date:</span>{' '}
                        {formatDateLong(charge.due_date)}
                    </p>
                ) : null}
            </section>

            <section className="mt-8 overflow-hidden rounded-md border border-slate-200">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-left text-[10px] font-bold uppercase tracking-wider text-slate-600">
                            <th className="px-4 py-3">Description</th>
                            <th className="px-4 py-3 text-right">Amount (SSP)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        <tr>
                            <td className="px-4 py-3 font-medium text-slate-900">{chargeType.name ?? 'Service charge'}</td>
                            <td className="px-4 py-3 text-right font-mono font-semibold tabular-nums">
                                {formatCurrency(baseAmount)}
                            </td>
                        </tr>
                        {otherCharges > 0 ? (
                            <tr>
                                <td className="px-4 py-3 font-medium text-slate-900">Other charges</td>
                                <td className="px-4 py-3 text-right font-mono font-semibold tabular-nums">
                                    {formatCurrency(otherCharges)}
                                </td>
                            </tr>
                        ) : null}
                    </tbody>
                    <tfoot>
                        <tr className="border-t-2 border-slate-300 bg-slate-50">
                            <td className="px-4 py-3 text-sm font-bold uppercase tracking-wide text-slate-800">
                                Total due
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-lg font-bold tabular-nums text-slate-900">
                                {formatCurrency(totalDue)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </section>

            {latestPayment ? (
                <section className="mt-6 rounded-md border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-950">
                    <p className="font-semibold">Payment recorded</p>
                    <p className="mt-1 tabular-nums">
                        {formatCurrency(latestPayment.amount)} on {formatDateLong(latestPayment.payment_date)}
                        {latestPayment.payment_method
                            ? ` · ${String(latestPayment.payment_method).replace(/_/g, ' ')}`
                            : ''}
                    </p>
                </section>
            ) : null}

            {charge.notes ? (
                <section className="mt-6 text-sm leading-relaxed text-slate-700">
                    <p className="font-semibold text-slate-800">Notes</p>
                    <p className="mt-2 whitespace-pre-wrap">{charge.notes}</p>
                </section>
            ) : null}

            <footer className="mt-10 border-t border-slate-200 pt-6 text-center text-xs text-slate-500">
                <p>Thank you for your payment.</p>
                <p className="mt-1 tabular-nums">Printed {new Date().toLocaleString('en-GB')}</p>
            </footer>
        </article>
    );
}
