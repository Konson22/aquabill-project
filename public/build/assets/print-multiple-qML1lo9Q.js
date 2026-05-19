import{j as e,r as w,L as C}from"./app-DejBYxgs.js";import{c as j,f as i}from"./utils-UUppJURa.js";function n({label:t,value:r,className:a,valueClassName:c}){return e.jsxs("div",{className:j("flex justify-between items-center gap-2",a),children:[e.jsxs("span",{className:"font-bold uppercase text-slate-500 whitespace-nowrap",children:[t,":"]}),e.jsx("span",{className:j("font-mono font-bold text-slate-900 truncate bg-gray-100 px-2 text-right flex-1",c),children:r})]})}function k({bill:t}){var p,l,d,m,u;const r=o=>o?new Date(o).toLocaleDateString("en-SS",{year:"numeric",month:"long",day:"2-digit"}):"",a=t==null?void 0:t.customer,c=(()=>{var f;const o=(f=a==null?void 0:a.name)==null?void 0:f.trim();return o?o.split(/\s+/).filter(Boolean).slice(0,3).join(" "):"—"})(),s=t==null?void 0:t.reading,x=(a==null?void 0:a.tariff)||((p=t==null?void 0:t.home)==null?void 0:p.tariff)||{},h=(t==null?void 0:t.consumption)||(s==null?void 0:s.consumption)||0,g=(t==null?void 0:t.current_charge)||0,v=(t==null?void 0:t.fixed_charge)||0,N=(t==null?void 0:t.previous_balance)||0,y=(t==null?void 0:t.total_amount)||0;return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
                    .bill-print-root {
                        position: relative;
                    }
                    .bill-print-root::before {
                        content: '';
                        position: absolute;
                        inset: 0;
                        z-index: 0;
                        background: url(/logo.png) no-repeat center / min(55%, 220px)
                            auto;
                        opacity: 0.07;
                        pointer-events: none;
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                    .bill-print-root > * {
                        position: relative;
                        z-index: 1;
                    }
                    @media print {
                        .bill-print-root {
                            border: 1px solid #eee !important;
                            background-color: #fff !important;
                            font-size: 11px !important;
                        }
                        .bill-print-root::before {
                            opacity: 0.09;
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
                `}),e.jsxs("div",{className:"bill-print-root mt-3 mb-4 w-full bg-white p-3 text-base print:text-xs",children:[e.jsxs("div",{className:"flex items-center justify-between border-b border-slate-200 pb-2",children:[e.jsx("div",{className:"h-16 w-16",children:e.jsx("img",{className:"h-full w-full object-contain",src:"/logo.png",alt:"Logo"})}),e.jsxs("div",{className:"flex flex-1 flex-col items-center text-center",children:[e.jsxs("p",{className:"bill-print-heading text-lg font-semibold tracking-wide text-slate-600 uppercase print:text-lg",children:["South Sudan Urban Water Corporation ",e.jsx("br",{})," CE Juba Station"]}),e.jsx("p",{className:"text-sm font-semibold text-slate-900",children:"Water Bill"}),e.jsx("div",{className:"mt-0.5 text-center",children:e.jsxs("p",{className:"text-sm font-semibold text-red-600",children:["#",(t==null?void 0:t.bill_no)??(t==null?void 0:t.id)??"—"]})})]}),e.jsx("div",{className:"h-16 w-16",children:e.jsx("img",{className:"h-full w-full object-contain",src:"/tape.png",alt:"Tape"})})]}),e.jsxs("div",{className:"mt-4 flex space-x-6",children:[e.jsxs("div",{className:"flex-1 space-y-1.5 text-xs",children:[e.jsx(n,{label:"Cus Name",value:c}),e.jsx(n,{label:"Cus Types",value:(x==null?void 0:x.name)||"—"}),e.jsx(n,{label:"Zone",value:((l=a==null?void 0:a.zone)==null?void 0:l.name)||"—"}),e.jsx(n,{label:"Area",value:(a==null?void 0:a.address)||((d=a==null?void 0:a.area)==null?void 0:d.name)||"—"})]}),e.jsxs("div",{className:"flex-1 space-y-1.5 text-xs",children:[e.jsx(n,{label:"Date",value:r((s==null?void 0:s.reading_date)||(t==null?void 0:t.created_at))}),e.jsx(n,{label:"Meter No",value:((m=t==null?void 0:t.meter)==null?void 0:m.meter_number)||"—"}),e.jsx(n,{label:"Previous Reading",value:(s==null?void 0:s.previous_reading)??0}),e.jsx(n,{label:"Current Reading",value:(s==null?void 0:s.current_reading)??0}),e.jsx(n,{label:"Usage",value:`${h} m³`})]}),e.jsxs("div",{className:"flex-1 space-y-1.5 text-xs",children:[e.jsx(n,{label:"Outstanding Balance",value:i(N)}),e.jsx(n,{label:"Service Fee",value:i(v)}),e.jsx(n,{label:"Tariff",value:i((t==null?void 0:t.unit_price)||0)}),e.jsx(n,{label:"Volume Charges",value:i(g)}),e.jsx(n,{label:"Total",value:i(y),className:"border-t border-slate-200 pt-1.5",valueClassName:"normal-case text-slate-900"})]})]}),e.jsxs("div",{className:"flex items-end justify-between gap-4 pt-4 text-xs print:text-xs",children:[e.jsxs("div",{children:[e.jsx("div",{className:"mt-10 text-xs font-semibold text-slate-700",children:((u=s==null?void 0:s.recorder)==null?void 0:u.name)||"System"}),e.jsx("p",{className:"mt-1 text-xs text-slate-500",children:"Sign: Billing Officer"})]}),e.jsxs("ul",{className:"list-disc space-y-0.5 text-xs text-slate-600 print:text-xs",children:[e.jsx("li",{children:"Make the settlement of water bills monthly within seven days to avoid disconnection and take care of your water tap"}),e.jsx("li",{children:"To report to Juba-Station management in case of damage or enquiry Call: +211929928736 / +211929928737"})]})]})]})]})}function b({bills:t}){return w.useEffect(()=>{window.print()},[]),e.jsxs(e.Fragment,{children:[e.jsx(C,{title:`Print Bills #${(t==null?void 0:t.length)||""}`}),e.jsx("style",{children:`
                    @media print {
                        @page {
                            size: A4;
                            margin: 8mm;
                        }
                        .print-bill-page {
                            background: white !important;
                            padding: 0 !important;
                        }
                        .print-bill-item {
                            page-break-inside: avoid !important;
                            break-inside: avoid !important;
                        }
                        .print-bill-item:nth-of-type(3n) {
                            page-break-after: always !important;
                            break-after: page !important;
                        }
                    }
                `}),e.jsx("div",{className:"print-bill-page min-h-screen bg-gray-100 p-4",children:t.map(r=>e.jsx("div",{className:"print-bill-item",children:e.jsx(k,{bill:r})},r.id))})]})}export{b as default};
