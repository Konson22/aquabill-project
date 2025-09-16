import { usePage } from '@inertiajs/react';

export function AppShell({ children, variant = 'header' }) {
    if (variant === 'header') {
        return <div className="flex min-h-screen w-full flex-col">{children}</div>;
    }

    return <div className="flex min-h-screen w-full">{children}</div>;
}
