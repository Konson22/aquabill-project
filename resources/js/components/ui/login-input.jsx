import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

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
                    <Icon className="h-5 w-5 text-white" />
                </div>
            )}
            <input
                type={type}
                className={cn(
                    "h-12 w-full rounded-xl border-0 bg-white/20 pl-12 pr-12 text-white placeholder:text-white/70 focus:bg-white/30 focus:ring-2 focus:ring-white/30 focus:outline-none transition-all duration-200",
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
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/70 transition-colors hover:text-white"
                    onClick={onRightIconClick}
                >
                    <RightIcon className="h-5 w-5" />
                </button>
            )}
        </div>
    );
});

LoginInput.displayName = 'LoginInput';

export { LoginInput };
