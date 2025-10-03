import { Head, useForm } from '@inertiajs/react';
import { AlertCircle, CheckCircle, LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { LoginEmailInput, LoginPasswordInput } from '@/components/ui/login-inputs';

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        setIsAnimating(true);
        post(route('login'), {
            onFinish: () => {
                reset('password');
                setIsAnimating(false);
            },
        });
    };

    // Add floating animation effect
    useEffect(() => {
        const interval = setInterval(() => {
            setIsAnimating((prev) => !prev);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <Head title="Login" />

            <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600">
                {/* Organic Background Shapes */}
                <div className="absolute inset-0">
                    {/* Large organic shapes */}
                    <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-blue-300/30 blur-3xl"></div>
                    <div className="absolute top-1/4 right-0 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl"></div>
                    <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-blue-500/25 blur-3xl"></div>
                    <div className="absolute top-1/2 right-1/4 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl"></div>

                    {/* Smaller floating shapes */}
                    <div className="absolute top-20 left-1/3 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
                    <div className="absolute right-1/3 bottom-20 h-40 w-40 rounded-full bg-white/15 blur-2xl"></div>
                    <div className="absolute top-1/3 left-1/2 h-24 w-24 rounded-full bg-white/5 blur-xl"></div>
                </div>

                {/* Particle dots overlay */}
                <div className="absolute inset-0 opacity-30">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `radial-gradient(circle at 20% 20%, white 1px, transparent 1px),
                                        radial-gradient(circle at 80% 40%, white 1px, transparent 1px),
                                        radial-gradient(circle at 40% 80%, white 1px, transparent 1px),
                                        radial-gradient(circle at 60% 10%, white 1px, transparent 1px),
                                        radial-gradient(circle at 10% 60%, white 1px, transparent 1px),
                                        radial-gradient(circle at 90% 80%, white 1px, transparent 1px),
                                        radial-gradient(circle at 30% 50%, white 1px, transparent 1px),
                                        radial-gradient(circle at 70% 30%, white 1px, transparent 1px)`,
                            backgroundSize: '200px 200px, 150px 150px, 180px 180px, 160px 160px, 170px 170px, 190px 190px, 140px 140px, 130px 130px',
                        }}
                    ></div>
                </div>

                {/* Main Content Container */}
                <div className="relative flex min-h-screen items-center justify-center px-6 py-12">
                    <div className="w-full max-w-md">
                        {/* Glassmorphism Form Container */}
                        <div className="relative rounded-xl border border-white/20 bg-indigo-900/40 p-8 backdrop-blur-xl">
                            {/* Subtle glow effect */}
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-transparent"></div>

                            {/* Form Header */}
                            <div className="relative mb-8 text-center">
                                <h2 className="text-3xl font-bold text-white">Login</h2>
                            </div>

                            <form className="relative space-y-6" onSubmit={submit}>
                                <div>
                                    <LoginEmailInput
                                        id="email"
                                        required
                                        autoFocus
                                        autoComplete="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div>
                                    <LoginPasswordInput
                                        id="password"
                                        required
                                        autoComplete="current-password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        showPassword={showPassword}
                                        onTogglePassword={() => setShowPassword(!showPassword)}
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <Button
                                    type="submit"
                                    className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 font-bold tracking-wide text-white uppercase transition-all duration-300 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg disabled:opacity-50"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <div className="flex items-center">
                                            <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                                            Signing in...
                                        </div>
                                    ) : (
                                        'LOGIN'
                                    )}
                                </Button>
                            </form>

                            {/* Status Messages */}
                            {status && (
                                <div className="relative mt-6 flex items-center justify-center rounded-xl border border-green-400/30 bg-green-500/20 p-4 text-center text-sm text-green-200 backdrop-blur-sm">
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    {status}
                                </div>
                            )}

                            {errors.email && (
                                <div className="relative mt-4 flex items-center justify-center rounded-xl border border-red-400/30 bg-red-500/20 p-4 text-center text-sm text-red-200 backdrop-blur-sm">
                                    <AlertCircle className="mr-2 h-4 w-4" />
                                    {errors.email}
                                </div>
                            )}

                            {errors.password && (
                                <div className="relative mt-4 flex items-center justify-center rounded-xl border border-red-400/30 bg-red-500/20 p-4 text-center text-sm text-red-200 backdrop-blur-sm">
                                    <AlertCircle className="mr-2 h-4 w-4" />
                                    {errors.password}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
