import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CreditCard, FileText, Receipt } from 'lucide-react';
import { useState } from 'react';
import BillsTab from './tabs/Bills';
import InvoicesTab from './tabs/Invoices';
import PaymentsTab from './tabs/Payments';

export default function FinanceIndex({ bills = [], payments = [], invoices = [] }) {
    const [activeTab, setActiveTab] = useState('bills');
    const breadcrumbs = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Finance', href: '/finance' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Finance" />
            <div className="flex flex-col gap-6 pb-10">
                <Card className="overflow-hidden rounded-xl border border-border/80 shadow-sm">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 bg-muted/20 px-5 py-4">
                            <TabsList className="h-10 bg-background/80 p-1">
                                <TabsTrigger value="bills" className="gap-2 px-4">
                                    <FileText className="h-4 w-4" />
                                    Bills
                                    <Badge variant="secondary" className="ml-0.5 font-mono text-xs">
                                        {bills.length}
                                    </Badge>
                                </TabsTrigger>
                                <TabsTrigger value="payments" className="gap-2 px-4">
                                    <CreditCard className="h-4 w-4" />
                                    Payments
                                    <Badge variant="secondary" className="ml-0.5 font-mono text-xs">
                                        {payments.length}
                                    </Badge>
                                </TabsTrigger>
                                <TabsTrigger value="invoices" className="gap-2 px-4">
                                    <Receipt className="h-4 w-4" />
                                    Invoices
                                    <Badge variant="secondary" className="ml-0.5 font-mono text-xs">
                                        {invoices.length}
                                    </Badge>
                                </TabsTrigger>
                            </TabsList>
                            <ViewAllButton activeTab={activeTab} />
                        </div>

                        <TabsContent value="bills" className="m-0">
                            <header className="flex flex-col gap-1 px-5 pt-5">
                                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                                    Finance
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Overview of recent bills, payments, and invoices.
                                </p>
                            </header>
                            <div className="px-5 pb-5">
                                <BillsTab bills={bills} />
                            </div>
                        </TabsContent>

                        <TabsContent value="payments" className="m-0">
                            <header className="flex flex-col gap-1 px-5 pt-5">
                                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                                    Finance
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Overview of recent bills, payments, and invoices.
                                </p>
                            </header>
                            <div className="px-5 pb-5">
                                <PaymentsTab payments={payments} />
                            </div>
                        </TabsContent>

                        <TabsContent value="invoices" className="m-0">
                            <header className="flex flex-col gap-1 px-5 pt-5">
                                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                                    Finance
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Overview of recent bills, payments, and invoices.
                                </p>
                            </header>
                            <div className="px-5 pb-5">
                                <InvoicesTab invoices={invoices} />
                            </div>
                        </TabsContent>
                    </Tabs>
                </Card>
            </div>
        </AppLayout>
    );
}

function ViewAllButton({ activeTab }) {
    const links = {
        bills: { href: route('bills') },
        payments: { href: route('payments') },
        invoices: { href: route('invoices') },
    };
    const current = links[activeTab] ?? links.bills;
    return (
        <Button variant="outline" size="sm" asChild className="gap-1.5">
            <Link href={current.href}>
                View all
                <ArrowRight className="h-4 w-4" />
            </Link>
        </Button>
    );
}
