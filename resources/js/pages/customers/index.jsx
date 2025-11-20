import InvoiceModal from '@/components/modals/invoice-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Activity, Calendar, DollarSign, Download, Droplets, FileText, Plus, Search, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs = [
    {
        title: 'Customers',
        href: '/customers',
    },
];

export default function Customers({ areas, categories, customers, meters = [] }) {
    const page = usePage();
    const { auth, errors = {} } = page.props;
    const userDepartment = auth.user?.department?.name;
    const isBillingDepartment = userDepartment === 'Billing';
    const isFinanceDepartment = userDepartment === 'Finance';

    const [searchQuery, setSearchQuery] = useState('');
    const [filteredCustomers, setFilteredCustomers] = useState(customers);
    const [filteredStats, setFilteredStats] = useState({
        total_customers: customers.length,
        active_customers: customers.filter((c) => c.is_active).length,
        inactive_customers: customers.filter((c) => !c.is_active).length,
        customers_with_meters: customers.filter((c) => !!c.meter).length,
    });

    // Invoice modal state
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [selectedCustomerForInvoice, setSelectedCustomerForInvoice] = useState(null);

    // Initial reading modal state
    const [isInitialReadingModalOpen, setIsInitialReadingModalOpen] = useState(false);
    const [selectedCustomerForInitialReading, setSelectedCustomerForInitialReading] = useState(null);
    const [initialReadingValue, setInitialReadingValue] = useState('');
    const [initialReadingDate, setInitialReadingDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [initialReadingNote, setInitialReadingNote] = useState('');
    const [isSavingInitialReading, setIsSavingInitialReading] = useState(false);

    const getToday = () => new Date().toISOString().split('T')[0];

    // Handle invoice modal
    const handleCreateInvoice = (customer) => {
        setSelectedCustomerForInvoice(customer);
        setIsInvoiceModalOpen(true);
    };

    const handleCloseInvoiceModal = () => {
        setIsInvoiceModalOpen(false);
        setSelectedCustomerForInvoice(null);
    };

    const handleInvoiceSuccess = () => {
        // Optionally refresh the page or show a success message
        window.location.reload();
    };

    const canCaptureInitialReading = (customer) => {
        if (!customer?.meter) {
            return false;
        }

        if (typeof customer.meter.readings_count === 'number') {
            return customer.meter.readings_count === 0;
        }

        if (Array.isArray(customer.meter.readings)) {
            return customer.meter.readings.length === 0;
        }

        if (typeof customer.readings_count === 'number') {
            return customer.readings_count === 0;
        }

        if (Array.isArray(customer.readings)) {
            return customer.readings.length === 0;
        }

        return false;
    };

    const openInitialReadingModal = (customer) => {
        if (!customer?.meter) return;
        setSelectedCustomerForInitialReading(customer);
        setInitialReadingValue('');
        setInitialReadingNote('');
        setInitialReadingDate(getToday());
        setIsInitialReadingModalOpen(true);
    };

    const closeInitialReadingModal = () => {
        setIsInitialReadingModalOpen(false);
        setSelectedCustomerForInitialReading(null);
        setInitialReadingValue('');
        setInitialReadingNote('');
        setInitialReadingDate(getToday());
        setIsSavingInitialReading(false);
    };

    const handleInitialReadingSubmit = () => {
        if (initialReadingValue === '' || Number(initialReadingValue) < 0 || !selectedCustomerForInitialReading?.meter) {
            return;
        }

        setIsSavingInitialReading(true);
        router.post(
            `/customers/${selectedCustomerForInitialReading.id}/initial-reading`,
            {
                value: Number(initialReadingValue),
                date: initialReadingDate,
                note: initialReadingNote,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    closeInitialReadingModal();
                    router.reload();
                },
                onError: () => {
                    setIsSavingInitialReading(false);
                },
                onFinish: () => {
                    setIsSavingInitialReading(false);
                },
            },
        );
    };

    // Filter customers based on search query
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredCustomers(customers);
            setFilteredStats({
                total_customers: customers.length,
                active_customers: customers.filter((c) => c.is_active).length,
                inactive_customers: customers.filter((c) => !c.is_active).length,
                customers_with_meters: customers.filter((c) => !!c.meter).length,
            });
        } else {
            const filtered = customers.filter((customer) => {
                const searchLower = searchQuery.toLowerCase();

                // Search in customer name
                const customerName = `${customer.first_name || ''} ${customer.last_name || ''}`.toLowerCase();
                if (customerName.includes(searchLower)) return true;

                // Search in phone
                const phone = customer.phone?.toLowerCase() || '';
                if (phone.includes(searchLower)) return true;

                // Search in email
                const email = customer.email?.toLowerCase() || '';
                if (email.includes(searchLower)) return true;

                // Search in address
                const address = customer.address?.toLowerCase() || '';
                if (address.includes(searchLower)) return true;

                // Search in contract
                const contract = customer.contract?.toLowerCase() || '';
                if (contract.includes(searchLower)) return true;

                // Search in location name
                const locationName = customer.location?.name?.toLowerCase() || '';
                if (locationName.includes(searchLower)) return true;

                // Search in meter serial
                const meterSerial = customer.meter?.serial?.toLowerCase() || '';
                if (meterSerial.includes(searchLower)) return true;

                return false;
            });

            setFilteredCustomers(filtered);
            setFilteredStats({
                total_customers: filtered.length,
                active_customers: filtered.filter((c) => c.is_active).length,
                inactive_customers: filtered.filter((c) => !c.is_active).length,
                customers_with_meters: filtered.filter((c) => !!c.meter).length,
            });
        }
    }, [searchQuery, customers]);

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customers" />

            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Customers</h1>
                </div>
                <div className="flex items-center gap-2">
                    <a href="/customers/export">
                        <Button variant="outline" className="gap-2">
                            <Download className="h-4 w-4" />
                            Export All
                        </Button>
                    </a>
                    {!isBillingDepartment && !isFinanceDepartment && (
                        <Link href="/customers/create">
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                Add Customer
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="p-4">
                    <div className="flex flex-row items-center justify-between">
                        <h3 className="text-xs font-medium text-slate-600 dark:text-slate-400">Total Customers</h3>
                        <Users className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{filteredStats.total_customers}</div>
                </Card>

                <Card className="p-4">
                    <div className="flex flex-row items-center justify-between">
                        <h3 className="text-xs font-medium text-slate-600 dark:text-slate-400">Active Customers</h3>
                        <Activity className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{filteredStats.active_customers}</div>
                </Card>

                <Card className="p-4">
                    <div className="flex flex-row items-center justify-between">
                        <h3 className="text-xs font-medium text-slate-600 dark:text-slate-400">With Meters</h3>
                        <Calendar className="h-3.5 w-3.5 text-purple-600" />
                    </div>
                    <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{filteredStats.customers_with_meters}</div>
                </Card>

                <Card className="p-4">
                    <div className="flex flex-row items-center justify-between">
                        <h3 className="text-xs font-medium text-slate-600 dark:text-slate-400">Inactive</h3>
                        <DollarSign className="h-3.5 w-3.5 text-red-600" />
                    </div>
                    <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{filteredStats.inactive_customers}</div>
                </Card>
            </div>

            {/* Customers Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>All Customers</CardTitle>
                            <CardDescription>Manage customer information and accounts</CardDescription>
                        </div>
                        <div className="flex w-[35%] items-center">
                            <Input
                                type="text"
                                placeholder="Search customers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800">
                                    <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">Customer</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">Contact</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">Area</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">Status</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCustomers.length > 0 ? (
                                    filteredCustomers.map((customer) => (
                                        <tr
                                            key={customer.id}
                                            className="border-b border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center">
                                                    <Users className="mr-2 h-4 w-4 text-slate-400" />
                                                    <div>
                                                        <span className="font-medium">
                                                            {customer.first_name} {customer.last_name}
                                                        </span>
                                                        {customer.contract && <p className="text-xs text-slate-500">#{customer.account_number}</p>}
                                                        {customer.meter?.serial && (
                                                            <p className="text-xs text-slate-500">Meter: {customer.meter.serial}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm">
                                                    {customer.phone && <div>{customer.phone}</div>}
                                                    {customer.email && <div className="text-slate-500">{customer.email}</div>}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {customer.address ? (
                                                    <Badge variant="outline">{customer.address}</Badge>
                                                ) : (
                                                    <span className="text-slate-400">No location</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    className={
                                                        customer.is_active
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                    }
                                                >
                                                    {customer.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex space-x-2">
                                                    <Link href={`/customers/${customer.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            View
                                                        </Button>
                                                    </Link>
                                                    {!isBillingDepartment && (
                                                        <>
                                                            {!isFinanceDepartment && (
                                                                <Link href={`/customers/${customer.id}/edit`}>
                                                                    <Button variant="outline" size="sm">
                                                                        Edit
                                                                    </Button>
                                                                </Link>
                                                            )}
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleCreateInvoice(customer)}
                                                                className="gap-1"
                                                            >
                                                                <FileText className="h-3 w-3" />
                                                                Invoice
                                                            </Button>
                                                            {canCaptureInitialReading(customer) && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => openInitialReadingModal(customer)}
                                                                    className="gap-1"
                                                                >
                                                                    <Droplets className="h-3 w-3" />
                                                                    Initial
                                                                </Button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                                            <div className="flex flex-col items-center">
                                                <Search className="mb-2 h-8 w-8 text-slate-300" />
                                                <p className="text-sm">No customers found matching your search.</p>
                                                {searchQuery && (
                                                    <p className="mt-1 text-xs text-slate-400">
                                                        Try adjusting your search terms or clear the search to see all customers.
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Results Count */}
                    <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            Showing {filteredCustomers.length} of {customers.length} customers
                            {searchQuery && <span className="ml-2 text-slate-500">(filtered by "{searchQuery}")</span>}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Invoice Modal */}
            <InvoiceModal
                isOpen={isInvoiceModalOpen}
                onClose={handleCloseInvoiceModal}
                customers={customers}
                meters={meters}
                selectedCustomer={selectedCustomerForInvoice}
                onSuccess={handleInvoiceSuccess}
            />

            {/* Initial Reading Modal */}
            <Dialog open={isInitialReadingModalOpen} onOpenChange={(open) => (open ? null : closeInitialReadingModal())}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Droplets className="h-5 w-5 text-blue-600" />
                            Record Initial Reading
                        </DialogTitle>
                        <DialogDescription>
                            {selectedCustomerForInitialReading
                                ? `Capture the initial meter reading for ${selectedCustomerForInitialReading.first_name} ${selectedCustomerForInitialReading.last_name}.`
                                : 'Capture the initial meter reading.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-5">
                        {selectedCustomerForInitialReading && (
                            <div className="rounded-lg border bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
                                <p className="text-xs text-slate-500 uppercase dark:text-slate-400">Meter</p>
                                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                    {selectedCustomerForInitialReading.meter?.serial || `Meter #${selectedCustomerForInitialReading.meter?.id}`}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    This value sets the baseline for future consumption calculations.
                                </p>
                            </div>
                        )}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="initial-reading-value">Initial Reading (m³)</Label>
                                <Input
                                    id="initial-reading-value"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={initialReadingValue}
                                    onChange={(e) => setInitialReadingValue(e.target.value)}
                                    placeholder="Enter reading value"
                                />
                                {errors.value && <p className="text-xs text-red-600">{errors.value}</p>}
                                <p className="text-xs text-slate-500">Use the latest display from the meter.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="initial-reading-date">Reading Date</Label>
                                <Input
                                    id="initial-reading-date"
                                    type="date"
                                    value={initialReadingDate}
                                    max={getToday()}
                                    onChange={(e) => setInitialReadingDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="initial-reading-note">Notes (optional)</Label>
                            <Textarea
                                id="initial-reading-note"
                                rows={3}
                                placeholder="Describe how this reading was captured"
                                value={initialReadingNote}
                                onChange={(e) => setInitialReadingNote(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={closeInitialReadingModal} disabled={isSavingInitialReading}>
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={handleInitialReadingSubmit}
                                disabled={initialReadingValue === '' || Number(initialReadingValue) < 0 || isSavingInitialReading}
                            >
                                {isSavingInitialReading ? 'Saving...' : 'Save Initial Reading'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
