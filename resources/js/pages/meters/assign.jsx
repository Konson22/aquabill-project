import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import { ArrowLeft, Search, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AssignMeter({ home }) {
    const [activeTab, setActiveTab] = useState('existing');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedMeter, setSelectedMeter] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const fetchMeters = async () => {
            if (
                searchTerm.length < 2 ||
                (selectedMeter && searchTerm === selectedMeter.meter_number)
            ) {
                setSearchResults([]);
                return;
            }
            setIsSearching(true);
            try {
                const url = route('meters.search', { q: searchTerm });
                const response = await fetch(url, {
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });

                if (!response.ok) throw new Error('Search failed');

                const data = await response.json();
                setSearchResults(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Search error:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        const timeoutId = setTimeout(fetchMeters, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, selectedMeter]);

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
        home_id: home.id,
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
        home_id: home.id,
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

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Homes', href: route('homes.index') },
                { title: home.address, href: route('customers.home', home.id) },
                { title: 'Assign Meter', href: '#' },
            ]}
        >
            <Head title={`Assign Meter - ${home.address}`} />

            <div className="mx-auto max-w-2xl">
                <div className="mb-6">
                    <Button variant="ghost" size="sm" asChild className="mb-2">
                        <Link href={route('customers.home', home.id)}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Property
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Assign Meter
                    </h1>
                    <p className="text-muted-foreground">
                        Property:{' '}
                        <span className="font-medium text-foreground">
                            {home.address}
                        </span>
                        {home.customer && (
                            <span>
                                {' '}
                                • Customer:{' '}
                                <span className="font-medium text-foreground">
                                    {home.customer.name}
                                </span>
                            </span>
                        )}
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
                                    <div className="relative space-y-2">
                                        <Label htmlFor="meter_search">
                                            Search Meter Number
                                        </Label>
                                        <div className="relative">
                                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="meter_search"
                                                className="pl-9"
                                                placeholder="Type serial number (e.g. SSUWC...)"
                                                value={searchTerm}
                                                onChange={(e) =>
                                                    setSearchTerm(
                                                        e.target.value,
                                                    )
                                                }
                                                autoComplete="off"
                                            />
                                            {isSearching && (
                                                <div className="absolute top-1/2 right-3 -translate-y-1/2">
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                                                </div>
                                            )}
                                        </div>

                                        {searchResults.length > 0 && (
                                            <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover py-1 shadow-lg">
                                                {searchResults.map((meter) => (
                                                    <div
                                                        key={meter.id}
                                                        className="cursor-pointer px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                                        onClick={() => {
                                                            setExistingData(
                                                                'meter_id',
                                                                meter.id,
                                                            );
                                                            setSelectedMeter(
                                                                meter,
                                                            );
                                                            setSearchTerm(
                                                                meter.meter_number,
                                                            );
                                                            setSearchResults(
                                                                [],
                                                            );
                                                        }}
                                                    >
                                                        <div className="font-medium">
                                                            {meter.meter_number}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Type:{' '}
                                                            {meter.meter_type}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {searchTerm.length >= 2 &&
                                            !isSearching &&
                                            searchResults.length === 0 && (
                                                <div className="mt-1 text-sm text-yellow-600">
                                                    No available (unassigned)
                                                    meters found matching "
                                                    {searchTerm}"
                                                </div>
                                            )}

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
