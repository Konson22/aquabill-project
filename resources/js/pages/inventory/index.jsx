import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Edit, Eye, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

const breadcrumbs = [{ title: 'Inventory', href: '/inventory-items' }];

export default function InventoryItemsIndex({ inventoryItems }) {
    const [query, setQuery] = useState('');

    const data = useMemo(() => {
        const items = inventoryItems?.data || [];
        if (!query.trim()) return items;
        const q = query.toLowerCase();
        return items.filter(
            (i) =>
                (i.item_name || '').toLowerCase().includes(q) ||
                (i.category || '').toLowerCase().includes(q) ||
                (i.unit || '').toLowerCase().includes(q),
        );
    }, [inventoryItems, query]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory" />
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Inventory</h1>
                <Link href="/inventory/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Item
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader className="flex items-center justify-between">
                    <CardTitle>Items</CardTitle>
                    <div className="w-80">
                        <Input placeholder="Search items..." value={query} onChange={(e) => setQuery(e.target.value)} />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Unit</TableHead>
                                <TableHead className="text-right">Qty</TableHead>
                                <TableHead className="text-right">Reorder</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.item_name}</TableCell>
                                    <TableCell>{item.category}</TableCell>
                                    <TableCell>{item.unit}</TableCell>
                                    <TableCell className="text-right">{item.quantity_available}</TableCell>
                                    <TableCell className="text-right">{item.reorder_level}</TableCell>
                                    <TableCell className="space-x-2 text-right">
                                        <Link href={`/inventory/${item.id}`}>
                                            <Button variant="outline" size="sm">
                                                <Eye className="mr-1 h-3 w-3" />
                                                View
                                            </Button>
                                        </Link>
                                        <Link href={`/inventory/${item.id}/edit`}>
                                            <Button variant="outline" size="sm">
                                                <Edit className="mr-1 h-3 w-3" />
                                                Edit
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
