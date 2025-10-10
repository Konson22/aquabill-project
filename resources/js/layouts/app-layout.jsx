import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { useState } from 'react';

export default ({ children, breadcrumbs }) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return (
        <AppShell variant="sidebar">
            <AppSidebar onCollapseChange={setIsSidebarCollapsed} />
            <div className={`flex flex-1 flex-col transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'ml-16' : 'ml-48'}`}>
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <div className="flex-1 bg-gray-50 p-4">{children}</div>
            </div>
        </AppShell>
    );
};
