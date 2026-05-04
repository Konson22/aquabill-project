
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

/** Application currency (South Sudanese Pound). */
export const CURRENCY_CODE = 'SSP';

/**
 * Formats an amount in SSP for display across the app.
 *
 * @param {number|string} amount - The amount to format
 * @returns {string} e.g. "1,234.56 SSP"
 */
export function formatCurrency(amount) {
    const n = Number(amount ?? 0);

    if (!Number.isFinite(n)) {
        return `0.00 ${CURRENCY_CODE}`;
    }

    return `${n.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })} ${CURRENCY_CODE}`;
}

/**
 * Compact SSP labels for chart axes (e.g. "12k SSP", "1.2M SSP").
 *
 * @param {number|string} value
 * @returns {string}
 */
export function formatCurrencyCompact(value) {
    const n = Number(value ?? 0);

    if (!Number.isFinite(n)) {
        return `0 ${CURRENCY_CODE}`;
    }

    if (n >= 1_000_000) {
        return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M ${CURRENCY_CODE}`;
    }

    if (n >= 1_000) {
        return `${Math.round(n / 1_000)}k ${CURRENCY_CODE}`;
    }

    return formatCurrency(n);
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
