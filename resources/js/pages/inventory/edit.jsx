import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';

const breadcrumbs = (item) => [
    { title: 'Inventory', href: '/inventory-items' },
    { title: item?.item_name || 'Item', href: `/inventory-items/${item?.id}` },
    { title: 'Edit', href: `/inventory-items/${item?.id}/edit` },
];

export default function InventoryItemEdit({ inventoryItem }) {
    const { data, setData, put, processing, errors } = useForm({
        item_name: inventoryItem.item_name,
        category: inventoryItem.category,
        description: inventoryItem.description ?? '',
        unit: inventoryItem.unit,
        quantity_available: inventoryItem.quantity_available,
        reorder_level: inventoryItem.reorder_level,
    });

    const submit = (e) => {
        e.preventDefault();
        put(`/inventory-items/${inventoryItem.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs(inventoryItem)}>
            <Head title={`Edit ${inventoryItem.item_name}`} />

            <Card>
                <CardHeader>
                    <CardTitle>Edit Item</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm">Item Name</label>
                            <Input value={data.item_name} onChange={(e) => setData('item_name', e.target.value)} />
                            {errors.item_name && <p className="mt-1 text-sm text-red-600">{errors.item_name}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm">Category</label>
                            <Input value={data.category} onChange={(e) => setData('category', e.target.value)} />
                            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                        </div>
                        <div className="md:col-span-2">
                            <label className="mb-1 block text-sm">Description</label>
                            <Input value={data.description} onChange={(e) => setData('description', e.target.value)} />
                            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm">Unit</label>
                            <Input value={data.unit} onChange={(e) => setData('unit', e.target.value)} />
                            {errors.unit && <p className="mt-1 text-sm text-red-600">{errors.unit}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm">Quantity Available</label>
                            <Input
                                type="number"
                                value={data.quantity_available}
                                onChange={(e) => setData('quantity_available', Number(e.target.value))}
                            />
                            {errors.quantity_available && <p className="mt-1 text-sm text-red-600">{errors.quantity_available}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm">Reorder Level</label>
                            <Input type="number" value={data.reorder_level} onChange={(e) => setData('reorder_level', Number(e.target.value))} />
                            {errors.reorder_level && <p className="mt-1 text-sm text-red-600">{errors.reorder_level}</p>}
                        </div>
                        <div className="flex items-center justify-end space-x-2 md:col-span-2">
                            <Link href={`/inventory-items/${inventoryItem.id}`} className="inline-block">
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                Save
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
