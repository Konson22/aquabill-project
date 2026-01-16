import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import ReactDOMServer from 'react-dom/server';

const appName = import.meta.env.VITE_APP_NAME || 'SSUWC billing system';

const pages = import.meta.glob('./pages/**/*.jsx');

createServer((page) =>
    createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        title: (title) => (title ? `${title} - ${appName}` : appName),
        resolve: (name) => {
            return resolvePageComponent(`./pages/${name}.jsx`, pages);
        },
        setup: ({ App, props }) => {
            return <App {...props} />;
        },
    }),
);
