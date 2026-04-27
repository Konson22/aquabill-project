import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';

export default function AppLayout({ children, breadcrumbs = [] }) {
    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs}>
            {children}
        </AppLayoutTemplate>
    );
}
