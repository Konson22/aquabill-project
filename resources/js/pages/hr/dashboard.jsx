import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
    Building2,
    Users,
    Calendar,
    Wallet,
    ClipboardList,
    FileText,
    BarChart3,
    UserCheck,
    GraduationCap,
    PieChart,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

const quickLinks = [
    { title: 'HR departments', description: 'Organize teams and cost centers', href: route('hr.departments.index'), icon: Building2 },
    { title: 'Staff', description: 'Directory, profiles, and records', href: route('hr.staff.index'), icon: Users },
    { title: 'Attendance', description: 'Daily clock-in and status', href: route('hr.attendance.index'), icon: Calendar },
    { title: 'Leave', description: 'Requests, balances, and types', href: route('hr.leave.index'), icon: ClipboardList },
    { title: 'Payroll', description: 'Periods and pay runs', href: route('hr.payroll.index'), icon: Wallet },
    { title: 'Documents', description: 'Expiring credentials and files', href: route('hr.documents.index'), icon: FileText },
    { title: 'Training', description: 'Programs, participants, and materials', href: route('hr.training.programs.index'), icon: GraduationCap },
    { title: 'Training reports', description: 'Costs, filters, and print-friendly lists', href: route('hr.training.reports.index'), icon: PieChart },
    { title: 'Reports', description: 'Lists, exports, and summaries', href: route('hr.reports.index'), icon: BarChart3 },
];

function formatStatLabel(key) {
    const map = {
        total_staff: 'Total staff',
        active_staff: 'Active staff',
        on_leave_today: 'Staff on leave (status)',
        pending_leave: 'Pending leave requests',
        attendance_today: 'Attendance records today',
        expiring_documents: 'Documents expiring (30d)',
    };
    return map[key] ?? key;
}

function trainingMetricLabel(key) {
    const map = {
        total_trainings: 'Total trainings',
        ongoing: 'Ongoing trainings',
        completed: 'Completed trainings',
        planned: 'Planned trainings',
        staff_trained_this_year: 'Staff trained (this year)',
        cost_this_year: 'Training cost (this year)',
    };
    return map[key] ?? key;
}

export default function HRDashboard({ stats, currentPayroll, trainingMetrics = {} }) {
    const trainingEntries = Object.entries(trainingMetrics || {}).filter(([k]) => k !== 'cost_this_year');
    const trainingCost = trainingMetrics?.cost_this_year;

    return (
        <AppLayout breadcrumbs={[{ title: 'HR', href: route('hr') }]}>
            <Head title="HR Dashboard" />

            <div className="flex flex-col gap-8 p-4 sm:p-6 lg:p-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Human resources</h1>
                    <p className="mt-1 text-muted-foreground">Staff, attendance, leave, payroll, and compliance.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(stats || {}).map(([key, value]) => (
                        <Card key={key} className="border shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">{formatStatLabel(key)}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold tabular-nums">{value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {(trainingEntries.length > 0 || trainingCost != null) && (
                    <div>
                        <h2 className="mb-4 text-lg font-semibold">Training overview</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {trainingEntries.map(([key, value]) => (
                                <Card key={key} className="border shadow-sm">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">{trainingMetricLabel(key)}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-3xl font-bold tabular-nums">{value}</p>
                                    </CardContent>
                                </Card>
                            ))}
                            {trainingCost != null && (
                                <Card className="border shadow-sm">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">{trainingMetricLabel('cost_this_year')}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-3xl font-bold tabular-nums">{formatCurrency(Number(trainingCost))}</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                )}

                {currentPayroll && (
                    <Card className="border border-amber-200/80 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20">
                        <CardContent className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                                <UserCheck className="h-8 w-8 text-amber-600" />
                                <div>
                                    <p className="text-sm font-medium">Current payroll period</p>
                                    <p className="text-lg font-semibold">{currentPayroll.name}</p>
                                </div>
                            </div>
                            <Badge variant="secondary" className="w-fit capitalize">
                                {currentPayroll.status}
                            </Badge>
                        </CardContent>
                    </Card>
                )}

                <div>
                    <h2 className="mb-4 text-lg font-semibold">Module areas</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {quickLinks.map((item) => (
                            <Link
                                key={item.title}
                                href={item.href}
                                className="group flex items-start gap-4 rounded-xl border bg-card p-4 shadow-sm transition hover:border-primary/30 hover:shadow-md"
                            >
                                <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                                    <item.icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground group-hover:text-primary">{item.title}</p>
                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
