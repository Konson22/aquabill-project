import { formatCurrency } from '@/lib/utils';

export default function PrintInvoiceCard({ invoice }) {
    // Alias invoice to bill to reuse the variable name 'bill'
    const bill = invoice;

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
    const grandTotal = Number(bill?.amount || bill?.total_amount || 0);

    // Calculate consumption
    const consumption = bill?.consumption || 0;

    // For bills: usage * rate. For invoices: just amount (handled in total) but maybe show breakdown if description allows.
    // In strict bill card layout, there was VOLUM_CHARGES.
    const VOLUM_CHARGES = consumption * (bill?.tariff || 0);

    const isWaterBill = !!meterReading;

    return (
        <>
            <style>
                {`
                    @media print {
                        @page { margin: 0.5cm; }
                        body { margin: 0; padding: 0; }
                        .bill-print-root {
                            height: 32vh !important; /* approx 1/3 of page */
                            font-size: 9px !important;
                            page-break-inside: avoid;
                            overflow: hidden; /* Prevent spillover */
                            margin-bottom: 0 !important;
                            border-bottom: 1px dashed #ccc; /* Separator for clarity if needed */
                        }
                        .bill-print-root:last-child {
                            border-bottom: none;
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
                            line-height: 1.1 !important;
                        }
                    }
                `}
            </style>
            <div className="bill-print-root flex h-full w-full flex-col border-b border-dashed border-gray-400 bg-white p-4 text-xs leading-none text-slate-900 last:border-0 print:p-4">
                {/* Header Section */}
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img
                            src="/logo.png"
                            alt="Logo"
                            className="h-10 w-10 object-contain"
                        />
                        <div>
                            <h1 className="text-sm font-bold tracking-tight text-slate-800 uppercase">
                                South Sudan Urban Water Corp.
                            </h1>
                            <p className="text-[10px] font-semibold text-slate-500 uppercase">
                                CES / Juba Station
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="inline-block rounded bg-slate-100 px-2 py-1 text-[10px] font-bold tracking-wider uppercase print:bg-slate-100">
                            {isWaterBill ? 'Water Bill' : 'Invoice'}
                        </span>
                        <div className="mt-1 text-sm font-bold text-slate-900">
                            #{bill?.bill_number || bill?.invoice_number}
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid flex-1 grid-cols-12 gap-4">
                    {/* Left Column: Customer & Location (Col-Span 5) */}
                    <div className="col-span-5 space-y-3">
                        <div>
                            <p className="mb-0.5 text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                                Customer Details
                            </p>
                            <div className="rounded bg-slate-50 p-2 print:bg-slate-50">
                                <p className="truncate text-sm font-bold">
                                    {bill?.customer?.name || '—'}
                                </p>
                                <p className="mt-0.5 text-[10px] text-slate-600 uppercase">
                                    {tariff?.name || bill?.type || '—'}
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <p className="mb-0.5 text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                                    Zone
                                </p>
                                <p className="text-[10px] font-semibold">
                                    {home?.zone?.name || '—'}
                                </p>
                            </div>
                            <div>
                                <p className="mb-0.5 text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                                    Area
                                </p>
                                <p className="text-[10px] font-semibold">
                                    {home?.address || home?.area?.name || '—'}
                                </p>
                            </div>
                        </div>
                        {isWaterBill && (
                            <div>
                                <p className="mb-0.5 text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                                    Meter No.
                                </p>
                                <p className="font-mono text-[10px] font-semibold">
                                    {meterReading?.meter?.meter_number || '—'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Middle Column: Usage/Details (Col-Span 3) */}
                    <div className="col-span-3 space-y-3 border-l border-slate-100 pl-2">
                        <div>
                            <p className="mb-0.5 text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                                Billing Date
                            </p>
                            <p className="text-[10px] font-semibold">
                                {formatDateLong(
                                    bill?.billing_period_end ||
                                        bill?.due_date ||
                                        bill?.created_at,
                                )}
                            </p>
                        </div>

                        {isWaterBill ? (
                            <>
                                <div>
                                    <p className="mb-0.5 text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                                        Readings
                                    </p>
                                    <div className="flex justify-between text-[10px]">
                                        <span className="text-slate-500">
                                            Prev
                                        </span>
                                        <span className="font-mono">
                                            {meterReading?.previous_reading ??
                                                0}
                                        </span>
                                    </div>
                                    <div className="mt-0.5 flex justify-between text-[10px]">
                                        <span className="text-slate-500">
                                            Curr
                                        </span>
                                        <span className="font-mono">
                                            {meterReading?.current_reading ?? 0}
                                        </span>
                                    </div>
                                </div>
                                <div className="border-t border-slate-200 pt-2">
                                    <div className="flex items-baseline justify-between">
                                        <span className="text-[9px] font-bold text-slate-700 uppercase">
                                            Consumption
                                        </span>
                                        <span className="text-sm font-bold text-blue-600 print:text-black">
                                            {consumption} m³
                                        </span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div>
                                <p className="mb-0.5 text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                                    Description
                                </p>
                                <p className="text-[10px] text-slate-600 italic">
                                    {bill?.description || 'N/A'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Financials (Col-Span 4) */}
                    <div className="col-span-4 space-y-3 border-l border-slate-100 pl-2">
                        <div>
                            <p className="mb-1 text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                                Charges Breakdown
                            </p>
                            <div className="space-y-1">
                                {isWaterBill ? (
                                    <>
                                        <div className="flex justify-between text-[10px]">
                                            <span className="text-slate-600">
                                                Arrears
                                            </span>
                                            <span className="font-mono">
                                                {formatCurrency(
                                                    bill?.previous_balance || 0,
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-[10px]">
                                            <span className="text-slate-600">
                                                Fixed Chg
                                            </span>
                                            <span className="font-mono">
                                                {formatCurrency(
                                                    bill?.fix_charges || 0,
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-[10px]">
                                            <span className="text-slate-600">
                                                Tariff
                                            </span>
                                            <span className="font-mono">
                                                {formatCurrency(
                                                    bill?.tariff || 0,
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between border-t border-dashed border-slate-200 pt-1 text-[10px]">
                                            <span className="font-medium text-slate-800">
                                                Vol. Charge
                                            </span>
                                            <span className="font-mono font-medium">
                                                {formatCurrency(
                                                    VOLUM_CHARGES || 0,
                                                )}
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex justify-between text-[10px]">
                                        <span className="text-slate-600">
                                            Base Amount
                                        </span>
                                        <span className="font-mono">
                                            {formatCurrency(grandTotal)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="mt-4 flex items-end justify-between border-t-2 border-slate-900 pt-3">
                    <div className="text-[9px] text-slate-500">
                        <div className="mb-1 flex gap-4">
                            <span>
                                Billed By:{' '}
                                <strong className="text-slate-700">
                                    {bill?.meterReading?.reader?.name ||
                                        'System'}
                                </strong>
                            </span>
                            <span>
                                {' '}
                                Helpline: <strong>+211 929 928 736</strong>
                            </span>
                        </div>
                        <p className="italic">
                            Please pay within 7 days to avoid disconnection.
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="mb-0.5 text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                            Total Payable
                        </p>
                        <p className="text-2xl leading-none font-black text-slate-900">
                            {formatCurrency(grandTotal)}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
