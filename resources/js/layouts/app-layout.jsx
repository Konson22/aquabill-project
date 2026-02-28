import AdminNavbar from '@/components/admin-navbar';
import AdminSidebar from '@/components/admin-sidebar';
import { useState } from 'react';

export default ({ children, breadcrumbs, ...props }) => {
    const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="flex h-screen max-h-screen min-h-screen">
            <AdminSidebar
                mobileOpen={sidebarMobileOpen}
                onMobileClose={() => setSidebarMobileOpen(false)}
                collapsed={sidebarCollapsed}
                onCollapsedChange={() => setSidebarCollapsed((c) => !c)}
            />
            <div className="h-screen max-h-screen min-h-screen w-full overflow-y-auto">
                <AdminNavbar onMobileMenuClick={() => setSidebarMobileOpen(true)} />
                <div className="p-4">{children}</div>
            </div>
        </div>
    );
};
