import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';

const breadcrumbs = [
    { title: 'Inventory', href: '/inventory-items' },
    { title: 'Low Stock', href: '/inventory-items/low-stock' },
];

export default function LowStockPage({ inventoryItems }) {
    const items = inventoryItems?.data || [];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Low Stock Items" />
            <Card>
                <CardHeader>
                    <CardTitle>Low Stock</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-right">Qty</TableHead>
                                <TableHead className="text-right">Reorder</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((i) => (
                                <TableRow key={i.id}>
                                    <TableCell>
                                        <Link href={`/inventory-items/${i.id}`} className="text-blue-600 hover:underline">
                                            {i.item_name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{i.category}</TableCell>
                                    <TableCell className="text-right">{i.quantity_available}</TableCell>
                                    <TableCell className="text-right">{i.reorder_level}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
