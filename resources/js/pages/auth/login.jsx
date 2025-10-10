import { Head, useForm } from '@inertiajs/react';
import { AlertCircle, CheckCircle, LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { LoginEmailInput, LoginPasswordInput } from '@/components/ui/login-inputs';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';

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

            <AuthSplitLayout title="Welcome Back" description="Sign in to your account">
                <form className="space-y-8" onSubmit={submit}>
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
                        className="h-14 w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 font-bold tracking-wide text-white uppercase shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-blue-700 hover:to-blue-800 hover:shadow-xl disabled:opacity-50"
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

                    {/* Status Messages */}
                    {status && (
                        <div className="mt-6 flex items-center justify-center rounded-xl border border-green-400/30 bg-green-500/20 p-4 text-center text-sm text-green-800">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            {status}
                        </div>
                    )}

                    {errors.email && (
                        <div className="mt-4 flex items-center justify-center rounded-xl border border-red-400/30 bg-red-100 p-4 text-center text-sm text-red-700">
                            <AlertCircle className="mr-2 h-4 w-4" />
                            {errors.email}
                        </div>
                    )}

                    {errors.password && (
                        <div className="mt-4 flex items-center justify-center rounded-xl border border-red-400/30 bg-red-100 p-4 text-center text-sm text-red-700">
                            <AlertCircle className="mr-2 h-4 w-4" />
                            {errors.password}
                        </div>
                    )}
                </form>
            </AuthSplitLayout>
        </>
    );
}
