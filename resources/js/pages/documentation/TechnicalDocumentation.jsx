import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function TechnicalDocumentation() {
    return (
        <AppLayout>
            <Head title="Technical Documentation" />
            <div className="mx-auto max-w-4xl space-y-6">
                <header>
                    <h1 className="scroll-m-20 text-3xl font-bold tracking-tight">
                        Technical Documentation
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        System overview, architecture, data model, and
                        backup/security procedures for the Aquabill platform.
                    </p>
                </header>
            </div>
        </AppLayout>
    );
}

