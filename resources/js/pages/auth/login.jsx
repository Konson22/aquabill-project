import { Head, Link, useForm } from '@inertiajs/react';
import { AlertCircle, CheckCircle, LoaderCircle } from 'lucide-react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { LoginPasswordInput, LoginUsernameInput } from '@/components/ui/login-inputs';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => {
                reset('password');
            },
        });
    };

    return (
        <>
            <Head title="Login" />

            <AuthSplitLayout>
                <div className="space-y-8">
                    {/* Greeting */}
                    <div>
                        <h2 className="mb-2 text-3xl font-semibold text-gray-900">Hello Again!</h2>
                        <p className="text-gray-500">Welcome Back.</p>
                    </div>

                    <form className="space-y-6" onSubmit={submit}>
                        <div>
                            <LoginUsernameInput
                                id="email"
                                required
                                autoFocus
                                autoComplete="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            <InputError message={errors.email} className="mt-1" />
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
                            <InputError message={errors.password} className="mt-1" />
                        </div>

                        <Button
                            type="submit"
                            className="h-12 w-full rounded-lg bg-blue-600 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                            disabled={processing}
                        >
                            {processing ? (
                                <div className="flex items-center justify-center">
                                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </div>
                            ) : (
                                'Login'
                            )}
                        </Button>

                        {/* Forgot Password Link */}
                        {canResetPassword && (
                            <div className="text-center">
                                <Link href={route('password.request')} className="text-sm text-gray-500 transition-colors hover:text-gray-700">
                                    Forgot Password?
                                </Link>
                            </div>
                        )}

                        {/* Status Messages */}
                        {status && (
                            <div className="mt-4 flex items-center justify-center rounded-lg border border-green-400/30 bg-green-500/20 p-3 text-center text-sm text-green-800">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                {status}
                            </div>
                        )}

                        {errors.email && (
                            <div className="mt-2 flex items-center justify-center rounded-lg border border-red-400/30 bg-red-100 p-3 text-center text-sm text-red-700">
                                <AlertCircle className="mr-2 h-4 w-4" />
                                {errors.email}
                            </div>
                        )}

                        {errors.password && (
                            <div className="mt-2 flex items-center justify-center rounded-lg border border-red-400/30 bg-red-100 p-3 text-center text-sm text-red-700">
                                <AlertCircle className="mr-2 h-4 w-4" />
                                {errors.password}
                            </div>
                        )}
                    </form>
                </div>
            </AuthSplitLayout>
        </>
    );
}
