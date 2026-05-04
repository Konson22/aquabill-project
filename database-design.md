Act as a senior Laravel + React/Inertia system architect.

Add a Training Management Module to the existing HR Management system.

Tech stack:
- Laravel backend
- React + Inertia frontend
- Tailwind CSS
- MySQL
- Role-based access control

Module name: Training Management

Objective:
Track all trainings provided by the institution to staff, including training programs, participants, attendance, completion, certificates, costs, and reports.

1. Database Tables

Create migrations for:

training_programs
Fields:
- id
- title
- description nullable
- provider nullable
- location nullable
- start_date nullable
- end_date nullable
- cost decimal nullable
- status enum: planned, ongoing, completed, cancelled
- timestamps
- soft deletes

training_participants
Fields:
- id
- training_program_id
- staff_id
- status enum: enrolled, attended, completed, absent
- score decimal nullable
- certificate_path nullable
- remarks nullable
- timestamps

Rules:
- training_program_id references training_programs
- staff_id references staff
- unique training_program_id + staff_id

training_documents
Fields:
- id
- training_program_id
- title nullable
- file_path
- timestamps

2. Models & Relationships

Create models:
- TrainingProgram
- TrainingParticipant
- TrainingDocument

Relationships:
- TrainingProgram has many participants
- TrainingProgram has many documents
- TrainingParticipant belongs to training program
- TrainingParticipant belongs to staff
- TrainingDocument belongs to training program
- Staff has many training participants
- Staff belongs to many training programs through training_participants

3. Features

Build full CRUD for training programs:
- Create training
- Edit training
- View training details
- Delete training
- Filter by status, provider, date range
- Search by title/provider/location

Training detail page should show:
- Training information
- Participants list
- Uploaded documents
- Training cost
- Completion summary

Participant management:
- Add staff to training
- Remove staff from training
- Update participant status:
  - enrolled
  - attended
  - completed
  - absent
- Add score
- Add remarks
- Upload certificate per participant

Training documents:
- Upload training materials
- View/download documents
- Delete documents

4. Staff Profile Integration

Update staff profile page to include a “Training” tab showing:
- Trainings enrolled
- Trainings attended
- Trainings completed
- Certificates
- Scores
- Training dates
- Provider

5. Dashboard Cards

Add dashboard widgets:
- Total trainings
- Ongoing trainings
- Completed trainings
- Staff trained this year
- Pending/planned trainings
- Training cost this year

6. Reports

Create reports for:
- Training programs report
- Staff training history
- Training participation report
- Training cost report
- Completion rate report

Reports should support:
- Search
- Filters
- Export to Excel
- Export to PDF
- Print

7. Permissions

Add permissions:
- view_training
- manage_training_programs
- manage_training_participants
- manage_training_documents
- view_training_reports

Role access:
- Super Admin: full access
- HR Manager: full training access
- Department Manager: view department staff trainings
- Staff: view own training history and certificates

8. UI Requirements

Use professional HR dashboard style:
- Responsive pages
- Tailwind CSS
- Clean tables
- Status badges
- Modal forms where useful
- Tabs on training detail page
- Confirmation dialogs before deleting
- File upload UI for documents/certificates

9. Business Logic

Use service classes where needed:
- TrainingService
- TrainingReportService

Important logic:
- Prevent duplicate staff enrollment in same training
- Calculate completion rate
- Calculate total cost per training
- Track training history per staff
- Show expired or missing certificates if certificate expiry is added later

10. Routes & Controllers

Create:
- TrainingProgramController
- TrainingParticipantController
- TrainingDocumentController
- TrainingReportController

Use Laravel validation Form Requests.

11. Deliver Step by Step

Implement in this order:
1. Migrations
2. Models and relationships
3. Seed permissions
4. Controllers and routes
5. Services
6. React/Inertia pages
7. Staff profile training tab
8. Dashboard widgets
9. Reports and exports