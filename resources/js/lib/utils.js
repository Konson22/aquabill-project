
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function isSameUrl(
    url1,
    url2,
) {
    return resolveUrl(url1) === resolveUrl(url2);
}

export function resolveUrl(url) {
    return typeof url === 'string' ? url : url.url;
}

/**
 * Formats a number as South Sudanese Pound (SSP) currency
 * @param {number|string} amount - The amount to format
 * @returns {string} Formatted currency string (e.g., "1,234.56 SSP")
 */
export function formatCurrency(amount) {
    return `${Number(amount || 0).toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })} SSP`;
}
