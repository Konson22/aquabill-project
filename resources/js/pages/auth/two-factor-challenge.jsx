import AuthLayout from '@/layouts/auth-layout';
import { Head } from '@inertiajs/react';

export default function TwoFactorChallenge() {
    return (
        <AuthLayout
            title="Two-factor authentication disabled"
            description="Two-factor authentication is not enabled in this system."
        >
            <Head title="Two-Factor Authentication" />
            <p className="mt-6 text-sm text-muted-foreground">
                You can sign in using your username and password only.
            </p>
        </AuthLayout>
    );
}
