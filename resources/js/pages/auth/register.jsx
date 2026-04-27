import { Head, Link, useForm } from '@inertiajs/react';
import { 
    LoaderCircle, 
    UtensilsCrossed, 
    ArrowLeft, 
    Building2, 
    User, 
    Mail, 
    Lock,
    ArrowRight,
    Phone,
    Briefcase
} from 'lucide-react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        account_name: '',
        business_type: '',
        phone: '',
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="flex min-h-screen w-full flex-col lg:flex-row bg-neutral-950 overflow-hidden">
            <Head title="Registration" />

            {/* Left Side: Branding & Visuals */}
            <div className="relative hidden w-[45%] flex-col bg-muted p-12 text-white lg:flex">
                <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10s] hover:scale-110" 
                    style={{ backgroundImage: 'url("/images/auth/login-bg.png")' }}
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-neutral-950 via-neutral-950/60 to-transparent" />
                
                <div className="relative z-20 flex items-center text-3xl font-black tracking-tighter">
                    <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-600 shadow-xl shadow-orange-600/30">
                        <UtensilsCrossed className="h-7 w-7 text-white" />
                    </div>
                    Konson <span className="text-orange-500 ml-1.5 uppercase font-bold text-xl tracking-widest bg-orange-500/10 px-3 py-1 rounded-lg">Resto</span>
                </div>

                <div className="relative z-20 mt-auto max-w-lg">
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                        <div className="inline-flex px-4 py-2 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-black uppercase tracking-[0.2em] backdrop-blur-md">
                            Partnership Program
                        </div>
                        <h2 className="text-6xl font-black leading-none tracking-tighter">
                            Build Your <span className="text-orange-500">Dream</span> Restaurant.
                        </h2>
                        <p className="text-lg text-neutral-400 font-medium leading-relaxed">
                            Join thousands of successful restaurateurs who scale their business with Konson's professional suite.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side: Registration Flow */}
            <div className="flex flex-1 items-center justify-center p-6 md:p-12 lg:p-10 bg-neutral-950 overflow-y-auto">
                <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[520px] animate-in fade-in slide-in-from-right-10 duration-700 delay-200 py-10">
                    
                    {/* Header */}
                    <div className="space-y-3">
                        <Link href={route('login')} className="inline-flex items-center text-xs font-black uppercase tracking-widest text-neutral-500 hover:text-orange-500 transition-colors group">
                            <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to log in
                        </Link>
                        <h1 className="text-4xl font-black text-white tracking-tight leading-none">Initialize <span className="text-orange-500">System</span></h1>
                        <p className="text-neutral-400 font-medium">Enter your credentials to deploy your instances.</p>
                    </div>

                    <form className="space-y-8" onSubmit={submit}>
                        
                        {/* Section: Business Details */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="h-px flex-1 bg-white/5" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600">Business Registry</span>
                                <div className="h-px flex-1 bg-white/5" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="grid gap-2 group">
                                    <Label htmlFor="account_name" className="text-neutral-500 text-xs font-black uppercase tracking-widest ml-1 group-focus-within:text-orange-500 transition-colors">Restaurant Name</Label>
                                    <div className="relative">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-600 group-focus-within:text-orange-500 transition-colors" />
                                        <Input
                                            id="account_name"
                                            required
                                            className="h-14 pl-12 bg-neutral-900 border-none text-white font-bold placeholder:text-neutral-700 focus:ring-4 focus:ring-orange-600/10 rounded-2xl shadow-inner"
                                            value={data.account_name}
                                            onChange={(e) => setData('account_name', e.target.value)}
                                            disabled={processing}
                                            placeholder="Ex: The Grand Bistro"
                                        />
                                    </div>
                                    <InputError message={errors.account_name} />
                                </div>

                                <div className="grid gap-2 group">
                                    <Label htmlFor="business_type" className="text-neutral-500 text-xs font-black uppercase tracking-widest ml-1 group-focus-within:text-orange-500 transition-colors">Business Type</Label>
                                    <Select
                                        value={data.business_type}
                                        onValueChange={(value) => setData('business_type', value)}
                                        disabled={processing}
                                    >
                                        <SelectTrigger className="h-14 bg-neutral-900 border-none text-white font-bold rounded-2xl focus:ring-4 focus:ring-orange-600/10 shadow-inner px-4">
                                            <div className="flex items-center gap-2">
                                                <Briefcase className="w-5 h-5 text-neutral-600" />
                                                <SelectValue placeholder="Select type" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="bg-neutral-900 border-white/5 text-white">
                                            <SelectItem value="restaurant" className="focus:bg-orange-600 focus:text-white font-bold">Restaurant</SelectItem>
                                            <SelectItem value="cafe" className="focus:bg-orange-600 focus:text-white font-bold">Cafe / Bakery</SelectItem>
                                            <SelectItem value="bar" className="focus:bg-orange-600 focus:text-white font-bold">Bar / Lounge</SelectItem>
                                            <SelectItem value="hotel" className="focus:bg-orange-600 focus:text-white font-bold">Hotel / Resort</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.business_type} />
                                </div>
                            </div>

                            <div className="grid gap-2 group">
                                <Label htmlFor="phone" className="text-neutral-500 text-xs font-black uppercase tracking-widest ml-1 group-focus-within:text-orange-500 transition-colors">Contact Phone</Label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-600 group-focus-within:text-orange-500 transition-colors" />
                                    <Input
                                        id="phone"
                                        required
                                        className="h-14 pl-12 bg-neutral-900 border-none text-white font-bold placeholder:text-neutral-700 focus:ring-4 focus:ring-orange-600/10 rounded-2xl shadow-inner"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        disabled={processing}
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                                <InputError message={errors.phone} />
                            </div>
                        </div>

                        {/* Section: Owner Details */}
                        <div className="space-y-6 pt-4">
                            <div className="flex items-center gap-3">
                                <div className="h-px flex-1 bg-white/5" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600">Administrator Access</span>
                                <div className="h-px flex-1 bg-white/5" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="grid gap-2 group">
                                    <Label htmlFor="name" className="text-neutral-500 text-xs font-black uppercase tracking-widest ml-1 group-focus-within:text-orange-500 transition-colors">Owner Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-600 group-focus-within:text-orange-500 transition-colors" />
                                        <Input
                                            id="name"
                                            required
                                            className="h-14 pl-12 bg-neutral-900 border-none text-white font-bold placeholder:text-neutral-700 focus:ring-4 focus:ring-orange-600/10 rounded-2xl shadow-inner"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            disabled={processing}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2 group">
                                    <Label htmlFor="email" className="text-neutral-500 text-xs font-black uppercase tracking-widest ml-1 group-focus-within:text-orange-500 transition-colors">Login Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-600 group-focus-within:text-orange-500 transition-colors" />
                                        <Input
                                            id="email"
                                            type="email"
                                            required
                                            className="h-14 pl-12 bg-neutral-900 border-none text-white font-bold placeholder:text-neutral-700 focus:ring-4 focus:ring-orange-600/10 rounded-2xl shadow-inner"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            disabled={processing}
                                            placeholder="john@konson.io"
                                        />
                                    </div>
                                    <InputError message={errors.email} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="grid gap-2 group">
                                    <Label htmlFor="password" className="text-neutral-500 text-xs font-black uppercase tracking-widest ml-1 group-focus-within:text-orange-500 transition-colors">Security Key</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-600 group-focus-within:text-orange-500 transition-colors" />
                                        <Input
                                            id="password"
                                            type="password"
                                            required
                                            className="h-14 pl-12 bg-neutral-900 border-none text-white font-bold placeholder:text-neutral-700 focus:ring-4 focus:ring-orange-600/10 rounded-2xl shadow-inner"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            disabled={processing}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-2 group">
                                    <Label htmlFor="password_confirmation" className="text-neutral-500 text-xs font-black uppercase tracking-widest ml-1 group-focus-within:text-orange-500 transition-colors">Verify Key</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-600 group-focus-within:text-orange-500 transition-colors" />
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            required
                                            className="h-14 pl-12 bg-neutral-900 border-none text-white font-bold placeholder:text-neutral-700 focus:ring-4 focus:ring-orange-600/10 rounded-2xl shadow-inner"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            disabled={processing}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <InputError message={errors.password_confirmation} />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <Button 
                                type="submit" 
                                className="h-20 w-full bg-orange-600 hover:bg-orange-700 text-white font-black text-xl rounded-3xl shadow-2xl shadow-orange-600/20 transition-all hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-3" 
                                disabled={processing}
                            >
                                {processing ? (
                                    <LoaderCircle className="h-6 w-6 animate-spin text-white" />
                                ) : (
                                    <>
                                        Deploy System
                                        <ArrowRight className="h-6 w-6" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>

                    <p className="text-center text-sm font-medium text-neutral-500">
                        Institutional access only?{' '}
                        <Link 
                            href={route('login')} 
                            className="text-orange-500 hover:text-orange-400 font-bold transition-colors underline underline-offset-4"
                        >
                            Establish session
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
