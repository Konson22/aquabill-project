import{r as c,j as e,H as f}from"./app-DrILltsX.js";import{c as d}from"./compiler-runtime-BOU1w6mF.js";import{P as b}from"./print-bill-card-CTIOv-fB.js";/* empty css            */import"./utils-D3e9f77r.js";function k(a){const t=d.c(11),{bills:l}=a;let s;t[0]===Symbol.for("react.memo_cache_sentinel")?(s=[],t[0]=s):s=t[0],c.useEffect(u,s);const p=`Print Bills #${l?.length||""}`;let n;t[1]!==p?(n=e.jsx(f,{title:p}),t[1]=p,t[2]=n):n=t[2];let m;t[3]===Symbol.for("react.memo_cache_sentinel")?(m=e.jsx("style",{children:`
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
                `}),t[3]=m):m=t[3];let i;t[4]!==l?(i=l.map(g),t[4]=l,t[5]=i):i=t[5];let r;t[6]!==i?(r=e.jsx("div",{className:"print-bill-page min-h-screen bg-gray-100 p-4",children:i}),t[6]=i,t[7]=r):r=t[7];let o;return t[8]!==n||t[9]!==r?(o=e.jsxs(e.Fragment,{children:[n,m,r]}),t[8]=n,t[9]=r,t[10]=o):o=t[10],o}function g(a){return e.jsx("div",{className:"print-bill-item",children:e.jsx(b,{bill:a})},a.id)}function u(){window.print()}export{k as default};
