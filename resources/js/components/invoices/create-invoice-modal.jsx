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
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { Check, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// Supports initialCustomer (id, address, name, meter) or legacy initialHome
// When open + onOpenChange are passed, the modal is controlled (no trigger needed).
export default function CreateInvoiceModal({
    trigger,
    initialHome = null,
    initialCustomer = null,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
}) {
    const initial = initialCustomer ?? initialHome;
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled =
        controlledOpen !== undefined && controlledOnOpenChange != null;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? controlledOnOpenChange : setInternalOpen;
    const { data, setData, post, processing, errors, reset } = useForm({
        customer_id: initial ? initial.id : '',
        amount: '',
        due_date: new Date().toISOString().split('T')[0],
        description: '',
    });

    const [query, setQuery] = useState(
        initial ? initial.address || initial.label || '' : '',
    );
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(initial);
    const searchRef = useRef(null);

    useEffect(() => {
        if (open && initial) {
            setSelectedCustomer(initial);
            setData('customer_id', initial.id);
            setQuery(initial.address || initial.label || '');
        }
    }, [open, initial]);

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
                fetch(route('customers.search', { query }))
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

    const handleSelectCustomer = (customer) => {
        setSelectedCustomer(customer);
        setData('customer_id', customer.id);
        setQuery(customer.label || customer.address);
        setShowResults(false);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('invoices.store'), {
            onSuccess: () => {
                setOpen(false);
                reset();
                setQuery('');
                setSelectedCustomer(null);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!isControlled && trigger != null && (
                <DialogTrigger asChild>{trigger}</DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New Invoice</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="grid gap-4 py-4">
                    <div className="grid gap-2" ref={searchRef}>
                        {!initial && (
                            <>
                                <Label htmlFor="customer_search">
                                    Find Customer
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="customer_search"
                                        type="text"
                                        value={query}
                                        onChange={(e) => {
                                            setQuery(e.target.value);
                                            if (!e.target.value) {
                                                setSelectedCustomer(null);
                                                setData('customer_id', '');
                                            }
                                        }}
                                        placeholder="Search by address, name, meter..."
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
                                            {results.map((cust) => (
                                                <div
                                                    key={cust.id}
                                                    onClick={() =>
                                                        handleSelectCustomer(
                                                            cust,
                                                        )
                                                    }
                                                    className="relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">
                                                            {cust.address ||
                                                                cust.label}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {cust.customer_name ||
                                                                cust.name ||
                                                                '—'}
                                                        </span>
                                                    </div>
                                                    {selectedCustomer?.id ===
                                                        cust.id && (
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
                                                No customers found.
                                            </div>
                                        )}
                                </div>
                            </>
                        )}
                        {selectedCustomer && (
                            <div className="rounded-md border bg-muted/50 p-2 text-xs text-muted-foreground">
                                <p>
                                    Selected: Invoice for{' '}
                                    <span className="font-medium text-foreground">
                                        {selectedCustomer.address ||
                                            selectedCustomer.label}
                                    </span>
                                    {selectedCustomer.name && (
                                        <span> ({selectedCustomer.name})</span>
                                    )}
                                </p>
                                {(selectedCustomer.meter?.meter_number ||
                                    selectedCustomer.meter_number) && (
                                    <p className="mt-1">
                                        Meter:{' '}
                                        <span className="font-medium text-foreground">
                                            {selectedCustomer.meter
                                                ?.meter_number ??
                                                selectedCustomer.meter_number}
                                        </span>
                                    </p>
                                )}
                            </div>
                        )}
                        {errors.customer_id && (
                            <span className="text-xs text-red-500">
                                {errors.customer_id}
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
