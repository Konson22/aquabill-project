import{u as d,r as u,b,j as e,H as g}from"./app-CqZcE_-V.js";import{c as x}from"./compiler-runtime-ClKKkGgL.js";import{P as h}from"./print-bill-card-DCWP1UH7.js";/* empty css            */import"./utils-5hzXyfz6.js";function E(l){const t=x.c(13),{bills:s}=l,a=d().props.auth?.user?.department;let p,o;if(t[0]!==a?(p=()=>{if(a==="finance"){b.visit(route("bills"));return}window.print()},o=[a],t[0]=a,t[1]=p,t[2]=o):(p=t[1],o=t[2]),u.useEffect(p,o),a==="finance")return null;const f=`Print Bills #${s?.length||""}`;let n;t[3]!==f?(n=e.jsx(g,{title:f}),t[3]=f,t[4]=n):n=t[4];let m;t[5]===Symbol.for("react.memo_cache_sentinel")?(m=e.jsx("style",{children:`
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
                `}),t[5]=m):m=t[5];let i;t[6]!==s?(i=s.map(j),t[6]=s,t[7]=i):i=t[7];let r;t[8]!==i?(r=e.jsx("div",{className:"print-bill-page min-h-screen bg-gray-100 p-4",children:i}),t[8]=i,t[9]=r):r=t[9];let c;return t[10]!==n||t[11]!==r?(c=e.jsxs(e.Fragment,{children:[n,m,r]}),t[10]=n,t[11]=r,t[12]=c):c=t[12],c}function j(l){return e.jsx("div",{className:"print-bill-item",children:e.jsx(h,{bill:l})},l.id)}export{E as default};
