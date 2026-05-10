import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, CircleDot, GitBranch, Globe2, Droplets, Map, Users } from 'lucide-react';

export default function GisDashboard() {
    const breadcrumbs = [{ title: 'GIS', href: route('gis.dashboard') }];

    const sections = [
        {
            title: 'Infrastructure map',
            description: 'Satellite view of water points, customers, pipes, and valves with filters.',
            href: route('gis.map'),
            icon: Map,
        },
        {
            title: 'Water point types',
            description: 'Manage categories used for GIS water points.',
            href: route('gis.water-point-types.index'),
            icon: BookOpen,
        },
        {
            title: 'Water points',
            description: 'List, create, and edit water points and meters on the network.',
            href: route('gis.water-points.index'),
            icon: Droplets,
        },
        {
            title: 'Pipes',
            description: 'Pipe segments and paths on the map.',
            href: route('gis.pipes.index'),
            icon: GitBranch,
        },
        {
            title: 'Valves',
            description: 'Valve locations and linkage to pipes.',
            href: route('gis.valves.index'),
            icon: CircleDot,
        },
        {
            title: 'Customers',
            description: 'Billing accounts; coordinates appear on the GIS map when set.',
            href: route('customers.index'),
            icon: Users,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="GIS" />

            <div className="flex h-full flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Globe2 className="h-7 w-7 text-sky-600" />
                        GIS
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Open the map or manage water infrastructure data for Juba, South Sudan.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {sections.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Card key={item.href} className="flex flex-col">
                                <CardHeader>
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0 space-y-1">
                                            <CardTitle className="text-lg">{item.title}</CardTitle>
                                            <CardDescription>{item.description}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="mt-auto pt-0">
                                    <Button variant="secondary" className="w-full" asChild>
                                        <Link href={item.href}>Open</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}
