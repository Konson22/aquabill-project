import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, DollarSign, History, Zap } from 'lucide-react';

export default function Show({ tariff }) {
    const breadcrumbs = [
        { title: 'Tariffs', href: '/tariffs' },
        { title: tariff?.name ?? 'Tariff', href: tariff ? `/tariffs/${tariff.id}` : '/tariffs' },
    ];

    const histories = tariff?.histories ?? [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={tariff ? `Tariff • ${tariff.name}` : 'Tariff'} />

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link
                            href={route('tariffs.index')}
                            className="mb-2 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Tariffs
                        </Link>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
                            <Zap className="h-6 w-6 text-amber-500" />
                            {tariff?.name ?? 'Tariff Details'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            View tariff pricing details and historical updates.
                        </p>
                    </div>
                    <Badge variant="success" className="w-fit">
                        Active
                    </Badge>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Price Per Unit
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-primary" />
                                <span className="font-mono text-2xl font-bold">
                                    {formatCurrency(tariff?.price_per_unit ?? 0)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Fixed Charge
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <span className="font-mono text-2xl font-bold">
                                {formatCurrency(tariff?.fixed_charge ?? 0)}
                            </span>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Created
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-primary" />
                                <span className="text-base font-semibold">
                                    {tariff?.created_at
                                        ? new Date(tariff.created_at).toLocaleDateString()
                                        : '—'}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <History className="h-5 w-5 text-primary" />
                            Tariff History
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="text-right">Price Per Unit</TableHead>
                                    <TableHead className="text-right">Fixed Charge</TableHead>
                                    <TableHead className="text-right">Created At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {histories.length > 0 ? (
                                    histories.map((history) => (
                                        <TableRow key={history.id}>
                                            <TableCell className="font-medium">{history.name}</TableCell>
                                            <TableCell className="text-right font-mono">
                                                {formatCurrency(history.price_per_unit ?? 0)}
                                            </TableCell>
                                            <TableCell className="text-right font-mono">
                                                {formatCurrency(history.fixed_charge ?? 0)}
                                            </TableCell>
                                            <TableCell className="text-right text-sm text-muted-foreground">
                                                {history.created_at
                                                    ? new Date(history.created_at).toLocaleDateString()
                                                    : '—'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="py-10 text-center text-sm text-muted-foreground"
                                        >
                                            No history records yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
