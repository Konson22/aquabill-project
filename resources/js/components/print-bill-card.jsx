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
    const consumption = bill?.consumption || 0;

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
            <div className="bill-print-root w-full bg-gray-200 p-6 text-base print:text-xs">
                <div className="mb-4 flex items-center justify-between">
                    <div className="h-16 w-16 object-contain">
                        <img
                            className="h-full w-full object-contain"
                            src="/logo.png"
                            alt="Logo"
                        />
                    </div>
                    <div className="text-center">
                        <p className="bill-print-heading text-base leading-5 font-semibold print:text-base print:leading-5">
                            SOUTH SUDAN URBAN WATER CORPERATION CES/JUBA
                            <br /> WATER BILL
                            <br />
                            <span className="font-semibold text-red-600">
                                #{bill?.bill_number}
                            </span>
                        </p>
                    </div>
                    <div className="h-16 w-16 object-contain">
                        <img
                            className="h-full w-full object-contain"
                            src="/tape.png"
                            alt="Logo"
                        />
                    </div>
                </div>
                <div className="mb-3 grid grid-cols-3 gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-xs print:text-xs">
                            <span className="font-medium">CUS NAME</span>
                            <span className="my-0.5 flex-1 rounded bg-white px-2 py-0.5 text-right text-xs uppercase print:text-xs">
                                {bill?.customer?.name || '—'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs print:text-xs">
                            <span className="font-medium">CUSTOMER TYPE</span>
                            <span className="my-0.5 flex-1 rounded bg-white px-2 py-0.5 text-right text-xs uppercase print:text-xs">
                                {tariff?.name || '—'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs print:text-xs">
                            <span className="font-medium">ZONE:</span>
                            <span className="my-0.5 flex-1 rounded bg-white px-2 py-0.5 text-right text-xs uppercase print:text-xs">
                                {home?.zone?.name || '—'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs print:text-xs">
                            <span className="font-medium">AREA:</span>
                            <span className="my-0.5 flex-1 rounded bg-white px-2 py-0.5 text-right text-xs uppercase print:text-xs">
                                {home?.address || home?.area?.name || '—'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs print:text-xs">
                            <span className="font-medium">METER NO:</span>
                            <span className="my-0.5 flex-1 rounded bg-white px-2 py-0.5 text-right text-xs uppercase print:text-xs">
                                {meterReading?.meter?.meter_number || '—'}
                            </span>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 text-xs print:text-xs">
                            <span className="font-medium">DATE</span>
                            <span className="my-0.5 flex-1 rounded bg-white px-2 py-0.5 text-right text-xs uppercase print:text-xs">
                                {formatDateLong(bill?.billing_period_end)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs print:text-xs">
                            <span className="font-medium">
                                PREVIOUS READING
                            </span>
                            <span className="my-0.5 flex-1 rounded bg-white px-2 py-0.5 text-right text-xs uppercase print:text-xs">
                                {meterReading?.previous_reading ?? 0}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs print:text-xs">
                            <span className="font-medium">CURRENT READING</span>
                            <span className="my-0.5 flex-1 rounded bg-white px-2 py-0.5 text-right text-xs uppercase print:text-xs">
                                {meterReading?.current_reading ?? 0}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs print:text-xs">
                            <span className="font-medium">CONSUMPTION</span>
                            <span className="my-0.5 flex-1 rounded bg-white px-2 py-0.5 text-right text-xs uppercase print:text-xs">
                                {meterReading?.current_reading -
                                    meterReading?.previous_reading}{' '}
                                M³
                            </span>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 text-xs print:text-xs">
                            <span className="font-medium">OUTSTANDING</span>
                            <span className="my-0.5 flex-1 rounded bg-white px-2 py-0.5 text-right text-xs uppercase print:text-xs">
                                {formatCurrency(bill?.previous_balance || 0)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs print:text-xs">
                            <span className="font-medium">FIXED CHARGES:</span>
                            <span className="my-0.5 flex-1 rounded bg-white px-2 py-0.5 text-right text-xs uppercase print:text-xs">
                                {formatCurrency(bill?.fix_charges || 0)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs print:text-xs">
                            <span className="font-medium">TARIFF</span>
                            <span className="my-0.5 flex-1 rounded bg-white px-2 py-0.5 text-right text-xs uppercase print:text-xs">
                                {formatCurrency(bill?.tariff || 0)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs print:text-xs">
                            <span className="font-medium">VOLUM/CHARGES</span>
                            <span className="my-0.5 flex-1 rounded bg-white px-2 py-0.5 text-right text-xs uppercase print:text-xs">
                                {formatCurrency(VOLUM_CHARGES || 0)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mb-4 flex items-center justify-between text-xs print:text-xs">
                    <div>
                        <div className="text-xs print:text-xs">
                            {bill?.meterReading?.reader?.name || 'System'}
                        </div>
                        <p className="mt-1 text-xs print:text-xs">
                            Sign: Billing Officer
                        </p>
                    </div>
                    <div className="flex-1"></div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-medium">TOTAL BILL</span>
                            <span className="my-0.5 flex-1 rounded bg-white px-2 py-0.5 text-right text-xs print:text-xs">
                                {formatCurrency(grandTotal)}
                            </span>
                        </div>
                    </div>
                </div>

                <ul className="mt-4 list-disc space-y-0.5 border-b-2 border-gray-600 pl-4 text-xs text-slate-600 print:text-xs">
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
