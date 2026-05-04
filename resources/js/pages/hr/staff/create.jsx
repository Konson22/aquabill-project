import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Loader2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/input-error';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HRStaffCreate({ hrDepartments = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        hr_department_id: '',
        employee_number: '',
        name: '',
        phone: '',
        email: '',
        job_title: '',
        status: 'active',
        hired_on: '',
        bank_name: '',
        bank_account_name: '',
        bank_account_number: '',
        notes: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('hr.staff.store'));
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'HR', href: route('hr') },
                { title: 'Staff', href: route('hr.staff.index') },
                { title: 'Create', href: route('hr.staff.create') },
            ]}
        >
            <Head title="New staff member" />

            <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                        <Button variant="outline" size="icon" asChild className="shrink-0">
                            <Link href={route('hr.staff.index')}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div className="flex items-center gap-2">
                            <UserPlus className="h-8 w-8 text-primary" />
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">New staff member</h1>
                                <p className="text-sm text-muted-foreground">Creates a non-login employee record for HR.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Assignment</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="hr_department_id">HR department</Label>
                                <Select
                                    value={data.hr_department_id === '' ? 'none' : String(data.hr_department_id)}
                                    onValueChange={(v) => setData('hr_department_id', v === 'none' ? '' : v)}
                                >
                                    <SelectTrigger id="hr_department_id">
                                        <SelectValue placeholder="Unassigned" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Unassigned</SelectItem>
                                        {hrDepartments.map((d) => (
                                            <SelectItem key={d.id} value={String(d.id)}>
                                                {d.name} ({d.code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.hr_department_id} />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="employee_number">Employee number</Label>
                                    <Input
                                        id="employee_number"
                                        value={data.employee_number}
                                        onChange={(e) => setData('employee_number', e.target.value)}
                                        autoComplete="off"
                                    />
                                    <InputError message={errors.employee_number} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                                        <SelectTrigger id="status">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                            <SelectItem value="on_leave">On leave</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.status} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Profile</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                    <InputError message={errors.email} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                    />
                                    <InputError message={errors.phone} />
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="job_title">Job title</Label>
                                    <Input
                                        id="job_title"
                                        value={data.job_title}
                                        onChange={(e) => setData('job_title', e.target.value)}
                                    />
                                    <InputError message={errors.job_title} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="hired_on">Hired on</Label>
                                    <Input
                                        id="hired_on"
                                        type="date"
                                        value={data.hired_on}
                                        onChange={(e) => setData('hired_on', e.target.value)}
                                    />
                                    <InputError message={errors.hired_on} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Bank details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="bank_name">Bank name</Label>
                                <Input
                                    id="bank_name"
                                    value={data.bank_name}
                                    onChange={(e) => setData('bank_name', e.target.value)}
                                />
                                <InputError message={errors.bank_name} />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="bank_account_name">Account name</Label>
                                    <Input
                                        id="bank_account_name"
                                        value={data.bank_account_name}
                                        onChange={(e) => setData('bank_account_name', e.target.value)}
                                    />
                                    <InputError message={errors.bank_account_name} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="bank_account_number">Account number</Label>
                                    <Input
                                        id="bank_account_number"
                                        value={data.bank_account_number}
                                        onChange={(e) => setData('bank_account_number', e.target.value)}
                                    />
                                    <InputError message={errors.bank_account_number} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-2">
                                <Label htmlFor="notes">Internal notes</Label>
                                <Textarea
                                    id="notes"
                                    rows={4}
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                />
                                <InputError message={errors.notes} />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
                        <Button variant="outline" type="button" asChild>
                            <Link href={route('hr.staff.index')}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save staff member
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
