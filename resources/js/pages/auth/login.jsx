import InputError from '@/components/input-error';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/login';
import { Form, Head } from '@inertiajs/react';
import { CheckCircle2, Lock, User } from 'lucide-react';

export default function Login({ status }) {
    return (
        <AuthLayout
            title="Welcome back"
            description="Sign in to your account to continue"
        >
            <Head title="Log in" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        {status && (
                            <Alert className="border-green-200 bg-green-50 text-green-800">
                                <CheckCircle2 className="h-4 w-4" />
                                <AlertDescription>{status}</AlertDescription>
                            </Alert>
                        )}

                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="username"
                                    className="text-sm font-semibold text-slate-700"
                                >
                                    Username
                                </Label>
                                <div className="relative">
                                    <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 pointer-events-none text-slate-400" />
                                    <Input
                                        id="username"
                                        type="text"
                                        name="name"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="username"
                                        placeholder="Enter your username"
                                        className={`border-slate-200 bg-white pl-9 text-slate-900 placeholder:text-slate-400 shadow-sm focus-visible:ring-slate-300 ${errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                    />
                                </div>
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password"
                                    className="text-sm font-semibold text-slate-700"
                                >
                                    Password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="password"
                                        type="password"
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                        className={`border-slate-200 bg-white pl-9 text-slate-900 placeholder:text-slate-400 shadow-sm focus-visible:ring-slate-300 ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                    />
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                                />
                                <Label
                                    htmlFor="remember"
                                    className="cursor-pointer text-sm font-medium text-slate-600"
                                >
                                    Remember me for 30 days
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full bg-blue-600 py-6 text-lg font-bold text-white shadow-lg hover:bg-blue-700"
                                size="lg"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing ? (
                                    <>
                                        <Spinner className="mr-2 text-white" />
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign in'
                                )}
                            </Button>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
