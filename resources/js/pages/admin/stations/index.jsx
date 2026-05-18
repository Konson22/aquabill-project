import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
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
import { Landmark, Plus, MapPin, UserCircle2, Phone, Navigation } from 'lucide-react';
import CreateStationModal from './components/create-station-modal';

export default function AdminStationsIndex({ stations, zones, accountantChoices }) {
    const [createOpen, setCreateOpen] = useState(false);

    const breadcrumbs = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Settings', href: route('admin.settings') },
        { title: 'Stations', href: route('admin.stations.index') },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Collection stations" />

            <div className="flex h-full flex-col gap-6 p-6 md:p-8">
                <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-600">
                            <Landmark className="h-4 w-4" />
                            Administration
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">
                            Collection stations
                        </h1>
                        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                            Define payment desks and field offices. Staff choose a station when recording payments so
                            reports can show where cash and deposits were collected.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Button variant="outline" asChild className="font-semibold">
                            <Link href={route('admin.settings')}>Back to settings</Link>
                        </Button>
                        <Button
                            onClick={() => setCreateOpen(true)}
                            className="bg-cyan-600 font-bold shadow-md shadow-cyan-900/10 hover:bg-cyan-700"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            New station
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
                    <Table>
                        <TableHeader className="bg-muted/40">
                            <TableRow className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-transparent">
                                <TableHead className="px-4 py-3">Station</TableHead>
                                <TableHead className="px-4 py-3">Zone</TableHead>
                                <TableHead className="px-4 py-3">Accountant</TableHead>
                                <TableHead className="px-4 py-3">Manager</TableHead>
                                <TableHead className="px-4 py-3">Location</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stations.length > 0 ? (
                                stations.map((row) => (
                                    <TableRow key={row.id} className="hover:bg-muted/30">
                                        <TableCell className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-700">
                                                    <Landmark className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-foreground">{row.name}</p>
                                                    <p className="text-xs text-muted-foreground">ID #{row.id}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-4">
                                            {row.zone ? (
                                                <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
                                                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                                    {row.zone.name}
                                                </span>
                                            ) : (
                                                <Badge variant="secondary" className="font-normal">
                                                    Unassigned
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-4 py-4">
                                            {row.accountant ? (
                                                <div className="flex items-start gap-2 text-sm">
                                                    <UserCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                                    <div>
                                                        <p className="font-medium text-foreground">{row.accountant.name}</p>
                                                        {row.accountant.email ? (
                                                            <p className="text-xs text-muted-foreground">
                                                                {row.accountant.email}
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-4 py-4 text-sm text-muted-foreground">
                                            <div className="space-y-0.5">
                                                {row.manager_name || row.manager_phone ? (
                                                    <>
                                                        <p className="font-medium text-foreground">
                                                            {row.manager_name || '—'}
                                                        </p>
                                                        {row.manager_phone ? (
                                                            <p className="inline-flex items-center gap-1 text-xs">
                                                                <Phone className="h-3 w-3" />
                                                                {row.manager_phone}
                                                            </p>
                                                        ) : null}
                                                    </>
                                                ) : (
                                                    <span>—</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-[200px] px-4 py-4">
                                            {row.coordinate ? (
                                                <span className="inline-flex items-start gap-1.5 break-words text-xs text-muted-foreground">
                                                    <Navigation className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                                    {row.coordinate}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">—</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-40 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center gap-2 py-6">
                                            <Landmark className="h-10 w-10 opacity-30" />
                                            <p className="font-medium text-foreground">No stations yet</p>
                                            <p className="max-w-sm text-sm">
                                                Create your first collection point to tag payments with a location.
                                            </p>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="mt-2 font-semibold"
                                                onClick={() => setCreateOpen(true)}
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add station
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <CreateStationModal
                isOpen={createOpen}
                onClose={() => setCreateOpen(false)}
                zones={zones}
                accountantChoices={accountantChoices}
            />
        </AppLayout>
    );
}
