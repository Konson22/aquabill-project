import AuthLayout from '@/layouts/auth-layout';
import { Head } from '@inertiajs/react';

export default function VerifyEmail() {
    return (
        <AuthLayout
            title="Email verification disabled"
            description="Email verification is not used in this system."
        >
            <Head title="Email verification" />
            <p className="mt-6 text-sm text-muted-foreground text-center">
                You can continue without verifying your email address.
            </p>
        </AuthLayout>
    );
}
