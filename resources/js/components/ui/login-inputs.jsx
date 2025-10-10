import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

const LoginInput = forwardRef(({ 
    className, 
    type = 'text', 
    icon: Icon, 
    rightIcon: RightIcon,
    onRightIconClick,
    ...props 
}, ref) => {
    return (
        <div className="relative">
            {Icon && (
                <div className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform">
                    <Icon className="h-5 w-5 text-blue-500" />
                </div>
            )}
            <input
                type={type}
                className={cn(
                    "h-14 w-full rounded-xl border-2 border-slate-200 bg-white pl-12 pr-12 text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-300 hover:border-slate-300",
                    Icon && "pl-12",
                    RightIcon && "pr-12",
                    !Icon && !RightIcon && "px-4",
                    className
                )}
                ref={ref}
                {...props}
            />
            {RightIcon && (
                <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-500 transition-colors hover:text-blue-600 hover:bg-blue-50 rounded-r-xl"
                    onClick={onRightIconClick}
                >
                    <RightIcon className="h-5 w-5" />
                </button>
            )}
        </div>
    );
});

LoginInput.displayName = 'LoginInput';

// Specific input components for different types
const LoginEmailInput = forwardRef(({ className, ...props }, ref) => {
    return (
        <LoginInput
            ref={ref}
            type="email"
            icon={Mail}
            placeholder="Username"
            className={className}
            {...props}
        />
    );
});

LoginEmailInput.displayName = 'LoginEmailInput';

const LoginPasswordInput = forwardRef(({ className, showPassword, onTogglePassword, ...props }, ref) => {
    return (
        <LoginInput
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            icon={Lock}
            placeholder="Password"
            rightIcon={showPassword ? EyeOff : Eye}
            onRightIconClick={onTogglePassword}
            className={className}
            {...props}
        />
    );
});

LoginPasswordInput.displayName = 'LoginPasswordInput';

const LoginUsernameInput = forwardRef(({ className, ...props }, ref) => {
    return (
        <LoginInput
            ref={ref}
            type="text"
            icon={User}
            placeholder="Username"
            className={className}
            {...props}
        />
    );
});

LoginUsernameInput.displayName = 'LoginUsernameInput';

export { 
    LoginInput, 
    LoginEmailInput, 
    LoginPasswordInput, 
    LoginUsernameInput 
};