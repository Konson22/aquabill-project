import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function QuickReferences() {
    return (
        <AppLayout>
            <Head title="Quick References & FAQs" />
            <div className="mx-auto max-w-4xl space-y-6">
                <header>
                    <h1 className="scroll-m-20 text-3xl font-bold tracking-tight">
                        Quick References & FAQs
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        One-page guides for common Aquabill tasks and answers
                        to frequently asked questions.
                    </p>
                </header>
            </div>
        </AppLayout>
    );
}

