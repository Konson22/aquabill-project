import { cn } from '@/lib/utils';

export default function PrintLabelValue({ label, value, className, valueClassName }) {
    return (
        <div className={cn("flex justify-between items-center gap-2", className)}>
            <span className="font-bold uppercase text-slate-500 whitespace-nowrap">{label}:</span>
            <span className={cn("font-mono font-bold text-slate-900 truncate bg-gray-100 px-1 text-right flex-1", valueClassName)}>{value}</span>
        </div>
    );
}
