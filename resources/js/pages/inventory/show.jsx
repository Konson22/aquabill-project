import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Edit } from 'lucide-react';

const breadcrumbs = (item) => [
    { title: 'Inventory', href: '/inventory-items' },
    { title: item?.item_name || 'Item', href: `/inventory-items/${item?.id}` },
];

export default function InventoryItemShow({ inventoryItem }) {
    const transactions = inventoryItem.transactions || [];

    return (
        <AppLayout breadcrumbs={breadcrumbs(inventoryItem)}>
            <Head title={inventoryItem.item_name} />

            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{inventoryItem.item_name}</h1>
                <Link href={`/inventory-items/${inventoryItem.id}/edit`}>
                    <Button variant="outline">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-slate-600">Category:</span>
                            <span>{inventoryItem.category}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600">Unit:</span>
                            <span>{inventoryItem.unit}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600">Quantity:</span>
                            <span>{inventoryItem.quantity_available}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600">Reorder Level:</span>
                            <span>{inventoryItem.reorder_level}</span>
                        </div>
                        {inventoryItem.description && (
                            <div>
                                <div className="text-slate-600">Description</div>
                                <div>{inventoryItem.description}</div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map((t) => (
                                    <TableRow key={t.id}>
                                        <TableCell>{new Date(t.created_at).toLocaleString()}</TableCell>
                                        <TableCell>{t.type}</TableCell>
                                        <TableCell className="text-right">{t.quantity}</TableCell>
                                    </TableRow>
                                ))}
                                {transactions.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-slate-500">
                                            No transactions
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
