import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function periodStatus(s) {
    if (s === 'paid') {
        return <Badge className="bg-emerald-600">Paid</Badge>;
    }
    if (s === 'processed') {
        return <Badge className="bg-blue-600">Processed</Badge>;
    }
    return <Badge variant="secondary">Draft</Badge>;
}

function formatDate(d) {
    if (!d) {
        return '';
    }
    return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function HRPayrollIndex({ periods }) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'HR', href: route('hr') },
                { title: 'Payroll', href: route('hr.payroll.index') },
            ]}
        >
            <Head title="Payroll" />

            <div className="flex flex-col gap-6 p-4 sm:p-6">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                        <Wallet className="h-7 w-7 text-primary" />
                        Payroll periods
                    </h1>
                    <p className="text-sm text-muted-foreground">Review pay runs and status. Generation flows will attach here.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Recent periods</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="pb-3 pr-4">Name</th>
                                        <th className="pb-3 pr-4">Range</th>
                                        <th className="pb-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {periods.length ? (
                                        periods.map((p) => (
                                            <tr key={p.id}>
                                                <td className="py-3 pr-4 font-medium">{p.name}</td>
                                                <td className="py-3 pr-4 text-xs text-muted-foreground">
                                                    {formatDate(p.start_date)} – {formatDate(p.end_date)}
                                                </td>
                                                <td className="py-3">{periodStatus(p.status)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="py-10 text-center text-muted-foreground">
                                                No payroll periods yet. Create one from the payroll service when ready.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
