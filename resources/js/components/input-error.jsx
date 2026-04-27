import { cn } from '@/lib/utils';

export default function InputError({ message, className = '', ...props }) {
    return message ? (
        <p {...props} className={cn('text-sm text-orange-600 dark:text-orange-400', className)}>
            {message}
        </p>
    ) : null;
}
