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
                <div className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform">
                    <Icon className="h-5 w-5 text-gray-400" />
                </div>
            )}
            <input
                type={type}
                className={cn(
                    "h-12 w-full rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200",
                    Icon ? "pl-11" : "pl-4",
                    RightIcon ? "pr-11" : "pr-4",
                    className
                )}
                ref={ref}
                {...props}
            />
            {RightIcon && (
                <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors hover:text-gray-600"
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
            icon={User}
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