import CustomerBills from '../components/customer-bills';
import CustomerTabExport from '../components/customer-tab-export';

export default function BillsTab({ bills, customerId }) {
    const list = Array.isArray(bills) ? bills : [];
    const exportHref =
        customerId != null ? route('bills.export', { customer_id: customerId }) : null;

    return (
        <div className="space-y-4">
            <CustomerTabExport href={exportHref} visible={list.length > 0} />
            <CustomerBills bills={bills} />
        </div>
    );
}
