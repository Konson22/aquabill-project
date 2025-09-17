import { Button } from '@/components/ui/button';
import { Calendar, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const DATE_RANGES = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'quarter', label: 'This Quarter' },
    { key: 'year', label: 'This Year' },
    { key: 'custom', label: 'Custom Range' },
];

export default function DateRangeFilter({ value, onChange, className = '' }) {
    const [isOpen, setIsOpen] = useState(false);

    const handleRangeSelect = (rangeKey) => {
        onChange(rangeKey);
        setIsOpen(false);
    };

    const getCurrentLabel = () => {
        const range = DATE_RANGES.find((r) => r.key === value);
        return range ? range.label : 'Select Period';
    };

    return (
        <div className={`relative ${className}`}>
            <Button variant="outline" onClick={() => setIsOpen(!isOpen)} className="flex min-w-[160px] items-center justify-between gap-2">
                <Calendar className="h-4 w-4" />
                <span>{getCurrentLabel()}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </Button>

            {isOpen && (
                <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <div className="py-1">
                        {DATE_RANGES.map((range) => (
                            <button
                                key={range.key}
                                onClick={() => handleRangeSelect(range.key)}
                                className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                    value === range.key
                                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                        : 'text-gray-700 dark:text-gray-300'
                                }`}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Overlay to close dropdown when clicking outside */}
            {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
        </div>
    );
}
