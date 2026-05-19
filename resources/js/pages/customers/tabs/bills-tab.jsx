import PaymentModal from '@/components/payment-modal';
import { useState } from 'react';
import CustomerBills, { printCustomerBillsTable } from '../components/customer-bills';
import CustomerTabExport from '../components/customer-tab-export';
import CustomerTabPrint from '../components/customer-tab-print';

export default function BillsTab({
    bills,
    customerId,
    customerName,
    accountNumber,
    stations = [],
}) {
    const list = Array.isArray(bills) ? bills : [];
    const exportHref =
        customerId != null ? route('bills.export', { customer_id: customerId }) : null;
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [activeBill, setActiveBill] = useState(null);

    const openPayment = (bill) => {
        setActiveBill({
            ...bill,
            customer: bill.customer ?? {
                name: customerName,
                account_number: accountNumber,
            },
        });
        setPaymentOpen(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap justify-end gap-2 print:hidden">
                <CustomerTabPrint onPrint={printCustomerBillsTable} visible={list.length > 0} />
                <CustomerTabExport href={exportHref} visible={list.length > 0} />
            </div>
            <CustomerBills bills={bills} onRecordPayment={openPayment} />
            <PaymentModal
                open={paymentOpen}
                onOpenChange={setPaymentOpen}
                bill={activeBill}
                stations={stations}
            />
        </div>
    );
}
