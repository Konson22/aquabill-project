import InputError from '@/components/input-error';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/login';
import { request as forgotPassword } from '@/routes/password';
import { Form, Head, Link } from '@inertiajs/react';
import { CheckCircle2, ChevronDown, Lock, User } from 'lucide-react';

export default function Login({ status, users = [] }) {
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
                            <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
                                <CheckCircle2 className="h-4 w-4" />
                                <AlertDescription>{status}</AlertDescription>
                            </Alert>
                        )}

                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="user"
                                    className="text-sm font-semibold text-white/90"
                                >
                                    User
                                </Label>
                                <div className="relative">
                                    <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 pointer-events-none text-white/50" />
                                    <ChevronDown className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 pointer-events-none text-white/50" />
                                    <select
                                        id="user"
                                        name="name"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="username"
                                        className={`h-12 w-full rounded-md border bg-white/10 pl-9 pr-10 text-white focus:ring-2 focus:ring-white/30 focus:border-white/30 outline-none appearance-none cursor-pointer ${errors.name ? 'border-destructive focus:ring-destructive' : 'border-white/20'}`}
                                        style={{ colorScheme: 'dark' }}
                                    >
                                        <option value="" className="bg-gray-900 text-white">
                                            Select user
                                        </option>
                                        {users.map((user) => (
                                            <option
                                                key={user.id}
                                                value={user.name}
                                                className="bg-gray-900 text-white"
                                            >
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label
                                        htmlFor="password"
                                        className="text-sm font-semibold text-white/90"
                                    >
                                        Password
                                    </Label>
                                    <Link
                                        href={forgotPassword().url}
                                        className="text-xs font-medium text-white/60 transition-colors hover:text-white hover:underline"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/50" />
                                    <Input
                                        id="password"
                                        type="password"
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                        className={`border-white/20 bg-white/10 pl-9 text-white placeholder:text-white/40 focus-visible:ring-white/30 ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                    />
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="border-white/30 data-[state=checked]:bg-white data-[state=checked]:text-blue-600"
                                />
                                <Label
                                    htmlFor="remember"
                                    className="cursor-pointer text-sm font-medium text-white/70"
                                >
                                    Remember me for 30 days
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full bg-white py-6 text-lg font-bold text-blue-600 shadow-xl hover:bg-white/90"
                                size="lg"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing ? (
                                    <>
                                        <Spinner className="mr-2 text-blue-600" />
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
