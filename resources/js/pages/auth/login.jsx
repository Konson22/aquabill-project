import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
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
        <>
            <Head title="Login" />

            <div className="min-h-screen bg-gray-50">
                {/* Geometric Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                    />
                </div>

                <div className="relative flex min-h-screen">
                    {/* Left Side - Promotional Visual */}
                    <div className="relative hidden lg:flex lg:w-1/2">
                        {/* Background Image with Overlay */}
                        <div
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                            style={{
                                backgroundImage:
                                    'url("https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80")',
                            }}
                        />

                        {/* Blue Overlay */}
                        <div className="absolute inset-0 bg-blue-600/80" />

                        {/* Content */}
                        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
                            <div className="max-w-lg">
                                {/* Brand */}
                                <div className="mb-16">
                                    <h1 className="mb-4 text-6xl font-bold">AQUABILL</h1>
                                    <p className="text-xl text-blue-100">Giving you more autonomy to control your water management.</p>
                                    <button className="mt-6 text-sm text-white underline transition-colors hover:text-blue-200">Learn more</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Login Form */}
                    <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
                        <div className="w-full max-w-md">
                            {/* Mobile Logo */}
                            <div className="mb-8 text-center lg:hidden">
                                <div className="mb-6 flex items-center justify-center space-x-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                                        <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                        </svg>
                                    </div>
                                    <span className="text-2xl font-bold text-gray-900">AquaBill</span>
                                </div>
                            </div>

                            {/* Form Container */}
                            <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
                                {/* Logo */}
                                <div className="mb-8 flex items-center space-x-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                                        <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                        </svg>
                                    </div>
                                    <span className="text-2xl font-bold text-gray-900">AquaBill</span>
                                </div>

                                {/* Form Header */}
                                <div className="mb-8">
                                    <h2 className="mb-2 text-2xl font-semibold text-gray-900">Sign in</h2>
                                    <p className="text-sm text-gray-600">Access the AquaBill dashboard using your email and password.</p>
                                </div>

                                <form className="space-y-6" onSubmit={submit}>
                                    <div>
                                        <Label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                                            Email
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            required
                                            autoFocus
                                            autoComplete="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="example@email.com"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div>
                                        <Label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                                            Password
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                required
                                                autoComplete="current-password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 flex items-center pr-3"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                                ) : (
                                                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                                )}
                                            </button>
                                        </div>
                                        <InputError message={errors.password} />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="h-11 w-full rounded-md bg-blue-600 font-medium text-white transition-colors hover:bg-blue-700"
                                        disabled={processing}
                                    >
                                        {processing ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : 'Login'}
                                    </Button>
                                </form>

                                <div className="mt-6 space-y-2 text-center">
                                    {canResetPassword && (
                                        <div>
                                            <TextLink href={route('password.request')} className="text-sm text-blue-600 hover:text-blue-500">
                                                Forgot password?
                                            </TextLink>
                                        </div>
                                    )}
                                    <div>
                                        <TextLink href={route('register')} className="text-sm text-blue-600 hover:text-blue-500">
                                            Don't have an account? Register
                                        </TextLink>
                                    </div>
                                </div>

                                {status && (
                                    <div className="mt-6 rounded-md border border-green-200 bg-green-50 p-4 text-center text-sm text-green-800">
                                        {status}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
