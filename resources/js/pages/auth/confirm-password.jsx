import AuthLayout from '@/layouts/auth-layout';
import { Head } from '@inertiajs/react';

export default function ConfirmPassword() {
    return (
        <AuthLayout
            title="Password confirmation disabled"
            description="Extra password confirmation is not required in this system."
        >
            <Head title="Confirm password" />
            <p className="mt-6 text-sm text-muted-foreground">
                You can continue using the application without additional password confirmation.
            </p>
        </AuthLayout>
    );
}
