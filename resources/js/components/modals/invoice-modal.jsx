import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import InvoiceForm from '@/pages/forms/invoice-form';
import { FileText, X } from 'lucide-react';

export default function InvoiceModal({ isOpen, onClose, customers = [], meters = [], selectedCustomer = null, onSuccess }) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
                <DialogHeader className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                                <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-semibold">Create Invoice</DialogTitle>
                                <DialogDescription className="text-sm text-slate-600 dark:text-slate-400">
                                    Generate a new service invoice
                                </DialogDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="px-2 py-1">
                                <FileText className="mr-1 h-3 w-3" />
                                New Invoice
                            </Badge>
                            <button
                                onClick={onClose}
                                className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none"
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Close</span>
                            </button>
                        </div>
                    </div>
                </DialogHeader>

                <div className="mt-6">
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
