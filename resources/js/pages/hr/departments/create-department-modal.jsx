import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { Building2, Loader2 } from 'lucide-react';
import { useEffect } from 'react';

export default function CreateDepartmentModal({ open, onOpenChange }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        code: '',
        description: '',
        is_active: true,
    });

    useEffect(() => {
        if (!open) {
            reset();
        }
    }, [open, reset]);

    const submit = (e) => {
        e.preventDefault();
        post(route('hr.departments.store'), {
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
                            <Building2 className="h-5 w-5 text-primary" />
                            New HR department
                        </DialogTitle>
                        <DialogDescription>
                            Add an organizational unit for non-login staff. Code must be unique (e.g. REC, LEG).
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="hr-dept-name">Name</Label>
                            <Input
                                id="hr-dept-name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g. Legal & compliance"
                                autoComplete="off"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="hr-dept-code">Code</Label>
                            <Input
                                id="hr-dept-code"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                placeholder="e.g. LEG"
                                maxLength={50}
                                className="font-mono uppercase"
                                autoComplete="off"
                            />
                            <InputError message={errors.code} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="hr-dept-description">Description</Label>
                            <Textarea
                                id="hr-dept-description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Optional details for reports and filters"
                                rows={3}
                                className="resize-none"
                            />
                            <InputError message={errors.description} />
                        </div>

                        <div className="grid gap-2">
                            <Label>Status</Label>
                            <Select
                                value={data.is_active ? 'active' : 'inactive'}
                                onValueChange={(v) => setData('is_active', v === 'active')}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.is_active} />
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving…
                                </>
                            ) : (
                                'Create department'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
