import { Head, useForm, Link } from '@inertiajs/react';
import { LoaderCircle, UtensilsCrossed } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        login: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="relative h-screen flex justify-center lg:p-0 bg-white">
            <Head title="Log in" />

            {/* Left Side: Background & Branding */}
            <div className="relative hidden h-full flex-1 flex-col bg-muted p-10 text-white lg:flex">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10s] hover:scale-105"
                    style={{ backgroundImage: 'url("/images/login-bg.jpg")' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
            </div>

            {/* Right Side: Login Form */}
            <div className="flex h-full w-[35%] items-center justify-center p-8 lg:p-0">
                <div className=" flex w-full flex-col justify-center space-y-8 sm:w-[400px] animate-in fade-in slide-in-from-right-8 duration-700 delay-100">

                    {/* Mobile Logo */}
                    <div className="flex flex-col items-center gap-2 lg:hidden">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/20">
                            <img src="/images/logo.png" className="h-7 w-7" />
                        </div>
                        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">AquaBill</h1>
                    </div>

                    <div className="flex flex-col space-y-3 text-center lg:text-left">
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 lg:text-4xl">
                            Welcome back
                        </h1>
                        <p className="text-neutral-500 text-base">
                            Enter your credentials to access your department dashboard
                        </p>
                    </div>

                    <div className="grid gap-6">
                        {status && (
                            <div className="rounded-lg bg-green-500/10 p-3 text-sm font-medium text-green-500 border border-green-500/20">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="login" className="text-neutral-700 font-medium ml-1">Email or Phone</Label>
                                <Input
                                    id="login"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="username"
                                    value={data.login}
                                    onChange={(e) => setData('login', e.target.value)}
                                    placeholder="manager@konson.com"
                                    className="h-12 bg-neutral-50 border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:ring-blue-600/20 focus:border-blue-600 transition-all rounded-xl"
                                />
                                <InputError message={errors.login} className="mt-1" />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center justify-between ml-1">
                                    <Label htmlFor="password" title="password" className="text-neutral-700 font-medium">Password</Label>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="h-12 bg-neutral-50 border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:ring-blue-600/20 focus:border-blue-600 transition-all rounded-xl"
                                />
                                <InputError message={errors.password} className="mt-1" />
                            </div>

                            <div className="flex items-center space-x-3 ml-1">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    checked={data.remember}
                                    onCheckedChange={(checked) => setData('remember', checked)}
                                    tabIndex={3}
                                    className="border-neutral-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                />
                                <Label htmlFor="remember" className="text-sm text-neutral-500 cursor-pointer select-none">Remember this device</Label>
                            </div>

                            <Button
                                type="submit"
                                className="h-12 mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
                                tabIndex={4}
                                disabled={processing}
                            >
                                {processing ? (
                                    <LoaderCircle className="h-5 w-5 animate-spin" />
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

