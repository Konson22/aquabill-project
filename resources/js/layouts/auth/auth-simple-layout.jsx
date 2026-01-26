export default function AuthSimpleLayout({ children, title, description }) {
    return (
        <div
            className="relative flex max-h-screen min-h-screen flex-col items-center justify-center overflow-hidden bg-cover bg-center p-6 md:p-10"
            style={{
                backgroundImage: "url('/images/water-background.jpg')",
            }}
        >
            {/* Overlay for better text processing if needed, though card is white now */}
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />

            {/* Premium Glass Card Container */}
            <div className="relative z-10 w-full max-w-[520px] overflow-hidden rounded-3xl border border-white/30 bg-white/20 p-8 shadow-2xl backdrop-blur-2xl sm:p-12">
                <div className="mb-8 flex flex-col items-center justify-center gap-4 text-center">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-sm">
                            {title}
                        </h1>
                        <p className="text-sm font-semibold text-white/80">
                            {description}
                        </p>
                    </div>
                </div>

                <div className="w-full">{children}</div>
            </div>
        </div>
    );
}
