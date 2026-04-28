import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ReadingModal from '@/components/reading-modal';
import ServiceChargeModal from '@/components/service-charge-modal';
import { useState } from 'react';
import {
    Search,
    Plus,
    MoreHorizontal,
    Filter,
    Download,
    Users,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    Activity,
    CreditCard
} from 'lucide-react';

const breadcrumbs = [
    {
        title: 'Customers',
        href: '/customers',
    },
];

export default function Customers({ customers, serviceChargeTypes }) {
    const [isReadingModalOpen, setIsReadingModalOpen] = useState(false);
    const [isServiceChargeModalOpen, setIsServiceChargeModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const handleRecordReading = (customer) => {
        setSelectedCustomer(customer);
        setIsReadingModalOpen(true);
    };

    const handleCreateServiceCharge = (customer) => {
        setSelectedCustomer(customer);
        setIsServiceChargeModalOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customers Management" />

            <div className="flex h-full flex-col gap-6 p-6">
                {/* Header Section */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <Users className="h-6 w-6 text-primary" />
                            Customers
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage your customer database, billing zones, and service connections.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="hidden md:flex">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                        <Button size="sm" asChild>
                            <Link href="/customers/create">
                                <Plus className="mr-2 h-4 w-4" />
                                New Customer
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Filters & Actions */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card p-4 rounded-xl border shadow-sm">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, account #, or phone..."
                            className="pl-10"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                            <Filter className="mr-2 h-4 w-4" />
                            Filter
                        </Button>
                    </div>
                </div>

                {/* Table Section */}
                <div className="flex-1 overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b bg-muted/50 transition-colors text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    <th className="px-4 py-3">Account #</th>
                                    <th className="px-4 py-3">Customer Name</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">Zone</th>
                                    <th className="px-4 py-3">Tariff</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {customers.data.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-4 py-4">
                                            <span className="font-mono text-sm font-bold text-primary">
                                                {customer.account_number}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-foreground">{customer.name}</span>
                                                <span className="text-xs text-muted-foreground">{customer.phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 capitalize">
                                            <span className="text-sm">{customer.customer_type}</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-1">
                                                <span className="text-sm font-medium">{customer.zone?.name}</span>
                                                <Badge variant="outline" className="text-[10px] py-0 px-1 font-mono">
                                                    {customer.zone?.supply_day ? 'Sch' : 'N/A'}
                                                </Badge>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-sm text-muted-foreground italic">
                                                {customer.tariff?.name}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <Badge 
                                                variant={customer.status === 'active' ? 'success' : 'secondary'}
                                                className="capitalize text-[10px]"
                                            >
                                                {customer.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="h-8 text-xs font-bold gap-1 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                                                    onClick={() => handleRecordReading(customer)}
                                                >
                                                    <Activity className="h-3 w-3" />
                                                    Record
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="h-8 text-xs font-bold gap-1 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                                    onClick={() => handleCreateServiceCharge(customer)}
                                                >
                                                    <CreditCard className="h-3 w-3" />
                                                    Charge
                                                </Button>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        asChild
                                                    >
                                                        <Link href={`/customers/${customer.id}`}>
                                                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {customers.data.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-12 text-center text-muted-foreground">
                                            No customers found. Click "New Customer" to get started.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {customers.links.length > 3 && (
                        <div className="flex items-center justify-between border-t px-4 py-4 bg-muted/20">
                            <div className="text-sm text-muted-foreground">
                                Showing <span className="font-medium">{customers.from}</span> to <span className="font-medium">{customers.to}</span> of <span className="font-medium">{customers.total}</span> customers
                            </div>
                            <div className="flex items-center gap-2">
                                {customers.links.map((link, i) => (
                                    <Button
                                        key={i}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        asChild={!!link.url}
                                        className={!link.url ? 'opacity-50' : ''}
                                    >
                                        {link.url ? (
                                            <Link href={link.url}>
                                                {link.label === '&laquo; Previous' ? <ChevronLeft className="h-4 w-4" /> : 
                                                 link.label === 'Next &raquo;' ? <ChevronRight className="h-4 w-4" /> : 
                                                 link.label}
                                            </Link>
                                        ) : (
                                            <span>
                                                {link.label === '&laquo; Previous' ? <ChevronLeft className="h-4 w-4" /> : 
                                                 link.label === 'Next &raquo;' ? <ChevronRight className="h-4 w-4" /> : 
                                                 link.label}
                                            </span>
                                        )}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Reusable Reading Modal */}
            <ReadingModal 
                customer={selectedCustomer} 
                isOpen={isReadingModalOpen} 
                onClose={() => setIsReadingModalOpen(false)} 
            />

            {/* Service Charge Modal */}
            <ServiceChargeModal 
                customer={selectedCustomer}
                serviceChargeTypes={serviceChargeTypes}
                isOpen={isServiceChargeModalOpen} 
                onClose={() => setIsServiceChargeModalOpen(false)} 
            />
        </AppLayout>
    );
}