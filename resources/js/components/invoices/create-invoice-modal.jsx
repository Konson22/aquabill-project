import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { Check, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function CreateInvoiceModal({ trigger, initialHome = null }) {
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        home_id: initialHome ? initialHome.id : '',
        amount: '',
        due_date: new Date().toISOString().split('T')[0],
        type: 'standard',
        description: '',
    });

    // Search functionality state
    const [query, setQuery] = useState(initialHome ? initialHome.address : '');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [selectedHome, setSelectedHome] = useState(initialHome);
    const searchRef = useRef(null);

    useEffect(() => {
        if (open && initialHome) {
            setSelectedHome(initialHome);
            setData('home_id', initialHome.id);
            setQuery(initialHome.address);
        }
    }, [open, initialHome]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                searchRef.current &&
                !searchRef.current.contains(event.target)
            ) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (query.length >= 2) {
                setLoading(true);
                fetch(route('homes.search', { query }))
                    .then((res) => res.json())
                    .then((data) => {
                        setResults(data);
                        setShowResults(true);
                        setLoading(false);
                    })
                    .catch((err) => {
                        console.error(err);
                        setLoading(false);
                    });
            } else {
                setResults([]);
                setShowResults(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query]);

    const handleSelectHome = (home) => {
        setSelectedHome(home);
        setData('home_id', home.id);
        setQuery(home.label);
        setShowResults(false);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('invoices.store'), {
            onSuccess: () => {
                setOpen(false);
                reset();
                setQuery('');
                setSelectedHome(null);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New Invoice</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="grid gap-4 py-4">
                    <div className="grid gap-2" ref={searchRef}>
                        {!initialHome && (
                            <>
                                <Label htmlFor="home_search">Find Home</Label>
                                <div className="relative">
                                    <Input
                                        id="home_search"
                                        type="text"
                                        value={query}
                                        onChange={(e) => {
                                            setQuery(e.target.value);
                                            if (!e.target.value) {
                                                setSelectedHome(null);
                                                setData('home_id', '');
                                            }
                                        }}
                                        placeholder="Search by address, customer, phone..."
                                        className="pr-10"
                                        autoComplete="off"
                                    />
                                    {loading && (
                                        <div className="absolute top-2.5 right-3">
                                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        </div>
                                    )}
                                    {showResults && results.length > 0 && (
                                        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
                                            {results.map((home) => (
                                                <div
                                                    key={home.id}
                                                    onClick={() =>
                                                        handleSelectHome(home)
                                                    }
                                                    className="relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">
                                                            {home.address}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {home.customer_name ||
                                                                'No Customer'}
                                                        </span>
                                                    </div>
                                                    {selectedHome?.id ===
                                                        home.id && (
                                                        <Check className="ml-auto h-4 w-4" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {showResults &&
                                        results.length === 0 &&
                                        query.length >= 2 &&
                                        !loading && (
                                            <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-4 text-center text-sm text-popover-foreground shadow-md">
                                                No homes found.
                                            </div>
                                        )}
                                </div>
                            </>
                        )}
                        {selectedHome && (
                            <div className="rounded-md border bg-muted/50 p-2 text-xs text-muted-foreground">
                                <p>
                                    Selected: Only Invoice for{' '}
                                    <span className="font-medium text-foreground">
                                        {selectedHome.address}
                                    </span>
                                </p>
                                {selectedHome.meter && (
                                    <p className="mt-1">
                                        Meter Number:{' '}
                                        <span className="font-medium text-foreground">
                                            {selectedHome.meter.meter_number}
                                        </span>
                                    </p>
                                )}
                            </div>
                        )}
                        {errors.home_id && (
                            <span className="text-xs text-red-500">
                                {errors.home_id}
                            </span>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="type">Invoice Type</Label>
                        <Select
                            value={data.type}
                            onValueChange={(val) => setData('type', val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="standard">
                                    Standard
                                </SelectItem>
                                <SelectItem value="fine">Fine</SelectItem>
                                <SelectItem value="connection_fee">
                                    Connection Fee
                                </SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.type && (
                            <span className="text-xs text-red-500">
                                {errors.type}
                            </span>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                            placeholder="0.00"
                        />
                        {errors.amount && (
                            <span className="text-xs text-red-500">
                                {errors.amount}
                            </span>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="due_date">Due Date</Label>
                        <Input
                            id="due_date"
                            type="date"
                            value={data.due_date}
                            onChange={(e) =>
                                setData('due_date', e.target.value)
                            }
                        />
                        {errors.due_date && (
                            <span className="text-xs text-red-500">
                                {errors.due_date}
                            </span>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">
                            Description (Optional)
                        </Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                            placeholder="Enter details..."
                            className="resize-none"
                        />
                        {errors.description && (
                            <span className="text-xs text-red-500">
                                {errors.description}
                            </span>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={processing}>
                            Create Invoice
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
