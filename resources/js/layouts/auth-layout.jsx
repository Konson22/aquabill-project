export default function AuthLayout({ children, title, description }) {
    return (
        <div className="flex min-h-screen">
            {/* Left: Image panel */}
            <div
                className="hidden flex-1 bg-cover bg-center lg:block"
                style={{
                    backgroundImage: "url('/images/alexei_other-tap-4709088_1280.jpg')",
                }}
            >
                <div className="h-full w-full bg-slate-900/20" />
            </div>

            {/* Right: Form panel */}
            <div className="flex w-full flex-col justify-center bg-slate-50 px-6 py-12 sm:px-12 lg:w-[480px] lg:flex-none lg:px-16">
                <div className="mx-auto w-full max-w-sm">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            {title}
                        </h1>
                        <p className="mt-2 text-sm text-slate-600">
                            {description}
                        </p>
                    </div>

                    <div className="w-full">{children}</div>
                </div>
            </div>
        </div>
    );
}
