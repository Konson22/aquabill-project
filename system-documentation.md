Act as a senior software documentation engineer and Laravel/React system analyst.

I want you to explore the entire codebase and generate a complete documentation package for the AquaBill Billing System for SSUWC.

First, inspect the system carefully:
- Read routes
- Read controllers
- Read models
- Read migrations
- Read database seeders
- Read React/Inertia pages
- Read API routes
- Read config files
- Read services/helpers
- Understand all modules and relationships before writing documentation

Do not guess. Base the documentation on the actual codebase and database structure.

System context:
- System name: AquaBill Billing System
- Client: South Sudan Urban Water Corporation (SSUWC)
- Purpose: Water billing, customer management, meter reading, payments, reporting, HR, attendance, leave, payroll, staff documents, and training management.
- Tech stack: Laravel, React/Inertia, MySQL, Tailwind CSS, Sanctum API.

Generate the following documentation files inside a new folder:

/docs

1. SYSTEM_OVERVIEW.md
Audience: SSUWC management, JICA, stakeholders.
Include:
- Introduction
- Objectives
- System modules
- Key features
- Benefits to SSUWC
- High-level workflows
- Future improvements

2. USER_MANUAL.md
Audience: end users.
Include step-by-step guides for:
- Login/logout
- Dashboard
- Customer management
- Meter readings
- Billing
- Payments
- Reports
- HR module
- Attendance
- Leave
- Payroll
- Staff documents
- Training management
Use clear language and add placeholders for screenshots like:
[SCREENSHOT: Login page]

3. TRAINING_MANUAL.md
Audience: trainers and workshop participants.
Include:
- Training objectives
- Training agenda
- Module-by-module explanation
- Practical exercises
- Example scenarios
- Assessment/checklist

4. TECHNICAL_DOCUMENTATION.md
Audience: developers and IT team.
Include:
- System architecture
- Folder structure
- Backend structure
- Frontend structure
- Database overview
- Authentication and authorization
- Key business logic
- Services/controllers/models explanation
- Important configuration files

5. DATABASE_DOCUMENTATION.md
Audience: developers and database administrators.
Explore migrations and models and document:
- All database tables
- Fields and data types
- Relationships
- Indexes
- Foreign keys
- Important constraints
- Suggested ERD in Mermaid syntax

6. API_DOCUMENTATION.md
Audience: developers/integrators.
Explore api.php and controllers.
Document:
- Authentication
- Endpoints
- Methods
- Request payloads
- Response examples
- Validation rules
- Error responses
- API usage flow

7. DEPLOYMENT_GUIDE.md
Audience: IT/admin team.
Include:
- Server requirements
- Environment requirements
- Installation steps
- .env configuration
- Database setup
- Migration/seed commands
- Storage link setup
- Apache/Nginx setup
- Queue/scheduler setup if used
- Backup notes
- Troubleshooting

8. OPERATIONS_MAINTENANCE_GUIDE.md
Audience: SSUWC IT handover team.
Include:
- Daily operations
- User management
- Backup procedure
- Restore procedure
- Monitoring
- Troubleshooting common issues
- Updating the system
- Managing uploaded files
- Security practices
- Handover checklist

9. ADMIN_MANUAL.md
Audience: system administrators.
Include:
- Managing users and roles
- Managing system settings
- Managing departments
- Managing tariffs/zones if available
- Managing HR settings
- Managing reports
- Exporting data
- Audit/security checks

10. REPORTS_ANALYTICS_GUIDE.md
Audience: management and reporting officers.
Include:
- List of all reports found in the system
- Purpose of each report
- Filters available
- Export options
- How reports support decision-making

11. SECURITY_DOCUMENTATION.md
Audience: IT/admin/management.
Include:
- Authentication
- Role-based access control
- Permissions
- Data protection
- Document/file access
- Backup security
- Recommended improvements

12. CHANGELOG.md
Audience: project team.
Create a clean changelog template:
- Version
- Date
- Added
- Changed
- Fixed
- Notes

Important writing style:
- Use professional but simple English
- Use SSUWC context
- Avoid unnecessary technical jargon in user-facing documents
- Use tables where useful
- Use Mermaid diagrams where useful
- Use clear headings
- Add screenshot placeholders where screenshots are needed
- Clearly mark sections that need screenshots or confirmation
- Do not invent features that are not in the codebase
- If a feature is partially implemented, write “Partially implemented” and explain what exists
- If something is missing but recommended, place it under “Recommended Improvements”

After generating the documentation:
- Create /docs/README.md as an index linking all documents
- Summarize what documents were created
- Summarize any missing or unclear areas found in the codebase
- Suggest next improvements for documentation quality