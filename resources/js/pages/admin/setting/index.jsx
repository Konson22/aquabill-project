import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { 
    Users, 
    ShieldCheck, 
    MapPin, 
    Receipt, 
    CreditCard, 
    Building, 
    Settings,
    ChevronRight,
    ArrowRight
} from 'lucide-react';

const SettingCard = ({ icon: Icon, title, description, href, color }) => (
    <Link 
        href={href}
        className="group relative bg-card hover:bg-accent/50 p-6 rounded-3xl border transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 flex flex-col justify-between h-full"
    >
        <div>
            <div className={`h-12 w-12 rounded-2xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500`}>
                <Icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
            </p>
        </div>
        <div className="mt-6 flex items-center text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
            Configure Now
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
    </Link>
);

export default function Index() {
    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Settings', href: '/admin/settings' },
    ];

    const categories = [
        {
            title: "Access Control",
            description: "Manage users, roles and organizational structure.",
            items: [
                {
                    title: "Users",
                    description: "Manage staff accounts, status, and department assignments.",
                    icon: Users,
                    href: "/admin/users",
                    color: "bg-blue-500"
                },
                {
                    title: "Roles & Permissions",
                    description: "Define what staff can see and do across the system.",
                    icon: ShieldCheck,
                    href: "/admin/roles",
                    color: "bg-indigo-500"
                },
                {
                    title: "Departments",
                    description: "Organize staff into functional departments.",
                    icon: Building,
                    href: "/admin/departments",
                    color: "bg-violet-500"
                }
            ]
        },
        {
            title: "Billing & Operations",
            description: "Configure rates, regions, and service-related fees.",
            items: [
                {
                    title: "Tariffs",
                    description: "Set water consumption rates and fixed service charges.",
                    icon: Receipt,
                    href: "/tariffs",
                    color: "bg-emerald-500"
                },
                {
                    title: "Zones",
                    description: "Manage geographical regions and service areas.",
                    icon: MapPin,
                    href: "/zones",
                    color: "bg-amber-500"
                },
                {
                    title: "Service Charges",
                    description: "Manage installation, reconnection, and inspection fee types.",
                    icon: CreditCard,
                    href: "/admin/settings/service-charges", // We'll need a route for this
                    color: "bg-rose-500"
                }
            ]
        }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System Settings" />

            <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Settings className="h-5 w-5 text-primary" />
                            </div>
                            <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Administration</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight">System Settings</h1>
                        <p className="text-muted-foreground mt-2 max-w-xl">
                            Configure the core billing engine, user access levels, and operational parameters of the Aquabill platform.
                        </p>
                    </div>
                </div>

                <div className="space-y-16">
                    {categories.map((category, idx) => (
                        <div key={idx} className="space-y-6">
                            <div className="border-l-4 border-primary pl-6 py-1">
                                <h2 className="text-2xl font-black tracking-tight">{category.title}</h2>
                                <p className="text-muted-foreground text-sm">{category.description}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {category.items.map((item, i) => (
                                    <SettingCard key={i} {...item} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer / Info */}
                <div className="mt-20 p-8 rounded-[2.5rem] bg-muted/30 border border-dashed flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                    <div className="h-16 w-16 rounded-full bg-background flex items-center justify-center shadow-sm">
                        <Settings className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                        <h4 className="font-bold">Need more customization?</h4>
                        <p className="text-sm text-muted-foreground">Some advanced configuration values are managed via environment variables and system config files.</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}