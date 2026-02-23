import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, Lock, Palette, User } from 'lucide-react';

export default function SettingsIndex() {
    const breadcrumbs = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
        },
        {
            title: 'Settings',
            href: route('settings.index'),
        },
    ];

    const settingsGroups = [
        {
            title: 'Account',
            items: [
                {
                    title: 'Profile Information',
                    description:
                        'Update your account profile information.',
                    icon: <User className="h-6 w-6 text-blue-500" />,
                    href: route('profile.edit'),
                },
                {
                    title: 'Password',
                    description:
                        'Ensure your account is using a long, random password to stay secure.',
                    icon: <Lock className="h-6 w-6 text-red-500" />,
                    href: route('user-password.edit'),
                },
            ],
        },
        {
            title: 'Preferences',
            items: [
                {
                    title: 'Appearance',
                    description:
                        'Customize the look and feel of the application.',
                    icon: <Palette className="h-6 w-6 text-purple-500" />,
                    href: route('appearance.edit'),
                },
            ],
        },
        {
            title: 'Support',
            items: [
                {
                    title: 'Documentation',
                    description:
                        'Read the documentation to learn how to use the system.',
                    icon: <BookOpen className="h-6 w-6 text-amber-500" />,
                    href: route('docs.index'),
                },
            ],
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Settings" />

            <div className="mx-auto w-full max-w-5xl space-y-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Settings
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your account settings and preferences.
                    </p>
                </div>

                <div className="space-y-8">
                    {settingsGroups.map((group, groupIndex) => (
                        <div key={groupIndex} className="space-y-4">
                            <h2 className="text-lg font-semibold tracking-tight">
                                {group.title}
                            </h2>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {group.items.map((item, itemIndex) => (
                                    <Link
                                        key={itemIndex}
                                        href={item.href}
                                        className="group block"
                                    >
                                        <Card className="h-full transition-all hover:border-primary/50 hover:shadow-sm">
                                            <CardHeader className="pb-2">
                                                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/50 transition-colors group-hover:bg-secondary">
                                                    {item.icon}
                                                </div>
                                                <CardTitle className="text-base">
                                                    {item.title}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <CardDescription className="text-xs">
                                                    {item.description}
                                                </CardDescription>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
