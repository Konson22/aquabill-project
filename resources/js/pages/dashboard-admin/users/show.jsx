import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Calendar, Shield, Trash2 } from 'lucide-react';

export default function UserShow({ user }) {
    const { delete: destroy } = useForm();

    const handleDelete = () => {
        destroy(route('users.destroy', user.id));
    };

    const breadcrumbs = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
        },
        {
            title: 'Users',
            href: route('users.index'),
        },
        {
            title: user.name,
            href: route('users.show', user.id),
        },
    ];

    const getInitials = (name) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            asChild
                        >
                            <Link href={route('users.index')}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                User Profile
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Manage user details and permissions
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete User
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Are you absolutely sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will
                                        permanently delete the user account
                                        related data.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDelete}
                                        className="bg-red-600 hover:bg-red-700"
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* User Profile Card */}
                    <Card className="col-span-full lg:col-span-1">
                        <CardHeader className="flex flex-row items-center gap-4 pb-2">
                            <div className="grid h-16 w-16 place-items-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                                {getInitials(user.name)}
                            </div>
                            <div className="flex flex-col">
                                <CardTitle>{user.name}</CardTitle>
                                <CardDescription className="flex items-center gap-2">
                                    <Badge
                                        variant="outline"
                                        className="mt-1 w-fit capitalize"
                                    >
                                        {user.department}
                                    </Badge>
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="mt-4 grid gap-4">
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>
                                        Joined {formatDate(user.created_at)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Shield className="h-4 w-4 text-muted-foreground" />
                                    <span className="capitalize">
                                        Role: {user.department}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Detailed Info Card */}
                    <Card className="col-span-full lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Account Information</CardTitle>
                            <CardDescription>
                                Detailed information about this user.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <p className="text-sm leading-none font-medium text-muted-foreground">
                                        Full Name
                                    </p>
                                    <p className="text-sm font-semibold">
                                        {user.name}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm leading-none font-medium text-muted-foreground">
                                        Department
                                    </p>
                                    <p className="text-sm font-semibold capitalize">
                                        {user.department}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm leading-none font-medium text-muted-foreground">
                                        Status
                                    </p>
                                    <Badge>Active</Badge>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h4 className="text-sm leading-none font-medium">
                                    System Metadata
                                </h4>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-1">
                                        <p className="text-sm leading-none font-medium text-muted-foreground">
                                            Created At
                                        </p>
                                        <p className="text-sm text-foreground">
                                            {new Date(
                                                user.created_at,
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm leading-none font-medium text-muted-foreground">
                                            Last Updated
                                        </p>
                                        <p className="text-sm text-foreground">
                                            {new Date(
                                                user.updated_at,
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
