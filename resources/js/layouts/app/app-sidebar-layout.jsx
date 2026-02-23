import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';

export default function AppSidebarLayout({ children, breadcrumbs }) {
    return (
        <AppShell variant="sidebar">
            <div className="flex h-screen w-full flex-col overflow-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <div className="flex min-h-0 flex-1 overflow-hidden">
                    <AppSidebar />
                    <AppContent
                        variant="sidebar"
                        className="flex min-h-0 flex-1 flex-col overflow-hidden bg-gray-50"
                    >
                        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-12 md:px-6 lg:px-5">
                            {children}
                        </div>
                    </AppContent>
                </div>
            </div>
        </AppShell>
    );
}
