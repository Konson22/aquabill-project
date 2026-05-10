import{j as i,L as a}from"./app-BvcbtHZ4.js";import{P as e}from"./print-bill-card-B_k_Ch_p.js";import"./utils-BJCfTd35.js";function s({bills:t}){return i.jsxs(i.Fragment,{children:[i.jsx(a,{title:`Print Bills #${(t==null?void 0:t.length)||""}`}),i.jsx("style",{children:`
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
                `}),i.jsx("div",{className:"print-bill-page min-h-screen bg-gray-100 p-4",children:t.map(r=>i.jsx("div",{className:"print-bill-item",children:i.jsx(e,{bill:r})},r.id))})]})}export{s as default};
