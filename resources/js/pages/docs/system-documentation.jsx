import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Server, Shield, Zap } from 'lucide-react';

export default function SystemDocumentation() {
    const breadcrumbs = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
        },
        {
            title: 'Documentation',
            href: route('docs.index'),
        },
        {
            title: 'System Overview',
            href: route('docs.system'),
        },
    ];

    const modules = [
        {
            title: 'Billing Engine',
            description:
                'Automated invoicing generation based on meter readings and tariff configurations.',
            icon: <Zap className="h-5 w-5 text-amber-500" />,
        },
        {
            title: 'Meter Management',
            description:
                'Digital tracking of water meters, readings history, and anomaly detection.',
            icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
        },
        {
            title: 'User Roles & Security',
            description:
                'Role-based access control (RBAC) ensuring data privacy and operational security.',
            icon: <Shield className="h-5 w-5 text-blue-500" />,
        },
        {
            title: 'Cloud Infrastructure',
            description:
                'Scalable database and application server setup for high availability.',
            icon: <Server className="h-5 w-5 text-purple-500" />,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System Documentation" />

            <div className="mx-auto max-w-5xl">
                <div className="mb-8">
                    <Link
                        href={route('docs.index')}
                        className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-primary"
                    >
                        <ArrowLeft className="mr-1 h-3 w-3" />
                        Back to Documentation Hub
                    </Link>
                    <h1 className="scroll-m-20 text-3xl font-bold tracking-tight text-slate-900">
                        System Documentation
                    </h1>
                    <p className="mt-2 text-lg text-muted-foreground">
                        Technical overview, installation usage, and
                        architectural specifications for the Aquabill Management
                        System.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_250px]">
                    <div className="space-y-10">
                        {/* Introduction */}
                        <section id="introduction" className="space-y-4">
                            <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                                1. Introduction
                            </h2>
                            <p className="leading-7 text-muted-foreground">
                                Aquabill is a comprehensive water utility
                                management platform designed to streamline
                                operations for water service providers. It
                                integrates customer management, billing, meter
                                reading, and payment processing into a unified,
                                user-friendly interface.
                            </p>
                        </section>

                        <Separator />

                        {/* Installation & Setup */}
                        <section id="installation" className="space-y-4">
                            <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                                2. Installation & Setup
                            </h2>
                            <p className="leading-7 text-muted-foreground">
                                Follow these steps to set up the Aquabill system
                                on your local or production environment.
                            </p>

                            <h3 className="mt-6 text-xl font-semibold tracking-tight">
                                Prerequisites
                            </h3>
                            <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
                                <li>PHP 8.1 or higher</li>
                                <li>Composer</li>
                                <li>Node.js & NPM</li>
                                <li>MySQL or PostgreSQL Database</li>
                            </ul>

                            <h3 className="mt-6 text-xl font-semibold tracking-tight">
                                Step-by-Step Installation
                            </h3>
                            <div className="space-y-4">
                                <div className="rounded-md bg-slate-950 p-4 font-mono text-sm text-slate-50">
                                    <p className="text-slate-400">
                                        # Clone the repository
                                    </p>
                                    <p>
                                        git clone
                                        https://github.com/aquabill/aquabill-system.git
                                    </p>

                                    <p className="mt-4 text-slate-400">
                                        # Install PHP dependencies
                                    </p>
                                    <p>composer install</p>

                                    <p className="mt-4 text-slate-400">
                                        # Install JavaScript dependencies
                                    </p>
                                    <p>npm install</p>

                                    <p className="mt-4 text-slate-400">
                                        # Setup environment environment
                                    </p>
                                    <p>cp .env.example .env</p>
                                    <p>php artisan key:generate</p>
                                </div>
                            </div>
                        </section>

                        <Separator />

                        {/* Configuration */}
                        <section id="configuration" className="space-y-4">
                            <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                                3. Configuration
                            </h2>
                            <p className="leading-7 text-muted-foreground">
                                Configure your database connection and other
                                environment variables in the{' '}
                                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                                    .env
                                </code>{' '}
                                file.
                            </p>
                            <div className="rounded-md bg-slate-950 p-4 font-mono text-sm text-slate-50">
                                <p>DB_CONNECTION=mysql</p>
                                <p>DB_HOST=127.0.0.1</p>
                                <p>DB_PORT=3306</p>
                                <p>DB_DATABASE=aquabill_db</p>
                                <p>DB_USERNAME=root</p>
                                <p>DB_PASSWORD=</p>
                            </div>
                            <p className="mt-4 leading-7 text-muted-foreground">
                                After configuration, run the database migrations
                                and seeders:
                            </p>
                            <div className="rounded-md bg-slate-950 p-4 font-mono text-sm text-slate-50">
                                <p>php artisan migrate --seed</p>
                            </div>
                        </section>

                        <Separator />

                        {/* Core Modules */}
                        <section id="modules" className="space-y-6">
                            <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                                4. Core Modules
                            </h2>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {modules.map((module, idx) => (
                                    <Card key={idx}>
                                        <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/50">
                                                {module.icon}
                                            </div>
                                            <CardTitle className="text-base">
                                                {module.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground">
                                                {module.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </section>

                        <Separator />

                        {/* Technical Architecture */}
                        <section id="architecture" className="space-y-4">
                            <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                                5. Technical Architecture
                            </h2>
                            <p className="leading-7 text-muted-foreground">
                                The system is built using a modern stack
                                prioritizing performance on reliability.
                            </p>
                            <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
                                <li>
                                    <strong className="text-foreground">
                                        Frontend:
                                    </strong>{' '}
                                    React.js with Inertia.js for seamless SPA
                                    experience.
                                </li>
                                <li>
                                    <strong className="text-foreground">
                                        Backend:
                                    </strong>{' '}
                                    Laravel (PHP) acting as the robust API and
                                    controller layer.
                                </li>
                                <li>
                                    <strong className="text-foreground">
                                        Database:
                                    </strong>{' '}
                                    MySQL/PostgreSQL for relational data
                                    storage.
                                </li>
                                <li>
                                    <strong className="text-foreground">
                                        Styling:
                                    </strong>{' '}
                                    Tailwind CSS for utility-first, responsive
                                    design.
                                </li>
                            </ul>
                        </section>

                        <Separator />

                        {/* Deployment */}
                        <section id="deployment" className="space-y-4">
                            <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                                6. Deployment
                            </h2>
                            <p className="leading-7 text-muted-foreground">
                                For production deployment, ensure you optimize
                                the application:
                            </p>
                            <div className="rounded-md bg-slate-950 p-4 font-mono text-sm text-slate-50">
                                <p className="text-slate-400">
                                    # Optimize autoloader
                                </p>
                                <p>
                                    composer install --optimize-autoloader
                                    --no-dev
                                </p>

                                <p className="mt-4 text-slate-400">
                                    # Cache configuration and routes
                                </p>
                                <p>php artisan config:cache</p>
                                <p>php artisan route:cache</p>
                                <p>php artisan view:cache</p>

                                <p className="mt-4 text-slate-400">
                                    # Build frontend assets for production
                                </p>
                                <p>npm run build</p>
                            </div>
                        </section>

                        <Separator />

                        {/* Version Control */}
                        <section id="versioning" className="space-y-4">
                            <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                                7. Versioning & Changelog
                            </h2>
                            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                                <div className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="font-medium">
                                                v1.0.0 - Initial Release
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                January 15, 2026
                                            </p>
                                        </div>
                                        <Badge>Current</Badge>
                                    </div>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Core features release: Billing,
                                        Invoicing, Meter Readings, and User
                                        Management.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Table of Contents Sidebar */}
                    <div className="hidden md:block">
                        <div className="sticky top-6">
                            <h4 className="mb-4 text-sm font-semibold tracking-tight">
                                On this page
                            </h4>
                            <nav className="flex flex-col space-y-2 text-sm text-muted-foreground">
                                <a
                                    href="#introduction"
                                    className="hover:text-primary hover:underline"
                                >
                                    Introduction
                                </a>
                                <a
                                    href="#installation"
                                    className="hover:text-primary hover:underline"
                                >
                                    Installation
                                </a>
                                <a
                                    href="#configuration"
                                    className="hover:text-primary hover:underline"
                                >
                                    Configuration
                                </a>
                                <a
                                    href="#modules"
                                    className="hover:text-primary hover:underline"
                                >
                                    Core Modules
                                </a>
                                <a
                                    href="#architecture"
                                    className="hover:text-primary hover:underline"
                                >
                                    Technical Architecture
                                </a>
                                <a
                                    href="#deployment"
                                    className="hover:text-primary hover:underline"
                                >
                                    Deployment
                                </a>
                                <a
                                    href="#versioning"
                                    className="hover:text-primary hover:underline"
                                >
                                    Versioning
                                </a>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
