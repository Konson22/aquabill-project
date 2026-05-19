import CustomerPayments from '../components/customer-payments';
import CustomerServiceCharges from '../components/customer-service-charges';
import CustomerTabExport from '../components/customer-tab-export';

export default function PaymentsChargesTab({ bills, serviceCharges, customerId }) {
    const billList = Array.isArray(bills) ? bills : [];
    const chargeList = Array.isArray(serviceCharges) ? serviceCharges : [];
    const paymentBills = billList.filter((bill) => bill.status !== 'pending');
    const hasPaymentActivity = paymentBills.some((bill) => Number(bill?.payments_sum_amount ?? 0) > 0);
    const paymentsExportHref =
        customerId != null ? route('customers.payments.export', customerId) : null;
    const chargesExportHref =
        customerId != null ? route('customers.service-charges.export', customerId) : null;

    return (
        <div className="space-y-8">
            <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        Bill payments
                    </h3>
                    <CustomerTabExport href={paymentsExportHref} visible={hasPaymentActivity} />
                </div>
                <CustomerPayments bills={paymentBills} />
            </section>

            <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        Service charges
                    </h3>
                    <CustomerTabExport href={chargesExportHref} visible={chargeList.length > 0} />
                </div>
                <CustomerServiceCharges serviceCharges={serviceCharges} />
            </section>
        </div>
    );
}
