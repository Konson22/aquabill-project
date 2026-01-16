import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';

export default function AppSidebarLayout({ children, breadcrumbs }) {
    return (
        <AppShell variant="sidebar">
            <div className="flex max-h-screen min-h-screen w-full flex-col">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <div className="flex flex-1 overflow-hidden">
                    <AppSidebar />
                    <AppContent
                        variant="sidebar"
                        className="h-[calc(100vh-4rem)] overflow-hidden bg-gray-100"
                    >
                        <div className="flex-1 overflow-auto px-4 py-4 pb-12 md:px-6 lg:px-5">
                            {children}
                        </div>
                    </AppContent>
                </div>
            </div>
        </AppShell>
    );
}
