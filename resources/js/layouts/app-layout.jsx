import AdminNavbar from '@/components/admin-navbar';
import AdminSidebar from '@/components/admin-sidebar';

export default ({ children, breadcrumbs, ...props }) => (
    <div className="flex h-screen max-h-screen min-h-screen">
        <AdminSidebar />
        <div className="h-screen max-h-screen min-h-screen w-full overflow-y-auto">
            <AdminNavbar />
            <div className="p-4">{children}</div>
        </div>
    </div>
);
