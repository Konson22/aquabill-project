import { Head, Link } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const SSUWC_LEGAL_NAME = 'South Sudan Urban Water Corporation (SSUWC)';
const SSUWC_STATION_NAME = 'Juba Station';

const PRINT_STYLES = `
@page {
    size: A4 portrait;
    margin: 12mm 14mm;
}
html, body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
}
@media print {
    .no-print { display: none !important; }
    .print-shell { min-height: auto !important; background: #fff !important; padding: 0 !important; }
    .print-page { box-shadow: none !important; border: none !important; border-radius: 0 !important; max-width: none !important; width: 100% !important; padding: 0 !important; margin: 0 !important; }
    .notice-print-root {
        font-size: 11pt;
        line-height: 1.45;
        color: #0f172a;
    }
    .notice-print-root .notice-title { font-size: 14pt !important; }
    .notice-print-root .notice-section-title { font-size: 9pt !important; }
    .notice-print-root::before { opacity: 0.08 !important; }
    .notice-avoid-break { break-inside: avoid; page-break-inside: avoid; }
    .notice-timeline {
        border: 1px solid #d97706 !important;
        background: #fffbeb !important;
    }
}
`;

function formatDateLong(value) {
    if (!value) {
        return '—';
    }

    const raw = typeof value === 'string' && value.includes(' ') ? value.split(' ')[0] : value;
    const date = /^\d{4}-\d{2}-\d{2}$/.test(String(raw))
        ? (() => {
              const [y, m, d] = String(raw).split('-').map(Number);
              return new Date(y, m - 1, d);
          })()
        : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '—';
    }

    return date.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

function serviceLocation(customer) {
    const parts = [customer?.address, customer?.plot_no ? `Plot ${customer.plot_no}` : null].filter(Boolean);

    return parts.length ? parts.join(' · ') : '—';
}

function noticePhaseLabel(status) {
    if (status === 'grace_period') {
        return '15-day final grace period (active)';
    }

    return '30-day notice period (active)';
}

function DetailRow({ label, value, className, mono = false }) {
    return (
        <div className={cn('grid grid-cols-[minmax(7.5rem,34%)_1fr] gap-x-3 gap-y-0.5 border-b border-slate-100 py-2 last:border-b-0 print:py-1.5', className)}>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 print:text-[9pt]">{label}</span>
            <span className={cn('text-sm text-slate-900 print:text-[11pt]', mono && 'font-mono tabular-nums')}>{value}</span>
        </div>
    );
}

export default function PrintNotification({ customer, activeNotice }) {
    const hasNotice = Boolean(activeNotice);
    const [logoReady, setLogoReady] = useState(false);

    useEffect(() => {
        if (!hasNotice || !logoReady) {
            return;
        }

        const timer = window.setTimeout(() => window.print(), 350);

        return () => window.clearTimeout(timer);
    }, [hasNotice, logoReady]);

    const noticeRef = activeNotice?.id ? `DCN-${String(activeNotice.id).padStart(5, '0')}` : null;

    return (
        <div className="print-shell min-h-screen bg-slate-100 text-slate-900">
            <Head title={hasNotice ? 'Disconnection notice' : 'Disconnection notice — unavailable'} />

            <div className="no-print sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
                <div className="mx-auto flex max-w-[21cm] flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">
                        {hasNotice
                            ? 'A4 preview below. Use Print or Save as PDF (margins: default or minimum).'
                            : 'There is no active notice to print.'}
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

            <div className="mx-auto w-full max-w-[21cm] px-4 py-6 print:max-w-none print:px-0 print:py-0">
                <article className="notice-print-root print-page relative overflow-hidden rounded-lg border border-slate-200 bg-white p-8 shadow-sm print:overflow-visible">
                    <header className="notice-avoid-break relative z-[1] border-b-2 border-slate-800 pb-5 text-center">
                        <div className="mx-auto inline-flex">
                            <img
                                src="/logo.png"
                                alt="SSUWC logo"
                                width={96}
                                height={96}
                                className="h-20 w-20 object-contain print:h-[4.5rem] print:w-[4.5rem]"
                                decoding="async"
                                onLoad={() => setLogoReady(true)}
                                onError={() => setLogoReady(true)}
                            />
                        </div>
                        <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">{SSUWC_LEGAL_NAME}</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">{SSUWC_STATION_NAME}</p>
                        <h1 className="notice-title mt-4 text-lg font-bold uppercase tracking-tight text-slate-900 print:text-[14pt]">
                            Notice of service disconnection
                        </h1>
                        {noticeRef ? (
                            <p className="mt-2 font-mono text-xs text-slate-600">
                                Reference: <span className="font-semibold text-slate-800">{noticeRef}</span>
                            </p>
                        ) : null}
                    </header>

                    {!hasNotice ? (
                        <div className="relative z-[1] py-12 text-center text-sm text-slate-600">
                            <p className="font-semibold text-slate-800">No active disconnection notice</p>
                            <p className="mx-auto mt-2 max-w-md">
                                This account does not have a notice in the 30-day or 15-day grace period. Issue a notice from the
                                disconnection page, then open print again.
                            </p>
                        </div>
                    ) : (
                        <div className="relative z-[1]">
                            <section className="notice-avoid-break mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <p className="text-sm leading-relaxed text-slate-700 print:text-[11pt]">
                                    To the occupier / account holder at the service address below:
                                </p>
                                <p className="shrink-0 text-sm sm:text-right">
                                    <span className="font-semibold text-slate-800">Notice date:</span>
                                    <br />
                                    <span className="tabular-nums text-slate-900">{formatDateLong(activeNotice.notified_at)}</span>
                                </p>
                            </section>

                            <section className="notice-avoid-break mt-5 rounded-md border border-slate-300 bg-slate-50/80 print:border-slate-400 print:bg-white">
                                <h2 className="notice-section-title border-b border-slate-300 bg-slate-100 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 print:bg-slate-50">
                                    Account particulars
                                </h2>
                                <div className="px-4 py-1">
                                    <DetailRow label="Account no." value={customer?.account_number ?? '—'} mono />
                                    <DetailRow label="Customer" value={customer?.name ?? '—'} />
                                    <DetailRow label="Phone" value={customer?.phone ?? '—'} />
                                    <DetailRow label="Service location" value={serviceLocation(customer)} />
                                    {customer?.zone?.name ? <DetailRow label="Zone" value={customer.zone.name} /> : null}
                                    <DetailRow label="Current phase" value={noticePhaseLabel(activeNotice.status)} />
                                </div>
                            </section>

                            <section className="notice-avoid-break notice-timeline mt-6 rounded-md border-2 border-amber-400 bg-amber-50 px-4 py-4 print:border-amber-500">
                                <h2 className="notice-section-title text-xs font-bold uppercase tracking-wider text-amber-950">
                                    Compliance timeline — action required
                                </h2>
                                <table className="mt-3 w-full border-collapse text-sm print:text-[11pt]">
                                    <tbody>
                                        <tr className="border-b border-amber-200/80">
                                            <td className="py-2 pr-3 align-top font-semibold text-amber-950">Phase 1</td>
                                            <td className="py-2 text-slate-800">
                                                30-day notice period ends{' '}
                                                <span className="font-bold tabular-nums">{formatDateLong(activeNotice.notice_ends_at)}</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 pr-3 align-top font-semibold text-amber-950">Phase 2</td>
                                            <td className="py-2 text-slate-800">
                                                Final 15-day grace period ends{' '}
                                                <span className="font-bold tabular-nums">
                                                    {formatDateLong(activeNotice.grace_period_ends_at)}
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <p className="mt-3 text-xs leading-relaxed text-amber-950/90 print:text-[10pt]">
                                    If the account is not brought into compliance before the grace period ends, SSUWC may disconnect
                                    water supply in accordance with applicable regulations and internal procedures.
                                </p>
                            </section>

                            {activeNotice.reason ? (
                                <section className="notice-avoid-break mt-6">
                                    <h2 className="notice-section-title border-b border-slate-300 pb-1 text-xs font-bold uppercase tracking-wider text-slate-600">
                                        Reason recorded
                                    </h2>
                                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-800 print:text-[11pt]">
                                        {activeNotice.reason}
                                    </p>
                                </section>
                            ) : null}

                            <section className="notice-avoid-break mt-6 text-sm leading-relaxed text-slate-700 print:text-[11pt]">
                                <p>
                                    You are required to settle outstanding charges or contact customer services to agree a payment plan
                                    before the dates above. Bring this notice or your account number when visiting our offices.
                                </p>
                                <p className="mt-3 text-xs text-slate-500 print:text-[9pt]">
                                    Computer-generated notice. Official signature and stamp may be applied on the printed copy where
                                    required by SSUWC policy.
                                </p>
                            </section>

                            <footer className="notice-avoid-break mt-10 grid grid-cols-1 gap-10 border-t border-slate-300 pt-6 sm:grid-cols-2 print:mt-8">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Customer acknowledgement</p>
                                    <div className="mt-10 border-b border-slate-500" />
                                    <p className="mt-1 text-[10px] text-slate-500">Name & signature</p>
                                    <div className="mt-8 border-b border-slate-500" />
                                    <p className="mt-1 text-[10px] text-slate-500">Date</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-600">For {SSUWC_STATION_NAME}</p>
                                    <div className="mt-10 border-b border-slate-500" />
                                    <p className="mt-1 text-[10px] text-slate-500">Name & title</p>
                                    <div className="mt-8 border-b border-slate-500" />
                                    <p className="mt-1 text-[10px] text-slate-500">Signature & official stamp</p>
                                </div>
                            </footer>
                        </div>
                    )}
                </article>
            </div>

            <style dangerouslySetInnerHTML={{ __html: PRINT_STYLES }} />
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                .notice-print-root::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    z-index: 0;
                    background: url(/logo.png) no-repeat center 42% / min(50%, 200px) auto;
                    opacity: 0.05;
                    pointer-events: none;
                }
            `,
                }}
            />
        </div>
    );
}
