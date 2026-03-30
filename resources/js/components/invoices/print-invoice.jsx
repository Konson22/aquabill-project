import { formatCurrency } from '@/lib/utils';

export default function PrintInvoiceCard({ invoice }) {
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
    const customer = bill?.customer;
    const grandTotal = Number(bill?.amount || bill?.total_amount || 0);

    const serviceFeeDescription = (bill?.description || '').trim() || 'Service fee';

    return (
        <>
            <style>
                {`
                    @media print {
                        @page { margin: 0.5cm; }
                        body { margin: 0; padding: 0; }
                        .bill-print-root {
                            height: auto !important;
                            min-height: auto;
                            page-break-inside: avoid;
                            font-size: 11px !important;
                            line-height: 1.45 !important;
                        }
                        .bill-print-root .service-doc-heading {
                            font-size: 13px !important;
                            letter-spacing: 0.02em;
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
            <div className="bill-print-root flex h-full w-full flex-col rounded-sm border-2 border-slate-800 bg-white p-6 text-[11px] leading-snug text-slate-900 shadow-none print:p-8 print:shadow-none">
                {/* Logo + letterhead */}
                <header className="mb-6 border-b-2 border-slate-800 pb-6">
                    <div className="mb-5 flex justify-center">
                        <img
                            src="/logo.png"
                            alt=""
                            className="h-16 w-16 object-contain print:h-16 print:w-16"
                        />
                    </div>
                    <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between sm:gap-10">
                        <div className="mx-auto max-w-sm text-center sm:mx-0 sm:text-left">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                South Sudan Urban Water Corp.
                            </p>
                            <p className="mt-1.5 text-base font-bold leading-tight tracking-tight text-slate-900">
                                CES / Juba Station
                            </p>
                            <p className="mt-2 text-[10px] leading-relaxed text-slate-600">
                                Behind Directorate of Passports, Immigration and
                                Passports, Juba
                            </p>
                            <p className="mt-2.5 text-[10px] leading-none text-slate-600">
                                <span className="text-slate-500">Tel</span>{' '}
                                <span className="font-semibold tabular-nums text-slate-900">
                                    +211 929 928 736
                                </span>
                            </p>
                        </div>
                       
                    </div>
                </header>

                {/* Customer + document reference */}
                <section className="mb-6 border-b border-slate-200 pb-6">
                    <p className="service-doc-heading mb-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-800">
                        Customer
                    </p>
                    <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
                        <div className="min-w-0 flex-1 space-y-2 text-[11px] text-slate-800">
                            <p className="text-base font-bold leading-tight text-slate-900">
                                {customer?.name || '—'}
                            </p>
                            {(customer?.phone || customer?.email) && (
                                <p className="text-slate-700">
                                    {customer?.phone && (
                                        <span>Tel: {customer.phone}</span>
                                    )}
                                    {customer?.phone && customer?.email && (
                                        <span className="text-slate-400">
                                            {' '}
                                            ·{' '}
                                        </span>
                                    )}
                                    {customer?.email && (
                                        <span>{customer.email}</span>
                                    )}
                                </p>
                            )}
                            <div>
                                <span className="font-semibold text-slate-600">
                                    Address &amp; zone:{' '}
                                </span>
                                <span className="whitespace-pre-wrap">
                                    {[
                                        (
                                            customer?.address ||
                                            home?.address ||
                                            ''
                                        ).trim(),
                                        home?.zone?.name || customer?.zone?.name,
                                    ]
                                        .filter(Boolean)
                                        .join(' · ') || '—'}
                                </span>
                            </div>
                        </div>

                        <div className="w-full shrink-0 text-center sm:max-w-md sm:mx-auto lg:mx-0 lg:w-[17rem] lg:border-l lg:border-slate-200 lg:pl-8 lg:text-right">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                Official fee notice
                            </p>
                            <p className="mt-2 font-mono text-[13px] font-semibold leading-none text-slate-800">
                                {bill?.invoice_number}
                            </p>
                            <div className="mt-4 space-y-2 text-[11px] leading-snug">
                                <p className="text-slate-800">
                                    <span className="mb-0.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500 lg:mb-0 lg:inline lg:mr-2">
                                        Issue
                                    </span>
                                    <span className="font-medium text-slate-900">
                                        {formatDateLong(bill?.created_at)}
                                    </span>
                                </p>
                                <p className="text-slate-800">
                                    <span className="mb-0.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500 lg:mb-0 lg:inline lg:mr-2">
                                        Payment due
                                    </span>
                                    <span className="font-medium text-slate-900">
                                        {formatDateLong(bill?.due_date)}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Invoice body — single card */}
                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                    <div className="space-y-5">
                        <p className="border-b border-slate-100 pb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-700">
                            Fee statement
                        </p>
                        <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
                           
                            <p className="max-w-md text-[11px] leading-relaxed text-slate-600">
                                The following fees and charges are assessed in
                                accordance with applicable service rules.
                            </p>
                        </div>
                        <div>
                            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-800">
                                Charge detail
                            </p>
                            <div className="overflow-hidden rounded-lg border border-slate-300">
                                <div className="grid grid-cols-[1fr_auto] gap-2 border-b border-slate-200 bg-slate-100 px-4 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-800 print:bg-slate-100">
                                    <span>Description</span>
                                    <span className="text-right">Amount</span>
                                </div>
                                <div className="grid grid-cols-[1fr_auto] gap-4 bg-white px-4 py-4 text-[11px]">
                                    <p className="whitespace-pre-wrap leading-relaxed text-slate-800">
                                        {serviceFeeDescription}
                                    </p>
                                    <span className="self-start font-mono text-sm font-semibold text-slate-900">
                                        {formatCurrency(grandTotal)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-10 border-t-2 border-slate-800 bg-white px-0 py-6">
                    <div className="text-[9px] text-slate-500">
                        <div className="mb-1 flex flex-wrap gap-x-4 gap-y-1">
                            <span>
                                Prepared by:{' '}
                                <strong className="text-slate-700">
                                    SSUWC Finance
                                </strong>
                            </span>
                            <span>
                                Helpline:{' '}
                                <strong>+211 929 928 736</strong>
                            </span>
                        </div>
                        <p className="italic">
                            {`Payment is due by ${formatDateLong(bill?.due_date)}. Thank you for your cooperation.`}
                        </p>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-6 text-[9px] tracking-wide text-slate-400 uppercase">
                        <div>
                            <p className="mb-2 font-semibold">Signature</p>
                            <div className="h-10 border-b border-dashed border-slate-300"></div>
                        </div>
                        <div>
                            <p className="mb-2 font-semibold">Stamp</p>
                            <div className="h-10 border-b border-dashed border-slate-300"></div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
