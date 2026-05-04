import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Calendar, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function statusBadge(status) {
    const map = {
        present: 'bg-emerald-600',
        absent: 'bg-rose-600',
        late: 'bg-amber-600',
        half_day: 'bg-blue-600',
        on_leave: 'bg-violet-600',
        holiday: 'bg-slate-600',
    };
    return <Badge className={map[status] ?? 'bg-slate-600'}>{status?.replace('_', ' ')}</Badge>;
}

export default function HRAttendanceIndex({ attendances, filters = {} }) {
    const date = filters.date ?? '';

    const onDateChange = (e) => {
        router.get(route('hr.attendance.index'), { date: e.target.value }, { preserveState: true, only: ['attendances', 'filters'] });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'HR', href: route('hr') },
                { title: 'Attendance', href: route('hr.attendance.index') },
            ]}
        >
            <Head title="Attendance" />

            <div className="flex flex-col gap-6 p-4 sm:p-6">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                        <Clock className="h-7 w-7 text-primary" />
                        Attendance
                    </h1>
                    <p className="text-sm text-muted-foreground">Daily attendance records by date.</p>
                </div>

                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Calendar className="h-4 w-4" />
                            Select date
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Label htmlFor="attendance-date">Date</Label>
                        <Input id="attendance-date" type="date" value={date?.slice(0, 10)} onChange={onDateChange} />
                    </CardContent>
                </Card>

                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b bg-muted/40">
                                    <th className="px-4 py-3 font-semibold">Staff</th>
                                    <th className="px-4 py-3 font-semibold">Department</th>
                                    <th className="px-4 py-3 font-semibold">Status</th>
                                    <th className="px-4 py-3 font-semibold">In</th>
                                    <th className="px-4 py-3 font-semibold">Out</th>
                                    <th className="px-4 py-3 font-semibold">Late (min)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {attendances.map((row) => (
                                    <tr key={row.id} className="hover:bg-muted/30">
                                        <td className="px-4 py-3 font-medium">{row.staff?.name ?? '—'}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{row.staff?.hr_department?.name ?? '—'}</td>
                                        <td className="px-4 py-3">{statusBadge(row.status)}</td>
                                        <td className="px-4 py-3 font-mono text-xs">{row.clock_in ?? '—'}</td>
                                        <td className="px-4 py-3 font-mono text-xs">{row.clock_out ?? '—'}</td>
                                        <td className="px-4 py-3 tabular-nums">{row.late_minutes ?? 0}</td>
                                    </tr>
                                ))}
                                {attendances.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                                            No attendance for this date.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
