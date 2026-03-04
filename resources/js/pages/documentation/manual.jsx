import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { FileDown, Target, AlertTriangle, CalendarCheck, BookOpen } from 'lucide-react';
import { useRef, useState } from 'react';
import { Separator } from '@/components/ui/separator';

export default function Manual() {
    const contentRef = useRef(null);
    const [isExportingPdf, setIsExportingPdf] = useState(false);

    async function handleDownloadPdf() {
        if (!contentRef.current) return;
        setIsExportingPdf(true);
        try {
            const element = contentRef.current;
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
            });
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const margin = 10;
            const contentWidth = pdfWidth - 2 * margin;
            const contentHeight = pdfHeight - 2 * margin;
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = contentWidth / imgWidth;
            const scaledHeight = imgHeight * ratio;
            const totalPages = Math.ceil(scaledHeight / contentHeight);

            for (let i = 0; i < totalPages; i++) {
                if (i > 0) pdf.addPage();
                const sourceY = (i * contentHeight) / ratio;
                const sliceHeight = Math.min(
                    canvas.height - sourceY,
                    contentHeight / ratio
                );
                const pageCanvas = document.createElement('canvas');
                pageCanvas.width = canvas.width;
                pageCanvas.height = sliceHeight;
                const ctx = pageCanvas.getContext('2d');
                ctx.drawImage(
                    canvas,
                    0,
                    sourceY,
                    canvas.width,
                    sliceHeight,
                    0,
                    0,
                    canvas.width,
                    sliceHeight
                );
                const pageImg = pageCanvas.toDataURL('image/png');
                const pageImgHeight = sliceHeight * ratio;
                pdf.addImage(
                    pageImg,
                    'PNG',
                    margin,
                    margin,
                    contentWidth,
                    pageImgHeight
                );
            }
            pdf.save('JICA-Meeting-Development-Status.pdf');
        } finally {
            setIsExportingPdf(false);
        }
    }

    return (
        <AppLayout>
            <Head title="Development Status — JICA Meeting" />

            <div className="mx-auto max-w-4xl space-y-10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div ref={contentRef} className="min-w-0 flex-1 space-y-10">
                        <div>
                            <h1 className="scroll-m-20 text-3xl font-bold tracking-tight">
                                Development Status — JICA Meeting
                            </h1>
                            <p className="mt-2 text-lg text-muted-foreground">
                                Prepared for the meeting with the JICA Expert Team:
                                scope, challenges, actions and schedule, and
                                documentation to be shared.
                            </p>
                        </div>
                        <Separator />

                    {/* 1. Scope of the system */}
                    <section id="scope" className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Target className="h-6 w-6 text-primary" />
                            <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                                1. Scope of the System
                            </h2>
                        </div>
                        <p className="leading-7 text-muted-foreground">
                            The Aquabill (SSUWC Billing) system is designed to
                            digitalize and streamline the end-to-end water
                            billing and customer service process, from data
                            capture to reporting and decision-making.
                        </p>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Key functional areas
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-muted-foreground">
                                <ul className="ml-6 list-disc space-y-1">
                                    <li>
                                        <strong className="text-foreground">
                                            Customer & account management
                                        </strong>{' '}
                                        — Registration, profiles, service
                                        connections, and history.
                                    </li>
                                    <li>
                                        <strong className="text-foreground">
                                            Billing & invoicing
                                        </strong>{' '}
                                        — Bill generation from meter readings
                                        and tariffs, adjustments, and history.
                                    </li>
                                    <li>
                                        <strong className="text-foreground">
                                            Payments & receipting
                                        </strong>{' '}
                                        — Recording payments, reconciliation,
                                        and payment methods.
                                    </li>
                                    <li>
                                        <strong className="text-foreground">
                                            Meter & consumption management
                                        </strong>{' '}
                                        — Meter registration, readings (manual
                                        or import), and consumption history.
                                    </li>
                                    <li>
                                        <strong className="text-foreground">
                                            Reporting & analytics
                                        </strong>{' '}
                                        — General Report for customers,
                                        finance, and water usage; support for
                                        period reviews.
                                    </li>
                                    <li>
                                        <strong className="text-foreground">
                                            User management & security
                                        </strong>{' '}
                                        — Roles (Admin, Finance, Meters),
                                        access control, and audit.
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                        <p className="leading-7 text-muted-foreground">
                            <strong className="text-foreground">
                                Technical scope:
                            </strong>{' '}
                            Web-based application (Aquabill) with dashboard,
                            customers, billing, payments, invoices, meters,
                            meter readings, zones, tariff, and user management.
                            Modular design to allow future enhancements and
                            integration with other systems as needed.
                        </p>
                    </section>

                    <Separator />

                    {/* 2. Challenges to utilize the system */}
                    <section id="challenges" className="space-y-4">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-6 w-6 text-primary" />
                            <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                                2. Challenges to Utilize the System
                            </h2>
                        </div>
                        <p className="leading-7 text-muted-foreground">
                            The following challenges are anticipated or
                            currently faced in utilizing the new system:
                        </p>
                        <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
                            <li>
                                <strong className="text-foreground">
                                    Data quality and migration
                                </strong>{' '}
                                — Inconsistent or incomplete data from legacy
                                or manual records; need for cleaning,
                                standardization, and validation.
                            </li>
                            <li>
                                <strong className="text-foreground">
                                    User adoption and change management
                                </strong>{' '}
                                — Staff accustomed to existing processes;
                                resistance or hesitation during transition.
                            </li>
                            <li>
                                <strong className="text-foreground">
                                    Capacity and skills
                                </strong>{' '}
                                — Varying IT literacy; need for ongoing
                                training and support.
                            </li>
                            <li>
                                <strong className="text-foreground">
                                    Infrastructure and connectivity
                                </strong>{' '}
                                — Reliance on stable power and network;
                                performance in some locations may be limited.
                            </li>
                            <li>
                                <strong className="text-foreground">
                                    Process alignment
                                </strong>{' '}
                                — Existing business processes may need to be
                                refined to fully use system capabilities.
                            </li>
                            <li>
                                <strong className="text-foreground">
                                    Support and maintenance
                                </strong>{' '}
                                — Clear support structure and escalation path;
                                planning for updates and fixes.
                            </li>
                        </ul>
                    </section>

                    <Separator />

                    {/* 3. Actions to be taken and schedule */}
                    <section id="actions" className="space-y-4">
                        <div className="flex items-center gap-2">
                            <CalendarCheck className="h-6 w-6 text-primary" />
                            <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                                3. Actions to Be Taken and Schedule
                            </h2>
                        </div>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Short term (e.g. next 1–2 months)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1 text-sm text-muted-foreground">
                                <ul className="ml-6 list-disc">
                                    <li>Finalize configuration of core modules.</li>
                                    <li>Complete initial data migration and validation.</li>
                                    <li>Pilot testing with a limited set of users/branches.</li>
                                    <li>Refine user roles and access rights from feedback.</li>
                                </ul>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Medium term (e.g. next 3–6 months)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1 text-sm text-muted-foreground">
                                <ul className="ml-6 list-disc">
                                    <li>Phased rollout to additional branches/units.</li>
                                    <li>Structured user training (basic and advanced).</li>
                                    <li>Monitor usage and performance; address issues.</li>
                                    <li>Align and update internal procedures (SOPs) with the system.</li>
                                </ul>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Longer term (beyond 6 months)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1 text-sm text-muted-foreground">
                                <ul className="ml-6 list-disc">
                                    <li>Implement planned enhancements or new modules.</li>
                                    <li>Strengthen integration with other systems if required.</li>
                                    <li>Periodic review with management and JICA team.</li>
                                </ul>
                            </CardContent>
                        </Card>
                        <p className="leading-7 text-muted-foreground">
                            A clear ownership structure (business owner, IT
                            owner, key users), support process, and agreed
                            milestones for progress reporting should be
                            established and reviewed in follow-up meetings.
                        </p>
                    </section>

                    <Separator />

                    {/* 4. Documents to be shared */}
                    <section id="documents" className="space-y-4">
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-6 w-6 text-primary" />
                            <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                                4. Documents to Be Shared
                            </h2>
                        </div>
                        <p className="leading-7 text-muted-foreground">
                            The following documentation will be shared or made
                            available to support training and day-to-day use:
                        </p>
                        <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
                            <li>
                                <strong className="text-foreground">
                                    <a
                                        href={route('docs.user-manuals')}
                                        className="text-primary underline underline-offset-4 hover:text-primary/80"
                                    >
                                        User manuals
                                    </a>
                                </strong>{' '}
                                — Step-by-step guides per module (customers,
                                billing, meter readings, payments, reports) and
                                role-specific guides (cashiers, meter readers,
                                admins).
                            </li>
                            <li>
                                <strong className="text-foreground">
                                    <a
                                        href={route('docs.quick-references')}
                                        className="text-primary underline underline-offset-4 hover:text-primary/80"
                                    >
                                        Quick reference materials
                                    </a>
                                </strong>{' '}
                                — One-page guides for common tasks; FAQs for
                                frequent issues and error messages.
                            </li>
                            <li>
                                <strong className="text-foreground">
                                    <a
                                        href={route('docs.technical')}
                                        className="text-primary underline underline-offset-4 hover:text-primary/80"
                                    >
                                        Technical documentation
                                    </a>
                                </strong>{' '}
                                — System overview, data model, backup and
                                security procedures where applicable.
                            </li>
                            <li>
                                <strong className="text-foreground">
                                    <a
                                        href={route('docs.process-governance')}
                                        className="text-primary underline underline-offset-4 hover:text-primary/80"
                                    >
                                        Process and governance
                                    </a>
                                </strong>{' '}
                                — Updated SOPs aligned with the system;
                                change-management and support escalation
                                contacts.
                            </li>
                            <li>
                                <strong className="text-foreground">
                                    <a
                                        href={route('docs.training-materials')}
                                        className="text-primary underline underline-offset-4 hover:text-primary/80"
                                    >
                                        Training materials
                                    </a>
                                </strong>{' '}
                                — Slides and, where possible, recorded demos
                                for self-paced learning.
                            </li>
                        </ul>
                        <p className="leading-7 text-muted-foreground">
                            The <strong className="text-foreground">System User
                            Manual</strong> (available in the Documentation
                            section) and this Development Status document can
                            be shared with the JICA Expert Team and used as
                            reference during and after the meeting.
                        </p>
                    </section>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadPdf}
                        disabled={isExportingPdf}
                        className="shrink-0"
                    >
                        <FileDown className="h-4 w-4" />
                        {isExportingPdf ? 'Generating…' : 'Download PDF'}
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
