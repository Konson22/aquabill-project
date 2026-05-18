import CustomerPayments from '../components/customer-payments';
import CustomerTabExport from '../components/customer-tab-export';

export default function PaymentsTab({ bills, customerId }) {
    const list = Array.isArray(bills) ? bills : [];
    const hasPaymentActivity = list.some((bill) => Number(bill?.payments_sum_amount ?? 0) > 0);
    const exportHref =
        customerId != null ? route('customers.payments.export', customerId) : null;

    return (
        <div className="space-y-4">
            <CustomerTabExport href={exportHref} visible={hasPaymentActivity} />
            <CustomerPayments bills={bills} />
        </div>
    );
}
