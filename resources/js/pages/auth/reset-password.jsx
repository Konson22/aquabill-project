import { Head } from '@inertiajs/react';
import AuthLayout from '@/layouts/auth-layout';

export default function ResetPassword() {
    return (
        <AuthLayout
            title="Reset password disabled"
            description="Password reset is not available in this system."
        >
            <Head title="Reset password" />
            <p className="mt-6 text-sm text-muted-foreground">
                Contact your administrator if you need help updating your password.
            </p>
        </AuthLayout>
    );
}
