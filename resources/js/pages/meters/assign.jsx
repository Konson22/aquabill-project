import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ChevronDown, Search, Zap } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

export default function AssignMeter({ customer }) {
    const [activeTab, setActiveTab] = useState('existing');
    const [meterDropdownOpen, setMeterDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [initialMeterList, setInitialMeterList] = useState([]);
    const [selectedMeter, setSelectedMeter] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    const fetchMeters = useCallback(async (q) => {
        setIsSearching(true);
        try {
            const url = route('meters.search', { q: q ?? '' });
            const response = await fetch(url, {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });
            if (!response.ok) throw new Error('Search failed');
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Search error:', error);
            return [];
        } finally {
            setIsSearching(false);
        }
    }, []);

    // When dropdown opens, load initial list for scrolling
    useEffect(() => {
        if (!meterDropdownOpen) return;
        setSearchTerm('');
        setSearchResults([]);
        fetchMeters('').then(setInitialMeterList);
    }, [meterDropdownOpen, fetchMeters]);

    // When user types, search (debounced)
    useEffect(() => {
        if (!meterDropdownOpen) return;
        const timeoutId = setTimeout(() => {
            if (searchTerm.trim() === '') {
                setSearchResults([]);
                return;
            }
            fetchMeters(searchTerm.trim()).then(setSearchResults);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, meterDropdownOpen, fetchMeters]);

    const meterList =
        searchTerm.trim() !== '' ? searchResults : initialMeterList;

    // Form for creating new meter
    const {
        data: newData,
        setData: setNewData,
        post: postNew,
        processing: newProcessing,
        errors: newErrors,
    } = useForm({
        meter_number: '',
        meter_type: 'Analog',
        initial_reading: '',
        customer_id: customer.id,
        status: 'active',
    });

    // Form for assigning existing meter
    const {
        data: existingData,
        setData: setExistingData,
        put: putExisting,
        processing: existingProcessing,
        errors: existingErrors,
    } = useForm({
        meter_id: '',
        customer_id: customer.id,
        initial_reading: '',
    });

    const submitNew = (e) => {
        e.preventDefault();
        postNew(route('meters.store'), {
            onSuccess: () => {
                // Success redirection usually happens from controller
            },
        });
    };

    const submitExisting = (e) => {
        e.preventDefault();
        if (!existingData.meter_id) return;

        putExisting(route('meters.update', existingData.meter_id), {
            onSuccess: () => {
                // Redirected back by controller
            },
        });
    };

    const selectMeter = (meter) => {
        setExistingData('meter_id', meter.id);
        setSelectedMeter(meter);
        setSearchTerm('');
        setSearchResults([]);
        setMeterDropdownOpen(false);
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Customers', href: route('customers.index') },
                {
                    title: customer.address || customer.name,
                    href: route('customers.show', customer.id),
                },
                { title: 'Assign Meter', href: '#' },
            ]}
        >
            <Head
                title={`Assign Meter - ${customer.address || customer.name}`}
            />

            <div className="mx-auto max-w-2xl">
                <div className="mb-6">
                    <Button variant="ghost" size="sm" asChild className="mb-2">
                        <Link href={route('customers.show', customer.id)}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Customer
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Assign Meter
                    </h1>
                    <p className="text-muted-foreground">
                        Address:{' '}
                        <span className="font-medium text-foreground">
                            {customer.address || '—'}
                        </span>
                        <span>
                            {' '}
                            • Customer:{' '}
                            <span className="font-medium text-foreground">
                                {customer.name}
                            </span>
                        </span>
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Meter Assignment</CardTitle>
                        <CardDescription>
                            Configure a meter for this property. If a meter is
                            already assigned, it will be replaced.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs
                            value={activeTab}
                            onValueChange={setActiveTab}
                            className="w-full"
                        >
                            <TabsList className="mb-6 grid w-full grid-cols-2">
                                <TabsTrigger value="existing">
                                    Assign Existing Meter
                                </TabsTrigger>
                                <TabsTrigger value="new">
                                    Create New Meter
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="existing">
                                <form
                                    onSubmit={submitExisting}
                                    className="space-y-6"
                                >
                                    <div className="space-y-2">
                                        <Label>Select Meter</Label>
                                        <DropdownMenu
                                            open={meterDropdownOpen}
                                            onOpenChange={setMeterDropdownOpen}
                                        >
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="w-full justify-between font-normal"
                                                >
                                                    <span className="truncate">
                                                        {selectedMeter
                                                            ? `${selectedMeter.meter_number}${selectedMeter.meter_type ? ` (${selectedMeter.meter_type})` : ''}`
                                                            : 'Select meter or search by number...'}
                                                    </span>
                                                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                className="min-w-[var(--radix-dropdown-menu-trigger-width)] p-0"
                                                align="start"
                                                onCloseAutoFocus={(e) =>
                                                    e.preventDefault()
                                                }
                                            >
                                                <div
                                                    className="border-b p-2"
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    <div className="relative">
                                                        <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                        <Input
                                                            placeholder="Search by meter number..."
                                                            value={searchTerm}
                                                            onChange={(e) =>
                                                                setSearchTerm(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="h-9 pl-8"
                                                            autoComplete="off"
                                                        />
                                                        {isSearching && (
                                                            <div className="absolute top-1/2 right-2.5 -translate-y-1/2">
                                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="max-h-60 overflow-auto p-1">
                                                    {meterList.length === 0 &&
                                                    !isSearching ? (
                                                        <p className="py-4 text-center text-sm text-muted-foreground">
                                                            {searchTerm.trim()
                                                                ? `No unassigned meters matching "${searchTerm}"`
                                                                : 'No unassigned meters available'}
                                                        </p>
                                                    ) : (
                                                        meterList.map(
                                                            (meter) => (
                                                                <button
                                                                    key={
                                                                        meter.id
                                                                    }
                                                                    type="button"
                                                                    className="flex w-full cursor-pointer flex-col items-start rounded-sm px-2 py-2 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                                                    onClick={() =>
                                                                        selectMeter(
                                                                            meter,
                                                                        )
                                                                    }
                                                                >
                                                                    <span className="font-medium">
                                                                        {
                                                                            meter.meter_number
                                                                        }
                                                                    </span>
                                                                    {meter.meter_type && (
                                                                        <span className="text-xs text-muted-foreground">
                                                                            Type:{' '}
                                                                            {
                                                                                meter.meter_type
                                                                            }
                                                                        </span>
                                                                    )}
                                                                </button>
                                                            ),
                                                        )
                                                    )}
                                                </div>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        {existingErrors.meter_id && (
                                            <p className="text-sm font-medium text-destructive">
                                                {existingErrors.meter_id}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="existing_initial_reading">
                                            Initial Reading
                                        </Label>
                                        <Input
                                            id="existing_initial_reading"
                                            type="number"
                                            step="0.01"
                                            value={existingData.initial_reading}
                                            onChange={(e) =>
                                                setExistingData(
                                                    'initial_reading',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="0.00"
                                        />
                                        {existingErrors.initial_reading && (
                                            <p className="text-sm font-medium text-destructive">
                                                {existingErrors.initial_reading}
                                            </p>
                                        )}
                                    </div>

                                    <div className="pt-4">
                                        <Button
                                            type="submit"
                                            className="w-full"
                                            disabled={
                                                existingProcessing ||
                                                !existingData.meter_id
                                            }
                                        >
                                            <Zap className="mr-2 h-4 w-4" />
                                            Assign Selected Meter
                                        </Button>
                                    </div>
                                </form>
                            </TabsContent>

                            <TabsContent value="new">
                                <form
                                    onSubmit={submitNew}
                                    className="space-y-6"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="meter_number">
                                            Meter Serial Number
                                        </Label>
                                        <Input
                                            id="meter_number"
                                            value={newData.meter_number}
                                            onChange={(e) =>
                                                setNewData(
                                                    'meter_number',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g. SN-123456"
                                        />
                                        {newErrors.meter_number && (
                                            <p className="text-sm font-medium text-destructive">
                                                {newErrors.meter_number}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="meter_type">
                                            Meter Type
                                        </Label>
                                        <Select
                                            value={newData.meter_type}
                                            onValueChange={(val) =>
                                                setNewData('meter_type', val)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Analog">
                                                    Analog
                                                </SelectItem>
                                                <SelectItem value="Digital">
                                                    Digital
                                                </SelectItem>
                                                <SelectItem value="Smart">
                                                    Smart
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {newErrors.meter_type && (
                                            <p className="text-sm font-medium text-destructive">
                                                {newErrors.meter_type}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="new_initial_reading">
                                            Initial Reading
                                        </Label>
                                        <Input
                                            id="new_initial_reading"
                                            type="number"
                                            step="0.01"
                                            value={newData.initial_reading}
                                            onChange={(e) =>
                                                setNewData(
                                                    'initial_reading',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="0.00"
                                        />
                                        {newErrors.initial_reading && (
                                            <p className="text-sm font-medium text-destructive">
                                                {newErrors.initial_reading}
                                            </p>
                                        )}
                                    </div>

                                    <div className="pt-4">
                                        <Button
                                            type="submit"
                                            className="w-full"
                                            disabled={newProcessing}
                                        >
                                            <Zap className="mr-2 h-4 w-4" />
                                            Create & Assign New Meter
                                        </Button>
                                    </div>
                                </form>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
