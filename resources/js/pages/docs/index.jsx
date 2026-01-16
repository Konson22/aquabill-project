import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import {
    BookOpen,
    CircleHelp,
    Code,
    CreditCard,
    Download,
    Droplets,
    FileText,
    Search,
    Settings,
    Shield,
    Users,
} from 'lucide-react';

export default function DocsIndex() {
    const breadcrumbs = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
        },
        {
            title: 'Documentation',
            href: route('docs.index'),
        },
    ];

    const sections = [
        {
            title: 'Getting Started',
            description:
                'Introduction to Aquabill, system requirements, and basic navigation.',
            icon: <BookOpen className="h-6 w-6 text-blue-500" />,
            href: route('docs.system'),
            badge: 'New',
        },
        {
            title: 'Billing & Invoicing',
            description:
                'Creating bills, managing invoices, generating receipts, and payment processing.',
            icon: <CreditCard className="h-6 w-6 text-emerald-500" />,
            href: '#',
        },
        {
            title: 'Meter Management',
            description:
                'Registering meters, recording readings, and managing meter assignments.',
            icon: <Droplets className="h-6 w-6 text-cyan-500" />,
            href: '#',
        },
        {
            title: 'Customer Management',
            description:
                'Managing customer profiles, home connections, and service history.',
            icon: <Users className="h-6 w-6 text-indigo-500" />,
            href: '#',
        },
        {
            title: 'Reports & Analytics',
            description:
                'Generating financial reports, consumption analytics, and zone performance.',
            icon: <FileText className="h-6 w-6 text-amber-500" />,
            href: '#',
        },
        {
            title: 'System Administration',
            description:
                'User management, roles & permissions, zones configuration, and audit logs.',
            icon: <Shield className="h-6 w-6 text-red-500" />,
            href: '#',
        },
        {
            title: 'Developer API',
            description:
                'API reference, authentication, and integration guides for 3rd party apps.',
            icon: <Code className="h-6 w-6 text-slate-500" />,
            href: '#',
            badge: 'Tech',
        },
        {
            title: 'Support & FAQ',
            description:
                'Common troubleshooting steps, contact support, and release notes.',
            icon: <CircleHelp className="h-6 w-6 text-purple-500" />,
            href: '#',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Documentation" />

            <div className="mx-auto w-full max-w-6xl space-y-8">
                {/* Hero Section */}
                <div className="flex flex-col gap-4 text-center md:text-left">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold tracking-tight">
                            Documentation & Support
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Welcome to the Aquabill knowledge base. Find guides,
                            references, and troubleshooting tips.
                        </p>
                    </div>
                    <div className="flex w-full items-center gap-4">
                        <div className="relative w-full max-w-xl">
                            <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search documentation..."
                                className="pl-9"
                            />
                        </div>
                        <Button variant="outline" className="hidden sm:flex">
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                        </Button>
                    </div>
                </div>

                <Separator />

                {/* Topics Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {sections.map((section, index) => (
                        <Card
                            key={index}
                            className="group relative overflow-hidden transition-all hover:border-primary/50 hover:shadow-sm"
                        >
                            <CardHeader>
                                <div className="mb-2 flex items-center justify-between">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/50 transition-colors group-hover:bg-secondary">
                                        {section.icon}
                                    </div>
                                    {section.badge && (
                                        <Badge variant="secondary">
                                            {section.badge}
                                        </Badge>
                                    )}
                                </div>
                                <CardTitle className="text-lg">
                                    {section.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>
                                    {section.description}
                                </CardDescription>
                            </CardContent>
                            <a href={section.href} className="absolute inset-0">
                                <span className="sr-only">
                                    View {section.title}
                                </span>
                            </a>
                        </Card>
                    ))}
                </div>

                {/* Quick Help Section */}
                <div className="mt-12 rounded-xl bg-slate-50 p-6 dark:bg-slate-900/50">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/30">
                                <Settings className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">
                                    Need direct assistance?
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Contact the IT Support team for urgent
                                    system issues.
                                </p>
                            </div>
                        </div>
                        <Badge variant="outline" className="h-9 px-4 text-sm">
                            support@aquabill.com
                        </Badge>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
