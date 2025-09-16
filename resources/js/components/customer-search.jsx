import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, User, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function CustomerSearch({
    customers = [],
    selectedCustomer,
    onCustomerSelect,
    onClear,
    placeholder = 'Search customers...',
    label = 'Customer *',
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [filteredCustomers, setFilteredCustomers] = useState(customers);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    // Filter customers based on search term
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredCustomers(customers);
        } else {
            const filtered = customers.filter(
                (customer) =>
                    `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    customer.account_number?.toLowerCase().includes(searchTerm.toLowerCase()),
            );
            setFilteredCustomers(filtered);
        }
    }, [searchTerm, customers]);

    // Handle customer selection
    const handleCustomerSelect = (customer) => {
        onCustomerSelect(customer);
        setSearchTerm(`${customer.first_name} ${customer.last_name}`);
        setIsOpen(false);
    };

    // Handle clear selection
    const handleClear = () => {
        setSearchTerm('');
        setSelectedCustomer(null);
        onClear?.();
    };

    // Handle input focus
    const handleInputFocus = () => {
        setIsOpen(true);
    };

    // Handle input change
    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
        setIsOpen(true);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) && inputRef.current && !inputRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Set initial search term if customer is pre-selected
    useEffect(() => {
        if (selectedCustomer && !searchTerm) {
            setSearchTerm(`${selectedCustomer.first_name} ${selectedCustomer.last_name}`);
        }
    }, [selectedCustomer]);

    return (
        <div className="relative">
            <Label htmlFor="customer_search">{label}</Label>
            <div className="relative">
                <div className="relative">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                        ref={inputRef}
                        id="customer_search"
                        type="text"
                        placeholder={placeholder}
                        value={searchTerm}
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                        className="pr-10 pl-10"
                        autoComplete="off"
                    />
                    {selectedCustomer && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleClear}
                            className="hover:bg-muted absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 p-0"
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    )}
                </div>

                {/* Dropdown */}
                {isOpen && (
                    <div ref={dropdownRef} className="bg-popover text-popover-foreground absolute z-50 mt-1 w-full rounded-md border p-1 shadow-md">
                        {filteredCustomers.length > 0 ? (
                            <div className="max-h-60 overflow-auto">
                                {filteredCustomers.map((customer) => (
                                    <div
                                        key={customer.id}
                                        onClick={() => handleCustomerSelect(customer)}
                                        className="hover:bg-accent hover:text-accent-foreground flex cursor-pointer items-center gap-3 rounded-sm px-3 py-2 text-sm"
                                    >
                                        <User className="text-muted-foreground h-4 w-4" />
                                        <div className="flex-1">
                                            <div className="font-medium">
                                                {customer.first_name} {customer.last_name}
                                            </div>
                                            <div className="text-muted-foreground text-xs">
                                                {customer.email} • {customer.account_number}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-muted-foreground px-3 py-2 text-sm">No customers found</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
