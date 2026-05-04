import AppLayout from '@/layouts/app-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, Edit, KeySquare, LogIn, Shield, UserCog, Building, Activity, Droplet } from 'lucide-react';

export default function UserShow({ user }) {
    const initials = user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'User Management', href: '/admin/users' },
                { title: user.name, href: `/admin/users/${user.id}` },
            ]}
        >
            <Head title={`${user.name} - User Details`} />

            <div className="flex h-full flex-col gap-6 p-6">
                {/* Header Section */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild className="h-8 w-8">
                            <Link href="/admin/users">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                                User Details
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                View and manage information for {user.name}.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                            <KeySquare className="mr-2 h-4 w-4" />
                            Reset Password
                        </Button>
                        <Button size="sm">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit User
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Left Column: Profile Card */}
                    <div className="md:col-span-1 space-y-6">
                        <Card className="border-border shadow-sm">
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center text-center">
                                    <Avatar className="h-24 w-24 mb-4 ring-2 ring-primary/10">
                                        <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`} />
                                        <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                                    </Avatar>
                                    <h2 className="text-xl font-bold">{user.name}</h2>
                                    <p className="text-sm text-muted-foreground mb-4">{user.email}</p>
                                    
                                    <Badge
                                        variant={(user.status ?? 'active') === 'active' ? 'success' : 'secondary'}
                                        className="capitalize mb-4"
                                    >
                                        {user.status ?? 'active'}
                                    </Badge>

                                    <div className="w-full flex justify-between items-center py-3 border-t">
                                        <span className="text-sm text-muted-foreground">ID</span>
                                        <span className="font-medium text-sm">#{user.id}</span>
                                    </div>
                                    <div className="w-full flex justify-between items-center py-3 border-t">
                                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                                            <Calendar className="h-3 w-3" /> Joined
                                        </span>
                                        <span className="font-medium text-sm">
                                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Details & Access */}
                    <div className="md:col-span-2 space-y-6">
                        <Card className="border-border shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-primary" />
                                    Access & Roles
                                </CardTitle>
                                <CardDescription>
                                    Department assignment and system permissions.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                                        <Building className="h-4 w-4" /> Department
                                    </h3>
                                    {user.department ? (
                                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border">
                                            <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                                                <Building className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium capitalize">{user.department.name}</p>
                                                <p className="text-xs text-muted-foreground">Primary Assignment</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm italic text-muted-foreground p-3 bg-muted/20 rounded-lg border">
                                            No department assigned.
                                        </p>
                                    )}
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                                        <UserCog className="h-4 w-4" /> Assigned Roles
                                    </h3>
                                    {user.roles && user.roles.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {user.roles.map((role) => (
                                                <Badge key={role.id} variant="secondary" className="px-3 py-1">
                                                    {role.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm italic text-muted-foreground p-3 bg-muted/20 rounded-lg border">
                                            No special roles assigned.
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {(user.performance?.readings_count > 0 || ['customer_care', 'ledger'].includes(user.department?.name) || user.roles?.some(r => r.name === 'Meter Reader')) && (
                            <Card className="border-border shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Activity className="h-5 w-5 text-primary" />
                                        Performance Overview
                                    </CardTitle>
                                    <CardDescription>
                                        Key metrics and activity for this user.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        {(user.performance?.readings_count > 0 || user.roles?.some(r => r.name === 'Meter Reader')) && (
                                            <div className="flex flex-col gap-1 p-4 bg-muted/30 rounded-lg border">
                                                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                                    <Droplet className="h-4 w-4" />
                                                    <span className="text-sm font-medium">Readings Taken</span>
                                                </div>
                                                <span className="text-2xl font-bold">{user.performance?.readings_count || 0}</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card className="border-border shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <LogIn className="h-5 w-5 text-primary" />
                                    Recent Activity
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                <LogIn className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">Last Login</p>
                                                <p className="text-xs text-muted-foreground">System Access</p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-medium">
                                            {user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never logged in'}
                                        </span>
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
