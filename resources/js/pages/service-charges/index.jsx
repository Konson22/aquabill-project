import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { 
    CreditCard, 
    Search, 
    Plus, 
    MoreHorizontal, 
    CheckCircle2, 
    Clock, 
    User,
    ArrowUpRight,
    FileText,
    Calendar,
    Filter,
    X,
    TrendingUp,
    AlertCircle,
    Eye,
    EyeOff,
    Info
} from 'lucide-react';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import ConfirmPaymentModal from './components/confirm-payment-modal';

export default function ServiceChargesIndex({ charges }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);

    // Modal state
    const [selectedCharge, setSelectedCharge] = useState(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Service Charges', href: '/service-charges' },
    ];

    // Calculate statistics
    const stats = useMemo(() => {
        const data = charges.data || [];
        return {
            total: charges.total || 0,
            totalAmount: data.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0),
            unpaid: data.filter(c => c.status === 'unpaid').length,
            unpaidAmount: data.filter(c => c.status === 'unpaid').reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0),
            paid: data.filter(c => c.status === 'paid').length,
            paidAmount: data.filter(c => c.status === 'paid').reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0),
        };
    }, [charges]);

    // Filter charges based on search and filters
    const filteredCharges = useMemo(() => {
        let filtered = charges.data || [];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(c => 
                c.customer?.name?.toLowerCase().includes(term) ||
                c.customer?.account_number?.toLowerCase().includes(term) ||
                c.service_charge_type?.name?.toLowerCase().includes(term)
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(c => c.status === statusFilter);
        }

        return filtered;
    }, [charges.data, searchTerm, statusFilter]);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'paid':
                return <Badge className="bg-emerald-500 hover:bg-emerald-600 rounded-full px-3 py-1 border-none shadow-sm shadow-emerald-200 font-bold tracking-tight text-xs">Paid</Badge>;
            case 'unpaid':
                return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 rounded-full px-3 py-1 font-bold tracking-tight text-xs">Unpaid</Badge>;
            default:
                return <Badge variant="secondary" className="rounded-full px-3 py-1 font-bold text-xs">{status}</Badge>;
        }
    };

    const hasActiveFilters = searchTerm || statusFilter !== 'all' || dateFilter !== 'all';


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customer Service Charges" />

            <div className="p-6 md:p-10 max-w-[1600px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-primary">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <CreditCard className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">Billing Operations</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight">Service Charges</h1>
                        <p className="text-sm text-muted-foreground">Manage and track operational fees applied to customer accounts</p>
                    </div>

                    <Button className="rounded-xl h-11 px-5 shadow-lg shadow-primary/20 gap-2 font-bold group w-full md:w-auto">
                        <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                        Issue Charge
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Charges */}
                    <div className="bg-card rounded-xl border shadow-sm p-6 group hover:shadow-md transition-all">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Total Charges</p>
                                <p className="text-2xl font-black tracking-tight">{stats.total}</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    {formatCurrency(stats.totalAmount)}
                                </p>
                            </div>
                            <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                                <CreditCard className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    {/* Unpaid Charges */}
                    <div className="bg-card rounded-xl border shadow-sm p-6 group hover:shadow-md transition-all">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Unpaid</p>
                                <p className="text-2xl font-black tracking-tight text-amber-600">{stats.unpaid}</p>
                                <p className="text-xs text-amber-600/70 mt-2">
                                    {formatCurrency(stats.unpaidAmount)}
                                </p>
                            </div>
                            <div className="p-2 bg-amber-500/10 rounded-lg group-hover:bg-amber-500/20 transition-colors">
                                <Clock className="h-5 w-5 text-amber-600" />
                            </div>
                        </div>
                    </div>

                    {/* Paid charges */}
                    <div className="bg-card rounded-xl border shadow-sm p-6 group hover:shadow-md transition-all">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Paid</p>
                                <p className="text-2xl font-black tracking-tight text-emerald-600">{stats.paid}</p>
                                <p className="text-xs text-emerald-600/70 mt-2">
                                    {formatCurrency(stats.paidAmount)}
                                </p>
                            </div>
                            <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20 shadow-sm p-6">
                        <div className="flex flex-col h-full justify-between">
                            <div>
                                <p className="text-xs font-bold text-primary uppercase tracking-wide mb-1">Quick Actions</p>
                                <p className="text-xs text-muted-foreground">Export data or view reports</p>
                            </div>
                            <Button variant="ghost" size="sm" className="gap-2 text-primary hover:bg-primary/10 w-full justify-start">
                                <ArrowUpRight className="h-4 w-4" />
                                <span className="text-xs font-bold">View Reports</span>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Search & Filters Section */}
                <div className="bg-card rounded-xl border shadow-sm p-4 md:p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-sm md:text-base">Filters & Search</h2>
                        {hasActiveFilters && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter('all');
                                    setDateFilter('all');
                                }}
                            >
                                <X className="h-3 w-3" />
                                Clear all
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Search */}
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input 
                                placeholder="Search by customer, account..." 
                                className="pl-10 h-10 rounded-lg border bg-muted/30 focus:bg-background"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Status Filter */}
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-10 rounded-lg border border-input bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-background"
                        >
                            <option value="all">All Statuses</option>
                            <option value="paid">Paid</option>
                            <option value="unpaid">Unpaid</option>
                        </select>

                        {/* Date Filter */}
                        <select 
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="h-10 rounded-lg border border-input bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-background"
                        >
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>
                    </div>

                    {hasActiveFilters && (
                        <p className="text-xs text-muted-foreground">
                            Showing <span className="font-bold text-foreground">{filteredCharges.length}</span> of <span className="font-bold text-foreground">{charges.data?.length || 0}</span> records
                        </p>
                    )}
                </div>

                {/* Data Table */}
                <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                    {filteredCharges.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-muted mb-3">
                                <AlertCircle className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="font-bold text-foreground mb-1">No charges found</p>
                            <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/40 hover:bg-muted/40 border-b">
                                        <TableHead className="font-bold h-12 pl-6 text-muted-foreground text-xs uppercase tracking-wide">Customer</TableHead>
                                        <TableHead className="font-bold h-12 text-muted-foreground text-xs uppercase tracking-wide">Service Type</TableHead>
                                        <TableHead className="font-bold h-12 text-muted-foreground text-xs uppercase tracking-wide">Amount</TableHead>
                                        <TableHead className="font-bold h-12 text-muted-foreground text-xs uppercase tracking-wide">Issued</TableHead>
                                        <TableHead className="font-bold h-12 text-muted-foreground text-xs uppercase tracking-wide">Status</TableHead>
                                        <TableHead className="font-bold h-12 pr-6 text-right text-muted-foreground text-xs uppercase tracking-wide">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCharges.map((charge) => (
                                        <TableRow key={charge.id} className="group hover:bg-muted/30 border-b transition-colors">
                                            <TableCell className="py-4 pl-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                                                        <User className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="font-bold text-sm truncate group-hover:text-primary transition-colors">{charge.customer?.name}</span>
                                                        <span className="text-xs text-muted-foreground font-mono">#{charge.customer?.account_number || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm">{charge.service_charge_type?.name}</span>
                                                    <span className="text-xs text-muted-foreground">{charge.service_charge_type?.code}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-base text-primary">
                                                        {formatCurrency(charge.amount)}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 text-muted-foreground text-sm">
                                                {charge.issued_date}
                                            </TableCell>
                                            <TableCell className="py-4">
                                                {getStatusBadge(charge.status)}
                                            </TableCell>
                                            <TableCell className="py-4 pr-6 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 rounded-lg p-1 shadow-lg border">
                                                        <DropdownMenuLabel className="px-3 py-2 text-xs font-bold text-muted-foreground">Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem className="rounded-md py-2 px-3 text-sm font-bold cursor-pointer">
                                                            <ArrowUpRight className="mr-2 h-4 w-4" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="rounded-md py-2 px-3 text-sm font-bold cursor-pointer">
                                                            <FileText className="mr-2 h-4 w-4" />
                                                            Print Receipt
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="my-1" />
                                                        <DropdownMenuItem 
                                                            className="rounded-md py-2 px-3 text-sm font-bold cursor-pointer text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                                            onSelect={() => {
                                                                setSelectedCharge(charge);
                                                                setIsPaymentModalOpen(true);
                                                            }}
                                                            disabled={charge.status === 'paid'}
                                                        >
                                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                                            Confirm Payment
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Table Footer */}
                    {filteredCharges.length > 0 && (
                        <div className="p-4 md:p-6 border-t bg-muted/20 flex flex-col md:flex-row items-center justify-between gap-4">
                            <p className="text-xs md:text-sm text-muted-foreground font-bold">
                                Showing <span className="text-foreground">{filteredCharges.length}</span> of <span className="text-foreground">{charges.total}</span> records
                            </p>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" disabled size="sm" className="h-9 px-3 text-xs font-bold rounded-lg">
                                    Previous
                                </Button>
                                <Button size="sm" className="h-9 w-9 p-0 text-xs font-bold rounded-lg shadow-sm shadow-primary/20">1</Button>
                                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-xs font-bold rounded-lg">2</Button>
                                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-xs font-bold rounded-lg">3</Button>
                                <Button variant="outline" size="sm" className="h-9 px-3 text-xs font-bold rounded-lg">
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex gap-4 items-start">
                        <div className="p-3 bg-amber-100 rounded-lg shrink-0">
                            <AlertCircle className="h-5 w-5 text-amber-700" />
                        </div>
                        <div>
                            <h4 className="font-bold text-amber-900 mb-1">Billing Synchronization</h4>
                            <p className="text-sm text-amber-800">Invoiced charges are linked to monthly bills. Payments should be processed via the main billing interface for consistency.</p>
                        </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex gap-4 items-start">
                        <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h4 className="font-bold text-primary mb-1">Standalone Charges</h4>
                            <p className="text-sm text-primary/80">One-off service charges can be issued independently. These are not tied to bills and can be paid directly from the row menu.</p>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmPaymentModal 
                charge={selectedCharge}
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
            />
        </AppLayout>
    );
}