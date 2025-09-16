# Database Factories and Seeders

This directory contains Laravel factories and seeders for the AquaBill application database.

## Factories

Factories are used to generate fake data for testing and development purposes. Each factory corresponds to a database table and generates realistic sample data.

### Available Factories

- **DepartmentFactory** - Generates department data
- **UserFactory** - Generates user data with roles and departments
- **NeighborhoodFactory** - Generates neighborhood data
- **LocationFactory** - Generates location data with coordinates
- **TypeFactory** - Generates meter type data
- **CategoryFactory** - Generates customer category data with pricing
- **MeterFactory** - Generates meter data with serial numbers
- **CustomerFactory** - Generates customer data with relationships
- **MeterReadingFactory** - Generates meter reading data
- **BillFactory** - Generates bill data with calculated totals

## Seeders

Seeders populate the database with initial data. They are designed to run in a specific order to maintain referential integrity.

### Seeder Order

1. **DepartmentSeeder** - Creates basic departments
2. **UserSeeder** - Creates admin, manager, and regular users
3. **NeighborhoodSeeder** - Creates neighborhoods
4. **LocationSeeder** - Creates locations within neighborhoods
5. **TypeSeeder** - Creates meter types
6. **CategorySeeder** - Creates customer categories with pricing
7. **MeterSeeder** - Creates meters with type assignments
8. **CustomerSeeder** - Creates customers with relationships
9. **MeterReadingSeeder** - Creates meter readings for each meter
10. **BillSeeder** - Creates bills with calculated totals

## Usage

### Running All Seeders

```bash
php artisan db:seed
```

### Running Individual Seeders

```bash
php artisan db:seed --class=DepartmentSeeder
php artisan db:seed --class=UserSeeder
# ... etc
```

### Running Factories in Tinker

```bash
php artisan tinker
```

```php
// Create a single customer
\App\Models\Customer::factory()->create();

// Create multiple customers
\App\Models\Customer::factory(10)->create();

// Create customer with specific attributes
\App\Models\Customer::factory()->create(['is_active' => false]);
```

## Data Relationships

The seeders maintain proper relationships between tables:

- Users are assigned to departments
- Locations are assigned to neighborhoods
- Meters are assigned to types
- Customers are assigned to categories, locations, and meters
- Meter readings are linked to meters
- Bills are linked to customers, meters, readings, and users

## Sample Data Generated

- **8 departments** (Billing, Customer Service, Technical Support, etc.)
- **12+ users** (1 admin, 1 manager, 10+ regular users)
- **25+ neighborhoods** (10 predefined + 15 random)
- **200+ locations** (5-15 per neighborhood + 50 random)
- **29+ meter types** (9 predefined + 20 random)
- **18+ customer categories** (8 predefined + 10 random)
- **100 meters** with type assignments
- **200 customers** with full relationships
- **500+ meter readings** (3-12 per meter + 500 random)
- **500+ bills** with calculated totals

## Customization

You can modify the factories to generate different types of data by:

1. Editing the `definition()` method in each factory
2. Adding new states using the `state()` method
3. Modifying the seeders to create different quantities or types of data

## Notes

- All factories use Laravel's `fake()` helper for generating realistic data
- Foreign key relationships are properly maintained
- Soft deletes are supported where applicable
- Timestamps are automatically generated
- Unique constraints are respected (e.g., email addresses, serial numbers)
