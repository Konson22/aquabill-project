import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import InvoiceForm from '@/pages/forms/invoice-form';
import { X } from 'lucide-react';

export default function InvoiceModal({ isOpen, onClose, customers = [], meters = [], selectedCustomer = null, onSuccess }) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Create Invoice</span>
                        <button
                            onClick={onClose}
                            className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none"
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </button>
                    </DialogTitle>
                    <DialogDescription>Create a new invoice for the selected customer</DialogDescription>
                </DialogHeader>

                <div className="mt-4">
                    <InvoiceForm
                        customers={customers}
                        meters={meters}
                        selectedCustomer={selectedCustomer}
                        isEditing={false}
                        onSuccess={() => {
                            onSuccess?.();
                            onClose();
                        }}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
