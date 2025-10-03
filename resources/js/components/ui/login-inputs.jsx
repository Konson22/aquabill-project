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
                <div className="absolute top-1/2 left-3 h-6 w-6 -translate-y-1/2 transform">
                    <Icon className="h-6 w-6 text-blue-400" />
                </div>
            )}
            <input
                type={type}
                className={cn(
                    "h-12 w-full rounded-lg border-0 bg-white/20 pl-12 pr-12 text-white placeholder:text-white/70 focus:bg-white/30 focus:ring-2 focus:ring-white/30 focus:outline-none transition-all duration-200",
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
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-400 transition-colors hover:text-blue-300"
                    onClick={onRightIconClick}
                >
                    <RightIcon className="h-6 w-6" />
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