import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Mail, Building2, Shield, Activity, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

type ProfileForm = {
    name: string;
    email: string;
}

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<Required<ProfileForm>>({
        name: auth.user.name,
        email: auth.user.email,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'), {
            preserveScroll: true,
        });
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getRoleBadgeColor = (roleName: string) => {
        switch (roleName.toLowerCase()) {
            case 'admin':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case 'manager':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'user':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-8">
                    {/* Profile Header */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center space-x-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                    <AvatarFallback className="text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                        {getInitials(auth.user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <CardTitle className="text-2xl">{auth.user.name}</CardTitle>
                                    <CardDescription className="text-base">
                                        {auth.user.department?.name || 'No Department Assigned'}
                                    </CardDescription>
                                    <div className="flex items-center space-x-2 mt-2">
                                        <Badge
                                            variant={auth.user.status === 'active' ? 'default' : 'secondary'}
                                            className={auth.user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                                        >
                                            {auth.user.status === 'active' ? (
                                                <><CheckCircle className="w-3 h-3 mr-1" /> Active</>
                                            ) : (
                                                <><AlertCircle className="w-3 h-3 mr-1" /> Inactive</>
                                            )}
                                        </Badge>
                                        {auth.user.roles && auth.user.roles.length > 0 && (
                                            <Badge className={getRoleBadgeColor(auth.user.roles[0].name)}>
                                                <Shield className="w-3 h-3 mr-1" />
                                                {auth.user.roles[0].name}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>

                    {/* Account Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Activity className="w-5 h-5 mr-2" />
                                Account Information
                            </CardTitle>
                            <CardDescription>
                                Your account details and system information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-3">
                                    <Mail className="w-4 h-4 text-gray-500" />
                                    <div>
                                        <p className="text-sm font-medium">Email Address</p>
                                        <p className="text-sm text-gray-600">{auth.user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Building2 className="w-4 h-4 text-gray-500" />
                                    <div>
                                        <p className="text-sm font-medium">Department</p>
                                        <p className="text-sm text-gray-600">{auth.user.department?.name || 'Not assigned'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    <div>
                                        <p className="text-sm font-medium">Member Since</p>
                                        <p className="text-sm text-gray-600">{formatDate(auth.user.created_at)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Clock className="w-4 h-4 text-gray-500" />
                                    <div>
                                        <p className="text-sm font-medium">Last Updated</p>
                                        <p className="text-sm text-gray-600">{formatDate(auth.user.updated_at)}</p>
                                    </div>
                                </div>
                            </div>

                            {auth.user.email_verified_at ? (
                                <div className="flex items-center space-x-2 text-green-600">
                                    <CheckCircle className="w-4 h-4" />
                                    <span className="text-sm">Email verified on {formatDate(auth.user.email_verified_at)}</span>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2 text-amber-600">
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="text-sm">Email not verified</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Role Information */}
                    {auth.user.roles && auth.user.roles.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Shield className="w-5 h-5 mr-2" />
                                    Role & Permissions
                                </CardTitle>
                                <CardDescription>
                                    Your assigned roles and permissions in the system
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {auth.user.roles.map((role, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <Shield className="w-4 h-4 text-gray-500" />
                                                <div>
                                                    <p className="font-medium">{role.name}</p>
                                                    <p className="text-sm text-gray-600">Role assigned on {formatDate(role.created_at)}</p>
                                                </div>
                                            </div>
                                            <Badge className={getRoleBadgeColor(role.name)}>
                                                {role.name}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Profile Settings Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Settings</CardTitle>
                            <CardDescription>
                                Update your personal information and account details
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        className="mt-1 block w-full"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                        autoComplete="name"
                                        placeholder="Enter your full name"
                                    />
                                    <InputError className="mt-2" message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                        autoComplete="username"
                                        placeholder="Enter your email address"
                                    />
                                    <InputError className="mt-2" message={errors.email} />
                                </div>

                                {mustVerifyEmail && auth.user.email_verified_at === null && (
                                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                        <div className="flex items-start space-x-3">
                                            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-sm text-amber-800 dark:text-amber-200">
                                                    Your email address is unverified. Please verify your email to access all features.
                                                </p>
                                                <Link
                                                    href={route('verification.send')}
                                                    method="post"
                                                    as="button"
                                                    className="mt-2 text-sm text-amber-600 hover:text-amber-800 underline"
                                                >
                                                    Resend verification email
                                                </Link>
                                                {status === 'verification-link-sent' && (
                                                    <div className="mt-2 text-sm font-medium text-green-600">
                                                        A new verification link has been sent to your email address.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                        <Transition
                                            show={recentlySuccessful}
                                            enter="transition ease-in-out"
                                            enterFrom="opacity-0"
                                            leave="transition ease-in-out"
                                            leaveTo="opacity-0"
                                        >
                                            <span className="ml-3 text-sm text-green-600">Changes saved successfully!</span>
                                        </Transition>
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Account Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-red-600">Danger Zone</CardTitle>
                            <CardDescription>
                                Irreversible and destructive actions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DeleteUser />
                        </CardContent>
                    </Card>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
