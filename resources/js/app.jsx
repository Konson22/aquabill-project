import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';



const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        if (name == null || String(name).trim() === '') {
            return Promise.reject(new Error('Inertia page name is missing — check Inertia::render() on the server.'));
        }

        const pages = import.meta.glob('./pages/**/*.{jsx,tsx}');
        const normalized = String(name).replace(/\\/g, '/').trim();
        const needle = `/pages/${normalized}.`;
        const path = Object.keys(pages).find((p) => p.replace(/\\/g, '/').includes(needle));

        if (path == null) {
            return Promise.reject(
                new Error(`Inertia page not found: "${normalized}" (expected resources/js/pages/${normalized}.jsx or .tsx).`),
            );
        }

        return resolvePageComponent(path, pages);
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
