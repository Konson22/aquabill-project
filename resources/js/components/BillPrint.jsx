export default function BillPrint({ bill }) {
    const formatCurrency = (n) => `${Number(n || 0).toLocaleString('en-SS', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SSP`;
    const formatDateLong = (d) => (d ? new Date(d).toLocaleDateString('en-SS', { year: 'numeric', month: 'long', day: '2-digit' }) : '');

    const category = bill?.customer?.category || {};
    const illigalConnection = (bill?.reading?.illigal_connection || 0) * (category?.tariff || 0);
    const grandTotal = Number(bill?.total_amount || 0) + Number(illigalConnection);

    // (Reverted) Use inline calculations in the layout instead of derived helpers

    return (
        <>
            <style>
                {`
                    @media print {
                        .bill-print-root {
                            font-size: 18px !important;
                        }
                        .bill-print-root .text-xs {
                            font-size: 14px !important;
                        }
                        .bill-print-root .text-sm {
                            font-size: 15px !important;
                        }
                        .bill-print-root h1, .bill-print-root h2, .bill-print-root h3 {
                            font-size: 20px !important;
                        }
                        .bill-print-root .text-base {
                            font-size: 18px !important;
                        }
                    }
                `}
            </style>
            <div className="bill-print-root mb-8 w-full bg-gray-200 p-8 text-base print:text-xs">
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                    <div className="h-16 w-16 object-contain">
                        <img className="h-full w-full object-contain" src="/logo.jpg" alt="Logo" />
                    </div>
                    <div className="text-center">
                        <p className="text-base leading-5 font-semibold print:text-base print:leading-5">
                            SOUTH SUDAN URBAN WATER CORPERATION
                            <br /> WATER BILL
                            <br /> Receipt No: <span className="font-semibold text-red-600">#{bill?.id}</span>
                        </p>
                    </div>
                    <div className="h-16 w-16 object-contain">
                        <img className="h-full w-full object-contain" src="/images/water.png" alt="Logo" />
                    </div>
                </div>
                {/* Main details (reverted three-column layout) */}
                <div className="mb-3 grid grid-cols-3 gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-xs print:text-xs">
                            <span className="font-medium">CUSTOMER NAME</span>
                            <span className="my-0.5 flex-1 rounded bg-white px-2 py-0.5 text-right text-xs print:text-xs">
                                {bill?.customer ? `${bill.customer.first_name} ${bill.customer.last_name}` : '—'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs print:text-xs">
                            <span className="font-medium">CUSTOMER TYPE</span>
                            <span className="my-0.5 flex-1 rounded bg-white px-2 py-0.5 text-right text-xs print:text-xs">
                                {bill?.customer?.category?.type_id || '—'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs print:text-xs">
                            <span className="font-medium">AREA:</span>
                            <span className="my-0.5 flex-1 rounded bg-white px-2 py-0.5 text-right text-xs print:text-xs">
                                {bill?.customer?.address ? bill.customer.address : '—'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs print:text-xs">
                            <span className="font-medium">METER NO:</span>
                            <span className="my-0.5 flex-1 rounded bg-white px-2 py-0.5 text-right text-xs print:text-xs">
                                {bill?.meter?.serial || '—'}
                            </span>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 text-xs print:text-xs">
                            <span className="font-medium">DATE</span>
                            <span className="my-0.5 flex-1 rounded bg-white px-2 py-0.5 text-right text-xs print:text-xs">
                                {formatDateLong(bill?.billing_period_end)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs print:text-xs">
                            <span className="font-medium">PREVIOUS READING</span>
                            <span className="my-0.5 flex-1 rounded bg-white px-2 py-0.5 text-right text-xs print:text-xs">
                                {bill?.reading?.previous ?? 0}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs print:text-xs">
                            <span className="font-medium">CURRENT READING</span>
                            <span className="my-0.5 flex-1 rounded bg-white px-2 py-0.5 text-right text-xs print:text-xs">
                                {bill?.reading?.value ?? 0}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs print:text-xs">
                            <span className="font-medium">CONSUMPTION</span>
                            <span className="my-0.5 flex-1 rounded bg-white px-2 py-0.5 text-right text-xs print:text-xs">
                                {bill?.reading ? bill.reading.value - bill.reading.previous : 0} M³
                            </span>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 text-xs print:text-xs">
                            <span className="font-medium">OUTSTANDING</span>
                            <span className="my-0.5 flex-1 rounded bg-white px-2 py-0.5 text-right text-xs print:text-xs">
                                {formatCurrency(bill?.prev_balance)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs print:text-xs">
                            <span className="font-medium">FIXED CHARGES:</span>
                            <span className="my-0.5 flex-1 rounded bg-white px-2 py-0.5 text-right text-xs print:text-xs">
                                {formatCurrency(bill?.customer?.category?.fixed_charge)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs print:text-xs">
                            <span className="font-medium">TARIFF</span>
                            <span className="my-0.5 flex-1 rounded bg-white px-2 py-0.5 text-right text-xs print:text-xs">
                                {formatCurrency(bill?.customer?.category?.tariff ?? 0)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs print:text-xs">
                            <span className="font-medium">VOLUM/CHARGES</span>
                            <span className="my-0.5 flex-1 rounded bg-white px-2 py-0.5 text-right text-xs print:text-xs">
                                {bill?.reading && bill?.customer?.category
                                    ? formatCurrency((bill.reading.value - bill.reading.previous) * bill.customer.category.tariff)
                                    : formatCurrency(0)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mb-4 flex items-center justify-between text-xs print:text-xs">
                    <div>
                        <div className="text-xs print:text-xs">{bill?.generatedBy?.name || 'System'}</div>
                        <p className="mt-1 text-xs print:text-xs">Sign: Billing Officer</p>
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

                <ul className="list-disc space-y-0.5 pl-4 text-xs text-slate-600 print:text-xs">
                    <li>Make the settlement of water bills monthly and take care of water tap in your premise.</li>
                    <li>To report to Juba-Station management in case of damage or enquiry Call: +211929928736 / +211929928737</li>
                </ul>
            </div>
        </>
    );
}
