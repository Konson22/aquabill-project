import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
    Plus, 
    Pencil, 
    Trash2, 
    CreditCard, 
    Search,
    Info,
    AlertCircle,
    ChevronLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from '@inertiajs/react';

export default function ServiceCharges({ types }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingType, setEditingType] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        code: '',
        amount: '',
        description: '',
    });

    const filteredTypes = types.filter(type => 
        type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Settings', href: '/admin/settings' },
        { title: 'Service Charges', href: '/admin/settings/service-charges' },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingType) {
            put(route('admin.service-charges.update', editingType.id), {
                onSuccess: () => {
                    setIsCreateOpen(false);
                    setEditingType(null);
                    reset();
                    toast.success('Service charge updated successfully');
                },
            });
        } else {
            post(route('admin.service-charges.store'), {
                onSuccess: () => {
                    setIsCreateOpen(false);
                    reset();
                    toast.success('Service charge created successfully');
                },
            });
        }
    };

    const handleEdit = (type) => {
        setEditingType(type);
        setData({
            name: type.name,
            code: type.code,
            amount: type.amount,
            description: type.description || '',
        });
        setIsCreateOpen(true);
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this service charge type?')) {
            destroy(route('admin.service-charges.destroy', id), {
                onSuccess: () => toast.success('Service charge deleted successfully'),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Service Charge Types" />

            <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
                
                {/* Back Link */}
                <Link href="/admin/settings" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors w-fit group">
                    <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-bold">Back to Settings</span>
                </Link>

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-rose-500">
                            <CreditCard className="h-5 w-5" />
                            <span className="text-xs font-black uppercase tracking-widest">Fee Configuration</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight">Service Charges</h1>
                        <p className="text-muted-foreground italic font-medium">Manage categories for installation, reconnection, and other operational fees.</p>
                    </div>

                    <Dialog open={isCreateOpen} onOpenChange={(open) => {
                        setIsCreateOpen(open);
                        if (!open) {
                            setEditingType(null);
                            reset();
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button className="rounded-2xl h-12 px-6 shadow-xl shadow-rose-500/20 bg-rose-600 hover:bg-rose-700 gap-2">
                                <Plus className="h-5 w-5" />
                                Create New Fee
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] rounded-[2.5rem]">
                            <form onSubmit={handleSubmit}>
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-black">{editingType ? 'Edit' : 'Create'} Service Fee</DialogTitle>
                                    <DialogDescription>
                                        Set a name, unique code, and a fixed amount for this operational service.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-6 py-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name" className="font-bold">Service Name</Label>
                                        <Input
                                            id="name"
                                            placeholder="e.g. Reconnection Fee"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            className="rounded-xl h-11"
                                        />
                                        {errors.name && <p className="text-xs text-destructive font-bold">{errors.name}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="code" className="font-bold">Unique Code</Label>
                                        <Input
                                            id="code"
                                            placeholder="e.g. RECON_FEE"
                                            value={data.code}
                                            onChange={e => setData('code', e.target.value)}
                                            className="rounded-xl h-11 font-mono"
                                        />
                                        {errors.code && <p className="text-xs text-destructive font-bold">{errors.code}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="amount" className="font-bold">Amount (SSP)</Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            placeholder="0.00"
                                            value={data.amount}
                                            onChange={e => setData('amount', e.target.value)}
                                            className="rounded-xl h-11"
                                        />
                                        {errors.amount && <p className="text-xs text-destructive font-bold">{errors.amount}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="description" className="font-bold">Description</Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Details about this service fee..."
                                            value={data.description}
                                            onChange={e => setData('description', e.target.value)}
                                            className="rounded-xl min-h-[100px]"
                                        />
                                        {errors.description && <p className="text-xs text-destructive font-bold">{errors.description}</p>}
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={processing} className="w-full rounded-xl h-12 font-bold bg-rose-600 hover:bg-rose-700">
                                        {editingType ? 'Save Changes' : 'Create Fee Type'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Search Bar */}
                <div className="bg-card rounded-2xl border shadow-sm p-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Filter by name or code..." 
                            className="pl-10 rounded-xl border-none bg-muted/50 focus-visible:ring-1"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-card rounded-[2.5rem] border shadow-2xl shadow-muted/10 overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 hover:bg-muted/30 border-none">
                                <TableHead className="font-black h-16 pl-8">Service Category</TableHead>
                                <TableHead className="font-black h-16">Identifier Code</TableHead>
                                <TableHead className="font-black h-16">Standard Amount</TableHead>
                                <TableHead className="font-black h-16">Description</TableHead>
                                <TableHead className="font-black h-16 text-right pr-8">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTypes.length > 0 ? (
                                filteredTypes.map((type) => (
                                    <TableRow key={type.id} className="group hover:bg-muted/20 border-muted/10 transition-colors">
                                        <TableCell className="py-6 pl-8">
                                            <div className="flex items-center gap-4">
                                                <div className="h-11 w-11 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300 shadow-sm shadow-rose-100">
                                                    <CreditCard className="h-5 w-5" />
                                                </div>
                                                <span className="font-bold text-lg tracking-tight">{type.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="px-3 py-1 bg-muted rounded-full text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                {type.code}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-mono font-black text-lg text-rose-600">
                                                SSP {type.amount}
                                            </span>
                                        </TableCell>
                                        <TableCell className="max-w-[350px]">
                                            <span className="text-sm text-muted-foreground leading-relaxed italic">
                                                {type.description || '—'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right pr-8">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                <Button 
                                                    variant="outline" 
                                                    size="icon" 
                                                    className="rounded-xl h-10 w-10 border-muted-foreground/20 hover:border-rose-500 hover:text-rose-500"
                                                    onClick={() => handleEdit(type)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    size="icon" 
                                                    className="rounded-xl h-10 w-10 border-muted-foreground/20 hover:border-destructive hover:text-destructive"
                                                    onClick={() => handleDelete(type.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-80 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <div className="p-6 bg-muted rounded-full">
                                                <AlertCircle className="h-12 w-12" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-black text-2xl uppercase tracking-tighter">No Fee Categories</p>
                                                <p className="text-sm italic">You haven't added any service charge types yet.</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Info Alert */}
                <div className="p-6 rounded-[2rem] bg-muted/30 border border-dashed flex items-start gap-4">
                    <div className="p-2 bg-background rounded-xl shadow-sm">
                        <Info className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="text-sm leading-relaxed">
                        <h4 className="font-bold text-foreground">Operational Fee Management</h4>
                        <p className="text-muted-foreground">
                            These categories define the standard rates for non-water consumption services. When applying a charge to a customer, the system will use the amount defined here as the default, but will store a historical snapshot of the price at the time of issuance.
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}