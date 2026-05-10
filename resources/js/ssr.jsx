/* prettier-ignore */
import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import ReactDOMServer from 'react-dom/server';

createServer((page) =>
    createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        resolve: (name) => {
            const pages = import.meta.glob('./pages/**/*.{jsx,tsx}');
            const path = Object.keys(pages).find((p) => p.toLowerCase().startsWith(`./pages/${name.toLowerCase()}.`));
            return resolvePageComponent(path, pages);
        },
        // prettier-ignore
        setup: ({ App, props }) => <App {...props} />,
    }),
);
