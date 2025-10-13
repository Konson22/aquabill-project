import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generate PDF from HTML content
 * @param {string} elementId - ID of the element to convert to PDF
 * @param {string} filename - Name of the PDF file
 * @param {Object} options - Additional options for PDF generation
 */
export const generatePDF = async (elementId, filename = 'aquabill-user-manual.pdf', options = {}) => {
    try {
        const element = document.getElementById(elementId);
        if (!element) {
            throw new Error(`Element with ID "${elementId}" not found`);
        }

        // Configure html2canvas options
        const canvasOptions = {
            scale: 2, // Higher scale for better quality
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            ...options.canvas
        };

        // Generate canvas from HTML element
        const canvas = await html2canvas(element, canvasOptions);
        const imgData = canvas.toDataURL('image/png');

        // Create PDF
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            ...options.pdf
        });

        // Calculate dimensions
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 295; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;

        let position = 0;

        // Add image to PDF
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // Add additional pages if content is longer than one page
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        // Save the PDF
        pdf.save(filename);
        
        return { success: true, message: 'PDF generated successfully' };
    } catch (error) {
        console.error('Error generating PDF:', error);
        return { success: false, message: error.message };
    }
};

/**
 * Generate PDF with custom content (for specific sections)
 * @param {string} content - HTML content to convert
 * @param {string} filename - Name of the PDF file
 * @param {Object} options - Additional options
 */
export const generatePDFFromContent = async (content, filename = 'aquabill-documentation.pdf', options = {}) => {
    try {
        // Create a temporary element
        const tempElement = document.createElement('div');
        tempElement.innerHTML = content;
        tempElement.style.position = 'absolute';
        tempElement.style.left = '-9999px';
        tempElement.style.top = '0';
        tempElement.style.width = '210mm'; // A4 width
        tempElement.style.backgroundColor = '#ffffff';
        tempElement.style.padding = '20px';
        tempElement.style.fontFamily = 'Arial, sans-serif';
        tempElement.style.fontSize = '12px';
        tempElement.style.lineHeight = '1.4';
        tempElement.style.color = '#333333';
        
        document.body.appendChild(tempElement);

        // Generate PDF
        const result = await generatePDF(tempElement.id, filename, options);
        
        // Clean up
        document.body.removeChild(tempElement);
        
        return result;
    } catch (error) {
        console.error('Error generating PDF from content:', error);
        return { success: false, message: error.message };
    }
};

/**
 * Generate a formatted PDF with table of contents
 * @param {Object} sections - Object containing section data
 * @param {string} filename - Name of the PDF file
 */
export const generateFormattedManualPDF = async (sections, filename = 'aquabill-user-manual.pdf') => {
    try {
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Set font
        pdf.setFont('helvetica');


        // Add title page
        pdf.setFontSize(28);
        pdf.setFont('helvetica', 'bold');
        pdf.text('AquaBill', 105, 40, { align: 'center' });
        
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Complete User Manual', 105, 55, { align: 'center' });
        
        pdf.setFontSize(14);
        pdf.text('Water Billing Management System', 105, 70, { align: 'center' });
        
        pdf.setFontSize(12);
        pdf.text(`Version 1.0 | Generated: ${new Date().toLocaleDateString()}`, 105, 85, { align: 'center' });
        
        pdf.setFontSize(10);
        pdf.text('Comprehensive Documentation for All Features', 105, 100, { align: 'center' });
        
        pdf.setFontSize(9);
        pdf.text('Support: konakech3@gmail.com | Phone: +211920079070', 105, 120, { align: 'center' });
        
        pdf.setFontSize(8);
        pdf.text('© 2024 AquaBill. All rights reserved.', 105, 130, { align: 'center' });

        // Add new page for table of contents
        pdf.addPage();
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Table of Contents', 20, 30);

        let yPosition = 50;
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');

        // Add table of contents
        Object.keys(sections).forEach((sectionKey, index) => {
            const section = sections[sectionKey];
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text(`${index + 1}. ${section.title}`, 20, yPosition);
            yPosition += 8;
            
            if (section.items) {
                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'normal');
                section.items.forEach((item, itemIndex) => {
                    pdf.text(`   ${index + 1}.${itemIndex + 1} ${item.title}`, 25, yPosition);
                    yPosition += 5;
                });
            }
            yPosition += 8;
        });

        // Add each section as a new page
        Object.keys(sections).forEach((sectionKey, index) => {
            const section = sections[sectionKey];
            
            pdf.addPage();
            pdf.setFontSize(18);
            pdf.setFont('helvetica', 'bold');
            pdf.text(`${index + 1}. ${section.title}`, 20, 30);
            
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'normal');
            pdf.text(section.description || '', 20, 45);
            
            let yPos = 60;
            
            
            if (section.items) {
                section.items.forEach((item, itemIndex) => {
                    // Check if we need a new page
                    if (yPos > 250) {
                        pdf.addPage();
                        yPos = 30;
                    }
                    
                    pdf.setFontSize(14);
                    pdf.setFont('helvetica', 'bold');
                    pdf.text(`${index + 1}.${itemIndex + 1} ${item.title}`, 20, yPos);
                    yPos += 8;
                    
                    pdf.setFontSize(10);
                    pdf.setFont('helvetica', 'normal');
                    
                    // Split long descriptions into multiple lines
                    const description = item.description || '';
                    const maxWidth = 170; // Maximum width for text
                    const lines = pdf.splitTextToSize(description, maxWidth);
                    
                    lines.forEach(line => {
                        if (yPos > 270) {
                            pdf.addPage();
                            yPos = 30;
                        }
                        pdf.text(line, 20, yPos);
                        yPos += 5;
                    });
                    
                    
                    yPos += 10;
                });
            }
        });

        // Add appendix with detailed feature descriptions
        pdf.addPage();
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Appendix A: Detailed Feature Descriptions', 20, 30);
        
        let yPos = 50;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');

        // Add workflow diagram placeholder
        addDiagramPlaceholder(pdf, 20, yPos, 170, 100, 'AquaBill System Workflow - Customer to Payment Process');
        yPos += 110;
        
        const detailedFeatures = {
            'Dashboard Features': [
                'Real-time Statistics: View total customers, active meters, total bills, and revenue at a glance',
                'Revenue Charts: Interactive charts showing monthly revenue trends and payment patterns',
                'Customer Analytics: Monitor customer growth, consumption patterns, and service statistics',
                'Meter Status: Real-time monitoring of meter status with fault detection and alerts',
                'Recent Activity: Track system activities, new registrations, and important events',
                'Quick Actions: Fast access to common tasks like adding customers and generating bills'
            ],
            'Customer Management Features': [
                'Customer Registration: Complete customer profile with contact information and service details',
                'Profile Management: View and edit customer information, billing history, and preferences',
                'Search & Filter: Advanced search and filtering options to find customers quickly',
                'Status Management: Manage active, inactive, and suspended customer accounts',
                'Meter Assignment: Assign and manage water meters for each customer',
                'Communication: Send notifications, bills, and updates to customers via email/SMS'
            ],
            'Billing System Features': [
                'Automated Bill Generation: Generate bills based on meter readings and tariff structures',
                'Bill Management: View, edit, and manage all generated bills with status tracking',
                'Print Options: Print individual bills or bulk print multiple bills',
                'Status Tracking: Track bill status (paid, unpaid, overdue, partially paid)',
                'Billing Periods: Define and manage billing cycles and periods',
                'Templates: Customize bill layout, branding, and content',
                'Bulk Operations: Generate bills for multiple customers simultaneously'
            ],
            'Payment Processing Features': [
                'Multiple Payment Methods: Support for cash, check, bank transfer, mobile money, and cards',
                'Payment Recording: Record payments with validation and confirmation',
                'Payment Tracking: Track payment history and outstanding balances',
                'Reports: Generate payment collection and reconciliation reports',
                'Verification: Verify and confirm payment transactions',
                'Refunds: Process refunds and payment adjustments',
                'Notifications: Send payment confirmations and receipts'
            ],
            'Meter Management Features': [
                'Meter Installation: Add new meters with installation details and specifications',
                'Configuration: Configure meter settings, capacity, and monitoring parameters',
                'Status Tracking: Monitor meter status (active, inactive, faulty, maintenance)',
                'Maintenance: Schedule and track meter maintenance and calibration',
                'Replacement: Replace faulty meters and update customer assignments',
                'Analytics: Analyze meter performance and consumption patterns'
            ],
            'Inventory Management Features': [
                'Item Management: Manage inventory items, specifications, and categories',
                'Stock Monitoring: Monitor current stock levels and quantities',
                'Low Stock Alerts: Set up alerts for low stock levels and reorder points',
                'Transaction Tracking: Track all inventory movements and transactions',
                'Purchase Orders: Create and manage purchase orders for supplies',
                'Supplier Management: Manage supplier information and relationships'
            ]
        };

        Object.keys(detailedFeatures).forEach((featureCategory, categoryIndex) => {
            if (yPos > 250) {
                pdf.addPage();
                yPos = 30;
            }
            
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text(`${String.fromCharCode(65 + categoryIndex)}. ${featureCategory}`, 20, yPos);
            yPos += 8;
            
            // Add category-specific image placeholders
            if (featureCategory === 'Dashboard Features') {
                addScreenshotPlaceholder(pdf, 20, yPos, 170, 60, 'Dashboard Interface Overview');
                yPos += 70;
            } else if (featureCategory === 'Customer Management Features') {
                addScreenshotPlaceholder(pdf, 20, yPos, 170, 60, 'Customer Management Interface');
                yPos += 70;
            } else if (featureCategory === 'Billing System Features') {
                addScreenshotPlaceholder(pdf, 20, yPos, 170, 60, 'Billing System Interface');
                yPos += 70;
            } else if (featureCategory === 'Payment Processing Features') {
                addScreenshotPlaceholder(pdf, 20, yPos, 170, 60, 'Payment Processing Interface');
                yPos += 70;
            } else if (featureCategory === 'Meter Management Features') {
                addScreenshotPlaceholder(pdf, 20, yPos, 170, 60, 'Meter Management Interface');
                yPos += 70;
            } else if (featureCategory === 'Inventory Management Features') {
                addScreenshotPlaceholder(pdf, 20, yPos, 170, 60, 'Inventory Management Interface');
                yPos += 70;
            }
            
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            
            detailedFeatures[featureCategory].forEach((feature, featureIndex) => {
                if (yPos > 270) {
                    pdf.addPage();
                    yPos = 30;
                }
                
                pdf.text(`• ${feature}`, 25, yPos);
                yPos += 5;
            });
            
            yPos += 8;
        });

        // Add system requirements page
        pdf.addPage();
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text('System Requirements', 20, 30);
        
        yPos = 50;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');

        // Add system architecture diagram
        addDiagramPlaceholder(pdf, 20, yPos, 170, 80, 'AquaBill System Architecture - Frontend, Backend, and Database');
        yPos += 90;
        
        const requirements = [
            'Minimum System Requirements:',
            '• Operating System: Windows 10, macOS 10.14, or Linux Ubuntu 18.04+',
            '• RAM: 4GB minimum, 8GB recommended',
            '• Storage: 2GB free disk space',
            '• Browser: Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+',
            '• Internet: Stable internet connection for cloud features',
            '',
            'Recommended System Requirements:',
            '• Operating System: Windows 11, macOS 12+, or Linux Ubuntu 20.04+',
            '• RAM: 8GB or more',
            '• Storage: 5GB free disk space',
            '• Browser: Latest version of Chrome, Firefox, Safari, or Edge',
            '• Internet: High-speed internet connection',
            '',
            'Browser Compatibility:',
            '• JavaScript must be enabled',
            '• Cookies must be enabled',
            '• Pop-up blockers should be disabled for PDF generation',
            '• Local storage should be enabled for offline features'
        ];
        
        requirements.forEach(req => {
            if (yPos > 270) {
                pdf.addPage();
                yPos = 30;
            }
            
            if (req.startsWith('•')) {
                pdf.text(req, 25, yPos);
            } else if (req === '') {
                yPos += 3;
            } else {
                pdf.setFont('helvetica', 'bold');
                pdf.text(req, 20, yPos);
                pdf.setFont('helvetica', 'normal');
            }
            yPos += 5;
        });


        // Save the PDF
        pdf.save(filename);
        
        return { success: true, message: 'Complete PDF manual generated successfully' };
    } catch (error) {
        console.error('Error generating formatted PDF:', error);
        return { success: false, message: error.message };
    }
};
