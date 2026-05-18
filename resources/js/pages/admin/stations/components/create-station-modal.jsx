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
import InputError from '@/components/input-error';
import { useForm } from '@inertiajs/react';
import { Landmark, Loader2 } from 'lucide-react';

export default function CreateStationModal({ isOpen, onClose, zones = [], accountantChoices = [] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        zone_id: '',
        accountant_id: '',
        manager_name: '',
        manager_phone: '',
        coordinate: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.stations.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg animate-in fade-in zoom-in duration-300">
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-black">
                            <Landmark className="h-5 w-5 text-cyan-600" />
                            New collection station
                        </DialogTitle>
                        <DialogDescription>
                            Stations appear when recording bill or service charge payments so you can track where money
                            was collected.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-6">
                        <div className="grid gap-2">
                            <Label htmlFor="station-name">Station name</Label>
                            <Input
                                id="station-name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g. Main office desk"
                                className="rounded-xl"
                                autoComplete="off"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label>Billing zone (optional)</Label>
                            <Select
                                value={data.zone_id === '' || data.zone_id == null ? 'none' : String(data.zone_id)}
                                onValueChange={(v) => setData('zone_id', v === 'none' ? '' : v)}
                            >
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue placeholder="Not linked to a zone" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Not linked to a zone</SelectItem>
                                    {zones.map((z) => (
                                        <SelectItem key={z.id} value={String(z.id)}>
                                            {z.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.zone_id} />
                        </div>

                        <div className="grid gap-2">
                            <Label>Assigned accountant (optional)</Label>
                            <Select
                                value={
                                    data.accountant_id === '' || data.accountant_id == null
                                        ? 'none'
                                        : String(data.accountant_id)
                                }
                                onValueChange={(v) => setData('accountant_id', v === 'none' ? '' : v)}
                            >
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue placeholder="No user assigned" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No user assigned</SelectItem>
                                    {accountantChoices.map((u) => (
                                        <SelectItem key={u.id} value={String(u.id)}>
                                            <span className="font-medium">{u.name}</span>
                                            {u.email ? (
                                                <span className="block text-xs font-normal text-muted-foreground">
                                                    {u.email}
                                                </span>
                                            ) : null}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.accountant_id} />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="manager-name">Manager name (optional)</Label>
                                <Input
                                    id="manager-name"
                                    value={data.manager_name}
                                    onChange={(e) => setData('manager_name', e.target.value)}
                                    placeholder="On-site contact"
                                    className="rounded-xl"
                                />
                                <InputError message={errors.manager_name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="manager-phone">Manager phone (optional)</Label>
                                <Input
                                    id="manager-phone"
                                    value={data.manager_phone}
                                    onChange={(e) => setData('manager_phone', e.target.value)}
                                    placeholder="09…"
                                    className="rounded-xl"
                                />
                                <InputError message={errors.manager_phone} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="coordinate">Location note (optional)</Label>
                            <Input
                                id="coordinate"
                                value={data.coordinate}
                                onChange={(e) => setData('coordinate', e.target.value)}
                                placeholder="e.g. lat,lng or building reference"
                                className="rounded-xl"
                            />
                            <InputError message={errors.coordinate} />
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="ghost" onClick={onClose} className="font-bold">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-cyan-600 font-bold shadow-lg shadow-cyan-200/50 hover:bg-cyan-700"
                        >
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create station
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
