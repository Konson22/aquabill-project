import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function ProcessGovernance() {
    return (
        <AppLayout>
            <Head title="Process & Governance" />
            <div className="mx-auto max-w-4xl space-y-6">
                <header>
                    <h1 className="scroll-m-20 text-3xl font-bold tracking-tight">
                        Process & Governance
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Standard operating procedures, roles & responsibilities,
                        and escalation paths aligned with the Aquabill system.
                    </p>
                </header>
            </div>
        </AppLayout>
    );
}

