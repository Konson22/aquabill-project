import ReadingModal from '@/components/reading-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import {
    CreditCard,
    Droplet,
    Gauge,
    MapPin,
    MoreHorizontal,
    Pencil,
    PowerOff,
    Receipt,
    User,
    Wrench,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import MeterStatusModal from './components/meter-status-modal';
import ReplaceMeterModal from './components/replace-meter-modal';
import BillsTab from './tabs/bills-tab';
import ChargesTab from './tabs/charges-tab';
import MetersTab from './tabs/meters-tab';
import PaymentsTab from './tabs/payments-tab';
import ProfileTab from './tabs/profile-tab';
import ReadingsTab from './tabs/readings-tab';

const CUSTOMER_TABS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'bills', label: 'Bills', icon: Receipt, countKey: 'bills' },
    { id: 'readings', label: 'Readings', icon: Droplet, countKey: 'readings' },
    { id: 'meters', label: 'Meters', icon: Gauge, countKey: 'meters' },
    { id: 'payments', label: 'Payments', icon: CreditCard, countKey: 'payments' },
    { id: 'charges', label: 'Charges', icon: Wrench, countKey: 'charges' },
];

function formatDate(value) {
    if (!value) {
        return '—';
    }

    try {
        return new Date(value).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    } catch {
        return String(value);
    }
}

function tabCounts(customer, bills, meters, unpaidBills) {
    const paymentsActivity = bills.filter((bill) => Number(bill?.payments_sum_amount ?? 0) > 0).length;

    return {
        profile: null,
        bills: bills.length,
        readings: customer?.readings?.length ?? 0,
        meters: meters.length,
        payments: paymentsActivity,
        charges: customer?.serviceCharges?.length ?? customer?.service_charges?.length ?? 0,
        unpaidBills: unpaidBills.length,
    };
}

export default function Show({ customer, unassignedMeters = [] }) {
    const [selectedMeter, setSelectedMeter] = useState(null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
    const [isReadingModalOpen, setIsReadingModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    const breadcrumbs = [
        { title: 'Customers', href: route('customers.index') },
        {
            title: customer?.account_number ?? 'Customer',
            href: customer ? route('customers.show', customer.id) : route('customers.index'),
        },
    ];

    const meters = customer?.meters ?? [];
    const meterHistories = customer?.meterHistories ?? customer?.meter_histories ?? [];
    const bills = customer?.bills ?? [];
    const currentMeter = meters[0] ?? null;
    const lastReadingValue =
        currentMeter?.latest_reading?.current_reading ??
        currentMeter?.latestReading?.current_reading ??
        currentMeter?.last_reading ??
        '—';
    const unpaidBills = bills.filter((bill) => bill?.status !== 'paid');
    const counts = useMemo(() => tabCounts(customer, bills, meters, unpaidBills), [customer, bills, meters, unpaidBills]);

    const statusVariant =
        customer?.status === 'active' ? 'success' : customer?.status === 'disconnected' ? 'destructive' : 'secondary';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={customer ? `${customer.name} • ${customer.account_number}` : 'Customer'} />

            <div className="m-3 flex flex-1 flex-col overflow-hidden rounded-md border bg-card shadow-sm">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex min-h-0 flex-1 flex-col">
                <div className="border-b border-sky-900/20 bg-sky-800 px-4 pt-4 text-white sm:px-6">
                    <div className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 space-y-2">
                            <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">{customer?.name ?? 'Customer'}</h1>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-sky-100">
                                <span className="font-mono font-semibold tabular-nums text-white">
                                    {customer?.account_number ?? '—'}
                                </span>
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        'border-white/25 uppercase',
                                        customer?.status === 'active' && 'bg-emerald-500/30 text-emerald-50',
                                        customer?.status === 'disconnected' && 'bg-rose-500/30 text-rose-50',
                                        customer?.status === 'inactive' && 'bg-white/10 text-white',
                                    )}
                                >
                                    {customer?.status ?? 'unknown'}
                                </Badge>
                                {customer?.zone?.name ? (
                                    <span className="inline-flex items-center gap-1 text-sky-100/90">
                                        <MapPin className="h-3.5 w-3.5" />
                                        {customer.zone.name}
                                    </span>
                                ) : null}
                            </div>
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                            >
                                <Link href={route('customers.edit', customer.id)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-52">
                                    <DropdownMenuItem onSelect={() => setIsReadingModalOpen(true)}>
                                        <Droplet className="mr-2 h-4 w-4 text-blue-600" />
                                        Record reading
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        disabled={!currentMeter}
                                        onSelect={() => {
                                            if (!currentMeter) {
                                                return;
                                            }
                                            setSelectedMeter(currentMeter);
                                            setIsStatusModalOpen(true);
                                        }}
                                    >
                                        <Gauge className="mr-2 h-4 w-4 text-indigo-600" />
                                        Meter status
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        disabled={!currentMeter}
                                        onSelect={() => {
                                            if (!currentMeter) {
                                                return;
                                            }
                                            setSelectedMeter(currentMeter);
                                            setIsReplaceModalOpen(true);
                                        }}
                                    >
                                        <Wrench className="mr-2 h-4 w-4 text-amber-600" />
                                        Replace meter
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href={route('customers.disconnection-status', customer.id)}>
                                            <PowerOff className="mr-2 h-4 w-4 text-orange-600" />
                                            Disconnection
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <div className="-mb-px flex h-auto w-full gap-1 overflow-x-auto bg-transparent p-0 hide-scrollbar">
                            {CUSTOMER_TABS.map(({ id, label, icon: Icon, countKey }) => {
                                const isActive = activeTab === id;
                                const count = countKey ? counts[countKey] : null;
                                const showUnpaid = id === 'bills' && counts.unpaidBills > 0;

                                return (
                                    <button
                                        key={id}
                                        type="button"
                                        onClick={() => setActiveTab(id)}
                                        aria-pressed={isActive}
                                        className={cn(
                                            'flex shrink-0 items-center justify-center gap-2 rounded-t-lg rounded-b-none border-0 px-4 py-2.5 text-[13px] font-bold transition-colors sm:px-5',
                                            isActive
                                                ? 'bg-card text-sky-800 shadow-none'
                                                : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white',
                                        )}
                                    >
                                        <Icon className={cn('h-3.5 w-3.5', isActive ? 'text-sky-800' : 'text-white/70')} />
                                        <span>{label}</span>
                                        {countKey ? (
                                            <span
                                                className={cn(
                                                    'inline-flex h-4 min-w-[1rem] items-center justify-center rounded-sm px-1 text-[9px] font-black tabular-nums',
                                                    isActive ? 'bg-sky-800/10 text-sky-800' : 'bg-black/10 text-white',
                                                    showUnpaid && isActive && 'bg-amber-100 text-amber-900',
                                                    showUnpaid && !isActive && 'bg-amber-500/40 text-amber-50',
                                                )}
                                            >
                                                {count}
                                            </span>
                                        ) : null}
                                    </button>
                                );
                            })}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                        <TabsContent value="profile" className="m-0 mt-0 border-none p-0 outline-none">
                            <ProfileTab
                                customer={customer}
                                statusVariant={statusVariant}
                                currentMeter={currentMeter}
                                lastReadingValue={lastReadingValue}
                                totalBills={bills.length}
                                unpaidBillCount={unpaidBills.length}
                                formatDate={formatDate}
                            />
                        </TabsContent>
                        <TabsContent value="bills" className="m-0 mt-0 border-none p-0 outline-none">
                            <BillsTab bills={customer?.bills} customerId={customer?.id} />
                        </TabsContent>
                        <TabsContent value="readings" className="m-0 mt-0 border-none p-0 outline-none">
                            <ReadingsTab readings={customer?.readings} customerId={customer?.id} />
                        </TabsContent>
                        <TabsContent value="meters" className="m-0 mt-0 border-none p-0 outline-none">
                            <MetersTab
                                meters={meters}
                                meterHistories={meterHistories}
                                formatDate={formatDate}
                                onOpenStatus={(meter) => {
                                    setSelectedMeter(meter);
                                    setIsStatusModalOpen(true);
                                }}
                                onOpenReplace={(meter) => {
                                    setSelectedMeter(meter);
                                    setIsReplaceModalOpen(true);
                                }}
                            />
                        </TabsContent>
                        <TabsContent value="payments" className="m-0 mt-0 border-none p-0 outline-none">
                            <PaymentsTab bills={customer?.bills} customerId={customer?.id} />
                        </TabsContent>
                        <TabsContent value="charges" className="m-0 mt-0 border-none p-0 outline-none">
                            <ChargesTab serviceCharges={customer?.serviceCharges} customerId={customer?.id} />
                        </TabsContent>
                </div>
                </Tabs>
            </div>

            <MeterStatusModal meter={selectedMeter} isOpen={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} />
            <ReplaceMeterModal
                meter={selectedMeter}
                unassignedMeters={unassignedMeters}
                isOpen={isReplaceModalOpen}
                onClose={() => setIsReplaceModalOpen(false)}
            />
            <ReadingModal customer={customer} isOpen={isReadingModalOpen} onClose={() => setIsReadingModalOpen(false)} />
        </AppLayout>
    );
}
