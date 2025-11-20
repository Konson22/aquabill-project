import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    Calendar,
    ChevronDown,
    CreditCard,
    Download,
    Droplets,
    Edit,
    FileText,
    Mail,
    MapPin,
    Phone,
    Plus,
    Printer,
    Receipt,
    Settings,
    Trash2,
    User,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

const breadcrumbs = [
    { title: 'Customers', href: '/customers' },
    { title: 'Profile', href: '#' },
];

export default function Show({ customer, availableMeters = [] }) {
    const page = usePage();
    const { auth, errors = {} } = page.props;
    const userDepartment = auth.user?.department?.name;
    const isBillingDepartment = userDepartment === 'Billing';
    const isFinanceDepartment = userDepartment === 'Finance';

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showAssignMeterModal, setShowAssignMeterModal] = useState(false);
    const [showManageMeterModal, setShowManageMeterModal] = useState(false);
    const [showInitialReadingModal, setShowInitialReadingModal] = useState(false);
    const [selectedMeterId, setSelectedMeterId] = useState('');
    const [selectedMeterStatus, setSelectedMeterStatus] = useState('');
    const [previousReading, setPreviousReading] = useState('');
    const [initialReadingValue, setInitialReadingValue] = useState('');
    const [initialReadingDate, setInitialReadingDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [initialReadingNote, setInitialReadingNote] = useState('');
    const [isSavingInitialReading, setIsSavingInitialReading] = useState(false);
    const [isEditingInitialReading, setIsEditingInitialReading] = useState(false);

    // Meter search state
    const [meterSearch, setMeterSearch] = useState('');
    const [showMeterDropdown, setShowMeterDropdown] = useState(false);
    const [filteredMeters, setFilteredMeters] = useState(availableMeters);
    const [selectedMeter, setSelectedMeter] = useState(null);
    const meterDropdownRef = useRef(null);

    const meterReadings = customer?.meter?.readings ?? [];
    const initialMeterReading = useMemo(() => {
        if (!meterReadings.length) {
            return null;
        }

        const sortedReadings = [...meterReadings].sort((a, b) => {
            const aTime = a.date ? new Date(a.date).getTime() : 0;
            const bTime = b.date ? new Date(b.date).getTime() : 0;
            return aTime - bTime;
        });

        return (
            sortedReadings.find((reading) => {
                const source = reading.source || '';
                const isInitialSource = source.startsWith('initial');
                const previousValue = Number(reading.previous ?? 0);
                const currentValue = Number(reading.value ?? 0);
                return isInitialSource || previousValue === currentValue;
            }) ?? sortedReadings[0]
        );
    }, [meterReadings]);

    const canAddInitialReading = Boolean(customer.meter) && meterReadings.length === 0;
    const canEditInitialReading = Boolean(customer.meter) && Boolean(initialMeterReading);
    const initialReadingSummary = initialMeterReading
        ? {
              rawValue: Number(initialMeterReading.value ?? 0),
              valueDisplay: Number(initialMeterReading.value ?? 0).toLocaleString(undefined, {
                  maximumFractionDigits: 2,
              }),
              date: initialMeterReading.date ? new Date(initialMeterReading.date).toLocaleDateString() : 'Not set',
              note: initialMeterReading.note,
          }
        : null;

    const getStatusColor = (isActive) => {
        return isActive
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    };

    const normalizeDateForInput = (value) => {
        if (!value) {
            return new Date().toISOString().split('T')[0];
        }

        const normalizedValue = typeof value === 'string' ? value : value.toString();

        return normalizedValue.includes('T') ? normalizedValue.split('T')[0] : normalizedValue;
    };

    const handlePrint = () => {
        // Create a new window for printing
        const printWindow = window.open('', '_blank');

        // Get the content to print (excluding sidebar and navbar)
        const contentToPrint = document.getElementById('printable-content');

        if (contentToPrint) {
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Customer Profile - ${customer.first_name} ${customer.last_name}</title>
                    <style>
                        @media print {
                            @page {
                                margin: 0.5in;
                                size: A4;
                            }
                            body {
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                line-height: 1.6;
                                color: #333;
                            }
                            .print-header {
                                text-align: center;
                                margin-bottom: 2rem;
                                padding-bottom: 1rem;
                                border-bottom: 2px solid #e5e7eb;
                            }
                            .print-title {
                                font-size: 24px;
                                font-weight: bold;
                                margin-bottom: 0.5rem;
                            }
                            .print-subtitle {
                                color: #6b7280;
                                font-size: 14px;
                            }
                            .print-section {
                                margin-bottom: 1.5rem;
                                page-break-inside: avoid;
                            }
                            .print-section-title {
                                font-size: 18px;
                                font-weight: 600;
                                margin-bottom: 1rem;
                                color: #1f2937;
                                border-bottom: 1px solid #e5e7eb;
                                padding-bottom: 0.5rem;
                            }
                            .print-grid {
                                display: grid;
                                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                                gap: 1rem;
                                margin-bottom: 1rem;
                            }
                            .print-card {
                                border: 1px solid #e5e7eb;
                                border-radius: 8px;
                                padding: 1rem;
                                background: #f9fafb;
                            }
                            .print-card-title {
                                font-weight: 600;
                                margin-bottom: 0.5rem;
                                color: #374151;
                            }
                            .print-info {
                                display: flex;
                                justify-content: space-between;
                                margin-bottom: 0.25rem;
                                font-size: 14px;
                            }
                            .print-label {
                                color: #6b7280;
                            }
                            .print-value {
                                font-weight: 500;
                            }
                            .print-table {
                                width: 100%;
                                border-collapse: collapse;
                                margin-top: 1rem;
                            }
                            .print-table th,
                            .print-table td {
                                border: 1px solid #e5e7eb;
                                padding: 0.5rem;
                                text-align: left;
                                font-size: 12px;
                            }
                            .print-table th {
                                background-color: #f3f4f6;
                                font-weight: 600;
                            }
                            .print-badge {
                                display: inline-block;
                                padding: 0.25rem 0.5rem;
                                border-radius: 4px;
                                font-size: 12px;
                                font-weight: 500;
                            }
                            .print-badge-active {
                                background-color: #dcfce7;
                                color: #166534;
                            }
                            .print-badge-inactive {
                                background-color: #fef2f2;
                                color: #991b1b;
                            }
                            .print-badge-paid {
                                background-color: #dcfce7;
                                color: #166534;
                            }
                            .print-badge-pending {
                                background-color: #fef3c7;
                                color: #92400e;
                            }
                            .print-badge-overdue {
                                background-color: #fef2f2;
                                color: #991b1b;
                            }
                            .no-print {
                                display: none !important;
                            }
                        }
                    </style>
                </head>
                <body>
                    ${contentToPrint.innerHTML}
                </body>
                </html>
            `);

            printWindow.document.close();
            printWindow.focus();

            // Wait for content to load, then print
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 250);
        }
    };

    const handleDeleteCustomer = () => {
        router.delete(`/customers/${customer.id}`, {
            onSuccess: () => {
                setShowDeleteDialog(false);
                // Redirect to customers index page after successful deletion
                router.visit('/customers');
            },
            onError: (errors) => {
                console.error('Error deleting customer:', errors);
                setShowDeleteDialog(false);
            },
        });
    };

    // Reset meter search when modal opens/closes
    useEffect(() => {
        if (showAssignMeterModal) {
            setFilteredMeters(availableMeters);
            setMeterSearch('');
            setSelectedMeter(null);
            setSelectedMeterId('');
            setShowMeterDropdown(false);
        }
    }, [showAssignMeterModal, availableMeters]);

    // Filter meters based on search
    useEffect(() => {
        if (meterSearch.trim() === '') {
            setFilteredMeters(availableMeters);
        } else {
            const filtered = availableMeters.filter(
                (meter) =>
                    (meter.serial && meter.serial.toLowerCase().includes(meterSearch.toLowerCase())) ||
                    (meter.meter_number && meter.meter_number.toLowerCase().includes(meterSearch.toLowerCase())) ||
                    (meter.model && meter.model.toLowerCase().includes(meterSearch.toLowerCase())),
            );
            setFilteredMeters(filtered);
        }
    }, [meterSearch, availableMeters]);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (meterDropdownRef.current && !meterDropdownRef.current.contains(event.target)) {
                setShowMeterDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleMeterSelect = (meter) => {
        setSelectedMeter(meter);
        setSelectedMeterId(meter.id.toString());
        setMeterSearch(meter.serial || meter.meter_number || `Meter #${meter.id}`);
        setShowMeterDropdown(false);
    };

    // Handle meter search input
    const handleMeterSearch = (value) => {
        setMeterSearch(value);
        setShowMeterDropdown(true);
        if (value === '') {
            setSelectedMeter(null);
            setSelectedMeterId('');
        }
    };

    // Clear meter selection
    const clearMeterSelection = () => {
        setSelectedMeter(null);
        setSelectedMeterId('');
        setMeterSearch('');
        setShowMeterDropdown(false);
    };

    const openInitialReadingModal = () => {
        if (!customer.meter) return;
        setIsEditingInitialReading(false);
        setInitialReadingValue('');
        setInitialReadingNote('');
        setInitialReadingDate(new Date().toISOString().split('T')[0]);
        setShowInitialReadingModal(true);
    };

    const openEditInitialReadingModal = () => {
        if (!initialMeterReading) return;
        setIsEditingInitialReading(true);
        setInitialReadingValue(initialMeterReading.value?.toString() ?? '');
        setInitialReadingNote(initialMeterReading.note ?? '');
        setInitialReadingDate(normalizeDateForInput(initialMeterReading.date));
        setShowInitialReadingModal(true);
    };

    const handleInitialReadingModalChange = (open) => {
        setShowInitialReadingModal(open);
        if (!open) {
            setInitialReadingValue('');
            setInitialReadingNote('');
            setInitialReadingDate(new Date().toISOString().split('T')[0]);
            setIsSavingInitialReading(false);
            setIsEditingInitialReading(false);
        }
    };

    const handleInitialReadingSubmit = () => {
        if (initialReadingValue === '' || Number(initialReadingValue) < 0 || !customer.meter) {
            return;
        }

        setIsSavingInitialReading(true);

        const payload = {
            value: Number(initialReadingValue),
            date: initialReadingDate,
            note: initialReadingNote,
        };

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                handleInitialReadingModalChange(false);
                router.reload();
            },
            onError: () => {
                setIsSavingInitialReading(false);
            },
            onFinish: () => {
                setIsSavingInitialReading(false);
            },
        };

        if (isEditingInitialReading) {
            router.post(
                `/customers/${customer.id}/initial-reading`,
                {
                    ...payload,
                    _method: 'put',
                },
                options,
            );
        } else {
            router.post(`/customers/${customer.id}/initial-reading`, payload, options);
        }
    };

    const handleAssignMeter = () => {
        if (!selectedMeterId || previousReading === '') {
            return;
        }

        router.post(
            `/customers/${customer.id}/assign-meter`,
            {
                meter_id: selectedMeterId,
                previous_reading: Number(previousReading),
            },
            {
                onSuccess: () => {
                    setShowAssignMeterModal(false);
                    setSelectedMeterId('');
                    setSelectedMeter(null);
                    setMeterSearch('');
                    setPreviousReading('');
                    // Refresh the page to show the updated meter information
                    router.reload();
                },
                onError: (errors) => {
                    console.error('Error assigning meter:', errors);
                },
            },
        );
    };

    const handleUpdateMeterStatus = () => {
        if (!selectedMeterStatus || !customer.meter) {
            return;
        }

        router.post(
            `/customers/${customer.id}/update-meter-status`,
            {
                meter_id: customer.meter.id,
                status: selectedMeterStatus,
            },
            {
                onSuccess: () => {
                    setShowManageMeterModal(false);
                    setSelectedMeterStatus('');
                    // Refresh the page to show the updated meter information
                    router.reload();
                },
                onError: (errors) => {
                    console.error('Error updating meter status:', errors);
                },
            },
        );
    };

    const handleReplaceMeter = () => {
        setShowManageMeterModal(false);
        setShowAssignMeterModal(true);
    };

    useEffect(() => {
        if (!showAssignMeterModal) {
            setSelectedMeterId('');
            setPreviousReading('');
        }
    }, [showAssignMeterModal]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Customer - ${customer.first_name} ${customer.last_name}`} />

            {/* Header Section */}
            <div className="mb-8">
                <div className="mb-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white shadow-lg">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                                <User className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">
                                    {customer.first_name} {customer.last_name}
                                </h1>
                                <p className="mt-1 text-blue-100">
                                    Account #{customer.account_number || 'N/A'} • {customer.category?.name || 'No Category'}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge className={`${getStatusColor(customer.is_active)} text-sm`}>{customer.is_active ? 'Active' : 'Inactive'}</Badge>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="no-print flex flex-wrap items-center gap-2">
                    {!isBillingDepartment && !isFinanceDepartment && (
                        <>
                            <Link href={`/customers/${customer.id}/edit`}>
                                <Button variant="outline">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Profile
                                </Button>
                            </Link>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        <Download className="mr-2 h-4 w-4" />
                                        Export Excel
                                        <ChevronDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <a href={`/customers/${customer.id}/export`} className="flex items-center">
                                            <User className="mr-2 h-4 w-4" />
                                            Export All Data
                                        </a>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <a href={`/customers/${customer.id}/export-readings`} className="flex items-center">
                                            <Activity className="mr-2 h-4 w-4" />
                                            Export Readings
                                        </a>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <a href={`/customers/${customer.id}/export-bills`} className="flex items-center">
                                            <Receipt className="mr-2 h-4 w-4" />
                                            Export Bills
                                        </a>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button variant="outline" onClick={() => setShowDeleteDialog(true)} className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </Button>
                        </>
                    )}
                    {isFinanceDepartment && (
                        <>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        <Download className="mr-2 h-4 w-4" />
                                        Export Excel
                                        <ChevronDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <a href={`/customers/${customer.id}/export`} className="flex items-center">
                                            <User className="mr-2 h-4 w-4" />
                                            Export All Data
                                        </a>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <a href={`/customers/${customer.id}/export-readings`} className="flex items-center">
                                            <Activity className="mr-2 h-4 w-4" />
                                            Export Readings
                                        </a>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <a href={`/customers/${customer.id}/export-bills`} className="flex items-center">
                                            <Receipt className="mr-2 h-4 w-4" />
                                            Export Bills
                                        </a>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    )}
                    <Button onClick={() => (customer.meter ? setShowManageMeterModal(true) : setShowAssignMeterModal(true))}>
                        <Plus className="mr-2 h-4 w-4" />
                        {customer.meter ? 'Manage Meter' : 'Assign Meter'}
                    </Button>
                    <Button onClick={handlePrint} variant="outline">
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                    </Button>
                </div>
            </div>

            {/* Tabs Section */}
            <div className="mt-6">
                <Tabs defaultValue="information" className="w-full">
                    <TabsList className="mb-6 flex h-auto w-full overflow-x-auto rounded-lg border bg-white p-1.5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                        <TabsTrigger
                            value="information"
                            className="flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all hover:bg-slate-100 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-slate-600 dark:hover:bg-slate-700 dark:data-[state=inactive]:text-slate-300"
                        >
                            <User className="h-4 w-4" />
                            <span>Information</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="meters"
                            className="flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all hover:bg-slate-100 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-slate-600 dark:hover:bg-slate-700 dark:data-[state=inactive]:text-slate-300"
                        >
                            <Droplets className="h-4 w-4" />
                            <span>Meter</span>
                            {customer.meter && (
                                <Badge variant="secondary" className="ml-1 h-5 px-1.5 py-0 text-xs">
                                    {customer.meter?.status || 'Unknown'}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger
                            value="readings"
                            className="flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all hover:bg-slate-100 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-slate-600 dark:hover:bg-slate-700 dark:data-[state=inactive]:text-slate-300"
                        >
                            <Activity className="h-4 w-4" />
                            <span>Readings</span>
                            {customer.readings?.length > 0 && (
                                <Badge variant="secondary" className="ml-1 h-5 px-1.5 py-0 text-xs">
                                    {customer.readings.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        {!isBillingDepartment && !isFinanceDepartment && (
                            <>
                                <TabsTrigger
                                    value="bills"
                                    className="flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all hover:bg-slate-100 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-slate-600 dark:hover:bg-slate-700 dark:data-[state=inactive]:text-slate-300"
                                >
                                    <Receipt className="h-4 w-4" />
                                    <span>Bills</span>
                                    {customer.bills?.length > 0 && (
                                        <Badge variant="secondary" className="ml-1 h-5 px-1.5 py-0 text-xs">
                                            {customer.bills.length}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="invoices"
                                    className="flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all hover:bg-slate-100 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-slate-600 dark:hover:bg-slate-700 dark:data-[state=inactive]:text-slate-300"
                                >
                                    <FileText className="h-4 w-4" />
                                    <span>Invoices</span>
                                    {customer.invoices?.length > 0 && (
                                        <Badge variant="secondary" className="ml-1 h-5 px-1.5 py-0 text-xs">
                                            {customer.invoices.length}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                            </>
                        )}
                        {!isBillingDepartment && (
                            <TabsTrigger
                                value="payments"
                                className="flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all hover:bg-slate-100 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-slate-600 dark:hover:bg-slate-700 dark:data-[state=inactive]:text-slate-300"
                            >
                                <CreditCard className="h-4 w-4" />
                                <span>Payments</span>
                                {customer.payments?.length > 0 && (
                                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 py-0 text-xs">
                                        {customer.payments.length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        )}
                    </TabsList>

                    <TabsContent value="information" className="mt-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {/* Contact Information */}
                            <Card className="border-0 shadow-md">
                                <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-blue-100/50 pb-3 dark:from-blue-900/20 dark:to-blue-800/10">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <div className="rounded-lg bg-blue-600 p-1.5">
                                            <Phone className="h-4 w-4 text-white" />
                                        </div>
                                        Contact Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20">
                                                <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Phone</p>
                                                <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                    {customer.phone || 'Not provided'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20">
                                                <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Email</p>
                                                <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                    {customer.email || 'Not provided'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20">
                                                <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Address</p>
                                                <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                    {customer.address || 'Not provided'}
                                                </p>
                                                {customer.plot_number && (
                                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Plot: {customer.plot_number}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Account Details */}
                            <Card className="border-0 shadow-md">
                                <CardHeader className="border-b bg-gradient-to-r from-green-50 to-green-100/50 pb-3 dark:from-green-900/20 dark:to-green-800/10">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <div className="rounded-lg bg-green-600 p-1.5">
                                            <CreditCard className="h-4 w-4 text-white" />
                                        </div>
                                        Account Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-lg bg-green-50 p-2 dark:bg-green-900/20">
                                                <CreditCard className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Account Number</p>
                                                <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                    {customer.account_number || 'Not assigned'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-lg bg-green-50 p-2 dark:bg-green-900/20">
                                                <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Contract Date</p>
                                                <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                    {customer.date ? new Date(customer.date).toLocaleDateString() : 'Not provided'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-lg bg-green-50 p-2 dark:bg-green-900/20">
                                                <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Status</p>
                                                <div className="mt-1">
                                                    <Badge className={`${getStatusColor(customer.is_active)}`}>
                                                        {customer.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Location & Category */}
                            <Card className="border-0 shadow-md">
                                <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-purple-100/50 pb-3 dark:from-purple-900/20 dark:to-purple-800/10">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <div className="rounded-lg bg-purple-600 p-1.5">
                                            <MapPin className="h-4 w-4 text-white" />
                                        </div>
                                        Location & Category
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-lg bg-purple-50 p-2 dark:bg-purple-900/20">
                                                <MapPin className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Neighborhood</p>
                                                <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                    {customer.neighborhood?.name || 'Not assigned'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-lg bg-purple-50 p-2 dark:bg-purple-900/20">
                                                <Settings className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Category</p>
                                                <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                    {customer.category?.name || 'Not assigned'}
                                                </p>
                                            </div>
                                        </div>
                                        {customer.latitude && customer.longitude && (
                                            <div className="flex items-start gap-3">
                                                <div className="rounded-lg bg-purple-50 p-2 dark:bg-purple-900/20">
                                                    <MapPin className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">GPS Coordinates</p>
                                                    <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                        {customer.latitude}, {customer.longitude}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="meters" className="mt-6">
                        {customer.meter ? (
                            <div className="space-y-6">
                                {canAddInitialReading && (
                                    <div className="rounded-lg border border-dashed border-blue-200 bg-blue-50/60 p-4 shadow-sm dark:border-blue-900/50 dark:bg-blue-950/30">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">Initial reading required</p>
                                                <p className="text-sm text-blue-800 dark:text-blue-300">
                                                    This meter has no readings yet. Capture the initial reading so future consumption is accurate.
                                                </p>
                                            </div>
                                            <Button onClick={openInitialReadingModal} className="gap-2 bg-blue-600 hover:bg-blue-700">
                                                <Droplets className="h-4 w-4" />
                                                Add Initial Reading
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                {!canAddInitialReading && canEditInitialReading && initialReadingSummary && (
                                    <div className="rounded-lg border border-slate-200 bg-white/70 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/30">
                                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                            <div className="flex items-start gap-3">
                                                <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                                                    <Droplets className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                        Initial reading captured
                                                    </p>
                                                    <div className="mt-1 flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                                                        <span className="flex items-center gap-1 font-semibold text-blue-700 dark:text-blue-300">
                                                            {initialReadingSummary.valueDisplay} m³
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-4 w-4 text-slate-400" />
                                                            {initialReadingSummary.date}
                                                        </span>
                                                    </div>
                                                    {initialReadingSummary.note && (
                                                        <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                                                            Note: {initialReadingSummary.note}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <Button variant="outline" className="gap-2" onClick={openEditInitialReadingModal}>
                                                    <Edit className="h-4 w-4" />
                                                    Edit Initial Reading
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {/* Meter Status Overview */}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <Card className="border-0 shadow-md">
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Meter Status</p>
                                                    <div className="mt-2">
                                                        <Badge
                                                            className={
                                                                customer.meter?.status === 'active'
                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                            }
                                                        >
                                                            {customer.meter?.status || 'Unknown'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
                                                    <Droplets className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-0 shadow-md">
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Last Reading</p>
                                                    <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                                                        {customer.meter?.readings?.length > 0
                                                            ? customer.meter.readings[customer.meter.readings.length - 1].value
                                                            : 'N/A'}
                                                    </p>
                                                </div>
                                                <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/30">
                                                    <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-0 shadow-md">
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Readings</p>
                                                    <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                                                        {customer.meter?.readings?.length || 0}
                                                    </p>
                                                </div>
                                                <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
                                                    <Settings className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Current Meter Information */}
                                <Card className="border-0 shadow-md">
                                    <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-700/30">
                                        <CardTitle className="flex items-center gap-2">
                                            <div className="rounded-lg bg-blue-600 p-1.5">
                                                <Droplets className="h-5 w-5 text-white" />
                                            </div>
                                            Meter Details
                                        </CardTitle>
                                        <CardDescription>Complete information about the assigned meter</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Serial Number</label>
                                                <p className="rounded bg-slate-100 p-2 font-mono text-sm dark:bg-slate-800">
                                                    {customer.meter?.serial || 'N/A'}
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Model</label>
                                                <p className="rounded bg-slate-100 p-2 text-sm dark:bg-slate-800">{customer.meter?.model || 'N/A'}</p>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Manufacturer</label>
                                                <p className="rounded bg-slate-100 p-2 text-sm dark:bg-slate-800">
                                                    {customer.meter?.manufactory || 'N/A'}
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Size</label>
                                                <p className="rounded bg-slate-100 p-2 text-sm dark:bg-slate-800">{customer.meter?.size || 'N/A'}</p>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</label>
                                                <div className="p-2">
                                                    <Badge
                                                        className={
                                                            customer.meter?.status === 'active'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }
                                                    >
                                                        {customer.meter?.status || 'Unknown'}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Installation Date</label>
                                                <p className="rounded bg-slate-100 p-2 text-sm dark:bg-slate-800">
                                                    {customer.meter?.created_at ? new Date(customer.meter.created_at).toLocaleDateString() : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Meter History */}
                                <Card className="border-0 shadow-md">
                                    <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-700/30">
                                        <CardTitle className="flex items-center gap-2">
                                            <div className="rounded-lg bg-blue-600 p-1.5">
                                                <Activity className="h-5 w-5 text-white" />
                                            </div>
                                            Meter History
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            Complete history of meter changes, maintenance, and readings for this customer
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        {customer.meterLogs && customer.meterLogs.length > 0 ? (
                                            <div className="space-y-4">
                                                {/* Summary Stats */}
                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                                    <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                                                        <div className="flex items-center">
                                                            <Settings className="h-5 w-5 text-blue-600" />
                                                            <div className="ml-2">
                                                                <p className="text-sm font-medium text-blue-600">Total Changes</p>
                                                                <p className="text-2xl font-bold text-blue-900">{customer.meterLogs.length}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                                                        <div className="flex items-center">
                                                            <Droplets className="h-5 w-5 text-green-600" />
                                                            <div className="ml-2">
                                                                <p className="text-sm font-medium text-green-600">Current Meter</p>
                                                                <p className="text-lg font-bold text-green-900">{customer.meter?.serial || 'N/A'}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
                                                        <div className="flex items-center">
                                                            <Calendar className="h-5 w-5 text-purple-600" />
                                                            <div className="ml-2">
                                                                <p className="text-sm font-medium text-purple-600">Last Change</p>
                                                                <p className="text-sm font-bold text-purple-900">
                                                                    {customer.meterLogs.length > 0
                                                                        ? new Date(customer.meterLogs[0].created_at).toLocaleDateString()
                                                                        : 'N/A'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* History Timeline */}
                                                <div className="space-y-3">
                                                    <h4 className="text-lg font-semibold">Timeline</h4>
                                                    <div className="space-y-2">
                                                        {customer.meterLogs
                                                            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                                                            .map((log, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-slate-50 dark:hover:bg-slate-800"
                                                                >
                                                                    <div className="flex-shrink-0">
                                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                                                                            <Settings className="h-4 w-4 text-blue-600" />
                                                                        </div>
                                                                    </div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <div className="flex items-center justify-between">
                                                                            <h5 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                                                                {log.action || 'Meter Change'}
                                                                            </h5>
                                                                            <time className="text-xs text-slate-500 dark:text-slate-400">
                                                                                {log.created_at
                                                                                    ? new Date(log.created_at).toLocaleDateString()
                                                                                    : 'N/A'}
                                                                            </time>
                                                                        </div>
                                                                        <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                                            {log.oldMeter && (
                                                                                <div className="text-sm">
                                                                                    <span className="font-medium text-slate-600 dark:text-slate-400">
                                                                                        From:
                                                                                    </span>
                                                                                    <span className="ml-1 font-mono">{log.oldMeter.serial}</span>
                                                                                </div>
                                                                            )}
                                                                            {log.newMeter && (
                                                                                <div className="text-sm">
                                                                                    <span className="font-medium text-slate-600 dark:text-slate-400">
                                                                                        To:
                                                                                    </span>
                                                                                    <span className="ml-1 font-mono">{log.newMeter.serial}</span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        {log.performedBy && (
                                                                            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                                                Performed by: {log.performedBy.name}
                                                                            </div>
                                                                        )}
                                                                        {log.note && (
                                                                            <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                                                                                <span className="font-medium">Note:</span> {log.note}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                    </div>
                                                </div>

                                                {/* Detailed Table View */}
                                                <div className="mt-6">
                                                    <h4 className="mb-4 text-lg font-semibold">Detailed History</h4>
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Date</TableHead>
                                                                <TableHead>Action</TableHead>
                                                                <TableHead>Old Meter</TableHead>
                                                                <TableHead>New Meter</TableHead>
                                                                <TableHead>Performed By</TableHead>
                                                                <TableHead>Notes</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {customer.meterLogs
                                                                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                                                                .map((log, index) => (
                                                                    <TableRow key={index}>
                                                                        <TableCell>
                                                                            {log.created_at ? new Date(log.created_at).toLocaleDateString() : 'N/A'}
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Badge variant="outline">{log.action || 'Unknown'}</Badge>
                                                                        </TableCell>
                                                                        <TableCell className="font-mono">{log.oldMeter?.serial || 'N/A'}</TableCell>
                                                                        <TableCell className="font-mono">{log.newMeter?.serial || 'N/A'}</TableCell>
                                                                        <TableCell>{log.performedBy?.name || 'N/A'}</TableCell>
                                                                        <TableCell className="max-w-xs truncate">{log.note || '-'}</TableCell>
                                                                    </TableRow>
                                                                ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="py-8 text-center">
                                                <Activity className="mx-auto h-12 w-12 text-slate-400" />
                                                <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">No meter history</h3>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    No meter changes or maintenance records found for this customer.
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <Droplets className="mx-auto h-12 w-12 text-slate-400" />
                                <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">No meter assigned</h3>
                                <p className="mt-1 text-sm text-slate-500">This customer doesn't have a meter assigned yet.</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="readings" className="mt-6">
                        {customer.readings && customer.readings.length > 0 ? (
                            <Card className="border-0 shadow-md">
                                <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-700/30">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <div className="rounded-lg bg-blue-600 p-1.5">
                                                    <Activity className="h-5 w-5 text-white" />
                                                </div>
                                                Meter Readings History
                                            </CardTitle>
                                            <CardDescription className="mt-1">All meter readings for this customer</CardDescription>
                                        </div>
                                        <a href={`/customers/${customer.id}/export-readings`}>
                                            <Button variant="outline" size="sm">
                                                <Download className="mr-2 h-4 w-4" />
                                                Export
                                            </Button>
                                        </a>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                                                    <TableHead className="font-semibold">Date</TableHead>
                                                    <TableHead className="font-semibold">Previous Reading</TableHead>
                                                    <TableHead className="font-semibold">Current Reading</TableHead>
                                                    <TableHead className="font-semibold">Consumption</TableHead>
                                                    <TableHead className="font-semibold">Source</TableHead>
                                                    <TableHead className="font-semibold">Officer</TableHead>
                                                    <TableHead className="font-semibold">Notes</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {customer.readings
                                                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                                                    .map((reading, index) => (
                                                        <TableRow key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                                            <TableCell className="font-medium">
                                                                {reading.date ? new Date(reading.date).toLocaleDateString() : 'N/A'}
                                                            </TableCell>
                                                            <TableCell>{reading.previous || 0}</TableCell>
                                                            <TableCell className="font-semibold text-blue-600 dark:text-blue-400">
                                                                {reading.value || 0}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline" className="font-medium">
                                                                    {reading.value - reading.previous || 0} units
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge
                                                                    variant={reading.source === 'manual' ? 'default' : 'secondary'}
                                                                    className="font-medium"
                                                                >
                                                                    {reading.source || 'Unknown'}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>{reading.recordedBy?.name || 'N/A'}</TableCell>
                                                            <TableCell className="max-w-xs truncate text-slate-600 dark:text-slate-400">
                                                                {reading.note || '-'}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="py-8 text-center">
                                <Activity className="mx-auto h-12 w-12 text-slate-400" />
                                <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">No readings found</h3>
                                <p className="mt-1 text-sm text-slate-500">No meter readings have been recorded for this customer yet.</p>
                                {canAddInitialReading && (
                                    <div className="mt-4">
                                        <Button onClick={openInitialReadingModal} className="gap-2 bg-blue-600 hover:bg-blue-700">
                                            <Droplets className="h-4 w-4" />
                                            Add Initial Reading
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </TabsContent>

                    {!isBillingDepartment && !isFinanceDepartment && (
                        <>
                            <TabsContent value="bills" className="mt-6">
                                {customer.bills && customer.bills.length > 0 ? (
                                    <Card className="border-0 shadow-md">
                                        <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-700/30">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle className="flex items-center gap-2">
                                                        <div className="rounded-lg bg-green-600 p-1.5">
                                                            <Receipt className="h-5 w-5 text-white" />
                                                        </div>
                                                        Bills History
                                                    </CardTitle>
                                                    <CardDescription className="mt-1">All bills generated for this customer</CardDescription>
                                                </div>
                                                <a href={`/customers/${customer.id}/export-bills`}>
                                                    <Button variant="outline" size="sm">
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Export
                                                    </Button>
                                                </a>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <div className="overflow-x-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                                                            <TableHead className="font-semibold">Bill Number</TableHead>
                                                            <TableHead className="font-semibold">Period</TableHead>
                                                            <TableHead className="font-semibold">Amount</TableHead>
                                                            <TableHead className="font-semibold">Status</TableHead>
                                                            <TableHead className="font-semibold">Due Date</TableHead>
                                                            <TableHead className="font-semibold">Generated By</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {customer.bills
                                                            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                                                            .map((bill, index) => (
                                                                <TableRow key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                                                    <TableCell className="font-medium">#{bill.bill_number || bill.id}</TableCell>
                                                                    <TableCell className="text-slate-600 dark:text-slate-400">
                                                                        {bill.period_from && bill.period_to
                                                                            ? `${new Date(bill.period_from).toLocaleDateString()} - ${new Date(bill.period_to).toLocaleDateString()}`
                                                                            : 'N/A'}
                                                                    </TableCell>
                                                                    <TableCell className="font-semibold text-green-600 dark:text-green-400">
                                                                        ${bill.total_amount || 0}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Badge
                                                                            className={
                                                                                bill.status === 'paid'
                                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                                                    : bill.status === 'overdue'
                                                                                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                                                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                                            }
                                                                        >
                                                                            {bill.status || 'Unknown'}
                                                                        </Badge>
                                                                    </TableCell>
                                                                    <TableCell className="text-slate-600 dark:text-slate-400">
                                                                        {bill.due_date ? new Date(bill.due_date).toLocaleDateString() : 'N/A'}
                                                                    </TableCell>
                                                                    <TableCell>{bill.generatedBy?.name || 'N/A'}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="py-8 text-center">
                                        <Receipt className="mx-auto h-12 w-12 text-slate-400" />
                                        <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">No bills found</h3>
                                        <p className="mt-1 text-sm text-slate-500">No bills have been generated for this customer yet.</p>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="invoices" className="mt-6">
                                {customer.invoices && customer.invoices.length > 0 ? (
                                    <Card className="border-0 shadow-md">
                                        <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-700/30">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle className="flex items-center gap-2">
                                                        <div className="rounded-lg bg-purple-600 p-1.5">
                                                            <FileText className="h-5 w-5 text-white" />
                                                        </div>
                                                        Invoices History
                                                    </CardTitle>
                                                    <CardDescription className="mt-1">All invoices generated for this customer</CardDescription>
                                                </div>
                                                <a href={`/customers/${customer.id}/export`}>
                                                    <Button variant="outline" size="sm">
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Export
                                                    </Button>
                                                </a>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <div className="overflow-x-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                                                            <TableHead className="font-semibold">Invoice Number</TableHead>
                                                            <TableHead className="font-semibold">Date</TableHead>
                                                            <TableHead className="font-semibold">Amount</TableHead>
                                                            <TableHead className="font-semibold">Status</TableHead>
                                                            <TableHead className="font-semibold">Due Date</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {customer.invoices
                                                            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                                                            .map((invoice, index) => (
                                                                <TableRow key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                                                    <TableCell className="font-medium">
                                                                        #{invoice.invoice_number || invoice.id}
                                                                    </TableCell>
                                                                    <TableCell className="text-slate-600 dark:text-slate-400">
                                                                        {invoice.created_at
                                                                            ? new Date(invoice.created_at).toLocaleDateString()
                                                                            : 'N/A'}
                                                                    </TableCell>
                                                                    <TableCell className="font-semibold text-green-600 dark:text-green-400">
                                                                        ${invoice.total_amount || 0}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Badge
                                                                            className={
                                                                                invoice.status === 'paid'
                                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                                                    : invoice.status === 'overdue'
                                                                                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                                                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                                            }
                                                                        >
                                                                            {invoice.status || 'Unknown'}
                                                                        </Badge>
                                                                    </TableCell>
                                                                    <TableCell className="text-slate-600 dark:text-slate-400">
                                                                        {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="py-8 text-center">
                                        <FileText className="mx-auto h-12 w-12 text-slate-400" />
                                        <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">No invoices found</h3>
                                        <p className="mt-1 text-sm text-slate-500">No invoices have been generated for this customer yet.</p>
                                    </div>
                                )}
                            </TabsContent>
                        </>
                    )}

                    {!isBillingDepartment && (
                        <TabsContent value="payments" className="mt-6">
                            {customer.payments && customer.payments.length > 0 ? (
                                <Card className="border-0 shadow-md">
                                    <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-700/30">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="flex items-center gap-2">
                                                    <div className="rounded-lg bg-emerald-600 p-1.5">
                                                        <Receipt className="h-5 w-5 text-white" />
                                                    </div>
                                                    Payment History
                                                </CardTitle>
                                                <CardDescription className="mt-1">All payments made by this customer</CardDescription>
                                            </div>
                                            <a href={`/customers/${customer.id}/export`}>
                                                <Button variant="outline" size="sm">
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Export
                                                </Button>
                                            </a>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                                                        <TableHead className="font-semibold">Payment Date</TableHead>
                                                        <TableHead className="font-semibold">Amount</TableHead>
                                                        <TableHead className="font-semibold">Method</TableHead>
                                                        <TableHead className="font-semibold">Reference</TableHead>
                                                        <TableHead className="font-semibold">Status</TableHead>
                                                        <TableHead className="font-semibold">Received By</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {customer.payments
                                                        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                                                        .map((payment, index) => (
                                                            <TableRow key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                                                <TableCell className="font-medium">
                                                                    {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : 'N/A'}
                                                                </TableCell>
                                                                <TableCell className="font-semibold text-green-600 dark:text-green-400">
                                                                    ${payment.amount || 0}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge variant="outline" className="font-medium">
                                                                        {payment.method || 'Unknown'}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="text-slate-600 dark:text-slate-400">
                                                                    {payment.reference || 'N/A'}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge
                                                                        className={
                                                                            payment.status === 'completed'
                                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                                                : payment.status === 'pending'
                                                                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                                        }
                                                                    >
                                                                        {payment.status || 'Unknown'}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell>{payment.receivedBy?.name || 'N/A'}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="py-8 text-center">
                                    <Receipt className="mx-auto h-12 w-12 text-slate-400" />
                                    <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">No payments found</h3>
                                    <p className="mt-1 text-sm text-slate-500">No payments have been recorded for this customer yet.</p>
                                </div>
                            )}
                        </TabsContent>
                    )}
                </Tabs>
            </div>

            {/* Assign Meter Modal */}
            <Dialog open={showInitialReadingModal} onOpenChange={handleInitialReadingModalChange} className="no-print">
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center">
                            <Droplets className="mr-2 h-5 w-5 text-blue-600" />
                            {isEditingInitialReading ? 'Edit Initial Meter Reading' : 'Record Initial Meter Reading'}
                        </DialogTitle>
                        <DialogDescription>
                            {isEditingInitialReading
                                ? `Update the baseline reading for ${
                                      customer.meter ? customer.meter.serial || `Meter #${customer.meter.id}` : 'this meter'
                                  }. This affects subsequent consumption calculations.`
                                : `Set the starting reading for ${
                                      customer.meter ? customer.meter.serial || `Meter #${customer.meter.id}` : 'this meter'
                                  }.`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-5">
                        <div className="rounded-lg border bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
                            <p className="text-xs text-slate-500 uppercase dark:text-slate-400">Meter</p>
                            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                {customer.meter ? customer.meter.serial || `Meter #${customer.meter.id}` : 'No meter assigned'}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                The value you enter will be stored as both the previous and current reading. Future readings will build on this
                                baseline without generating extra consumption.
                            </p>
                        </div>
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
                                <p className="text-xs text-slate-500">Use the last known display on the meter.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="initial-reading-date">Reading Date</Label>
                                <Input
                                    id="initial-reading-date"
                                    type="date"
                                    value={initialReadingDate}
                                    max={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setInitialReadingDate(e.target.value)}
                                />
                                <p className="text-xs text-slate-500">Defaults to today.</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="initial-reading-note">Notes (optional)</Label>
                            <Textarea
                                id="initial-reading-note"
                                rows={3}
                                placeholder="Describe where this value came from"
                                value={initialReadingNote}
                                onChange={(e) => setInitialReadingNote(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleInitialReadingModalChange(false)}
                                disabled={isSavingInitialReading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={handleInitialReadingSubmit}
                                disabled={initialReadingValue === '' || Number(initialReadingValue) < 0 || isSavingInitialReading}
                            >
                                {isSavingInitialReading ? 'Saving...' : isEditingInitialReading ? 'Update Initial Reading' : 'Save Initial Reading'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={showAssignMeterModal} onOpenChange={setShowAssignMeterModal} className="no-print">
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center">
                            <Plus className="mr-2 h-5 w-5" />
                            Assign Meter to Customer
                        </DialogTitle>
                        <DialogDescription>
                            Assign a meter to {customer.first_name} {customer.last_name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                        <div className="space-y-6">
                            {/* Meter Selection */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Select Available Meter</label>
                                    {availableMeters && availableMeters.length > 0 ? (
                                        <div className="relative" ref={meterDropdownRef}>
                                            <div className="relative">
                                                <Input
                                                    value={meterSearch}
                                                    onChange={(e) => handleMeterSearch(e.target.value)}
                                                    onFocus={() => setShowMeterDropdown(true)}
                                                    placeholder="Search meters by serial, number, or model..."
                                                />
                                                {selectedMeter && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 p-0 hover:bg-slate-100"
                                                        onClick={clearMeterSelection}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                )}
                                            </div>

                                            {showMeterDropdown && (
                                                <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
                                                    {filteredMeters.length > 0 ? (
                                                        filteredMeters.map((meter) => (
                                                            <div
                                                                key={meter.id}
                                                                className="cursor-pointer px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                                                                onClick={() => handleMeterSelect(meter)}
                                                            >
                                                                <div className="flex w-full items-center justify-between">
                                                                    <div className="flex items-center space-x-2">
                                                                        <Droplets className="h-4 w-4 text-green-600" />
                                                                        <div>
                                                                            <div className="font-medium">
                                                                                {meter.serial || meter.meter_number || `Meter #${meter.id}`}
                                                                            </div>
                                                                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                                                                {meter.model || 'Unknown Model'} - {meter.manufactory || 'Unknown'}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center space-x-1">
                                                                        <div
                                                                            className={`h-2 w-2 rounded-full ${
                                                                                meter.status === 'active'
                                                                                    ? 'bg-green-500'
                                                                                    : meter.status === 'inactive'
                                                                                      ? 'bg-red-500'
                                                                                      : meter.status === 'maintenance'
                                                                                        ? 'bg-yellow-500'
                                                                                        : meter.status === 'damaged'
                                                                                          ? 'bg-orange-500'
                                                                                          : 'bg-gray-500'
                                                                            }`}
                                                                        ></div>
                                                                        <span className="text-xs text-slate-600 capitalize dark:text-slate-400">
                                                                            {meter.status || 'Unknown'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400">No meters found</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center">
                                            <AlertCircle className="mx-auto h-8 w-8 text-slate-400" />
                                            <p className="mt-2 text-sm text-slate-500">No available meters found</p>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Previous Reading</label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="Enter latest reading value"
                                        value={previousReading}
                                        onChange={(e) => setPreviousReading(e.target.value)}
                                    />
                                    <p className="text-xs text-slate-500">
                                        This value becomes the current reading for the new meter. Previous reading will be set to 0 automatically.
                                    </p>
                                    {errors.previous_reading && <p className="text-xs text-red-600">{errors.previous_reading}</p>}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowAssignMeterModal(false);
                                        setSelectedMeterId('');
                                        setSelectedMeter(null);
                                        setMeterSearch('');
                                        setPreviousReading('');
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleAssignMeter}
                                    disabled={!selectedMeterId || previousReading === ''}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Assign Meter
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Manage Meter Modal */}
            <Dialog open={showManageMeterModal} onOpenChange={setShowManageMeterModal} className="no-print">
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center">
                            <Settings className="mr-2 h-5 w-5" />
                            Manage Customer Meter
                        </DialogTitle>
                        <DialogDescription>
                            Manage the current meter for {customer.first_name} {customer.last_name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                        <div className="space-y-6">
                            {/* Current Meter Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center text-lg">
                                        <Droplets className="mr-2 h-5 w-5" />
                                        Current Meter
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Serial Number</label>
                                            <p className="rounded bg-slate-100 p-2 font-mono text-sm dark:bg-slate-800">
                                                {customer.meter?.serial || 'N/A'}
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Model</label>
                                            <p className="rounded bg-slate-100 p-2 text-sm dark:bg-slate-800">{customer.meter?.model || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</label>
                                            <Select
                                                value={selectedMeterStatus || customer.meter?.status || ''}
                                                onValueChange={setSelectedMeterStatus}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select meter status..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">
                                                        <div className="flex items-center space-x-2">
                                                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                                            <span>Active</span>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="inactive">
                                                        <div className="flex items-center space-x-2">
                                                            <div className="h-2 w-2 rounded-full bg-red-500"></div>
                                                            <span>Inactive</span>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="maintenance">
                                                        <div className="flex items-center space-x-2">
                                                            <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                                                            <span>Maintenance</span>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="damaged">
                                                        <div className="flex items-center space-x-2">
                                                            <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                                                            <span>Damaged</span>
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Action Buttons */}
                            <div className="flex justify-between">
                                <Button variant="outline" onClick={handleReplaceMeter} className="bg-orange-600 text-white hover:bg-orange-700">
                                    <Settings className="mr-2 h-4 w-4" />
                                    Replace Meter
                                </Button>
                                <div className="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowManageMeterModal(false);
                                            setSelectedMeterStatus('');
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleUpdateMeterStatus}
                                        disabled={!selectedMeterStatus || selectedMeterStatus === customer.meter?.status}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        <Settings className="mr-2 h-4 w-4" />
                                        Update Status
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog} className="no-print">
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center text-red-600">
                            <AlertCircle className="mr-2 h-5 w-5" />
                            Delete Customer
                        </DialogTitle>
                        <DialogDescription className="text-base">
                            Are you sure you want to delete{' '}
                            <strong>
                                {customer.first_name} {customer.last_name}
                            </strong>
                            ? This action cannot be undone and will permanently remove all customer data including:
                            <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
                                <li>Customer profile information</li>
                                <li>Meter readings and history</li>
                                <li>Bills and invoices</li>
                                <li>Payment records</li>
                            </ul>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-6 flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteCustomer} className="bg-red-600 hover:bg-red-700">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Customer
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
