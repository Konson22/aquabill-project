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

            <Card className="m-4 p-4 shadow-sm">
                <div className="flex items-center justify-between border-b pb-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                            {tariff.name}
                        </h1>
                        <p className="text-sm text-gray-500">
                            Tariff Report & History
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <a
                                href={route('tariffs.print', tariff.id)}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Printer className="mr-2 h-4 w-4" />
                                Print Report
                            </a>
                        </Button>
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">
                        Current Rates
                    </h2>
                    <div className="rounded-lg border bg-gray-50 p-6 dark:bg-gray-900/50">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <span className="block text-sm font-medium text-gray-500">
                                    Price per Unit
                                </span>
                                <span className="text-2xl font-bold">
                                    {formatCurrency(tariff.price)}
                                </span>
                            </div>
                            <div>
                                <span className="block text-sm font-medium text-gray-500">
                                    Fixed Charge
                                </span>
                                <span className="text-2xl font-bold">
                                    {formatCurrency(tariff.fixed_charge)}
                                </span>
                            </div>
                        </div>
                        <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-700">
                            <span className="block text-sm font-medium text-gray-500">
                                Description
                            </span>
                            <p className="mt-1 text-gray-700 dark:text-gray-300">
                                {tariff.description ||
                                    'No description provided.'}
                            </p>
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">
                        Historical Changes
                    </h2>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-100 dark:bg-gray-800">
                                    <TableHead className="font-semibold text-gray-700 dark:text-gray-200">
                                        From
                                    </TableHead>
                                    <TableHead className="font-semibold text-gray-700 dark:text-gray-200">
                                        To
                                    </TableHead>
                                    <TableHead className="font-semibold text-gray-700 dark:text-gray-200">
                                        Duration
                                    </TableHead>
                                    <TableHead className="font-semibold text-gray-700 dark:text-gray-200">
                                        Price / Unit
                                    </TableHead>
                                    <TableHead className="font-semibold text-gray-700 dark:text-gray-200">
                                        Fixed Charge
                                    </TableHead>
                                    <TableHead className="font-semibold text-gray-700 dark:text-gray-200">
                                        Comment
                                    </TableHead>
                                    <TableHead className="font-semibold text-gray-700 dark:text-gray-200">
                                        Updated By
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tariff.histories &&
                                tariff.histories.length > 0 ? (
                                    tariff.histories.map((history) => (
                                        <TableRow key={history.id}>
                                            <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                                                {formatDate(
                                                    history.effective_from,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                                                {formatDate(
                                                    history.effective_to,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                                                {calculateDuration(
                                                    history.effective_from,
                                                    history.effective_to,
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {formatCurrency(history.price)}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {formatCurrency(
                                                    history.fixed_charge,
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {history.description}
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-500">
                                                {history.creator?.name ||
                                                    'System'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="h-24 text-center text-muted-foreground"
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
