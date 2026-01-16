import { home } from '@/routes';
import { Link, usePage } from '@inertiajs/react';

export default function AuthSplitLayout({ children, title, description }) {
    const { name, quote } = usePage().props;
    const appName = name || 'Water Billing System';

    return (
        <div className="relative flex h-screen justify-center">
            {/* Left Side - Branding Panel */}
            <div className="relative hidden flex-1 lg:block">
                <img
                    src="/images/water-background2.jpg"
                    alt="Background"
                    className="absolute inset-0 h-full w-full object-cover"
                />
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-[40%] lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
                    <Link
                        href={home()}
                        className="relative z-20 mb-8 flex items-center justify-center gap-3 text-xl font-semibold"
                    >
                        <div className="flex h-12 w-16 items-center justify-center rounded-xl">
                            <img
                                className="h-full w-full"
                                src="/logo.png"
                                alt="App Logo"
                            />
                        </div>
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <p className="text-sm text-balance text-muted-foreground">
                            {description}
                        </p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
