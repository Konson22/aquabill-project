import { usePage } from '@inertiajs/react';

export default function AuthSplitLayout({ children }) {
    const { name, quote } = usePage().props;
    const appName = name || 'GoFinance';
    const tagline = quote || 'Business popular sem to come handligue this.';

    return (
        <div className="flex min-h-screen items-center justify-center bg-blue-50">
            <div className="flex min-h-screen w-full flex-col lg:flex-row">
                {/* Left Panel - Blue Gradient (2/3 width) */}
                <div
                    style={{
                        backgroundImage: 'linear-gradient(rgba(15, 78, 214,0.5), rgba(15, 78, 214,0.5)), url(/images/water-bg.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                    className="relative hidden overflow-hidden bg-gradient-to-b from-blue-500 to-blue-700 lg:flex lg:w-2/3"
                ></div>

                {/* Right Panel - White Background (1/3 width on desktop, full width on mobile) */}
                <div className="flex w-full items-center justify-center bg-white p-8 lg:w-1/3">
                    <div className="w-full max-w-md">{children}</div>
                </div>
            </div>
        </div>
    );
}
