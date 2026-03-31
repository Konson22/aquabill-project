import{j as e}from"./app-CXT2YVfW.js";import{c as j}from"./compiler-runtime-CyYYUI2t.js";import{c as b,f as d}from"./utils-D3e9f77r.js";function s(a){const t=j.c(13),{label:i,value:f,children:p,className:r,valueClassName:o}=a,c=p??f??"—";let n;t[0]!==r?(n=b("flex items-center justify-between gap-2",r),t[0]=r,t[1]=n):n=t[1];let l;t[2]!==i?(l=e.jsx("span",{className:"font-medium",children:i}),t[2]=i,t[3]=l):l=t[3];let x;t[4]!==o?(x=b("flex-1 bg-white px-2 py-[2px] text-right font-semibold text-slate-800 uppercase",o),t[4]=o,t[5]=x):x=t[5];let m;t[6]!==c||t[7]!==x?(m=e.jsx("span",{className:x,children:c}),t[6]=c,t[7]=x,t[8]=m):m=t[8];let u;return t[9]!==n||t[10]!==l||t[11]!==m?(u=e.jsxs("div",{className:n,children:[l,m]}),t[9]=n,t[10]=l,t[11]=m,t[12]=u):u=t[12],u}function N({bill:a}){const t=l=>l?new Date(l).toLocaleDateString("en-SS",{year:"numeric",month:"long",day:"2-digit"}):"",i=a?.customer,f=(()=>{const l=i?.name?.trim();return l?l.split(/\s+/).filter(Boolean).slice(0,3).join(" "):"—"})(),p=i?.tariff||a?.home?.tariff||{},r=a?.meter_reading,o=r?.current_reading-r?.previous_reading||0,c=o*p.price,n=Number(c||0)+Number(a?.fix_charges||0)+Number(a?.previous_balance||0);return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
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
                            background-color: #eee !important;
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
                `}),e.jsxs("div",{className:"bill-print-root mt-3 mb-4 w-full bg-gray-200 p-3 text-base print:text-xs",children:[e.jsxs("div",{className:"flex items-center justify-between border-b border-slate-200 pb-2",children:[e.jsx("div",{className:"h-16 w-16",children:e.jsx("img",{className:"h-full w-full object-contain",src:"/logo.png",alt:"Logo"})}),e.jsxs("div",{className:"flex flex-1 flex-col items-center text-center",children:[e.jsxs("p",{className:"bill-print-heading text-lg font-semibold tracking-wide text-slate-600 uppercase print:text-lg",children:["South Sudan Urban Water Corporation ",e.jsx("br",{})," CE Juba Station"]}),e.jsx("p",{className:"text-sm font-semibold text-slate-900",children:"Water Bill"}),e.jsx("div",{className:"mt-0.5 text-center",children:e.jsxs("p",{className:"text-sm font-semibold text-red-600",children:["#",a?.bill_number]})})]}),e.jsx("div",{className:"h-16 w-16",children:e.jsx("img",{className:"h-full w-full object-contain",src:"/tape.png",alt:"Tape"})})]}),e.jsxs("div",{className:"mt-4 flex space-x-6",children:[e.jsxs("div",{className:"flex-1 space-y-1.5 text-xs",children:[e.jsx(s,{label:"Cus Name",value:f}),e.jsx(s,{label:"Tariff",value:p?.name||"—"}),e.jsx(s,{label:"Zone",value:i?.zone?.name||"—"}),e.jsx(s,{label:"Area",value:i?.address||i?.area?.name||"—"})]}),e.jsxs("div",{className:"flex-1 space-y-1.5 text-xs",children:[e.jsx(s,{label:"Date",value:t(a?.billing_period_end)}),e.jsx(s,{label:"Meter No",value:r?.meter?.meter_number||"—"}),e.jsx(s,{label:"Previous Reading",value:r?.previous_reading??0}),e.jsx(s,{label:"Current Reading",value:r?.current_reading??0}),e.jsx(s,{label:"Usage",value:`${o} m³`})]}),e.jsxs("div",{className:"flex-1 space-y-1.5 text-xs",children:[e.jsx(s,{label:"Outstanding Balance",value:d(a?.previous_balance||0)}),e.jsx(s,{label:"Fixed Charges",value:d(a?.fix_charges||0)}),e.jsx(s,{label:"Tariff",value:d(a?.tariff||0)}),e.jsx(s,{label:"Volume Charges",value:d(c||0)}),e.jsx(s,{label:"Total",value:d(n),className:"border-t border-slate-200 pt-1.5",valueClassName:"normal-case text-slate-900"})]})]}),e.jsxs("div",{className:"flex items-end justify-between gap-4 pt-4 text-xs print:text-xs",children:[e.jsxs("div",{children:[e.jsx("div",{className:"mt-10 text-xs font-semibold text-slate-700",children:a?.meterReading?.reader?.name||"System"}),e.jsx("p",{className:"mt-1 text-xs text-slate-500",children:"Sign: Billing Officer"})]}),e.jsxs("ul",{className:"list-disc space-y-0.5 text-xs text-slate-600 print:text-xs",children:[e.jsx("li",{children:"Make the settlement of water bills monthly within seven days to avoid disconnection and take care of your water tap"}),e.jsx("li",{children:"To report to Juba-Station management in case of damage or enquiry Call: +211929928736 / +211929928737"})]})]})]})]})}export{N as P};
