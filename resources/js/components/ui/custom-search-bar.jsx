import { Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function CustomSearchBar({ 
    value, 
    onChange, 
    placeholder = "Search...", 
    className = "",
    onClear,
    debounceMs = 300 
}) {
    const [localValue, setLocalValue] = useState(value || '');

    useEffect(() => {
        setLocalValue(value || '');
    }, [value]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (onChange) {
                onChange(localValue);
            }
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [localValue, onChange, debounceMs]);

    const handleClear = () => {
        setLocalValue('');
        if (onClear) {
            onClear();
        }
    };

    return (
        <div className={`relative ${className}`}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    value={localValue}
                    onChange={(e) => setLocalValue(e.target.value)}
                    placeholder={placeholder}
                    className="w-full rounded-lg border border-slate-300 bg-white px-10 py-2 text-sm placeholder-slate-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-green-400 dark:focus:ring-green-400"
                />
                {localValue && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                    >
                        <X className="h-3 w-3" />
                    </button>
                )}
            </div>
            
            {/* Search suggestions dropdown (optional - can be expanded later) */}
            {localValue && (
                <div className="absolute top-full z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
                    <div className="p-2 text-xs text-slate-500 dark:text-slate-400">
                        Search by customer name, account number, or meter serial
                    </div>
                </div>
            )}
        </div>
    );
}
