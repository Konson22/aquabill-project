import { cn } from '@/lib/utils';

/**
 * Reusable label-value row for print layouts (e.g. bill cards).
 * Value has gray background by default.
 * @param {string} label - Left-side label
 * @param {React.ReactNode} [value] - Right-side value (or use children)
 * @param {React.ReactNode} [children] - Alternative to value
 * @param {string} [className] - Extra classes for the root div
 * @param {string} [valueClassName] - Extra classes for the value span (e.g. normal-case text-slate-900)
 */
export default function PrintLabelValue({
    label,
    value,
    children,
    className,
    valueClassName,
}) {
    const displayValue = children ?? value ?? '—';

    return (
        <div
            className={cn('flex items-center justify-between gap-2', className)}
        >
            <span className="font-medium">{label}</span>
            <span
                className={cn(
                    'flex-1 bg-white px-2 py-[2px] text-right font-semibold text-slate-800 uppercase',
                    valueClassName,
                )}
            >
                {displayValue}
            </span>
        </div>
    );
}
