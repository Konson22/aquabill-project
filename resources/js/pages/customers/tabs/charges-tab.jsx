import CustomerServiceCharges from '../components/customer-service-charges';
import CustomerTabExport from '../components/customer-tab-export';

export default function ChargesTab({ serviceCharges, customerId }) {
    const list = Array.isArray(serviceCharges) ? serviceCharges : [];
    const exportHref =
        customerId != null ? route('customers.service-charges.export', customerId) : null;

    return (
        <div className="space-y-4">
            <CustomerTabExport href={exportHref} visible={list.length > 0} />
            <CustomerServiceCharges serviceCharges={serviceCharges} />
        </div>
    );
}
