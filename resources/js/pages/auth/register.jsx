import { Head, useForm } from '@inertiajs/react';
import { ArrowRight, CheckCircle, Eye, EyeOff, LoaderCircle, Lock, Mail, Shield, User, Users, Zap } from 'lucide-react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
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
        <>
            <Head title="Register" />

            <div className="relative min-h-screen overflow-hidden bg-black">
                {/* Animated Background */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-red-900/20"></div>
                    <div className="absolute top-0 left-0 h-full w-full">
                        <div className="absolute top-1/4 left-1/4 h-96 w-96 animate-pulse rounded-full bg-purple-500/10 blur-3xl"></div>
                        <div className="absolute top-3/4 right-1/4 h-80 w-80 animate-pulse rounded-full bg-pink-500/10 blur-3xl delay-1000"></div>
                        <div className="absolute bottom-1/4 left-1/3 h-64 w-64 animate-pulse rounded-full bg-red-500/10 blur-3xl delay-500"></div>
                    </div>
                </div>

                <div className="relative z-10 flex min-h-screen">
                    {/* Left Side - Hero Section */}
                    <div className="hidden flex-col justify-center px-16 lg:flex lg:w-1/2">
                        <div className="max-w-lg">
                            {/* Logo */}
                            <div className="mb-12">
                                <div className="mb-6 flex items-center space-x-4">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-2xl">
                                        <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-bold text-white">AquaBill</h1>
                                        <p className="text-sm text-purple-300">Water Management Platform</p>
                                    </div>
                                </div>
                            </div>

                            {/* Hero Content */}
                            <div className="space-y-8">
                                <div>
                                    <h2 className="mb-6 text-5xl leading-tight font-bold text-white">
                                        Join the
                                        <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                                            revolution
                                        </span>
                                        in water management
                                    </h2>
                                    <p className="text-xl leading-relaxed text-gray-300">
                                        Be part of the next generation of water utility management. Get started with our cutting-edge platform and
                                        transform your operations.
                                    </p>
                                </div>

                                {/* Benefits */}
                                <div className="space-y-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-lg border border-purple-500/30 bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                                            <CheckCircle className="h-4 w-4 text-purple-400" />
                                        </div>
                                        <div>
                                            <h3 className="mb-1 font-semibold text-white">Free 30-day trial</h3>
                                            <p className="text-sm text-gray-400">No credit card required, full access to all features</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4">
                                        <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-lg border border-pink-500/30 bg-gradient-to-br from-pink-500/20 to-red-500/20">
                                            <CheckCircle className="h-4 w-4 text-pink-400" />
                                        </div>
                                        <div>
                                            <h3 className="mb-1 font-semibold text-white">Setup in minutes</h3>
                                            <p className="text-sm text-gray-400">Quick onboarding with guided setup process</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4">
                                        <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/30 bg-gradient-to-br from-red-500/20 to-purple-500/20">
                                            <CheckCircle className="h-4 w-4 text-red-400" />
                                        </div>
                                        <div>
                                            <h3 className="mb-1 font-semibold text-white">24/7 expert support</h3>
                                            <p className="text-sm text-gray-400">Dedicated support team ready to help you succeed</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Features */}
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                                            <Zap className="h-5 w-5 text-purple-400" />
                                        </div>
                                        <span className="font-medium text-gray-300">AI-powered insights</span>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-pink-500/30 bg-gradient-to-br from-pink-500/20 to-red-500/20">
                                            <Shield className="h-5 w-5 text-pink-400" />
                                        </div>
                                        <span className="font-medium text-gray-300">Bank-level security</span>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/30 bg-gradient-to-br from-red-500/20 to-purple-500/20">
                                            <Users className="h-5 w-5 text-red-400" />
                                        </div>
                                        <span className="font-medium text-gray-300">Team collaboration</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Register Form */}
                    <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
                        <div className="w-full max-w-md">
                            {/* Mobile Logo */}
                            <div className="mb-8 text-center lg:hidden">
                                <div className="mb-6 flex items-center justify-center space-x-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-xl">
                                        <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-white">AquaBill</h1>
                                        <p className="text-sm text-purple-300">Water Management</p>
                                    </div>
                                </div>
                            </div>

                            {/* Form Card */}
                            <div className="rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
                                <div className="mb-8">
                                    <h2 className="mb-2 text-3xl font-bold text-white">Create Account</h2>
                                    <p className="text-gray-300">Start your journey with AquaBill today</p>
                                </div>

                                <form className="space-y-6" onSubmit={submit}>
                                    <div>
                                        <Label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-200">
                                            Full Name
                                        </Label>
                                        <div className="relative">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                                <User className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <Input
                                                id="name"
                                                type="text"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                disabled={processing}
                                                placeholder="Enter your full name"
                                                className="h-14 rounded-xl border-white/20 bg-white/10 pl-12 text-white transition-all duration-300 placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/50"
                                            />
                                        </div>
                                        <InputError message={errors.name} />
                                    </div>

                                    <div>
                                        <Label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-200">
                                            Email Address
                                        </Label>
                                        <div className="relative">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                                <Mail className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <Input
                                                id="email"
                                                type="email"
                                                required
                                                tabIndex={2}
                                                autoComplete="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                disabled={processing}
                                                placeholder="Enter your email"
                                                className="h-14 rounded-xl border-white/20 bg-white/10 pl-12 text-white transition-all duration-300 placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/50"
                                            />
                                        </div>
                                        <InputError message={errors.email} />
                                    </div>

                                    <div>
                                        <Label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-200">
                                            Password
                                        </Label>
                                        <div className="relative">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                                <Lock className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <Input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                required
                                                tabIndex={3}
                                                autoComplete="new-password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                disabled={processing}
                                                placeholder="Create a strong password"
                                                className="h-14 rounded-xl border-white/20 bg-white/10 pr-12 pl-12 text-white transition-all duration-300 placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/50"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 flex items-center pr-4"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-5 w-5 text-gray-400 transition-colors hover:text-purple-400" />
                                                ) : (
                                                    <Eye className="h-5 w-5 text-gray-400 transition-colors hover:text-purple-400" />
                                                )}
                                            </button>
                                        </div>
                                        <InputError message={errors.password} />
                                    </div>

                                    <div>
                                        <Label htmlFor="password_confirmation" className="mb-2 block text-sm font-medium text-gray-200">
                                            Confirm Password
                                        </Label>
                                        <div className="relative">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                                <Lock className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <Input
                                                id="password_confirmation"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                required
                                                tabIndex={4}
                                                autoComplete="new-password"
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                disabled={processing}
                                                placeholder="Confirm your password"
                                                className="h-14 rounded-xl border-white/20 bg-white/10 pr-12 pl-12 text-white transition-all duration-300 placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/50"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 flex items-center pr-4"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="h-5 w-5 text-gray-400 transition-colors hover:text-purple-400" />
                                                ) : (
                                                    <Eye className="h-5 w-5 text-gray-400 transition-colors hover:text-purple-400" />
                                                )}
                                            </button>
                                        </div>
                                        <InputError message={errors.password_confirmation} />
                                    </div>

                                    <div className="flex items-start">
                                        <Checkbox
                                            id="terms"
                                            className="mt-1 h-4 w-4 rounded border-white/30 text-purple-400 focus:ring-purple-400/50"
                                        />
                                        <Label htmlFor="terms" className="ml-2 block text-sm text-gray-300">
                                            I agree to the{' '}
                                            <a href="#" className="font-medium text-purple-400 transition-colors duration-200 hover:text-purple-300">
                                                terms and conditions
                                            </a>{' '}
                                            and{' '}
                                            <a href="#" className="font-medium text-purple-400 transition-colors duration-200 hover:text-purple-300">
                                                privacy policy
                                            </a>
                                        </Label>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="group h-14 w-full transform rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:scale-[1.02] hover:from-purple-600 hover:to-pink-600 hover:shadow-2xl"
                                        tabIndex={5}
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                                        ) : (
                                            <>
                                                Create Account
                                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                            </>
                                        )}
                                    </Button>
                                </form>

                                <div className="mt-8 text-center">
                                    <p className="text-gray-300">
                                        Already have an account?{' '}
                                        <TextLink
                                            href={route('login')}
                                            className="font-semibold text-purple-400 transition-colors duration-200 hover:text-purple-300"
                                        >
                                            Sign in here
                                        </TextLink>
                                    </p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-8 text-center text-xs text-gray-400">
                                <p>© 2024 AquaBill. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
