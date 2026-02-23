import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    Calendar,
    MapPin,
    Phone,
    Settings,
    Shield,
    User,
} from 'lucide-react';

export default function ProfileIndex() {
    const { auth } = usePage().props;
    const user = auth.user;

    const breadcrumbs = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
        },
        {
            title: 'Profile',
            href: '#',
        },
    ];

    // Helper to get initials
    const getInitials = (name) => {
        return name
            ?.split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile" />

            <div className="flex flex-col gap-6 p-4 md:p-8">
                {/* Profile Header Card */}
                <Card className="overflow-hidden border-slate-200 shadow-sm">
                    {/* Cover Image */}
                    <div className="h-32 w-full bg-gradient-to-r from-blue-600 to-indigo-600 md:h-48"></div>

                    <CardContent className="relative px-6 pb-6">
                        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
                            <div className="flex flex-col gap-4 md:flex-row md:items-end">
                                {/* Avatar */}
                                <div className="-mt-12 md:-mt-16">
                                    <Avatar className="h-24 w-24 rounded-full border-4 border-white shadow-md md:h-32 md:w-32">
                                        <AvatarImage
                                            src={user.avatar_url} // Assuming avatar_url might exist, else fallback
                                            alt={user.name}
                                        />
                                        <AvatarFallback className="bg-slate-100 text-2xl font-bold text-slate-600">
                                            {getInitials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>

                                {/* User Info */}
                                <div className="mb-1 space-y-1">
                                    <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                                        {user.name}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                        <Badge
                                            variant="secondary"
                                            className="bg-blue-100 text-blue-700 hover:bg-blue-200"
                                        >
                                            {user.department || 'Staff'}
                                        </Badge>
                                        <span className="flex items-center gap-1">
                                            <User className="h-3.5 w-3.5" />
                                            {user.name}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex w-full gap-2 md:w-auto">
                                <Button
                                    asChild
                                    className="w-full gap-2 md:w-auto"
                                >
                                    <Link href={route('profile.edit')}>
                                        <Settings className="h-4 w-4" />
                                        Edit Profile
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Left Column: Personal Info */}
                    <div className="space-y-6 md:col-span-1">
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Shield className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                    <div className="space-y-0.5">
                                        <p className="text-sm leading-none font-medium">
                                            Role
                                        </p>
                                        <p className="text-sm text-muted-foreground capitalize">
                                            {user.role || 'User'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                    <div className="space-y-0.5">
                                        <p className="text-sm leading-none font-medium">
                                            Joined
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDate(user.created_at)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                    <div className="space-y-0.5">
                                        <p className="text-sm leading-none font-medium">
                                            Phone
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {user.phone || 'Not provided'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                    <div className="space-y-0.5">
                                        <p className="text-sm leading-none font-medium">
                                            Location
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Juba, South Sudan
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Activity / Stats */}
                    <div className="space-y-6 md:col-span-2">
                        {/* Stats Grid */}
                        <div className="grid gap-4 sm:grid-cols-3">
                            <Card className="border-slate-200 bg-slate-50">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2">
                                        <Activity className="h-4 w-4 text-primary" />
                                        <span className="text-sm font-medium text-muted-foreground">
                                            Status
                                        </span>
                                    </div>
                                    <div className="text-success mt-2 text-2xl font-bold">
                                        Active
                                    </div>
                                </CardContent>
                            </Card>
                            {/* Placeholder stats */}
                            <Card className="border-slate-200 bg-slate-50">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-primary" />
                                        <span className="text-sm font-medium text-muted-foreground">
                                            ID
                                        </span>
                                    </div>
                                    <div className="mt-2 text-2xl font-bold">
                                        {String(user.id).padStart(4, '0')}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-slate-200 bg-slate-50">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-primary" />
                                        <span className="text-sm font-medium text-muted-foreground">
                                            Department
                                        </span>
                                    </div>
                                    <div className="mt-2 text-xl font-bold capitalize">
                                        {user.department || 'N/A'}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Activity Log Placeholder */}
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Recent Activity
                                </CardTitle>
                                <CardDescription>
                                    Your recent actions and system
                                    notifications.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col gap-4">
                                    {/* This is a static placeholder logic, actual logs would come from backend */}
                                    <div className="flex gap-4">
                                        <div className="relative mt-1">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-background shadow-xs">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div className="absolute top-8 left-4 h-full w-px bg-border"></div>
                                        </div>
                                        <div className="flex flex-col gap-1 pb-4">
                                            <div className="text-sm font-medium">
                                                Profile Updated
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                You updated your profile
                                                information recently.
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {formatDate(user.updated_at)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="relative mt-1">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-background shadow-xs">
                                                <Shield className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div className="text-sm font-medium">
                                                Account Created
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Welcome to SSUWC AquaBill
                                                system.
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {formatDate(user.created_at)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
