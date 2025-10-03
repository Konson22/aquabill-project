import { useEffect } from 'react';

export default function PrintLayout({ children, onPrint }) {
    useEffect(() => {
        if (onPrint) {
            onPrint();
        }
    }, [onPrint]);

    return (
        <div className="print-layout">
            <style>
                {`
                    @media print {
                        body { margin: 0 !important; padding: 0 !important; }
                        .print-layout { 
                            width: 100% !important; 
                            margin: 0 !important; 
                            padding: 0.5in !important;
                            box-sizing: border-box !important;
                        }
                        .no-print { display: none !important; }
                    }
                `}
            </style>
            {children}
        </div>
    );
}
