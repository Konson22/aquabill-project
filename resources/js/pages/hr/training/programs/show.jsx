import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, GraduationCap, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import { formatCurrency } from '@/lib/utils';

function programStatusBadge(s) {
    const map = {
        planned: 'bg-slate-600',
        ongoing: 'bg-blue-600',
        completed: 'bg-emerald-600',
        cancelled: 'bg-rose-600',
    };
    return <Badge className={map[s] ?? 'bg-slate-600'}>{s}</Badge>;
}

export default function TrainingProgramShow({ program, participantSummary, completionRate, staffOptions = [] }) {
    const enrollForm = useForm({ staff_id: '' });

    const enrollSubmit = (e) => {
        e.preventDefault();
        enrollForm.post(route('hr.training.programs.participants.store', program.id), {
            preserveScroll: true,
            onSuccess: () => enrollForm.reset('staff_id'),
        });
    };

    const docForm = useForm({
        title: '',
        file: null,
    });

    const docSubmit = (e) => {
        e.preventDefault();
        docForm.post(route('hr.training.programs.documents.store', program.id), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => docForm.reset(),
        });
    };

    const patchParticipant = (participantId, payload) => {
        router.patch(route('hr.training.programs.participants.update', [program.id, participantId]), payload, {
            preserveScroll: true,
        });
    };

    const deleteParticipant = (participantId) => {
        if (!confirm('Remove this participant from the training?')) {
            return;
        }
        router.delete(route('hr.training.programs.participants.destroy', [program.id, participantId]), {
            preserveScroll: true,
        });
    };

    const deleteDocument = (documentId) => {
        if (!confirm('Delete this document?')) {
            return;
        }
        router.delete(route('hr.training.programs.documents.destroy', [program.id, documentId]), {
            preserveScroll: true,
        });
    };

    const deleteProgram = () => {
        if (!confirm('Archive this training program?')) {
            return;
        }
        router.delete(route('hr.training.programs.destroy', program.id));
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'HR', href: route('hr') },
                { title: 'Training', href: route('hr.training.programs.index') },
                { title: program.title, href: route('hr.training.programs.show', program.id) },
            ]}
        >
            <Head title={program.title} />

            <div className="flex flex-col gap-6 p-4 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href={route('hr.training.programs.index')}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex flex-wrap items-center gap-3">
                                <GraduationCap className="h-8 w-8 text-primary" />
                                <h1 className="text-2xl font-bold tracking-tight">{program.title}</h1>
                                {programStatusBadge(program.status)}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Completion rate: <span className="font-semibold text-foreground">{completionRate}%</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" asChild>
                            <Link href={route('hr.training.programs.edit', program.id)}>Edit</Link>
                        </Button>
                        <Button variant="destructive" onClick={deleteProgram}>
                            Archive
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {Object.entries(participantSummary || {}).map(([k, v]) => (
                        <Card key={k}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-medium capitalize text-muted-foreground">{k}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold tabular-nums">{v}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="participants">Participants</TabsTrigger>
                        <TabsTrigger value="documents">Materials</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-4 space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Details</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-3 text-sm">
                                <div className="grid gap-1 sm:grid-cols-2">
                                    <span className="text-muted-foreground">Provider</span>
                                    <span>{program.provider ?? '—'}</span>
                                </div>
                                <div className="grid gap-1 sm:grid-cols-2">
                                    <span className="text-muted-foreground">Location</span>
                                    <span>{program.location ?? '—'}</span>
                                </div>
                                <div className="grid gap-1 sm:grid-cols-2">
                                    <span className="text-muted-foreground">Dates</span>
                                    <span>
                                        {program.start_date?.slice(0, 10) ?? '—'} → {program.end_date?.slice(0, 10) ?? '—'}
                                    </span>
                                </div>
                                <div className="grid gap-1 sm:grid-cols-2">
                                    <span className="text-muted-foreground">Cost</span>
                                    <span className="font-medium tabular-nums">
                                        {program.cost != null ? formatCurrency(Number(program.cost)) : '—'}
                                    </span>
                                </div>
                                {program.description && (
                                    <div className="border-t pt-3">
                                        <p className="whitespace-pre-wrap text-muted-foreground">{program.description}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="participants" className="mt-4 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Add participant</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={enrollSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                                    <div className="grid flex-1 gap-2">
                                        <Label>Staff member</Label>
                                        <Select
                                            value={enrollForm.data.staff_id ? String(enrollForm.data.staff_id) : ''}
                                            onValueChange={(v) => enrollForm.setData('staff_id', v)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select staff…" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {staffOptions.map((s) => (
                                                    <SelectItem key={s.id} value={String(s.id)}>
                                                        {s.name}
                                                        {s.employee_number ? ` (${s.employee_number})` : ''}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={enrollForm.errors.staff_id} />
                                    </div>
                                    <Button type="submit" disabled={enrollForm.processing || !enrollForm.data.staff_id}>
                                        Enroll
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <div className="overflow-hidden rounded-xl border">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/40">
                                        <th className="px-4 py-3">Staff</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Score</th>
                                        <th className="px-4 py-3">Remarks</th>
                                        <th className="px-4 py-3">Certificate</th>
                                        <th className="w-24 px-4 py-3" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {(program.participants || []).map((p) => (
                                        <ParticipantRow
                                            key={p.id}
                                            programId={program.id}
                                            participant={p}
                                            onPatch={patchParticipant}
                                            onDelete={deleteParticipant}
                                        />
                                    ))}
                                    {(program.participants || []).length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                                                No participants yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </TabsContent>

                    <TabsContent value="documents" className="mt-4 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Upload material</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={docSubmit} className="grid gap-3 sm:grid-cols-2">
                                    <div className="grid gap-2 sm:col-span-2">
                                        <Label>Title (optional)</Label>
                                        <Input
                                            value={docForm.data.title}
                                            onChange={(e) => docForm.setData('title', e.target.value)}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>File</Label>
                                        <Input
                                            type="file"
                                            onChange={(e) => docForm.setData('file', e.target.files?.[0] ?? null)}
                                        />
                                        <InputError message={docForm.errors.file} />
                                    </div>
                                    <div className="flex items-end">
                                        <Button type="submit" disabled={docForm.processing}>
                                            Upload
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        <div className="overflow-hidden rounded-xl border">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/40">
                                        <th className="px-4 py-3">Title</th>
                                        <th className="px-4 py-3">File</th>
                                        <th className="w-24 px-4 py-3" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {(program.documents || []).map((d) => (
                                        <tr key={d.id}>
                                            <td className="px-4 py-3">{d.title}</td>
                                            <td className="px-4 py-3 font-mono text-xs">
                                                <a
                                                    href={`/storage/${d.file_path}`}
                                                    className="text-primary underline"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    Download
                                                </a>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Button type="button" variant="ghost" size="icon" onClick={() => deleteDocument(d.id)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {(program.documents || []).length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-10 text-center text-muted-foreground">
                                                No materials uploaded.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}

function ParticipantRow({ programId, participant: p, onPatch, onDelete }) {
    const [score, setScore] = useState(p.score != null ? String(p.score) : '');
    const [remarks, setRemarks] = useState(p.remarks ?? '');

    const saveFields = () => {
        onPatch(p.id, {
            status: p.status,
            score: score === '' ? null : Number(score),
            remarks: remarks || null,
        });
    };

    return (
        <tr>
            <td className="px-4 py-3">
                <div className="font-medium">{p.staff?.name}</div>
                <div className="text-xs text-muted-foreground">{p.staff?.employee_number ?? ''}</div>
            </td>
            <td className="px-4 py-3">
                <Select
                    value={p.status}
                    onValueChange={(v) => onPatch(p.id, { status: v, score: p.score, remarks: p.remarks })}
                >
                    <SelectTrigger className="h-9 w-[140px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="enrolled">enrolled</SelectItem>
                        <SelectItem value="attended">attended</SelectItem>
                        <SelectItem value="completed">completed</SelectItem>
                        <SelectItem value="absent">absent</SelectItem>
                    </SelectContent>
                </Select>
            </td>
            <td className="px-4 py-3">
                <Input
                    className="h-9 w-24"
                    type="number"
                    step="0.01"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    onBlur={saveFields}
                />
            </td>
            <td className="px-4 py-3 max-w-xs">
                <Textarea
                    className="min-h-[60px] text-xs"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    onBlur={saveFields}
                />
            </td>
            <td className="px-4 py-3">
                <CertificateUpload programId={programId} participant={p} />
            </td>
            <td className="px-4 py-3">
                <Button type="button" variant="ghost" size="icon" onClick={() => onDelete(p.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </td>
        </tr>
    );
}

function CertificateUpload({ programId, participant }) {
    const onFile = (file) => {
        if (!file) {
            return;
        }
        const fd = new FormData();
        fd.append('certificate', file);
        fd.append('status', participant.status);
        if (participant.score != null) {
            fd.append('score', String(participant.score));
        }
        if (participant.remarks) {
            fd.append('remarks', participant.remarks);
        }
        router.patch(route('hr.training.programs.participants.update', [programId, participant.id]), fd, {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    return (
        <div className="flex flex-col gap-1">
            {participant.certificate_path && (
                <a
                    href={`/storage/${participant.certificate_path}`}
                    className="text-xs text-primary underline"
                    target="_blank"
                    rel="noreferrer"
                >
                    View certificate
                </a>
            )}
            <Input type="file" accept=".pdf,image/*" className="h-9 text-xs" onChange={(e) => onFile(e.target.files?.[0])} />
        </div>
    );
}
