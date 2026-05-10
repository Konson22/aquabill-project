import{r as n,j as e,L as s}from"./app-BvcbtHZ4.js";import{P as i}from"./print-bill-card-B_k_Ch_p.js";import"./utils-BJCfTd35.js";function c({bill:t}){return n.useEffect(()=>{const r=setTimeout(()=>{window.print()},500);return()=>clearTimeout(r)},[]),e.jsxs("div",{className:"min-h-screen bg-white px-4 py-6 print:p-0",children:[e.jsx(s,{title:`Print Bill #${(t==null?void 0:t.bill_no)??(t==null?void 0:t.id)??""}`}),e.jsx("div",{className:"mx-auto w-full max-w-[21cm]",children:e.jsx(i,{bill:t})}),e.jsx("style",{dangerouslySetInnerHTML:{__html:`
                @page {
                    size: A4;
                    margin: 0;
                }
                body {
                    -webkit-print-color-adjust: exact;
                }
                @media print {
                    .min-h-screen { min-height: auto; }
                    body { background: white; }
                }
            `}})]})}export{c as default};
