import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/utils';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Activity,
    Calendar,
    CreditCard,
    Eye,
    FileSpreadsheet,
    MoreHorizontal,
    Trash2,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Payments({
    payments,
    filters = {},
    zones = [],
    areas = [],
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [month, setMonth] = useState(filters.month || '');
    const [deleteId, setDeleteId] = useState(null);
    const { delete: destroy } = useForm();

    const confirmDelete = (id) => {
        setDeleteId(id);
    };

    const handleDelete = () => {
        if (deleteId) {
            destroy(route('payments.destroy', deleteId), {
                preserveScroll: true,
                onSuccess: () => setDeleteId(null),
                onFinish: () => setDeleteId(null),
            });
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            const query = {};
            if (search) query.search = search;
            if (month) query.month = month;

            router.get(route('payments'), query, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [search, month]);

    const clearFilters = () => {
        setSearch('');
        setMonth('');
    };

    const breadcrumbs = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
        },
        {
            title: 'Payments',
            href: route('payments'),
        },
    ];

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getLast12Months = () => {
        const months = [];
        const date = new Date();
        for (let i = 0; i < 12; i++) {
            const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
            const value = d.toISOString().slice(0, 7);
            const label = d.toLocaleString('default', {
                month: 'long',
                year: 'numeric',
            });
            months.push({ value, label });
        }
        return months;
    };

    const last12Months = getLast12Months();
    const hasFilters = search || month;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payments" />

            <div className="p flex flex-col gap-6">
                {/* Header & Controls Section */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Payments
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {hasFilters && (
                            <Button
                                variant="ghost"
                                size="md"
                                onClick={clearFilters}
                                title="Clear filters"
                                className="h-8 px-2 lg:px-3"
                            >
                                <X className="mr-2 h-4 w-4" />
                                Clear Filters
                            </Button>
                        )}
                        <div className="mx-1 hidden h-6 w-[1px] bg-border sm:block" />

                        <Button
                            variant="outline"
                            asChild
                            title="Export CSV"
                            className="gap-2"
                        >
                            <a
                                href={
                                    route('payments.export') +
                                    window.location.search
                                }
                            >
                                <FileSpreadsheet className="h-4 w-4" />
                                <span className="hidden sm:inline">
                                    Export CSV
                                </span>
                            </a>
                        </Button>
                        <Button
                            variant="outline"
                            asChild
                            title="Reports"
                            className="gap-2"
                        >
                            <Link href={route('payments.report')}>
                                <Activity className="h-4 w-4" />
                                <span className="hidden sm:inline">
                                    Reports
                                </span>
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex items-center justify-end px-5">
                        <div className=""></div>
                        <div className="flex">
                            <Input
                                placeholder="Search payments..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="mr-3 w-[450px] bg-background"
                            />
                            <Select
                                value={month || 'all'}
                                onValueChange={(value) =>
                                    setMonth(value === 'all' ? '' : value)
                                }
                            >
                                <SelectTrigger className="w-full sm:w-[160px]">
                                    <SelectValue placeholder="All Months" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Months
                                    </SelectItem>
                                    {last12Months.map((m) => (
                                        <SelectItem
                                            key={m.value}
                                            value={m.value}
                                        >
                                            {m.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-[180px]">
                                        Reference
                                    </TableHead>
                                    <TableHead>Customer</TableHead>

                                    <TableHead>Bill No</TableHead>
                                    <TableHead>Amount Paid</TableHead>
                                    <TableHead>Balance</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payments.data.length > 0 ? (
                                    payments.data.map((payment) => (
                                        <TableRow
                                            key={payment.id}
                                            className="hover:bg-muted/5"
                                        >
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    {payment.reference_number ||
                                                        '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    {payment.payable?.customer
                                                        ?.name ||
                                                        'Unknown Customer'}
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                {payment.payable ? (
                                                    <div className="flex flex-col text-sm">
                                                        {payment.payable_type.includes(
                                                            'Bill',
                                                        ) ? (
                                                            <Link
                                                                href={route(
                                                                    'bills.show',
                                                                    payment
                                                                        .payable
                                                                        .id,
                                                                )}
                                                                className="flex items-center gap-1 font-medium text-primary hover:underline"
                                                            >
                                                                <FileSpreadsheet className="h-3 w-3" />
                                                                {
                                                                    payment
                                                                        .payable
                                                                        .bill_number
                                                                }
                                                            </Link>
                                                        ) : (
                                                            <span className="font-medium">
                                                                Other Service
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        -
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-bold text-green-600">
                                                        {formatCurrency(
                                                            payment.amount,
                                                        )}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-bold text-green-600">
                                                        {formatCurrency(
                                                            payment.balance,
                                                        )}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDate(
                                                        payment.payment_date,
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">
                                                                Open menu
                                                            </span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>
                                                            Actions
                                                        </DropdownMenuLabel>
                                                        <DropdownMenuItem
                                                            asChild
                                                        >
                                                            <Link
                                                                href={route(
                                                                    'payments.show',
                                                                    payment.id,
                                                                )}
                                                            >
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Receipt
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        {/* Assuming we might want a print option here later */}
                                                        {/* <DropdownMenuItem>
                                                            <Printer className="mr-2 h-4 w-4" />
                                                            Print Receipt
                                                        </DropdownMenuItem> */}
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                confirmDelete(
                                                                    payment.id,
                                                                )
                                                            }
                                                            className="text-red-600 focus:text-red-600"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete Record
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="h-32 text-center text-muted-foreground"
                                        >
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <CreditCard className="h-8 w-8 opacity-20" />
                                                <p>
                                                    No payments found matching
                                                    your criteria.
                                                </p>
                                                {hasFilters && (
                                                    <Button
                                                        variant="link"
                                                        onClick={clearFilters}
                                                        className="px-0"
                                                    >
                                                        Clear filters
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="border-t p-4">
                        <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-sm text-muted-foreground">
                                Showing{' '}
                                <span className="font-medium">
                                    {payments.from || 0}
                                </span>{' '}
                                to{' '}
                                <span className="font-medium">
                                    {payments.to || 0}
                                </span>{' '}
                                of{' '}
                                <span className="font-medium">
                                    {payments.total}
                                </span>{' '}
                                results
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                {payments.links &&
                                    payments.links.map((link, index) => {
                                        const label = link.label
                                            .replace('&laquo; Previous', 'Prev')
                                            .replace('Next &raquo;', 'Next');

                                        return (
                                            <Button
                                                key={index}
                                                variant={
                                                    link.active
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="sm"
                                                disabled={!link.url}
                                                asChild={!!link.url}
                                                className={
                                                    !link.url
                                                        ? 'cursor-default opacity-50'
                                                        : ''
                                                }
                                            >
                                                {link.url ? (
                                                    <Link
                                                        href={link.url}
                                                        dangerouslySetInnerHTML={{
                                                            __html: label,
                                                        }}
                                                    />
                                                ) : (
                                                    <span
                                                        dangerouslySetInnerHTML={{
                                                            __html: label,
                                                        }}
                                                    />
                                                )}
                                            </Button>
                                        );
                                    })}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            <AlertDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the payment record from the database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
