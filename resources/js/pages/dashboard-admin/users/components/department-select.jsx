import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

export const DEPARTMENT_OPTIONS = [
    { value: 'admin', label: 'Admin', icon: ShieldAlert, iconClassName: 'text-destructive' },
    { value: 'finance', label: 'Finance', icon: ShieldCheck, iconClassName: 'text-emerald-500' },
    { value: 'meters', label: 'Meters', icon: Shield, iconClassName: 'text-blue-500' },
];

export function DepartmentSelect({ id, value, onValueChange, placeholder = 'Select Department', error, label = 'Department', disabled }) {
    return (
        <div className="space-y-2">
            {label && (
                <Label htmlFor={id}>{label}</Label>
            )}
            <Select
                value={value}
                onValueChange={onValueChange}
                disabled={disabled}
            >
                <SelectTrigger id={id}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {DEPARTMENT_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        return (
                            <SelectItem key={opt.value} value={opt.value}>
                                <div className="flex items-center">
                                    <Icon className={`mr-2 h-4 w-4 ${opt.iconClassName}`} />
                                    {opt.label}
                                </div>
                            </SelectItem>
                        );
                    })}
                </SelectContent>
            </Select>
            <InputError message={error} />
        </div>
    );
}
