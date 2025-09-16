import AppLogoIcon from '@/components/app-logo-icon';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    const { name, quote } = usePage<SharedData>().props;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
            <div className="relative flex min-h-screen">
                {/* Left Side - Visual/Branding Panel */}
                <div className="relative hidden w-1/2 bg-gradient-to-br from-slate-800 via-blue-800 to-purple-900 lg:block">
                    {/* Background Image with Overlay */}
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
                        style={{
                            backgroundImage: 'url(/images/water-background.jpg)',
                        }}
                    />

                    {/* Dark Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800/90 via-blue-800/90 to-purple-900/90" />

                    {/* Content */}
                    <div className="relative z-10 flex h-full flex-col justify-between p-12">
                        {/* Logo & Brand */}
                        <div className="flex items-center space-x-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                                <AppLogoIcon className="h-8 w-8 fill-current text-white" />
                            </div>
                            <span className="text-2xl font-bold text-white">{name}</span>
                        </div>

                        {/* Main Content */}
                        <div className="max-w-md">
                            <h1 className="text-5xl font-bold text-white leading-tight mb-6">
                                Smart Water
                                <span className="block text-blue-300">Management System</span>
                            </h1>
                            <p className="text-xl text-blue-200 leading-relaxed mb-8">
                                Streamline your water utility operations with intelligent billing, real-time monitoring, and comprehensive customer management.
                            </p>

                            {/* Features */}
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 border border-blue-400/30">
                                        <svg className="h-4 w-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-blue-200 font-medium">Advanced Meter Reading</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 border border-blue-400/30">
                                        <svg className="h-4 w-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-blue-200 font-medium">Automated Billing & Invoicing</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 border border-blue-400/30">
                                        <svg className="h-4 w-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-blue-200 font-medium">Customer Portal & Analytics</span>
                                </div>
                            </div>
                        </div>

                        {/* Quote */}
                        {quote && (
                            <div className="border-l-4 border-blue-400/30 pl-6">
                                <blockquote className="text-blue-200 italic">
                                    <p className="text-lg mb-2">&ldquo;{quote.message}&rdquo;</p>
                                    <footer className="text-sm text-blue-300/80">— {quote.author}</footer>
                                </blockquote>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="flex w-full flex-col justify-center px-8 py-12 lg:w-1/2 lg:px-12">
                    <div className="mx-auto w-full max-w-md">
                        {/* Mobile Logo */}
                        <div className="mb-8 flex justify-center lg:hidden">
                            <div className="flex items-center space-x-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
                                    <AppLogoIcon className="h-8 w-8 fill-current text-white" />
                                </div>
                                <span className="text-2xl font-bold text-white">{name}</span>
                            </div>
                        </div>

                        {/* Form Header */}
                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
                            <p className="text-blue-200">{description}</p>
                        </div>

                        {/* Form Container */}
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-2xl p-8">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
