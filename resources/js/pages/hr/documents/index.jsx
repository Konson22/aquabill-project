import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { FileText, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function formatDate(d) {
    if (!d) {
        return '—';
    }
    return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function HRDocumentsIndex({ expiringDocuments }) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'HR', href: route('hr') },
                { title: 'Documents', href: route('hr.documents.index') },
            ]}
        >
            <Head title="Staff documents" />

            <div className="flex flex-col gap-6 p-4 sm:p-6">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                        <FileText className="h-7 w-7 text-primary" />
                        Documents
                    </h1>
                    <p className="text-sm text-muted-foreground">Credentials and files expiring within the next 30 days.</p>
                </div>

                <Card className="border-amber-200/80 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20">
                    <CardContent className="flex items-start gap-3 py-4 text-sm">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                        <p>
                            Upload and renewal workflows will live here. This table is read-only visibility for compliance tracking.
                        </p>
                    </CardContent>
                </Card>

                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b bg-muted/40">
                                    <th className="px-4 py-3 font-semibold">Staff</th>
                                    <th className="px-4 py-3 font-semibold">Type</th>
                                    <th className="px-4 py-3 font-semibold">Document #</th>
                                    <th className="px-4 py-3 font-semibold">Expires</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {expiringDocuments.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-muted/30">
                                        <td className="px-4 py-3 font-medium">{doc.staff?.name ?? '—'}</td>
                                        <td className="px-4 py-3">{doc.document_type?.name ?? '—'}</td>
                                        <td className="px-4 py-3 font-mono text-xs">{doc.document_number ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant="outline" className="font-normal">
                                                {formatDate(doc.expires_at)}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                                {expiringDocuments.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                                            No documents expiring in the next 30 days.
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
