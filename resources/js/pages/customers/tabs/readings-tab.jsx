import CustomerReadings from '../components/customer-readings';
import CustomerTabExport from '../components/customer-tab-export';

export default function ReadingsTab({ readings, customerId }) {
    const list = Array.isArray(readings) ? readings : [];
    const exportHref =
        customerId != null ? route('customers.readings.export', customerId) : null;

    return (
        <div className="space-y-4">
            <CustomerTabExport href={exportHref} visible={list.length > 0} />
            <CustomerReadings readings={readings} />
        </div>
    );
}
