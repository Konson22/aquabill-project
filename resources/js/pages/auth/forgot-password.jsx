import { Head } from '@inertiajs/react';
import AuthLayout from '@/layouts/auth-layout';

export default function ForgotPassword() {
    return (
        <AuthLayout
            title="Forgot password disabled"
            description="Password reset is not available in this system."
        >
            <Head title="Forgot password" />
            <p className="mt-6 text-sm text-muted-foreground">
                Contact your administrator if you need help accessing your account.
            </p>
        </AuthLayout>
    );
}
