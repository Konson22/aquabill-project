import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { Head } from '@inertiajs/react';
import { Printer } from 'lucide-react';

export default function TariffShow({ tariff }) {
    const breadcrumbs = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
        },
        {
            title: 'Tariffs',
            href: route('tariffs.index'),
        },
        {
            title: tariff.name,
            href: route('tariffs.show', tariff.id),
        },
    ];

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    const calculateDuration = (from, to) => {
        if (!from || !to) return '-';
        const start = new Date(from);
        const end = new Date(to);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 30) {
            return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
        }

        const diffMonths = Math.floor(diffDays / 30);
        if (diffMonths < 12) {
            return `${diffMonths} month${diffMonths !== 1 ? 's' : ''}`;
        }

        const diffYears = Math.floor(diffMonths / 12);
        const remainingMonths = diffMonths % 12;
        let duration = `${diffYears} year${diffYears !== 1 ? 's' : ''}`;
        if (remainingMonths > 0) {
            duration += ` ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
        }
        return duration;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Tariff - ${tariff.name}`} />

            <Card className="m-4 border-slate-200/80 p-0 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/60 p-6">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                            {tariff.name}
                        </h1>
                        <p className="text-sm text-slate-500">
                            Tariff Report & History
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <a
                                href={route('tariffs.print', tariff.id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="gap-2"
                            >
                                <Printer className="mr-2 h-4 w-4" />
                                Print Report
                            </a>
                        </Button>
                    </div>
                </div>

                <div className="px-6 pb-6 pt-6">
                    <h2 className="mb-4 text-lg font-semibold text-slate-900">
                        Current Rates
                    </h2>
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                                <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Price per Unit
                                </span>
                                <span className="mt-2 block text-2xl font-semibold text-slate-900">
                                    {formatCurrency(tariff.price)}
                                </span>
                            </div>
                            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                                <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Fixed Charge
                                </span>
                                <span className="mt-2 block text-2xl font-semibold text-slate-900">
                                    {formatCurrency(tariff.fixed_charge)}
                                </span>
                            </div>
                        </div>
                        <div className="mt-6 border-t border-slate-100 pt-4">
                            <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Description
                            </span>
                            <p className="mt-2 text-sm text-slate-600">
                                {tariff.description ||
                                    'No description provided.'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="px-6 pb-6">
                    <h2 className="mb-4 text-lg font-semibold text-slate-900">
                        Historical Changes
                    </h2>
                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 shadow-sm">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/80">
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                                        From
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                                        To
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                                        Duration
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                                        Price / Unit
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                                        Fixed Charge
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                                        Comment
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                                        Updated By
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tariff.histories &&
                                tariff.histories.length > 0 ? (
                                    tariff.histories.map((history) => (
                                        <TableRow
                                            key={history.id}
                                            className="hover:bg-slate-50/70"
                                        >
                                            <TableCell className="text-sm text-slate-600">
                                                {formatDate(
                                                    history.effective_from,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-600">
                                                {formatDate(
                                                    history.effective_to,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-600">
                                                {calculateDuration(
                                                    history.effective_from,
                                                    history.effective_to,
                                                )}
                                            </TableCell>
                                            <TableCell className="font-semibold text-slate-900">
                                                {formatCurrency(history.price)}
                                            </TableCell>
                                            <TableCell className="font-semibold text-slate-900">
                                                {formatCurrency(
                                                    history.fixed_charge,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-600">
                                                {history.description}
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-500">
                                                {history.creator?.name ||
                                                    'System'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="h-24 text-center text-sm text-slate-500"
                                        >
                                            No history available.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </Card>
        </AppLayout>
    );
}
