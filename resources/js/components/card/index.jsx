/**
 * Report-style card with optional header icon, title, and actions.
 * Use for dashboard report sections (e.g. Water Usage, Finance, Customers).
 * Pass `actions` for dropdowns or buttons (e.g. DropdownMenu).
 */
export default function Card({
    title,
    icon,
    iconClassName,
    actions,
    children,
    className = '',
}) {
    const hasHeader = title || icon || actions;

    return (
        <article
            className={`overflow-hidden rounded-md border border-slate-300 bg-white ${className}`.trim()}
        >
            {hasHeader && (
                <header className="border-b border-slate-200 px-6 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                            {icon && (
                                <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClassName ?? 'border border-slate-200 bg-slate-100 text-slate-600'}`}
                                >
                                    {icon}
                                </div>
                            )}
                            {title && (
                                <div className="min-w-0">
                                    <h2 className="text-lg font-bold tracking-tight text-slate-900">
                                        {title}
                                    </h2>
                                </div>
                            )}
                        </div>
                        {actions && (
                            <div className="flex shrink-0 items-center gap-2">
                                {actions}
                            </div>
                        )}
                    </div>
                </header>
            )}
            <div className="bg-white p-6">{children}</div>
        </article>
    );
}
