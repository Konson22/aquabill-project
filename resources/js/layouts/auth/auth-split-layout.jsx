import AppLogoIcon from '@/components/app-logo-icon';
import { usePage } from '@inertiajs/react';

export default function AuthSplitLayout({ children, title, description }) {
    const { name, quote } = usePage().props;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
                style={{
                    backgroundImage: 'url(/images/water-background.jpg)',
                }}
            />

            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-blue-900/80 to-indigo-900/80" />

            {/* Centered Form Container */}
            <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    {/* Form Container */}
                    <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-2xl">
                        {/* Logo */}
                        <div className="mb-8 text-center">
                            <div className="mx-auto flex h-16 w-20 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm">
                                <AppLogoIcon className="h-full w-full fill-current text-blue-600" />
                            </div>
                        </div>

                        {/* Form Header */}
                        <div className="mb-6 text-center">
                            <h2 className="mb-2 text-xl font-semibold text-slate-900">{title}</h2>
                            {description && <p className="text-slate-600">{description}</p>}
                        </div>

                        {/* Form Content */}
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
