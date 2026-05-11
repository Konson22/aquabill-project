import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Head, Link } from '@inertiajs/react';
import { CreditCard, Droplet, Gauge, MoreHorizontal, PowerOff, Receipt, Wrench } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReadingModal from '@/components/reading-modal';
import MeterStatusModal from './components/meter-status-modal';
import ReplaceMeterModal from './components/replace-meter-modal';
import BillsTab from './tabs/bills-tab';
import ChargesTab from './tabs/charges-tab';
import MetersTab from './tabs/meters-tab';
import PaymentsTab from './tabs/payments-tab';
import ProfileTab from './tabs/profile-tab';
import ReadingsTab from './tabs/readings-tab';
import { useState } from 'react';

export default function Show({ customer, unassignedMeters = [] }) {
    const [selectedMeter, setSelectedMeter] = useState(null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
    const [isReadingModalOpen, setIsReadingModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    const breadcrumbs = [
        { title: 'Customers', href: '/customers' },
        { title: customer?.account_number ?? 'Customer', href: customer ? `/customers/${customer.id}` : '/customers' },
    ];

    const formatDate = (value) => {
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
    };

    const meters = customer?.meters ?? [];
    const meterHistories = customer?.meterHistories ?? customer?.meter_histories ?? [];
    const bills = customer?.bills ?? [];
    const currentMeter = meters[0] ?? null;
    const lastReadingValue = currentMeter?.last_reading?.reading_value ?? currentMeter?.lastReading?.reading_value ?? '—';
    const unpaidBills = bills.filter((bill) => bill?.status !== 'paid');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={customer ? `${customer.name} • ${customer.account_number}` : 'Customer'} />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-2 animate-in fade-in duration-500">
                <div className="grid gap-6 xl:grid-cols-12 xl:items-start">
                    <div className="xl:col-span-12">
                        <Card className="border shadow-sm">
                            <CardContent className="p-3 md:p-0">
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                    <div className="flex flex-col gap-2 border-b bg-muted/40 p-2 md:flex-row md:items-center md:justify-between">
                                        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-md bg-primary/10 p-1 sm:grid-cols-3 lg:grid-cols-6">
                                            <TabsTrigger value="profile" className="rounded-sm py-2 text-[11px] font-bold uppercase tracking-wider text-primary/70 hover:text-primary data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"><PowerOff className="mr-2 h-4 w-4" />Profile</TabsTrigger>
                                            <TabsTrigger value="bills" className="rounded-sm py-2 text-[11px] font-bold uppercase tracking-wider text-primary/70 hover:text-primary data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"><Receipt className="mr-2 h-4 w-4" />Bills</TabsTrigger>
                                            <TabsTrigger value="readings" className="rounded-sm py-2 text-[11px] font-bold uppercase tracking-wider text-primary/70 hover:text-primary data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"><Droplet className="mr-2 h-4 w-4" />Readings</TabsTrigger>
                                            <TabsTrigger value="meters" className="rounded-sm py-2 text-[11px] font-bold uppercase tracking-wider text-primary/70 hover:text-primary data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"><Gauge className="mr-2 h-4 w-4" />Meters</TabsTrigger>
                                            <TabsTrigger value="payments" className="rounded-sm py-2 text-[11px] font-bold uppercase tracking-wider text-primary/70 hover:text-primary data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"><CreditCard className="mr-2 h-4 w-4" />Payments</TabsTrigger>
                                            <TabsTrigger value="charges" className="rounded-sm py-2 text-[11px] font-bold uppercase tracking-wider text-primary/70 hover:text-primary data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"><Wrench className="mr-2 h-4 w-4" />Charges</TabsTrigger>
                                        </TabsList>
                                        <div className="flex items-center justify-end md:pl-2">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="outline" size="icon" className="h-8 w-8 border-primary/30 bg-background">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem onSelect={() => setIsReadingModalOpen(true)}>
                                                        <Droplet className="mr-2 h-4 w-4 text-blue-600" />
                                                        Record Reading
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
                                                        Meter Status
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
                                                        Replace Meter
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={route('customers.disconnection-status', customer.id)}>
                                                            <PowerOff className="mr-2 h-4 w-4 text-orange-600" />
                                                            Disconnection
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={route('customers.edit', customer.id)}>
                                                            <Wrench className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>

                                    <div className="mt-4 p-3">
                                        <TabsContent value="profile" className="m-0 border-none p-0 outline-none">
                                            <ProfileTab
                                                customer={customer}
                                                statusVariant={customer?.status === 'active' ? 'success' : 'secondary'}
                                                currentMeter={currentMeter}
                                                lastReadingValue={lastReadingValue}
                                                totalBills={bills.length}
                                                unpaidBillCount={unpaidBills.length}
                                                formatDate={formatDate}
                                                onRecordReading={() => setIsReadingModalOpen(true)}
                                            />
                                        </TabsContent>
                                        <TabsContent value="bills" className="m-0 border-none p-0 outline-none"><BillsTab bills={customer?.bills} /></TabsContent>
                                        <TabsContent value="readings" className="m-0 border-none p-0 outline-none"><ReadingsTab readings={customer?.readings} /></TabsContent>
                                        <TabsContent value="meters" className="m-0 border-none p-0 outline-none">
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
                                        <TabsContent value="payments" className="m-0 border-none p-0 outline-none"><PaymentsTab bills={customer?.bills} /></TabsContent>
                                        <TabsContent value="charges" className="m-0 border-none p-0 outline-none"><ChargesTab serviceCharges={customer?.serviceCharges} /></TabsContent>
                                    </div>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <MeterStatusModal meter={selectedMeter} isOpen={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} />
            <ReplaceMeterModal meter={selectedMeter} unassignedMeters={unassignedMeters} isOpen={isReplaceModalOpen} onClose={() => setIsReplaceModalOpen(false)} />
            <ReadingModal customer={customer} isOpen={isReadingModalOpen} onClose={() => setIsReadingModalOpen(false)} />
        </AppLayout>
    );
}
