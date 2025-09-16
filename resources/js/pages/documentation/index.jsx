import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { generateFormattedManualPDF, generatePDF } from '@/utils/pdfGenerator';
import { Head } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpen,
    Download,
    ExternalLink,
    FileText,
    HelpCircle,
    Mail,
    MessageCircle,
    Phone,
    Settings,
    Star,
    Users,
    Video,
    Zap,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs = [
    {
        title: 'Documentation & Support',
        href: '/documentation',
    },
];

const documentationSections = [
    {
        title: 'Getting Started',
        description: 'Learn the basics of AquaBill',
        icon: Zap,
        items: [
            {
                title: 'Quick Start Guide',
                href: '#quick-start',
                description: 'Get up and running in 5 minutes with step-by-step setup instructions',
            },
            {
                title: 'System Overview',
                href: '#system-overview',
                description: 'Understand the core features and architecture of AquaBill',
            },
            {
                title: 'User Interface Tour',
                href: '#ui-tour',
                description: 'Navigate the dashboard and understand the interface layout',
            },
            {
                title: 'First Time Setup',
                href: '#first-setup',
                description: 'Complete initial configuration and user account setup',
            },
        ],
    },
    {
        title: 'User Manual',
        description: 'Detailed guides for all features',
        icon: BookOpen,
        items: [
            {
                title: 'Customer Management',
                href: '#customer-management',
                description: 'Complete guide to adding, editing, and managing customer accounts and information',
            },
            {
                title: 'Billing Process',
                href: '#billing-process',
                description: 'Step-by-step guide to generating, customizing, and managing bills and invoices',
            },
            {
                title: 'Payment Processing',
                href: '#payment-processing',
                description: 'Handle all payment methods, track payments, and manage payment records',
            },
            {
                title: 'Reports & Analytics',
                href: '#reports-analytics',
                description: 'Generate comprehensive reports, view analytics, and export data',
            },
            {
                title: 'Water Meter Management',
                href: '#meter-management',
                description: 'Add, configure, and monitor water meters and readings',
            },
            {
                title: 'Tariff Configuration',
                href: '#tariff-config',
                description: 'Set up billing rates, tariffs, and pricing structures',
            },
            {
                title: 'Notification Settings',
                href: '#notifications',
                description: 'Configure email and SMS notifications for bills and reminders',
            },
            {
                title: 'User Account Management',
                href: '#user-accounts',
                description: 'Manage user roles, permissions, and account settings',
            },
        ],
    },
    {
        title: 'Advanced Features',
        description: 'Power user and advanced functionality',
        icon: Settings,
        items: [
            {
                title: 'Bulk Operations',
                href: '#bulk-operations',
                description: 'Perform bulk actions on customers, bills, and data',
            },
            {
                title: 'Data Import/Export',
                href: '#data-import-export',
                description: 'Import customer data and export reports in various formats',
            },
            {
                title: 'Automated Billing',
                href: '#automated-billing',
                description: 'Set up automated billing cycles and recurring charges',
            },
            {
                title: 'Integration Setup',
                href: '#integrations',
                description: 'Connect with external systems and payment gateways',
            },
        ],
    },
    {
        title: 'Technical Documentation',
        description: 'Developer and technical resources',
        icon: FileText,
        items: [
            {
                title: 'API Documentation',
                href: '#api-docs',
                description: 'Complete API reference and integration guides',
            },
            {
                title: 'Database Schema',
                href: '#database-schema',
                description: 'Database structure, relationships, and data models',
            },
            {
                title: 'Configuration Guide',
                href: '#configuration',
                description: 'System settings, customization options, and environment setup',
            },
            {
                title: 'Troubleshooting',
                href: '#troubleshooting',
                description: 'Common issues, error codes, and resolution steps',
            },
        ],
    },
];

const supportOptions = [
    {
        title: 'Help Center',
        description: 'Search our knowledge base for answers',
        icon: HelpCircle,
        href: '#',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
        title: 'Live Chat',
        description: 'Chat with our support team',
        icon: MessageCircle,
        href: '#',
        color: 'text-green-600',
        bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
        title: 'Email Support',
        description: 'Send us an email for assistance',
        icon: Mail,
        href: 'mailto:konakech3@gmail.com',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
    {
        title: 'Phone Support',
        description: 'Call us for immediate assistance',
        icon: Phone,
        href: 'tel:+211920079070',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 dark:bg-orange-950',
    },
];

const quickLinks = [
    { title: 'Video Tutorials', icon: Video, href: '#', description: 'Step-by-step video guides' },
    { title: 'Download Manual', icon: Download, href: '#', description: 'PDF user manual', isDownload: true },
    { title: 'Community Forum', icon: Users, href: '#', description: 'Connect with other users' },
    { title: 'System Status', icon: Settings, href: '#', description: 'Check system health' },
];

export default function Documentation() {
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    const handleDownloadPDF = async () => {
        setIsGeneratingPDF(true);
        try {
            const result = await generatePDF('documentation-content', 'aquabill-user-manual.pdf');
            if (result.success) {
                // Show success message (you can add a toast notification here)
                console.log('PDF generated successfully');
            } else {
                console.error('PDF generation failed:', result.message);
                // Show error message (you can add a toast notification here)
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const handleDownloadFormattedPDF = async () => {
        setIsGeneratingPDF(true);
        try {
            const sections = {
                'getting-started': {
                    title: 'Getting Started',
                    description: 'Learn the basics of AquaBill',
                    items: [
                        { title: 'Quick Start Guide', description: 'Get up and running in 5 minutes with step-by-step setup instructions' },
                        { title: 'System Overview', description: 'Understand the core features and architecture of AquaBill' },
                        { title: 'User Interface Tour', description: 'Navigate the dashboard and understand the interface layout' },
                        { title: 'First Time Setup', description: 'Complete initial configuration and user account setup' },
                        { title: 'Authentication & Login', description: 'User login, password reset, and account verification processes' },
                    ],
                },
                dashboard: {
                    title: 'Dashboard & Analytics',
                    description: 'Overview and real-time monitoring',
                    items: [
                        { title: 'Dashboard Overview', description: 'Main dashboard with key metrics, charts, and quick actions' },
                        { title: 'Revenue Analytics', description: 'Monthly revenue trends, payment patterns, and financial insights' },
                        { title: 'Customer Analytics', description: 'Customer growth, consumption patterns, and service statistics' },
                        { title: 'Meter Status Monitoring', description: 'Real-time meter status, fault detection, and maintenance alerts' },
                        { title: 'Recent Activity Feed', description: 'Track system activities, new registrations, and important events' },
                        { title: 'Quick Actions', description: 'Fast access to common tasks like adding customers and generating bills' },
                    ],
                },
                'customer-management': {
                    title: 'Customer Management',
                    description: 'Complete customer lifecycle management',
                    items: [
                        { title: 'Customer Registration', description: 'Add new customers with complete profile information and service details' },
                        { title: 'Customer Profiles', description: 'View and manage customer information, contact details, and service history' },
                        { title: 'Customer Search & Filtering', description: 'Find customers using advanced search and filter options' },
                        { title: 'Customer Status Management', description: 'Manage active, inactive, and suspended customer accounts' },
                        { title: 'Customer Meter Assignment', description: 'Assign and manage water meters for customers' },
                        { title: 'Customer Billing History', description: 'View complete billing and payment history for each customer' },
                        { title: 'Customer Communication', description: 'Send notifications, bills, and updates to customers' },
                    ],
                },
                'billing-system': {
                    title: 'Billing System',
                    description: 'Complete billing workflow and management',
                    items: [
                        { title: 'Bill Generation', description: 'Generate bills based on meter readings and tariff structures' },
                        { title: 'Bill Management', description: 'View, edit, and manage all generated bills' },
                        { title: 'Bill Printing', description: 'Print individual bills or bulk print multiple bills' },
                        { title: 'Bill Status Tracking', description: 'Track bill status (paid, unpaid, overdue, partially paid)' },
                        { title: 'Billing Periods', description: 'Define and manage billing cycles and periods' },
                        { title: 'Bill Templates', description: 'Customize bill layout, branding, and content' },
                        { title: 'Bulk Billing Operations', description: 'Generate bills for multiple customers simultaneously' },
                        { title: 'Billing Reports', description: 'Generate comprehensive billing reports and analytics' },
                    ],
                },
                'payment-processing': {
                    title: 'Payment Processing',
                    description: 'Payment collection and tracking system',
                    items: [
                        { title: 'Payment Recording', description: 'Record payments from various sources and methods' },
                        { title: 'Payment Methods', description: 'Support for cash, check, bank transfer, mobile money, and card payments' },
                        { title: 'Payment Tracking', description: 'Track payment history and outstanding balances' },
                        { title: 'Payment Reports', description: 'Generate payment collection and reconciliation reports' },
                        { title: 'Payment Verification', description: 'Verify and confirm payment transactions' },
                        { title: 'Refund Management', description: 'Process refunds and payment adjustments' },
                        { title: 'Payment Notifications', description: 'Send payment confirmations and receipts' },
                    ],
                },
                'meter-management': {
                    title: 'Water Meter Management',
                    description: 'Complete meter lifecycle management',
                    items: [
                        { title: 'Meter Installation', description: 'Add new meters with installation details and specifications' },
                        { title: 'Meter Configuration', description: 'Configure meter settings, capacity, and monitoring parameters' },
                        { title: 'Meter Status Tracking', description: 'Monitor meter status (active, inactive, faulty, maintenance)' },
                        { title: 'Meter Maintenance', description: 'Schedule and track meter maintenance and calibration' },
                        { title: 'Meter Replacement', description: 'Replace faulty meters and update customer assignments' },
                        { title: 'Meter Analytics', description: 'Analyze meter performance and consumption patterns' },
                    ],
                },
                'meter-readings': {
                    title: 'Meter Readings',
                    description: 'Reading collection and management',
                    items: [
                        { title: 'Manual Reading Entry', description: 'Enter meter readings manually with validation' },
                        { title: 'Bulk Reading Import', description: 'Import readings from CSV files or external systems' },
                        { title: 'Reading Validation', description: 'Validate readings for accuracy and anomalies' },
                        { title: 'Reading History', description: 'View complete reading history and trends' },
                        { title: 'Consumption Calculation', description: 'Calculate water consumption between readings' },
                        { title: 'Reading Reports', description: 'Generate reading reports and consumption analytics' },
                    ],
                },
                'tariff-management': {
                    title: 'Tariff & Pricing Management',
                    description: 'Pricing structures and rate management',
                    items: [
                        { title: 'Tariff Configuration', description: 'Set up different tariff structures and pricing tiers' },
                        { title: 'Category Management', description: 'Manage customer categories and pricing groups' },
                        { title: 'Rate Structures', description: 'Configure fixed charges, unit rates, and tiered pricing' },
                        { title: 'Tariff History', description: 'Track tariff changes and historical pricing' },
                        { title: 'Pricing Calculator', description: 'Test and calculate bill amounts with different tariffs' },
                        { title: 'Special Rates', description: 'Apply special rates for specific customers or situations' },
                    ],
                },
                'inventory-management': {
                    title: 'Inventory Management',
                    description: 'Stock and supply management system',
                    items: [
                        { title: 'Inventory Items', description: 'Manage inventory items, specifications, and categories' },
                        { title: 'Stock Levels', description: 'Monitor current stock levels and quantities' },
                        { title: 'Low Stock Alerts', description: 'Set up alerts for low stock levels and reorder points' },
                        { title: 'Inventory Transactions', description: 'Track all inventory movements and transactions' },
                        { title: 'Purchase Orders', description: 'Create and manage purchase orders for supplies' },
                        { title: 'Supplier Management', description: 'Manage supplier information and relationships' },
                        { title: 'Inventory Reports', description: 'Generate inventory reports and stock analysis' },
                    ],
                },
                'finance-management': {
                    title: 'Finance Management',
                    description: 'Financial overview and management',
                    items: [
                        { title: 'Financial Dashboard', description: 'Overview of financial metrics and key performance indicators' },
                        { title: 'Revenue Tracking', description: 'Track revenue from different sources and time periods' },
                        { title: 'Expense Management', description: 'Record and categorize business expenses' },
                        { title: 'Cash Flow Analysis', description: 'Analyze cash flow patterns and trends' },
                        { title: 'Financial Reports', description: 'Generate comprehensive financial reports' },
                        { title: 'Budget Planning', description: 'Create and manage budgets and financial forecasts' },
                    ],
                },
                'user-management': {
                    title: 'User & Access Management',
                    description: 'User accounts and system access control',
                    items: [
                        { title: 'User Accounts', description: 'Create and manage user accounts and profiles' },
                        { title: 'Role Management', description: 'Define and assign user roles and permissions' },
                        { title: 'Department Management', description: 'Organize users into departments and groups' },
                        { title: 'Access Control', description: 'Control access to different system features and data' },
                        { title: 'User Activity Monitoring', description: 'Track user activities and system usage' },
                        { title: 'Password Management', description: 'Manage password policies and user authentication' },
                    ],
                },
                'reports-analytics': {
                    title: 'Reports & Analytics',
                    description: 'Comprehensive reporting and data analysis',
                    items: [
                        { title: 'Customer Reports', description: 'Customer lists, payment history, and account summaries' },
                        { title: 'Billing Reports', description: 'Billing summaries, revenue analysis, and bill status reports' },
                        { title: 'Payment Reports', description: 'Payment collection reports and reconciliation' },
                        { title: 'Consumption Reports', description: 'Water consumption analysis and trends' },
                        { title: 'Financial Reports', description: 'Revenue, expenses, and financial performance reports' },
                        { title: 'Operational Reports', description: 'System usage, maintenance, and operational metrics' },
                        { title: 'Custom Reports', description: 'Create custom reports with specific criteria' },
                        { title: 'Data Export', description: 'Export data in various formats (PDF, Excel, CSV)' },
                    ],
                },
                'settings-configuration': {
                    title: 'Settings & Configuration',
                    description: 'System configuration and preferences',
                    items: [
                        { title: 'System Settings', description: 'Configure system-wide settings and preferences' },
                        { title: 'Company Information', description: 'Set up company details and branding' },
                        { title: 'Notification Settings', description: 'Configure email and SMS notification preferences' },
                        { title: 'Appearance Settings', description: 'Customize system appearance and themes' },
                        { title: 'Profile Management', description: 'Manage user profile and personal settings' },
                        { title: 'Security Settings', description: 'Configure security policies and access controls' },
                    ],
                },
                'advanced-features': {
                    title: 'Advanced Features',
                    description: 'Power user and advanced functionality',
                    items: [
                        { title: 'Bulk Operations', description: 'Perform bulk actions on customers, bills, and data' },
                        { title: 'Data Import/Export', description: 'Import customer data and export reports in various formats' },
                        { title: 'Automated Billing', description: 'Set up automated billing cycles and recurring charges' },
                        { title: 'Integration Setup', description: 'Connect with external systems and payment gateways' },
                        { title: 'API Access', description: 'Access system data through REST API endpoints' },
                        { title: 'Backup & Recovery', description: 'System backup and data recovery procedures' },
                    ],
                },
                troubleshooting: {
                    title: 'Troubleshooting & Support',
                    description: 'Common issues and support resources',
                    items: [
                        { title: 'Common Issues', description: 'Solutions to frequently encountered problems' },
                        { title: 'Error Messages', description: 'Understanding system error messages and codes' },
                        { title: 'Performance Optimization', description: 'Tips for improving system performance' },
                        { title: 'Data Recovery', description: 'Procedures for recovering lost or corrupted data' },
                        { title: 'Contact Support', description: 'How to get help from technical support team' },
                        { title: 'System Requirements', description: 'Hardware and software requirements for optimal performance' },
                    ],
                },
            };

            const result = await generateFormattedManualPDF(sections, 'aquabill-complete-user-manual.pdf');
            if (result.success) {
                console.log('Complete PDF manual generated successfully');
            } else {
                console.error('PDF generation failed:', result.message);
            }
        } catch (error) {
            console.error('Error generating complete PDF manual:', error);
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Documentation & Support" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Documentation & Support</h1>
                        <p className="text-muted-foreground">Find help, documentation, and support resources for AquaBill</p>
                    </div>

                    {/* PDF Download Buttons */}
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleDownloadPDF}
                            disabled={isGeneratingPDF}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Download className="h-4 w-4" />
                            {isGeneratingPDF ? 'Generating PDF...' : 'Download Full Manual (PDF)'}
                        </button>

                        <button
                            onClick={handleDownloadFormattedPDF}
                            disabled={isGeneratingPDF}
                            className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-white px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-800 dark:text-blue-400 dark:hover:bg-slate-700"
                        >
                            <FileText className="h-4 w-4" />
                            {isGeneratingPDF ? 'Generating...' : 'Download Complete Manual (All Features)'}
                        </button>
                    </div>
                </div>

                {/* Documentation Sections */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {documentationSections.map((section, index) => (
                        <Card key={index} className="transition-shadow hover:shadow-md">
                            <CardHeader>
                                <div className="flex items-center space-x-2">
                                    <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800">
                                        <section.icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{section.title}</CardTitle>
                                        <CardDescription>{section.description}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {section.items.map((item, itemIndex) => (
                                        <a
                                            key={itemIndex}
                                            href={item.href}
                                            className="group flex items-start space-x-3 rounded-lg p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                                        >
                                            <div className="rounded bg-slate-100 p-1 dark:bg-slate-700">
                                                <FileText className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-slate-900 group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-blue-400">
                                                    {item.title}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
                                            </div>
                                            <ExternalLink className="h-3 w-3 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
                                        </a>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Detailed User Manual Content */}
                <div id="documentation-content" className="space-y-8">
                    {/* Quick Start Guide */}
                    <Card id="quick-start">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Zap className="h-5 w-5 text-yellow-500" />
                                <span>Quick Start Guide</span>
                            </CardTitle>
                            <CardDescription>Get AquaBill up and running in 5 minutes</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold">Step 1: Initial Setup</h4>
                                <ol className="list-inside list-decimal space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                    <li>Log in to your AquaBill account using your credentials</li>
                                    <li>Complete your profile information in the Settings section</li>
                                    <li>Configure your company details and billing preferences</li>
                                    <li>Set up your first water tariff structure</li>
                                </ol>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold">Step 2: Add Your First Customer</h4>
                                <ol className="list-inside list-decimal space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                    <li>Navigate to the Customers section from the main menu</li>
                                    <li>Click "Add New Customer" button</li>
                                    <li>Fill in customer details (name, address, contact information)</li>
                                    <li>Assign a water meter and set up billing preferences</li>
                                    <li>Save the customer record</li>
                                </ol>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold">Step 3: Generate Your First Bill</h4>
                                <ol className="list-inside list-decimal space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                    <li>Go to the Billing section</li>
                                    <li>Select the customer you just created</li>
                                    <li>Enter the current meter reading</li>
                                    <li>Review the calculated bill amount</li>
                                    <li>Generate and send the bill to the customer</li>
                                </ol>
                            </div>
                        </CardContent>
                    </Card>

                    {/* System Overview */}
                    <Card id="system-overview">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <BookOpen className="h-5 w-5 text-blue-500" />
                                <span>System Overview</span>
                            </CardTitle>
                            <CardDescription>Understanding AquaBill's core features and architecture</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-4">
                                    <h4 className="text-lg font-semibold">Core Features</h4>
                                    <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                        <li>• Customer Management System</li>
                                        <li>• Automated Billing & Invoicing</li>
                                        <li>• Payment Processing & Tracking</li>
                                        <li>• Water Meter Management</li>
                                        <li>• Comprehensive Reporting</li>
                                        <li>• Multi-user Access Control</li>
                                        <li>• Email & SMS Notifications</li>
                                        <li>• Data Import/Export</li>
                                    </ul>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-lg font-semibold">Key Benefits</h4>
                                    <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                        <li>• Streamlined billing process</li>
                                        <li>• Reduced manual errors</li>
                                        <li>• Improved customer service</li>
                                        <li>• Real-time data analytics</li>
                                        <li>• Scalable architecture</li>
                                        <li>• Mobile-responsive design</li>
                                        <li>• Secure data handling</li>
                                        <li>• Easy integration options</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customer Management Guide */}
                    <Card id="customer-management">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Users className="h-5 w-5 text-green-500" />
                                <span>Customer Management Guide</span>
                            </CardTitle>
                            <CardDescription>Complete guide to managing customer accounts and information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold">Adding a New Customer</h4>
                                <ol className="list-inside list-decimal space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                    <li>
                                        Navigate to <strong>Customers</strong> from the main menu
                                    </li>
                                    <li>
                                        Click the <strong>"Add New Customer"</strong> button
                                    </li>
                                    <li>
                                        Fill in the required information:
                                        <ul className="mt-2 ml-4 list-inside list-disc space-y-1">
                                            <li>Customer Name (First Name, Last Name)</li>
                                            <li>Contact Information (Phone, Email)</li>
                                            <li>Billing Address (Street, City, State, ZIP)</li>
                                            <li>Service Address (if different from billing)</li>
                                            <li>Account Number (auto-generated or custom)</li>
                                        </ul>
                                    </li>
                                    <li>Assign a water meter to the customer</li>
                                    <li>Set billing preferences and tariff structure</li>
                                    <li>Configure notification preferences</li>
                                    <li>
                                        Click <strong>"Save Customer"</strong> to create the account
                                    </li>
                                </ol>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold">Managing Customer Information</h4>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <h5 className="font-medium">Editing Customer Details</h5>
                                        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                            <li>Click on any customer in the customer list</li>
                                            <li>Select "Edit Customer" from the action menu</li>
                                            <li>Update the required fields</li>
                                            <li>Save changes to update the record</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h5 className="font-medium">Customer Search & Filtering</h5>
                                        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                            <li>Use the search bar to find customers by name</li>
                                            <li>Filter by account status (Active, Inactive, Suspended)</li>
                                            <li>Filter by billing cycle or payment status</li>
                                            <li>Sort by name, account number, or last payment</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold">Customer Account Status</h4>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950">
                                        <h5 className="font-medium text-green-800 dark:text-green-200">Active</h5>
                                        <p className="text-sm text-green-600 dark:text-green-400">
                                            Customer account is active and receiving services
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-950">
                                        <h5 className="font-medium text-yellow-800 dark:text-yellow-200">Suspended</h5>
                                        <p className="text-sm text-yellow-600 dark:text-yellow-400">
                                            Service temporarily suspended due to non-payment
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-red-50 p-3 dark:bg-red-950">
                                        <h5 className="font-medium text-red-800 dark:text-red-200">Inactive</h5>
                                        <p className="text-sm text-red-600 dark:text-red-400">Account closed or service terminated</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Billing Process Guide */}
                    <Card id="billing-process">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <FileText className="h-5 w-5 text-purple-500" />
                                <span>Billing Process Guide</span>
                            </CardTitle>
                            <CardDescription>Step-by-step guide to generating and managing bills</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold">Generating a New Bill</h4>
                                <ol className="list-inside list-decimal space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                    <li>
                                        Navigate to <strong>Billing</strong> from the main menu
                                    </li>
                                    <li>
                                        Click <strong>"Generate New Bill"</strong>
                                    </li>
                                    <li>Select the customer from the dropdown list</li>
                                    <li>Enter the current meter reading</li>
                                    <li>
                                        System automatically calculates:
                                        <ul className="mt-2 ml-4 list-inside list-disc space-y-1">
                                            <li>Water consumption (current reading - previous reading)</li>
                                            <li>Base charges and service fees</li>
                                            <li>Tax calculations</li>
                                            <li>Total amount due</li>
                                        </ul>
                                    </li>
                                    <li>Review the bill details and make adjustments if needed</li>
                                    <li>Set the due date for payment</li>
                                    <li>
                                        Click <strong>"Generate Bill"</strong> to create the invoice
                                    </li>
                                </ol>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold">Bill Customization</h4>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <h5 className="font-medium">Bill Templates</h5>
                                        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                            <li>Choose from pre-designed templates</li>
                                            <li>Customize company logo and branding</li>
                                            <li>Modify bill layout and formatting</li>
                                            <li>Add custom fields or messages</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h5 className="font-medium">Billing Cycles</h5>
                                        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                            <li>Monthly billing cycles</li>
                                            <li>Quarterly billing options</li>
                                            <li>Custom billing periods</li>
                                            <li>Automated billing setup</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold">Bill Management</h4>
                                <div className="space-y-3">
                                    <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
                                        <h5 className="font-medium">Viewing Bills</h5>
                                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                            Access all generated bills from the Billing section. Filter by date range, customer, or payment status.
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
                                        <h5 className="font-medium">Sending Bills</h5>
                                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                            Send bills via email or SMS. Configure automatic sending for recurring bills.
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
                                        <h5 className="font-medium">Bill Reprinting</h5>
                                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                            Reprint bills at any time. All bills are stored with complete history and audit trail.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Processing Guide */}
                    <Card id="payment-processing">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Star className="h-5 w-5 text-orange-500" />
                                <span>Payment Processing Guide</span>
                            </CardTitle>
                            <CardDescription>Handle all payment methods and track payment records</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold">Recording Payments</h4>
                                <ol className="list-inside list-decimal space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                    <li>
                                        Navigate to <strong>Payments</strong> from the main menu
                                    </li>
                                    <li>
                                        Click <strong>"Record New Payment"</strong>
                                    </li>
                                    <li>Select the customer and bill to be paid</li>
                                    <li>
                                        Choose payment method:
                                        <ul className="mt-2 ml-4 list-inside list-disc space-y-1">
                                            <li>Cash</li>
                                            <li>Check (with check number)</li>
                                            <li>Bank Transfer</li>
                                            <li>Credit/Debit Card</li>
                                            <li>Mobile Money</li>
                                        </ul>
                                    </li>
                                    <li>Enter payment amount and date</li>
                                    <li>Add any additional notes or reference numbers</li>
                                    <li>
                                        Click <strong>"Record Payment"</strong> to save
                                    </li>
                                </ol>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold">Payment Methods</h4>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-3">
                                        <div className="rounded-lg border p-3">
                                            <h5 className="font-medium">Cash Payments</h5>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Record cash payments received at your office or from field collectors
                                            </p>
                                        </div>
                                        <div className="rounded-lg border p-3">
                                            <h5 className="font-medium">Check Payments</h5>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Process check payments with check number tracking and deposit management
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="rounded-lg border p-3">
                                            <h5 className="font-medium">Bank Transfers</h5>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Record bank transfers with transaction reference numbers
                                            </p>
                                        </div>
                                        <div className="rounded-lg border p-3">
                                            <h5 className="font-medium">Mobile Money</h5>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Process mobile money payments (M-Pesa, Airtel Money, etc.)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold">Payment Tracking</h4>
                                <div className="space-y-3">
                                    <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                                        <h5 className="font-medium text-blue-800 dark:text-blue-200">Payment History</h5>
                                        <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                                            View complete payment history for each customer with date, amount, and method details.
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950">
                                        <h5 className="font-medium text-green-800 dark:text-green-200">Outstanding Balances</h5>
                                        <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                                            Track customers with outstanding balances and overdue payments.
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-950">
                                        <h5 className="font-medium text-purple-800 dark:text-purple-200">Payment Reports</h5>
                                        <p className="mt-1 text-sm text-purple-600 dark:text-purple-400">
                                            Generate detailed payment reports for accounting and reconciliation purposes.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Reports & Analytics Guide */}
                    <Card id="reports-analytics">
                        <CardHeader>
                            <CardTitle className="flex items-center space-y-2">
                                <Settings className="h-5 w-5 text-indigo-500" />
                                <span>Reports & Analytics Guide</span>
                            </CardTitle>
                            <CardDescription>Generate comprehensive reports and view analytics</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold">Available Reports</h4>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-3">
                                        <div className="rounded-lg border p-3">
                                            <h5 className="font-medium">Customer Reports</h5>
                                            <ul className="mt-1 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                                <li>• Customer list with contact details</li>
                                                <li>• Customer payment history</li>
                                                <li>• Outstanding balances report</li>
                                                <li>• New customer registrations</li>
                                            </ul>
                                        </div>
                                        <div className="rounded-lg border p-3">
                                            <h5 className="font-medium">Billing Reports</h5>
                                            <ul className="mt-1 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                                <li>• Monthly billing summary</li>
                                                <li>• Bill generation report</li>
                                                <li>• Unpaid bills report</li>
                                                <li>• Revenue analysis</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="rounded-lg border p-3">
                                            <h5 className="font-medium">Financial Reports</h5>
                                            <ul className="mt-1 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                                <li>• Payment collection report</li>
                                                <li>• Revenue by period</li>
                                                <li>• Payment method analysis</li>
                                                <li>• Cash flow statement</li>
                                            </ul>
                                        </div>
                                        <div className="rounded-lg border p-3">
                                            <h5 className="font-medium">Operational Reports</h5>
                                            <ul className="mt-1 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                                <li>• Water consumption analysis</li>
                                                <li>• Meter reading reports</li>
                                                <li>• Service interruption log</li>
                                                <li>• System usage statistics</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold">Generating Reports</h4>
                                <ol className="list-inside list-decimal space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                    <li>
                                        Navigate to <strong>Reports</strong> from the main menu
                                    </li>
                                    <li>Select the type of report you want to generate</li>
                                    <li>Set the date range and filters as needed</li>
                                    <li>Choose the output format (PDF, Excel, CSV)</li>
                                    <li>
                                        Click <strong>"Generate Report"</strong>
                                    </li>
                                    <li>Download or view the generated report</li>
                                </ol>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold">Analytics Dashboard</h4>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="rounded-lg bg-blue-50 p-4 text-center dark:bg-blue-950">
                                        <h5 className="font-medium text-blue-800 dark:text-blue-200">Revenue Analytics</h5>
                                        <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                                            Track monthly revenue trends and payment patterns
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-green-50 p-4 text-center dark:bg-green-950">
                                        <h5 className="font-medium text-green-800 dark:text-green-200">Customer Analytics</h5>
                                        <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                                            Monitor customer growth and service usage patterns
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-purple-50 p-4 text-center dark:bg-purple-950">
                                        <h5 className="font-medium text-purple-800 dark:text-purple-200">Operational Metrics</h5>
                                        <p className="mt-1 text-sm text-purple-600 dark:text-purple-400">
                                            Analyze system performance and operational efficiency
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Water Meter Management Guide */}
                    <Card id="meter-management">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Settings className="h-5 w-5 text-cyan-500" />
                                <span>Water Meter Management Guide</span>
                            </CardTitle>
                            <CardDescription>Add, configure, and monitor water meters and readings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold">Adding a New Water Meter</h4>
                                <ol className="list-inside list-decimal space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                    <li>
                                        Navigate to <strong>Meters</strong> from the main menu
                                    </li>
                                    <li>
                                        Click <strong>"Add New Meter"</strong> button
                                    </li>
                                    <li>
                                        Enter meter details:
                                        <ul className="mt-2 ml-4 list-inside list-disc space-y-1">
                                            <li>Meter Serial Number (unique identifier)</li>
                                            <li>Meter Type (Digital, Analog, Smart)</li>
                                            <li>Installation Date</li>
                                            <li>Location/Address</li>
                                            <li>Initial Reading</li>
                                            <li>Meter Capacity</li>
                                        </ul>
                                    </li>
                                    <li>Assign the meter to a customer (optional)</li>
                                    <li>Set up reading schedule and intervals</li>
                                    <li>Save the meter configuration</li>
                                </ol>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold">Recording Meter Readings</h4>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <h5 className="font-medium">Manual Reading Entry</h5>
                                        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                            <li>Select the meter from the list</li>
                                            <li>Enter the current reading</li>
                                            <li>Add reading date and notes</li>
                                            <li>System calculates consumption automatically</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h5 className="font-medium">Bulk Reading Import</h5>
                                        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                            <li>Download the reading template</li>
                                            <li>Fill in readings for multiple meters</li>
                                            <li>Upload the completed file</li>
                                            <li>Review and confirm the readings</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold">Meter Maintenance</h4>
                                <div className="space-y-3">
                                    <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                                        <h5 className="font-medium text-blue-800 dark:text-blue-200">Reading History</h5>
                                        <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                                            View complete reading history for each meter with consumption trends and patterns.
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-950">
                                        <h5 className="font-medium text-yellow-800 dark:text-yellow-200">Maintenance Alerts</h5>
                                        <p className="mt-1 text-sm text-yellow-600 dark:text-yellow-400">
                                            Set up alerts for meter maintenance, calibration, and replacement schedules.
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-red-50 p-4 dark:bg-red-950">
                                        <h5 className="font-medium text-red-800 dark:text-red-200">Anomaly Detection</h5>
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            System automatically flags unusual consumption patterns or meter malfunctions.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tariff Configuration Guide */}
                    <Card id="tariff-config">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <FileText className="h-5 w-5 text-emerald-500" />
                                <span>Tariff Configuration Guide</span>
                            </CardTitle>
                            <CardDescription>Set up billing rates, tariffs, and pricing structures</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold">Creating a New Tariff</h4>
                                <ol className="list-inside list-decimal space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                    <li>
                                        Navigate to <strong>Settings</strong> → <strong>Tariffs</strong>
                                    </li>
                                    <li>
                                        Click <strong>"Create New Tariff"</strong>
                                    </li>
                                    <li>
                                        Enter tariff details:
                                        <ul className="mt-2 ml-4 list-inside list-disc space-y-1">
                                            <li>Tariff Name and Description</li>
                                            <li>Effective Date Range</li>
                                            <li>Base Service Charge</li>
                                            <li>Consumption Rate per Unit</li>
                                            <li>Minimum Charge Amount</li>
                                        </ul>
                                    </li>
                                    <li>
                                        Set up tiered pricing (if applicable):
                                        <ul className="mt-2 ml-4 list-inside list-disc space-y-1">
                                            <li>First 10 units: $X per unit</li>
                                            <li>Next 20 units: $Y per unit</li>
                                            <li>Above 30 units: $Z per unit</li>
                                        </ul>
                                    </li>
                                    <li>Configure additional charges (taxes, fees, penalties)</li>
                                    <li>Save and activate the tariff</li>
                                </ol>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold">Tariff Types</h4>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-3">
                                        <div className="rounded-lg border p-3">
                                            <h5 className="font-medium">Residential Tariff</h5>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Standard pricing for residential customers with tiered consumption rates
                                            </p>
                                        </div>
                                        <div className="rounded-lg border p-3">
                                            <h5 className="font-medium">Commercial Tariff</h5>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Higher rates for commercial and business customers
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="rounded-lg border p-3">
                                            <h5 className="font-medium">Industrial Tariff</h5>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Specialized pricing for industrial and high-volume users
                                            </p>
                                        </div>
                                        <div className="rounded-lg border p-3">
                                            <h5 className="font-medium">Special Tariff</h5>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Custom rates for specific customer categories or situations
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold">Managing Tariffs</h4>
                                <div className="space-y-3">
                                    <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950">
                                        <h5 className="font-medium text-green-800 dark:text-green-200">Active Tariffs</h5>
                                        <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                                            View and manage currently active tariff structures being used for billing.
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                                        <h5 className="font-medium text-blue-800 dark:text-blue-200">Historical Tariffs</h5>
                                        <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                                            Access historical tariff data for reporting and audit purposes.
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-950">
                                        <h5 className="font-medium text-purple-800 dark:text-purple-200">Tariff Calculator</h5>
                                        <p className="mt-1 text-sm text-purple-600 dark:text-purple-400">
                                            Test different consumption scenarios to calculate bill amounts before applying tariffs.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notification Settings Guide */}
                    <Card id="notifications">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Mail className="h-5 w-5 text-pink-500" />
                                <span>Notification Settings Guide</span>
                            </CardTitle>
                            <CardDescription>Configure email and SMS notifications for bills and reminders</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold">Setting Up Notifications</h4>
                                <ol className="list-inside list-decimal space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                    <li>
                                        Navigate to <strong>Settings</strong> → <strong>Notifications</strong>
                                    </li>
                                    <li>
                                        Configure email settings:
                                        <ul className="mt-2 ml-4 list-inside list-disc space-y-1">
                                            <li>SMTP server configuration</li>
                                            <li>Sender email address</li>
                                            <li>Email templates for different notifications</li>
                                            <li>Test email delivery</li>
                                        </ul>
                                    </li>
                                    <li>
                                        Set up SMS notifications:
                                        <ul className="mt-2 ml-4 list-inside list-disc space-y-1">
                                            <li>SMS gateway configuration</li>
                                            <li>API credentials and settings</li>
                                            <li>SMS templates and character limits</li>
                                            <li>Test SMS delivery</li>
                                        </ul>
                                    </li>
                                    <li>Configure notification triggers and schedules</li>
                                </ol>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold">Notification Types</h4>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-3">
                                        <div className="rounded-lg border p-3">
                                            <h5 className="font-medium">Bill Notifications</h5>
                                            <ul className="mt-1 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                                <li>• New bill generated</li>
                                                <li>• Bill due date reminders</li>
                                                <li>• Overdue payment alerts</li>
                                                <li>• Payment confirmation</li>
                                            </ul>
                                        </div>
                                        <div className="rounded-lg border p-3">
                                            <h5 className="font-medium">System Notifications</h5>
                                            <ul className="mt-1 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                                <li>• Account status changes</li>
                                                <li>• Service interruptions</li>
                                                <li>• Maintenance schedules</li>
                                                <li>• System updates</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="rounded-lg border p-3">
                                            <h5 className="font-medium">Customer Notifications</h5>
                                            <ul className="mt-1 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                                <li>• Welcome messages</li>
                                                <li>• Account activation</li>
                                                <li>• Password resets</li>
                                                <li>• Profile updates</li>
                                            </ul>
                                        </div>
                                        <div className="rounded-lg border p-3">
                                            <h5 className="font-medium">Admin Notifications</h5>
                                            <ul className="mt-1 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                                <li>• New customer registrations</li>
                                                <li>• Payment alerts</li>
                                                <li>• System errors</li>
                                                <li>• Security alerts</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold">Notification Templates</h4>
                                <div className="space-y-3">
                                    <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                                        <h5 className="font-medium text-blue-800 dark:text-blue-200">Email Templates</h5>
                                        <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                                            Customize email templates with your branding, company information, and dynamic content placeholders.
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950">
                                        <h5 className="font-medium text-green-800 dark:text-green-200">SMS Templates</h5>
                                        <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                                            Create concise SMS messages that fit within character limits while conveying essential information.
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-950">
                                        <h5 className="font-medium text-purple-800 dark:text-purple-200">Template Variables</h5>
                                        <p className="mt-1 text-sm text-purple-600 dark:text-purple-400">
                                            Use dynamic variables like {'{customer_name}'}, {'{bill_amount}'}, {'{due_date}'} to personalize
                                            notifications.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* User Account Management Guide */}
                    <Card id="user-accounts">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Users className="h-5 w-5 text-violet-500" />
                                <span>User Account Management Guide</span>
                            </CardTitle>
                            <CardDescription>Manage user roles, permissions, and account settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold">Creating User Accounts</h4>
                                <ol className="list-inside list-decimal space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                    <li>
                                        Navigate to <strong>Settings</strong> → <strong>User Management</strong>
                                    </li>
                                    <li>
                                        Click <strong>"Add New User"</strong>
                                    </li>
                                    <li>
                                        Enter user details:
                                        <ul className="mt-2 ml-4 list-inside list-disc space-y-1">
                                            <li>Full Name and Email Address</li>
                                            <li>Username and Password</li>
                                            <li>Contact Information</li>
                                            <li>Department or Role</li>
                                        </ul>
                                    </li>
                                    <li>Assign user role and permissions</li>
                                    <li>Set account status (Active/Inactive)</li>
                                    <li>Configure notification preferences</li>
                                    <li>Save the user account</li>
                                </ol>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold">User Roles and Permissions</h4>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-3">
                                        <div className="rounded-lg border p-3">
                                            <h5 className="font-medium">Administrator</h5>
                                            <ul className="mt-1 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                                <li>• Full system access</li>
                                                <li>• User management</li>
                                                <li>• System configuration</li>
                                                <li>• All reports and analytics</li>
                                            </ul>
                                        </div>
                                        <div className="rounded-lg border p-3">
                                            <h5 className="font-medium">Billing Manager</h5>
                                            <ul className="mt-1 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                                <li>• Generate and manage bills</li>
                                                <li>• Process payments</li>
                                                <li>• View billing reports</li>
                                                <li>• Customer management</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="rounded-lg border p-3">
                                            <h5 className="font-medium">Field Staff</h5>
                                            <ul className="mt-1 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                                <li>• Record meter readings</li>
                                                <li>• View customer information</li>
                                                <li>• Update service status</li>
                                                <li>• Basic reporting</li>
                                            </ul>
                                        </div>
                                        <div className="rounded-lg border p-3">
                                            <h5 className="font-medium">Customer Service</h5>
                                            <ul className="mt-1 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                                <li>• View customer accounts</li>
                                                <li>• Process payments</li>
                                                <li>• Update customer info</li>
                                                <li>• Generate basic reports</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold">Account Security</h4>
                                <div className="space-y-3">
                                    <div className="rounded-lg bg-red-50 p-4 dark:bg-red-950">
                                        <h5 className="font-medium text-red-800 dark:text-red-200">Password Policies</h5>
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            Enforce strong password requirements, regular password changes, and account lockout policies.
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-950">
                                        <h5 className="font-medium text-yellow-800 dark:text-yellow-200">Session Management</h5>
                                        <p className="mt-1 text-sm text-yellow-600 dark:text-yellow-400">
                                            Configure session timeouts, concurrent login limits, and activity monitoring.
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                                        <h5 className="font-medium text-blue-800 dark:text-blue-200">Audit Logs</h5>
                                        <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                                            Track user activities, login attempts, and system changes for security and compliance.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* User Interface Tour */}
                    <Card id="ui-tour">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <HelpCircle className="h-5 w-5 text-teal-500" />
                                <span>User Interface Tour</span>
                            </CardTitle>
                            <CardDescription>Navigate the dashboard and understand the interface layout</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold">Main Navigation</h4>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <h5 className="font-medium">Top Navigation Bar</h5>
                                        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                            <li>Company logo and branding</li>
                                            <li>Main menu items (Dashboard, Customers, Billing, etc.)</li>
                                            <li>Search functionality</li>
                                            <li>User profile and settings</li>
                                            <li>Notifications and alerts</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h5 className="font-medium">Sidebar Navigation</h5>
                                        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                            <li>Quick access to main features</li>
                                            <li>Collapsible menu sections</li>
                                            <li>Current page indicators</li>
                                            <li>Shortcut keys and tooltips</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold">Dashboard Overview</h4>
                                <div className="space-y-3">
                                    <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                                        <h5 className="font-medium text-blue-800 dark:text-blue-200">Key Metrics Cards</h5>
                                        <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                                            View important statistics like total customers, monthly revenue, outstanding payments, and system status
                                            at a glance.
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950">
                                        <h5 className="font-medium text-green-800 dark:text-green-200">Quick Actions</h5>
                                        <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                                            Access frequently used functions like adding customers, generating bills, and recording payments directly
                                            from the dashboard.
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-950">
                                        <h5 className="font-medium text-purple-800 dark:text-purple-200">Recent Activity</h5>
                                        <p className="mt-1 text-sm text-purple-600 dark:text-purple-400">
                                            Monitor recent system activities, new customer registrations, payments received, and other important
                                            events.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold">Data Tables and Lists</h4>
                                <div className="space-y-3">
                                    <div className="rounded-lg border p-3">
                                        <h5 className="font-medium">Sorting and Filtering</h5>
                                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                            Click column headers to sort data, use filter options to narrow down results, and search for specific
                                            records.
                                        </p>
                                    </div>
                                    <div className="rounded-lg border p-3">
                                        <h5 className="font-medium">Pagination</h5>
                                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                            Navigate through large datasets using pagination controls at the bottom of tables.
                                        </p>
                                    </div>
                                    <div className="rounded-lg border p-3">
                                        <h5 className="font-medium">Bulk Actions</h5>
                                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                            Select multiple records and perform bulk operations like sending notifications or updating status.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Links */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Star className="h-5 w-5 text-yellow-500" />
                            <span>Quick Links</span>
                        </CardTitle>
                        <CardDescription>Popular resources and helpful links</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {quickLinks.map((link, index) =>
                                link.isDownload ? (
                                    <button
                                        key={index}
                                        onClick={handleDownloadPDF}
                                        disabled={isGeneratingPDF}
                                        className="group flex items-center space-x-3 rounded-lg border p-3 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800"
                                    >
                                        <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800">
                                            <link.icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="text-sm font-medium text-slate-900 group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-blue-400">
                                                {isGeneratingPDF ? 'Generating PDF...' : link.title}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{link.description}</p>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
                                    </button>
                                ) : (
                                    <a
                                        key={index}
                                        href={link.href}
                                        className="group flex items-center space-x-3 rounded-lg border p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                                    >
                                        <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800">
                                            <link.icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-slate-900 group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-blue-400">
                                                {link.title}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{link.description}</p>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
                                    </a>
                                ),
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                        <CardDescription>Get in touch with our support team</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-3">
                                <h4 className="font-semibold text-slate-900 dark:text-slate-100">Support Hours</h4>
                                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                    <p>Monday - Friday: 8:00 AM - 6:00 PM EST</p>
                                    <p>Saturday: 9:00 AM - 3:00 PM EST</p>
                                    <p>Sunday: Closed</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h4 className="font-semibold text-slate-900 dark:text-slate-100">Contact Details</h4>
                                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                    <p>
                                        Email:{' '}
                                        <a href="mailto:konakech3@gmail.com" className="underline">
                                            konakech3@gmail.com
                                        </a>
                                    </p>
                                    <p>
                                        Phone:{' '}
                                        <a href="tel:+211920079070" className="underline">
                                            +211920079070
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
