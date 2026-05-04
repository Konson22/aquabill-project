import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { BarChart3, Users, Calendar, Wallet, FileText, Download, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const reportCards = [
    {
        title: 'Staff list',
        description: 'Directory export with filters',
        icon: Users,
        href: route('hr.staff.index'),
        action: 'Open staff',
    },
    {
        title: 'Attendance report',
        description: 'Daily / range attendance summaries',
        icon: Calendar,
        href: route('hr.attendance.index'),
        action: 'Open attendance',
    },
    {
        title: 'Leave report',
        description: 'Balances and request history',
        icon: Calendar,
        href: route('hr.leave.index'),
        action: 'Open leave',
    },
    {
        title: 'Payroll report',
        description: 'Period totals and payslips',
        icon: Wallet,
        href: route('hr.payroll.index'),
        action: 'Open payroll',
    },
    {
        title: 'Document expiry',
        description: 'Upcoming renewals',
        icon: FileText,
        href: route('hr.documents.index'),
        action: 'Open documents',
    },
    {
        title: 'Training programs',
        description: 'Programs, participation, and yearly training cost',
        icon: GraduationCap,
        href: route('hr.training.reports.index'),
        action: 'Open training reports',
    },
];

export default function HRReportsIndex() {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'HR', href: route('hr') },
                { title: 'Reports', href: route('hr.reports.index') },
            ]}
        >
            <Head title="HR Reports" />

            <div className="flex flex-col gap-6 p-4 sm:p-6">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                        <BarChart3 className="h-7 w-7 text-primary" />
                        HR reports
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Excel and PDF exports can be wired to the same queries used on each module page.
                    </p>
                </div>

                <Card className="border-dashed">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Download className="h-4 w-4" />
                            Exports (planned)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        Use Laravel Excel / DomPDF from backend routes when you are ready; navigation below jumps to the live data
                        screens that reports will summarize.
                    </CardContent>
                </Card>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {reportCards.map((r) => (
                        <Card key={r.title} className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <r.icon className="h-4 w-4 text-primary" />
                                    {r.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="mt-auto flex flex-col gap-3">
                                <p className="text-sm text-muted-foreground">{r.description}</p>
                                <Button variant="outline" size="sm" className="w-fit" asChild>
                                    <Link href={r.href}>{r.action}</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
