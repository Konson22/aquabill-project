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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { DepartmentSelect } from './department-select';

export function EditUserDialog({ open, onOpenChange, user, onSuccess, zones = [] }) {
    const {
        data,
        setData,
        put,
        processing,
        errors,
        reset,
    } = useForm({
        name: '',
        department: 'admin',
        zone_id: '__all__',
    });

    const ZONE_ALL = '__all__';

    useEffect(() => {
        if (open && user) {
            setData({
                name: user.name ?? '',
                department: user.department ?? 'admin',
                zone_id: user.zone_id != null ? String(user.zone_id) : ZONE_ALL,
            });
        }
    }, [open, user?.id]);

    const handleOpenChange = (isOpen) => {
        if (!isOpen) {
            reset();
        }
        onOpenChange?.(isOpen);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!user?.id) return;
        put(route('users.update', user.id), {
            preserveScroll: true,
            onSuccess: () => {
                handleOpenChange(false);
                onSuccess?.();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>
                        Update name, department, and zone for this user.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-user-name">Full Name</Label>
                        <Input
                            id="edit-user-name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. John Doe"
                        />
                        <InputError message={errors.name} />
                    </div>
                    <DepartmentSelect
                        id="edit-user-department"
                        value={data.department}
                        onValueChange={(value) => setData('department', value)}
                        error={errors.department}
                    />
                    <div className="space-y-2">
                        <Label htmlFor="edit-user-zone">Zone</Label>
                        <Select
                            value={data.zone_id || '__all__'}
                            onValueChange={(value) => setData('zone_id', value)}
                        >
                            <SelectTrigger id="edit-user-zone">
                                <SelectValue placeholder="All zones" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__all__">
                                    All zones
                                </SelectItem>
                                {zones.map((zone) => (
                                    <SelectItem key={zone.id} value={String(zone.id)}>
                                        {zone.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.zone_id} />
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Save changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
