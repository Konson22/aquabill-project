
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

/**
 * Formats a number to a compact string (e.g., 1000 -> 1K)
 * @param {number} value - The number to format
 * @returns {string} Compactly formatted string
 */
export function formatCompactNumber(value) {
    if (value >= 1000000) {
        return (value / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (value >= 1000) {
        return (value / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return value.toString();
}
