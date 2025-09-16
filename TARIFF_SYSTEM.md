# Tariff Management System Documentation

## Overview

The Tariff Management System is a comprehensive solution for managing water pricing structures in the AquaBill application. It provides flexible pricing models, effective date management, and consumption-based billing calculations.

## Features

### 🏷️ **Tariff Management**

- **Flexible Pricing**: Unit price per cubic meter with fixed charges
- **Consumption Ranges**: Define minimum and maximum consumption limits
- **Effective Dates**: Schedule tariffs for future implementation
- **Status Tracking**: Active, upcoming, and historical tariff management

### 📊 **Analytics & Statistics**

- **Real-time Metrics**: Total tariffs, active rates, and revenue tracking
- **Usage Analytics**: Bills generated and revenue collected per tariff
- **Comparison Tools**: Side-by-side tariff comparison
- **Historical Data**: Complete tariff history and changes

### 🧮 **Calculation Engine**

- **Bill Calculation**: Real-time bill amount calculation
- **Sample Calculations**: Preview bills before implementation
- **Validation**: Consumption range and date validation
- **Conflict Detection**: Overlapping tariff detection

## Architecture

### Backend (Laravel)

#### TariffController

Located at `app/Http/Controllers/TariffController.php`

**Key Methods:**

- `index()` - Dashboard with statistics and tariff listings
- `store()` - Create new tariff with validation
- `update()` - Update existing tariff
- `destroy()` - Delete tariff (with usage checks)
- `compare()` - Compare multiple tariffs
- `calculate()` - Calculate bill amounts
- `history()` - View tariff history

**Private Helper Methods:**

- `getTariffStats()` - Calculate dashboard statistics
- `getTariffBillingStats()` - Get billing data for specific tariff

#### Tariff Model

Located at `app/Models/Tariff.php`

**Key Features:**

- **Soft Deletes**: Maintains historical data
- **Date Casting**: Automatic date handling
- **Scopes**: Effective date and consumption filtering
- **Relationships**: Bills using this tariff

**Scopes:**

- `effectiveFrom($date)` - Tariffs effective from specific date
- `forConsumption($consumption)` - Tariffs for specific consumption range

### Frontend (React)

#### Pages

- **Tariffs Dashboard** (`resources/js/pages/tariffs/index.jsx`)
    - Comprehensive overview with metrics and listings
    - Active and recent tariffs display
    - Quick actions and management tools

#### Components

- **TariffForm** (`resources/js/components/tariffs/TariffForm.jsx`)
    - Modal form for creating/editing tariffs
    - Real-time bill calculation preview
    - Validation and error handling

## Database Schema

### Tariffs Table

```sql
- id (Primary Key)
- effective_date (Date) - When tariff becomes active
- unit_price (Decimal) - Price per cubic meter
- min_consumption (Integer) - Minimum consumption threshold
- max_consumption (Integer) - Maximum consumption threshold (nullable)
- fixed_charge (Decimal) - Fixed charge per bill
- description (Text) - Optional description
- created_at, updated_at, deleted_at
```

### Key Relationships

- Tariffs have many Bills
- Bills belong to one Tariff
- Tariffs are soft-deleted for historical tracking

## Usage

### Creating a New Tariff

1. **Access Tariffs Page**

    - Navigate to `/tariffs` route
    - View current tariffs and statistics

2. **Create New Tariff**

    - Click "New Tariff" button
    - Fill in required fields:
        - Effective Date
        - Unit Price (per m³)
        - Fixed Charge
        - Minimum Consumption
        - Maximum Consumption (optional)
        - Description (optional)

3. **Preview Calculation**

    - See sample bill calculation for 50 m³
    - Verify pricing structure is correct

4. **Save Tariff**
    - Review all details
    - Click "Create Tariff" to save

### Managing Existing Tariffs

1. **View Tariff Details**

    - Click "View" on any tariff
    - See billing statistics and usage

2. **Edit Tariff**

    - Click "Edit" icon on tariff
    - Modify pricing structure
    - Update effective date if needed

3. **Delete Tariff**
    - Only possible if not used in bills
    - System prevents deletion of active tariffs

### Comparing Tariffs

1. **Select Tariffs**

    - Choose 2-5 tariffs to compare
    - View side-by-side comparison

2. **Analyze Differences**
    - Unit prices and fixed charges
    - Consumption ranges
    - Usage statistics

## API Endpoints

### Tariff Management Routes

```php
GET    /tariffs                    - Tariff dashboard
POST   /tariffs                    - Create new tariff
GET    /tariffs/{id}               - Show tariff details
PUT    /tariffs/{id}               - Update tariff
DELETE /tariffs/{id}               - Delete tariff
```

### Additional Routes

```php
POST   /tariffs/compare            - Compare tariffs
POST   /tariffs/calculate          - Calculate bill amount
GET    /tariffs/history            - View tariff history
```

## Pricing Models

### Basic Tariff Structure

```
Bill Amount = (Consumption × Unit Price) + Fixed Charge
```

### Consumption Range Example

```javascript
{
  effective_date: "2024-01-01",
  unit_price: 2.50,        // $2.50 per m³
  min_consumption: 0,       // Starting from 0 m³
  max_consumption: 100,     // Up to 100 m³
  fixed_charge: 15.00       // $15.00 fixed charge
}
```

### Sample Calculation

For 75 m³ consumption:

```
Bill = (75 × $2.50) + $15.00 = $187.50 + $15.00 = $202.50
```

## Validation Rules

### Required Fields

- **Effective Date**: Must be a valid date
- **Unit Price**: Must be numeric and ≥ 0
- **Min Consumption**: Must be integer and ≥ 0
- **Fixed Charge**: Must be numeric and ≥ 0

### Business Rules

- **Max Consumption**: Must be > min_consumption (if provided)
- **Effective Date**: Cannot conflict with existing tariffs
- **Consumption Range**: Should not overlap with existing tariffs

## Security Features

- **Authentication**: All tariff routes require authentication
- **Authorization**: Role-based access control
- **Validation**: Comprehensive input validation
- **Soft Deletes**: Maintains data integrity

## Performance Considerations

- **Eager Loading**: Relationships loaded efficiently
- **Pagination**: Large datasets handled properly
- **Caching**: Consider Redis for frequently accessed data
- **Indexing**: Database indexes on effective_date and consumption ranges

## Future Enhancements

- **Tiered Pricing**: Multiple consumption tiers per tariff
- **Seasonal Rates**: Different rates for different seasons
- **Customer Categories**: Different rates for different customer types
- **Bulk Operations**: Import/export tariff data
- **Audit Trail**: Track all tariff changes
- **Approval Workflow**: Multi-level approval for tariff changes
- **API Integration**: External tariff data sources

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.

## Examples

### Residential Tariff

```javascript
{
  effective_date: "2024-01-01",
  unit_price: 2.25,
  min_consumption: 0,
  max_consumption: null,  // Unlimited
  fixed_charge: 12.50,
  description: "Standard residential water rates"
}
```

### Commercial Tariff

```javascript
{
  effective_date: "2024-01-01",
  unit_price: 1.85,
  min_consumption: 100,
  max_consumption: 1000,
  fixed_charge: 25.00,
  description: "Commercial water rates for medium usage"
}
```

### High Usage Tariff

```javascript
{
  effective_date: "2024-01-01",
  unit_price: 3.50,
  min_consumption: 1000,
  max_consumption: null,
  fixed_charge: 50.00,
  description: "High consumption rates for industrial use"
}
```
