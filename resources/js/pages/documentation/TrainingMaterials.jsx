import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function TrainingMaterials() {
    return (
        <AppLayout>
            <Head title="Training Materials" />
            <div className="mx-auto max-w-4xl space-y-6">
                <header>
                    <h1 className="scroll-m-20 text-3xl font-bold tracking-tight">
                        Training Materials
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Slide decks, exercise guides, and links to recorded
                        training sessions for Aquabill users and administrators.
                    </p>
                </header>
            </div>
        </AppLayout>
    );
}

