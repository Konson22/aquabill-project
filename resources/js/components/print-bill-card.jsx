import PrintLabelValue from '@/components/print-label-value';
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

    const customer = bill?.customer;
    const tariff = customer?.tariff || bill?.home?.tariff || {};
    const meterReading = bill?.meter_reading;
    // Calculate consumption
    const consumption =
    meterReading?.current_reading - meterReading?.previous_reading || 0;
    const VOLUM_CHARGES = consumption * tariff.price;
    const totalAmount = Number(VOLUM_CHARGES || 0) + Number(bill?.fix_charges || 0);
    const amountDue = totalAmount + Number(bill?.previous_balance || 0);

    return (
        <>
            <style>
                {`
                    @media print {
                        .bill-print-root {
                            background-color: #eee !important;
                            font-size: 11px !important;
                        }
                        .bill-print-root .bill-print-heading {
                            font-size: 15px !important;
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
            <div className="bill-print-root mt-3 mb-4 w-full bg-gray-200 p-3 text-base print:text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="h-16 w-16">
                        <img
                            className="h-full w-full object-contain"
                            src="/logo.png"
                            alt="Logo"
                        />
                    </div>
                    <div className="flex flex-1 flex-col items-center text-center">
                        <p className="bill-print-heading text-lg font-semibold tracking-wide text-slate-600 uppercase print:text-lg">
                            South Sudan Urban Water Corporation <br /> CE Juba
                            Station
                        </p>
                        <p className="text-sm font-semibold text-slate-900">
                            Water Bill
                        </p>
                        <div className="mt-0.5 text-center">
                            <p className="text-sm font-semibold text-red-600">
                                #{bill?.bill_number}
                            </p>
                        </div>
                    </div>
                    <div className="h-16 w-16">
                        <img
                            className="h-full w-full object-contain"
                            src="/tape.png"
                            alt="Tape"
                        />
                    </div>
                </div>

                <div className="mt-4 flex space-x-6">
                    <div className="flex-1 space-y-1.5 text-xs">
                        <PrintLabelValue
                            label="Name"
                            value={bill?.customer?.name || '—'}
                        />
                        <PrintLabelValue
                            label="Type"
                            value={tariff?.name || '—'}
                        />
                        <PrintLabelValue
                            label="Zone"
                            value={customer?.zone?.name || '—'}
                        />
                        <PrintLabelValue
                            label="Area"
                            value={
                                customer?.address || customer?.area?.name || '—'
                            }
                        />
                    </div>

                    <div className="flex-1 space-y-1.5 text-xs">
                        <PrintLabelValue
                            label="Date"
                            value={formatDateLong(bill?.billing_period_end)}
                        />
                        <PrintLabelValue
                            label="Meter No"
                            value={meterReading?.meter?.meter_number || '—'}
                        />
                        <PrintLabelValue
                            label="Previous"
                            value={meterReading?.previous_reading ?? 0}
                        />
                        <PrintLabelValue
                            label="Current"
                            value={meterReading?.current_reading ?? 0}
                        />
                        <PrintLabelValue
                            label="Usage"
                            value={`${consumption} m³`}
                        />
                    </div>
                    <div className="flex-1 space-y-1.5 text-xs">
                        <PrintLabelValue
                            label="Outstanding"
                            value={formatCurrency(bill?.previous_balance || 0)}
                        />
                        <PrintLabelValue
                            label="Fixed"
                            value={formatCurrency(bill?.fix_charges || 0)}
                        />
                        <PrintLabelValue
                            label="Tariff"
                            value={formatCurrency(bill?.tariff || 0)}
                        />
                        <PrintLabelValue
                            label="Volume Charges"
                            value={formatCurrency(VOLUM_CHARGES || 0)}
                        />
                        <PrintLabelValue
                            label="Total"
                            value={formatCurrency(totalAmount)}
                            className="border-t border-slate-200 pt-1.5"
                            valueClassName="normal-case text-slate-900"
                        />
                        {/* <PrintLabelValue
                            label="Total Due"
                            value={formatCurrency(amountDue)}
                            className="border-t border-slate-200 pt-1.5"
                            valueClassName="normal-case text-slate-900"
                        /> */}
                    </div>
                </div>

                <div className="flex items-start justify-between gap-4 pt-4 text-xs print:text-xs">
                    <div>
                        <div className="mt-10 text-xs font-semibold text-slate-700">
                            {bill?.meterReading?.reader?.name || 'System'}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                            Sign: Billing Officer
                        </p>
                    </div>
                    <ul className="list-disc space-y-0.5 text-xs text-slate-600 print:text-xs">
                        <li>
                            Make the settlement of water bills monthly within
                            seven days to avoid disconnection and take care of
                            your water tap
                        </li>
                        <li>
                            To report to Juba-Station management in case of
                            damage or enquiry Call: +211929928736 /
                            +211929928737
                        </li>
                    </ul>
                </div>
            </div>
        </>
    );
}
