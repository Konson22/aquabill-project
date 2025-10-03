import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';
import { useState } from 'react';

export default function PrintModal({ isOpen, onClose, children }) {
    const [isPrinting, setIsPrinting] = useState(false);

    const handlePrint = () => {
        setIsPrinting(true);
        window.print();
        // Reset after print dialog closes
        setTimeout(() => {
            setIsPrinting(false);
        }, 1000);
    };

    if (!isOpen) return null;

    return (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
            <div className="relative w-full max-w-4xl rounded-lg bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b p-4">
                    <h2 className="text-lg font-semibold">Print Preview</h2>
                    <div className="flex gap-2">
                        <Button onClick={handlePrint} disabled={isPrinting}>
                            <Printer className="mr-2 h-4 w-4" />
                            {isPrinting ? 'Printing...' : 'Print'}
                        </Button>
                        <Button variant="outline" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="max-h-[80vh] overflow-y-auto p-4">{children}</div>
            </div>
        </div>
    );
}
