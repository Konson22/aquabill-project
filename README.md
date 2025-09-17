# AquaBill - Water Billing Management System

A comprehensive water billing management solution built with Laravel 10 and React 18, featuring modern UI components and robust functionality for managing customers, meters, billing, and payments.

## 🚀 Recent Updates & Improvements

### ✨ Latest Features (December 2024)

- **Enhanced Customer Management**: Redesigned customer show page with modern tabs, export functionality, and print capabilities
- **Improved User Management**: Complete user edit functionality with modern form design
- **Streamlined Invoice Creation**: Simplified invoice forms with better UX
- **Finance Dashboard**: Removed Payment Methods card for cleaner analytics
- **Security Enhancements**: Active user-only login restrictions for both API and web authentication
- **UI/UX Improvements**: Modern card-based designs, better error handling, and responsive layouts

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [System Architecture](#system-architecture)
- [API Documentation](#api-documentation)
- [User Guide](#user-guide)
- [Development](#development)
- [Contributing](#contributing)

## ✨ Features

### 🏠 Dashboard & Analytics

- **Real-time Statistics**: Live metrics for customers, bills, payments, and revenue
- **Revenue Trends**: 12-month revenue analysis with interactive charts
- **Quick Actions**: One-click access to common tasks
- **Recent Activity**: Latest bills, payments, and system events

### 👥 Customer Management

- **Comprehensive Customer Profiles**: Detailed customer information with contact details
- **Customer Tabs**: Overview, Meter, Readings, Bills, Invoices, and Payments
- **Export Functionality**: Excel export for customer data, readings, and bills
- **Print Capabilities**: Clean print layouts without navigation elements
- **Meter Management**: Assign and manage customer meters with history tracking

### 💰 Billing System

- **Automated Bill Generation**: Generate bills based on meter readings and tariffs
- **Flexible Tariff System**: Multiple pricing structures and fixed charges
- **Bill Status Tracking**: Unpaid, paid, and overdue bill management
- **Export & Reporting**: Comprehensive billing reports and data export

### 📄 Invoice Management

- **Modern Invoice Creation**: Streamlined invoice forms with better UX
- **Customer Selection**: Easy customer and meter selection
- **Invoice Tracking**: Status management and payment tracking
- **Print-Ready Invoices**: Professional invoice layouts

### 💳 Payment Processing

- **Multiple Payment Methods**: Cash, mobile money, and bank transfers
- **Payment Validation**: Required reference numbers and amount validation
- **Payment History**: Complete payment tracking and history
- **Receipt Generation**: Automated receipt creation

### 👤 User Management

- **User Administration**: Complete user CRUD operations
- **Department Management**: Organize users by departments
- **Role-Based Access**: Granular permission system
- **Active User Control**: Restrict login to active users only

### 📊 Finance & Reports

- **Revenue Analytics**: Monthly revenue trends and analysis
- **Payment Tracking**: Payment method analysis and collection rates
- **Export Capabilities**: CSV and Excel export for all data
- **Real-time Metrics**: Live financial statistics

## 🛠 Technology Stack

### Backend

- **Laravel 10**: PHP framework with Eloquent ORM
- **MySQL/SQLite**: Database management
- **Sanctum**: API authentication
- **Inertia.js**: Modern SPA framework

### Frontend

- **React 18**: Modern JavaScript library
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Modern UI component library
- **Lucide React**: Beautiful icon library

### Development Tools

- **Vite**: Fast build tool and dev server
- **ESLint**: Code linting and formatting
- **PHPUnit**: Backend testing
- **Jest**: Frontend testing

## 🚀 Installation

### Prerequisites

- PHP 8.1 or higher
- Composer
- Node.js 18 or higher
- MySQL or SQLite

### Step 1: Clone Repository

```bash
git clone https://github.com/your-username/aquabill.git
cd aquabill
```

### Step 2: Install Dependencies

```bash
# Backend dependencies
composer install

# Frontend dependencies
npm install
```

### Step 3: Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database in .env file
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=aquabill
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### Step 4: Database Setup

```bash
# Run migrations
php artisan migrate

# Seed database with sample data
php artisan db:seed
```

### Step 5: Build Assets

```bash
# Development build
npm run dev

# Production build
npm run build
```

### Step 6: Start Application

```bash
# Start Laravel server
php artisan serve

# In another terminal, start Vite dev server (for development)
npm run dev
```

## ⚙️ Configuration

### Environment Variables

```env
# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=aquabill
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Application
APP_NAME="AquaBill"
APP_ENV=production
APP_DEBUG=false
APP_URL=http://localhost:8000

# Mail Configuration
MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-email
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=tls

# API Configuration
SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost:8000
```

### User Roles & Permissions

The system includes predefined roles:

- **Admin**: Full system access
- **Manager**: Department and user management
- **Staff**: Customer and billing operations
- **Operator**: Meter reading and basic operations

## 🏗 System Architecture

### Database Schema

#### Core Entities

- **Customers**: Customer information and account details
- **Meters**: Water meter management and tracking
- **Meter Readings**: Consumption data and billing periods
- **Bills**: Generated water bills with consumption calculations
- **Invoices**: Bill-to-invoice conversion and payment tracking
- **Payments**: Payment records and collection tracking
- **Users**: System users with role-based access
- **Departments**: Organizational structure
- **Tariffs**: Pricing structures and rates

#### Key Relationships

```
Customer → has many → Meters
Meter → has many → Meter Readings
Meter Reading → generates → Bill
Bill → creates → Invoice
Invoice → receives → Payments
User → belongs to → Department
User → has many → Roles
```

### API Architecture

#### Authentication

- **Web**: Laravel session-based authentication
- **API**: Sanctum token-based authentication
- **Security**: Active user validation for all login attempts

#### Controllers

- **CustomerController**: Customer CRUD and management
- **MeterController**: Meter operations and tracking
- **MeterReadingController**: Reading management and bill generation
- **BillController**: Bill generation and management
- **InvoiceController**: Invoice creation and tracking
- **PaymentController**: Payment processing and history
- **UserController**: User management and administration
- **FinanceController**: Financial analytics and reporting

## 📚 User Guide

### Getting Started

1. **Login**: Access the system with your credentials
2. **Dashboard**: View system overview and quick actions
3. **Navigation**: Use the sidebar to access different modules

### Customer Management

1. **View Customers**: Browse all customers with search and filters
2. **Customer Details**: Click on a customer to view detailed information
3. **Customer Tabs**:
    - **Overview**: Summary statistics and recent activity
    - **Meter**: Meter information and history
    - **Readings**: Meter reading history
    - **Bills**: Customer bill history
    - **Invoices**: Invoice tracking
    - **Payments**: Payment history

### Billing Process

1. **Record Meter Reading**: Enter current meter readings
2. **Generate Bills**: Create bills based on consumption
3. **Create Invoices**: Convert bills to invoices
4. **Process Payments**: Record customer payments
5. **Track Status**: Monitor bill and payment status

### User Administration

1. **Manage Users**: Create, edit, and manage system users
2. **Department Assignment**: Organize users by departments
3. **Role Management**: Assign appropriate roles and permissions
4. **Status Control**: Activate/deactivate user accounts

## 🔧 Development

### Code Structure

```
app/
├── Http/Controllers/     # API and web controllers
├── Models/              # Eloquent models
├── Services/            # Business logic services
└── Notifications/       # Email and system notifications

resources/js/
├── components/          # Reusable React components
├── pages/              # Page components
├── layouts/            # Layout components
└── utils/              # Utility functions

database/
├── migrations/          # Database schema migrations
└── seeders/            # Database seeders
```

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
php artisan test
npm test

# Code formatting
npm run lint
php artisan format
```

### Adding New Features

1. **Backend**: Create controller, model, and migration
2. **Frontend**: Create React components and pages
3. **Routes**: Add web and API routes
4. **Testing**: Write unit and feature tests
5. **Documentation**: Update documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- Follow PSR-12 coding standards for PHP
- Use ESLint configuration for JavaScript/TypeScript
- Write comprehensive tests for new features
- Update documentation for any changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@aquabill.com or create an issue in the repository.

## 🔄 Changelog

### v2.0.0 (December 2024)

- Enhanced customer management with modern UI
- Improved user administration
- Streamlined invoice creation
- Security enhancements
- UI/UX improvements

### v1.0.0 (Initial Release)

- Core billing system
- Customer management
- Meter reading system
- Payment processing
- Basic reporting

---

**AquaBill** - Modern water billing management for the digital age.
