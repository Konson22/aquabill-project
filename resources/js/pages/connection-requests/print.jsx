import { Head, Link } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

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

export default function ConnectionRequestPrint({ connectionRequest: req }) {
    const items = req.items ?? [];

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900 print:bg-white print:p-0">
            <Head title={`Connection request ${req.request_number}`} />

            <div className="no-print sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur print:hidden">
                <div className="mx-auto flex max-w-[21cm] flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">Review the invoice, then print or save as PDF.</p>
                    <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="default" size="sm" onClick={() => window.print()}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('connection-requests.show', req.id)}>Back to request</Link>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="mx-auto w-full max-w-[21cm] px-4 py-8 print:px-0 print:py-0">
                <article className="connection-print-root rounded-lg border border-slate-200 bg-white p-8 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
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
                            Request for water connection
                        </h1>
                        <p className="mt-2 font-mono text-sm text-slate-600">Ref: {req.request_number}</p>
                    </header>

                    <section className="mt-8 grid gap-1 text-sm leading-relaxed sm:grid-cols-2">
                        <p>
                            <span className="font-semibold text-slate-800">Date:</span>{' '}
                            <span className="tabular-nums">{formatDateLong(req.issued_date)}</span>
                        </p>
                        <p>
                            <span className="font-semibold text-slate-800">Status:</span>{' '}
                            <span className="capitalize">{req.status}</span>
                        </p>
                        <p className="sm:col-span-2">
                            <span className="font-semibold text-slate-800">Applicant:</span> {req.name}
                        </p>
                        <p>
                            <span className="font-semibold text-slate-800">Phone:</span> {req.phone}
                        </p>
                        {req.email ? (
                            <p>
                                <span className="font-semibold text-slate-800">Email:</span> {req.email}
                            </p>
                        ) : null}
                        <p className="sm:col-span-2">
                            <span className="font-semibold text-slate-800">Address:</span> {req.address}
                        </p>
                        {req.plot_no ? (
                            <p>
                                <span className="font-semibold text-slate-800">Plot:</span> {req.plot_no}
                            </p>
                        ) : null}
                        <p>
                            <span className="font-semibold text-slate-800">Zone:</span> {req.zone?.name ?? '—'}
                        </p>
                        <p>
                            <span className="font-semibold text-slate-800">Tariff:</span> {req.tariff?.name ?? '—'}
                        </p>
                        <p>
                            <span className="font-semibold text-slate-800">Customer type:</span>{' '}
                            <span className="capitalize">{req.customer_type}</span>
                        </p>
                    </section>

                    <section className="mt-10">
                        <h2 className="border-b border-slate-200 pb-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                            Fees due
                        </h2>
                        <table className="mt-4 w-full border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                                    <th className="py-2 pr-2 font-semibold">Description</th>
                                    <th className="py-2 pr-2 text-right font-semibold">Unit price</th>
                                    <th className="py-2 pr-2 text-right font-semibold">Qty</th>
                                    <th className="py-2 text-right font-semibold">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => {
                                    const lineTotal =
                                        (Number(item.amount) || 0) * (Number(item.quantity) || 1);
                                    return (
                                        <tr key={item.id} className="border-b border-slate-100">
                                            <td className="py-2.5 pr-2">{item.description}</td>
                                            <td className="py-2.5 pr-2 text-right font-mono tabular-nums">
                                                {formatCurrency(item.amount)}
                                            </td>
                                            <td className="py-2.5 pr-2 text-right tabular-nums">{item.quantity}</td>
                                            <td className="py-2.5 text-right font-mono font-medium tabular-nums">
                                                {formatCurrency(lineTotal)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={3} className="pt-4 text-right font-semibold text-slate-800">
                                        Total due
                                    </td>
                                    <td className="pt-4 text-right font-mono text-lg font-bold tabular-nums text-slate-900">
                                        {formatCurrency(req.total_amount)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </section>

                    {req.notes ? (
                        <section className="mt-8 text-sm">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">Notes</h2>
                            <p className="mt-2 whitespace-pre-line leading-relaxed text-slate-700">{req.notes}</p>
                        </section>
                    ) : null}

                    <section className="mt-10 text-sm leading-relaxed text-slate-700">
                        <p>
                            Payment of the fees above is required before a customer account and meter connection can be
                            processed. Present this document and your identification at the cashier.
                        </p>
                        <p className="mt-4 text-xs text-slate-500">
                            Generated from the billing system. Official stamp and signature may be applied on the printed
                            copy where required by SSUWC policy.
                        </p>
                    </section>

                    <footer className="mt-14 grid grid-cols-1 gap-8 border-t border-slate-200 pt-8 text-sm sm:grid-cols-2">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Applicant signature
                            </p>
                            <p className="mt-8 border-b border-slate-400 pb-1 text-xs text-slate-500">Name & signature</p>
                            <p className="mt-6 border-b border-slate-400 pb-1 text-xs text-slate-500">Date</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">For the utility</p>
                            <p className="mt-8 border-b border-slate-400 pb-1 text-xs text-slate-500">Name & title</p>
                            <p className="mt-6 border-b border-slate-400 pb-1 text-xs text-slate-500">Signature & stamp</p>
                        </div>
                    </footer>
                </article>
            </div>

            <style
                dangerouslySetInnerHTML={{
                    __html: `
                @page { size: A4; margin: 14mm 16mm; }
                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                @media print {
                    .no-print { display: none !important; }
                    .min-h-screen { min-height: auto; }
                    body { background: white; }
                }
            `,
                }}
            />
        </div>
    );
}
