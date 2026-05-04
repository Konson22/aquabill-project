import { Head, Link } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

const SSUWC_LEGAL_NAME = 'South Sudan Urban Water Corporation (SSUWC)';
const SSUWC_STATION_NAME = 'Juba Station';

function formatDateLong(d) {
    if (!d) {
        return '—';
    }
    return new Date(d).toLocaleDateString('en-SS', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
    });
}

export default function PrintNotification({ customer, activeNotice }) {
    const hasNotice = Boolean(activeNotice);

    useEffect(() => {
        if (!hasNotice) {
            return;
        }
        const timer = setTimeout(() => {
            window.print();
        }, 500);
        return () => clearTimeout(timer);
    }, [hasNotice]);

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900 print:bg-white print:p-0">
            <Head title={hasNotice ? 'Disconnection notice' : 'Disconnection notice — unavailable'} />

            <div className="no-print sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur print:hidden">
                <div className="mx-auto flex max-w-[21cm] flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">
                        {hasNotice ? 'Review the notice, then use Print or your browser print dialog.' : 'There is no active notice to print.'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {hasNotice ? (
                            <Button type="button" variant="default" size="sm" onClick={() => window.print()}>
                                <Printer className="mr-2 h-4 w-4" />
                                Print
                            </Button>
                        ) : null}
                        {customer?.id ? (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={route('customers.disconnection-status', customer.id)}>Back to disconnection</Link>
                            </Button>
                        ) : null}
                    </div>
                </div>
            </div>

            <div className="mx-auto w-full max-w-[21cm] px-4 py-8 print:px-0 print:py-0">
                <article className="notice-print-root rounded-lg border border-slate-200 bg-white p-8 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
                    <header className="border-b border-slate-200 pb-6 text-center ">
                        <div className="mx-auto inline-flex rounded-2xl bg-white print:bg-white">
                            <img
                                src="/logo.png"
                                alt="SSUWC"
                                width={112}
                                height={112}
                                className="h-24 w-24 rounded-lg bg-white object-contain print:h-[7.5rem] print:w-[7.5rem] print:bg-white"
                                decoding="async"
                            />
                        </div>
                        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{SSUWC_LEGAL_NAME}</p>
                        <p className="mt-1.5 text-sm font-medium text-slate-600">
                            <span className="text-slate-800">{SSUWC_STATION_NAME}</span>
                        </p>
                        <h1 className="mt-3 text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
                            Notice of service — disconnection proceedings
                        </h1>
                    </header>

                    {!hasNotice ? (
                        <div className="py-12 text-center text-sm text-slate-600">
                            <p className="font-medium text-slate-800">No active disconnection notice</p>
                            <p className="mt-2 max-w-md mx-auto">
                                This account does not currently have a notice in the 30-day or 15-day grace period. Issue a notice from the
                                disconnection page first, then open print again.
                            </p>
                        </div>
                    ) : (
                        <>
                            <section className="mt-8 space-y-1 text-sm leading-relaxed">
                                <p>
                                    <span className="font-semibold text-slate-800">Date:</span>{' '}
                                    <span className="tabular-nums">{formatDateLong(activeNotice.notified_at)}</span>
                                </p>
                                <p>
                                    <span className="font-semibold text-slate-800">Account number:</span>{' '}
                                    <span className="font-mono tabular-nums">{customer?.account_number ?? '—'}</span>
                                </p>
                                <p>
                                    <span className="font-semibold text-slate-800">Customer name:</span> {customer?.name ?? '—'}
                                </p>
                                <p>
                                    <span className="font-semibold text-slate-800">Service address:</span> {customer?.address ?? '—'}
                                </p>
                                {customer?.zone?.name ? (
                                    <p>
                                        <span className="font-semibold text-slate-800">Zone:</span> {customer.zone.name}
                                    </p>
                                ) : null}
                            </section>

                            <section className="mt-8 border border-amber-200 bg-amber-50/80 p-5 text-sm leading-relaxed text-slate-800 print:border-amber-300 print:bg-amber-50">
                                <h2 className="text-xs font-bold uppercase tracking-wider text-amber-900">Compliance timeline</h2>
                                <ul className="mt-3 list-inside list-disc space-y-2 marker:text-amber-700">
                                    <li>
                                        <span className="font-semibold">Phase 1 — 30-day notice period</span> ends on{' '}
                                        <span className="tabular-nums font-semibold">{formatDateLong(activeNotice.notice_ends_at)}</span>.
                                    </li>
                                    <li>
                                        <span className="font-semibold">Phase 2 — 15-day final grace period</span> ends on{' '}
                                        <span className="tabular-nums font-semibold">{formatDateLong(activeNotice.grace_period_ends_at)}</span>.
                                    </li>
                                    <li>
                                        After the grace period, the utility may proceed with disconnection in line with applicable regulations
                                        and internal procedures, unless the account is brought into compliance.
                                    </li>
                                </ul>
                            </section>

                            {activeNotice.reason ? (
                                <section className="mt-8 text-sm">
                                    <h2 className="border-b border-slate-200 pb-1 text-xs font-bold uppercase tracking-wider text-slate-600">
                                        Reason stated on notice
                                    </h2>
                                    <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-800">{activeNotice.reason}</p>
                                </section>
                            ) : null}

                            <section className="mt-10 text-sm leading-relaxed text-slate-700">
                                <p>
                                    Please contact customer services to discuss payment plans, verify your balance, or resolve any dispute before
                                    the dates above. Bring this notice or your account number when you visit our offices.
                                </p>
                                <p className="mt-4 text-xs text-slate-500">
                                    This document was generated from the billing system. Signature and stamp may be applied on the printed copy
                                    where required by SSUWC policy.
                                </p>
                            </section>

                            <footer className="mt-14 flex flex-col gap-6 border-t border-slate-200 pt-8 text-sm print:mt-10">
                                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Customer acknowledgement</p>
                                        <p className="mt-8 border-b border-slate-400 pb-1 text-xs text-slate-500">Name & signature</p>
                                        <p className="mt-6 border-b border-slate-400 pb-1 text-xs text-slate-500">Date</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">For the utility</p>
                                        <p className="mt-8 border-b border-slate-400 pb-1 text-xs text-slate-500">Name & title</p>
                                        <p className="mt-6 border-b border-slate-400 pb-1 text-xs text-slate-500">Signature & stamp</p>
                                    </div>
                                </div>
                            </footer>
                        </>
                    )}
                </article>
            </div>

            <style
                dangerouslySetInnerHTML={{
                    __html: `
                @page {
                    size: A4;
                    margin: 14mm 16mm;
                }
                body {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                @media print {
                    .no-print { display: none !important; }
                    .min-h-screen { min-height: auto; }
                    body { background: white; }
                    .notice-print-root header img {
                        background-color: #ffffff !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            `,
                }}
            />
        </div>
    );
}
