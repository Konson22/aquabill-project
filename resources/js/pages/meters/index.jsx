import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Search,
    Plus,
    Activity,
    User,
    Settings,
    MoreVertical,
    History,
    ChevronLeft,
    ChevronRight,
    MapPin
} from 'lucide-react';

const breadcrumbs = [
    {
        title: 'Meters',
        href: '/meters',
    },
];

export default function Meters({ meters }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Water Meters Management" />

            <div className="flex h-full flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <Activity className="h-6 w-6 text-blue-500" />
                            Water Meters
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Track meter installation, operational status, and link meters to customer accounts.
                        </p>
                    </div>
                    <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Install New Meter
                    </Button>
                </div>

                {/* Status Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-card p-4 rounded-xl border shadow-sm">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Meters</div>
                        <div className="text-2xl font-bold">{meters.total}</div>
                    </div>
                    <div className="bg-card p-4 rounded-xl border shadow-sm border-l-4 border-l-emerald-500">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Active</div>
                        <div className="text-2xl font-bold">{meters.total}</div>
                    </div>
                    <div className="bg-card p-4 rounded-xl border shadow-sm border-l-4 border-l-amber-500">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Maintenance</div>
                        <div className="text-2xl font-bold">0</div>
                    </div>
                    <div className="bg-card p-4 rounded-xl border shadow-sm border-l-4 border-l-red-500">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Broken</div>
                        <div className="text-2xl font-bold">0</div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card p-4 rounded-xl border shadow-sm">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search by meter number or customer..."
                            className="pl-10"
                        />
                    </div>
                    <Button variant="outline" size="sm">
                        <Settings className="mr-2 h-4 w-4" />
                        Batch Actions
                    </Button>
                </div>

                <div className="flex-1 overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b bg-muted/50 transition-colors text-xs uppercase tracking-wider">
                                    <th className="px-6 py-4 font-bold text-muted-foreground">Meter Number</th>
                                    <th className="px-6 py-4 font-bold text-muted-foreground">Customer</th>
                                    <th className="px-6 py-4 font-bold text-muted-foreground">Location</th>
                                    <th className="px-6 py-4 font-bold text-muted-foreground">Status</th>
                                    <th className="px-6 py-4 font-bold text-muted-foreground text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {meters.data.map((meter) => (
                                    <tr key={meter.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center text-blue-600">
                                                    <Activity className="h-4 w-4" />
                                                </div>
                                                <span className="font-mono text-sm font-bold tracking-tight">
                                                    {meter.meter_number}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                                                    <User className="h-3 w-3 text-muted-foreground" />
                                                </div>
                                                <span className="text-sm font-medium">{meter.customer?.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <MapPin className="h-3 w-3" />
                                                {meter.customer?.address?.substring(0, 20)}...
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge 
                                                variant={meter.status === 'active' ? 'success' : 'secondary'}
                                                className="rounded-md font-mono text-[10px]"
                                            >
                                                {meter.status.toUpperCase()}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="icon" title="History">
                                                    <History className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {meters.links.length > 3 && (
                        <div className="flex items-center justify-between border-t px-6 py-4">
                            <span className="text-xs text-muted-foreground">
                                Total {meters.total} units managed
                            </span>
                            <div className="flex items-center gap-1">
                                {meters.links.map((link, i) => (
                                    <Button
                                        key={i}
                                        variant={link.active ? 'default' : 'ghost'}
                                        size="sm"
                                        disabled={!link.url}
                                        className="h-8 w-8 p-0"
                                        asChild={!!link.url}
                                    >
                                        {link.url ? (
                                            <Link href={link.url}>
                                                {link.label === '&laquo; Previous' ? <ChevronLeft className="h-4 w-4" /> : 
                                                 link.label === 'Next &raquo;' ? <ChevronRight className="h-4 w-4" /> : 
                                                 link.label}
                                            </Link>
                                        ) : (
                                            <span>
                                                {link.label === '&laquo; Previous' ? <ChevronLeft className="h-4 w-4" /> : 
                                                 link.label === 'Next &raquo;' ? <ChevronRight className="h-4 w-4" /> : 
                                                 link.label}
                                            </span>
                                        )}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}