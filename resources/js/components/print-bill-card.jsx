import { formatCurrency } from '@/lib/utils';

export default function PrintBillCard({ bill }) {
    const formatDateLong = (d) =>
        d
            ? new Date(d).toLocaleDateString('en-SS', {
                  year: 'numeric',
                  month: 'long',
                  day: '2-digit',
              })
            : '';

    const home = bill?.home;
    const tariff = home?.tariff || {};
    const meterReading = bill?.meter_reading;
    const grandTotal = Number(bill?.total_amount || 0);
    // Calculate consumption
    const consumption =
        meterReading?.current_reading - meterReading?.previous_reading || 0;
    const VOLUM_CHARGES = consumption * tariff.price;

    return (
        <>
            <style>
                {`
                    @media print {
                        .bill-print-root {
                            font-size: 9px !important;
                        }
                        .bill-print-root .bill-print-heading {
                            font-size: 11px !important;
                        }
                        .bill-print-root .text-xs,
                        .bill-print-root .text-sm,
                        .bill-print-root .text-base,
                        .bill-print-root p,
                        .bill-print-root span,
                        .bill-print-root li {
                            font-size: inherit !important;
                            line-height: inherit !important;
                        }
                    }
                `}
            </style>
            <div className="bill-print-root w-full bg-slate-100 p-6 text-base print:text-xs">
                <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-300 bg-white px-4 py-3">
                    <div className="h-14 w-14 object-contain">
                        <img
                            className="h-full w-full object-contain"
                            src="/logo.png"
                            alt="Logo"
                        />
                    </div>
                    <div className="text-center">
                        <p className="bill-print-heading text-sm font-semibold uppercase tracking-wide text-slate-600 print:text-sm">
                            South Sudan Urban Water Corporation
                        </p>
                        <p className="text-base font-semibold text-slate-900">
                            Water Bill
                        </p>
                        <p className="text-sm font-semibold text-red-600">
                            #{bill?.bill_number}
                        </p>
                    </div>
                    <div className="h-14 w-14 object-contain">
                        <img
                            className="h-full w-full object-contain"
                            src="/tape.png"
                            alt="Logo"
                        />
                    </div>
                </div>
                <div className="mb-4 grid grid-cols-3 gap-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Customer Details
                        </p>
                        <div className="mt-3 space-y-2 text-xs">
                            <div className="flex items-center justify-between gap-2">
                                <span className="font-medium text-slate-500">
                                    Cus Name
                                </span>
                                <span className="text-right font-semibold uppercase text-slate-800">
                                    {bill?.customer?.name || '—'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <span className="font-medium text-slate-500">
                                    Customer Type
                                </span>
                                <span className="text-right font-semibold uppercase text-slate-800">
                                    {tariff?.name || '—'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <span className="font-medium text-slate-500">
                                    Zone
                                </span>
                                <span className="text-right font-semibold uppercase text-slate-800">
                                    {home?.zone?.name || '—'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <span className="font-medium text-slate-500">
                                    Area
                                </span>
                                <span className="text-right font-semibold uppercase text-slate-800">
                                    {home?.address || home?.area?.name || '—'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <span className="font-medium text-slate-500">
                                    Meter No
                                </span>
                                <span className="text-right font-semibold uppercase text-slate-800">
                                    {meterReading?.meter?.meter_number || '—'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Reading Details
                        </p>
                        <div className="mt-3 space-y-2 text-xs">
                            <div className="flex items-center justify-between gap-2">
                                <span className="font-medium text-slate-500">
                                    Date
                                </span>
                                <span className="text-right font-semibold uppercase text-slate-800">
                                    {formatDateLong(bill?.billing_period_end)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <span className="font-medium text-slate-500">
                                    Previous
                                </span>
                                <span className="text-right font-semibold uppercase text-slate-800">
                                    {meterReading?.previous_reading ?? 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <span className="font-medium text-slate-500">
                                    Current
                                </span>
                                <span className="text-right font-semibold uppercase text-slate-800">
                                    {meterReading?.current_reading ?? 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <span className="font-medium text-slate-500">
                                    Consumption
                                </span>
                                <span className="text-right font-semibold uppercase text-slate-800">
                                    {consumption} m³
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Charges
                        </p>
                        <div className="mt-3 space-y-2 text-xs">
                            <div className="flex items-center justify-between gap-2">
                                <span className="font-medium text-slate-500">
                                    Outstanding
                                </span>
                                <span className="text-right font-semibold uppercase text-slate-800">
                                    {formatCurrency(bill?.previous_balance || 0)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <span className="font-medium text-slate-500">
                                    Fixed Charges
                                </span>
                                <span className="text-right font-semibold uppercase text-slate-800">
                                    {formatCurrency(bill?.fix_charges || 0)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <span className="font-medium text-slate-500">
                                    Tariff
                                </span>
                                <span className="text-right font-semibold uppercase text-slate-800">
                                    {formatCurrency(bill?.tariff || 0)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <span className="font-medium text-slate-500">
                                    Volume Charges
                                </span>
                                <span className="text-right font-semibold uppercase text-slate-800">
                                    {formatCurrency(VOLUM_CHARGES || 0)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs print:text-xs">
                    <div>
                        <div className="text-xs font-semibold text-slate-700">
                            {bill?.meterReading?.reader?.name || 'System'}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                            Sign: Billing Officer
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Total Bill
                        </span>
                        <span className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                            {formatCurrency(grandTotal)}
                        </span>
                    </div>
                </div>

                <ul className="mt-4 list-disc space-y-0.5 border-t border-slate-300 pt-3 text-xs text-slate-600 print:text-xs">
                    <li>
                        Make the settlement of water bills monthly within seven
                        days to avoid disconnection and take care of your water
                        tap
                    </li>
                    <li>
                        To report to Juba-Station management in case of damage
                        or enquiry Call: +211929928736 / +211929928737
                    </li>
                </ul>
            </div>
        </>
    );
}
