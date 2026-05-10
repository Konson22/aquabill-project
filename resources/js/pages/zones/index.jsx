import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { MapPin, Plus, CalendarDays, Edit2, Clock } from 'lucide-react';
import { useState } from 'react';
import CreateZoneModal from './components/create-zone-modal';

const breadcrumbs = [
    {
        title: 'Zones',
        href: '/zones',
    },
];

export default function Zones({ zones }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Billing Zones" />

            <div className="flex h-full flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <MapPin className="h-6 w-6 text-red-500" />
                            Billing Zones
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage geographic billing areas, water supply schedules, and customer density.
                        </p>
                    </div>
                    <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Zone
                    </Button>
                </div>

                <div className="flex-1 overflow-hidden rounded-xl border bg-card shadow-sm">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                <TableHead className="px-4 py-3">Zone</TableHead>
                                <TableHead className="px-4 py-3 text-right">Customers</TableHead>
                                <TableHead className="px-4 py-3">Supply day</TableHead>
                                <TableHead className="px-4 py-3">Supply time</TableHead>
                                <TableHead className="px-4 py-3">Status</TableHead>
                                <TableHead className="px-4 py-3 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {zones.length > 0 ? (
                                zones.map((zone) => (
                                    <TableRow key={zone.id} className="hover:bg-muted/30">
                                        <TableCell className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
                                                    <MapPin className="h-4 w-4" />
                                                </div>
                                                <span className="font-semibold text-foreground">{zone.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-4 text-right tabular-nums font-medium text-foreground">
                                            {zone.customers_count}
                                        </TableCell>
                                        <TableCell className="px-4 py-4">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <CalendarDays className="h-4 w-4 shrink-0" />
                                                {zone.supply_day || 'N/A'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-4">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground italic">
                                                <Clock className="h-4 w-4 shrink-0" />
                                                {zone.supply_time || 'Not set'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-4">
                                            <Badge variant={zone.status === 'active' ? 'success' : 'secondary'}>
                                                {zone.status.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-4 py-4 text-right">
                                            <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                                                <Edit2 className="h-3 w-3" />
                                                Configure
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="px-4 py-12 text-center text-sm text-muted-foreground"
                                    >
                                        No billing zones yet. Create one to get started.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <CreateZoneModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
        </AppLayout>
    );
}
