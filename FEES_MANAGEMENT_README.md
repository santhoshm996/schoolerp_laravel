# Fees Management Module - School ERP System

## Overview
The Fees Management Module is a comprehensive solution for managing school fees, including fee groups, fee types, student fee assignments, fee collection, and reporting. The system is built with Laravel backend and React frontend, featuring session-based filtering and role-based access control.

## Features

### 🔐 Security & Access Control
- **Authentication**: All endpoints protected with `auth:sanctum`
- **Role-based Access**: 
  - Admin/Superadmin: Full access to all features
  - Accountant: Full access to fee management
  - Teachers: Read-only access to fee information
- **Session-based Filtering**: All fee data is linked to academic sessions

### 💰 Fee Structure Management
- **Fee Groups**: Organize fees by categories (e.g., "Class 1 Fees", "Transportation Fees")
- **Fee Types**: Individual fee items within groups (e.g., "Tuition Fee", "Computer Lab Fee")
- **Flexible Pricing**: Support for different frequencies (one-time, monthly, quarterly, yearly)
- **Due Dates**: Configurable due dates for each fee type

### 👥 Student Fee Management
- **Fee Assignment**: Assign multiple fee types to multiple students
- **Bulk Operations**: Efficiently manage fees for entire classes/sections
- **Status Tracking**: Real-time status updates (pending, partial, paid, overdue)
- **Payment History**: Complete payment transaction history

### 💳 Fee Collection
- **Multiple Payment Modes**: Cash, Online, Cheque, Bank Transfer
- **Receipt Generation**: Automatic receipt number generation
- **Payment Validation**: Prevents overpayment and validates fee assignments
- **Reference Tracking**: Support for transaction references and notes

### 📊 Reporting & Analytics
- **Real-time Statistics**: Today's collection, monthly summaries
- **Student Reports**: Individual student fee summaries
- **Class/Section Reports**: Filtered reports by academic divisions
- **Payment Analytics**: Payment mode breakdowns and trends

## Database Schema

### Core Tables

#### 1. `fee_groups`
```sql
- id (Primary Key)
- name (Fee group name)
- description (Optional description)
- session_id (Foreign key to sessions)
- is_active (Boolean status)
- created_at, updated_at (Timestamps)
```

#### 2. `fee_types`
```sql
- id (Primary Key)
- name (Fee type name)
- description (Optional description)
- amount (Decimal fee amount)
- fee_group_id (Foreign key to fee_groups)
- session_id (Foreign key to sessions)
- frequency (one_time/monthly/quarterly/yearly)
- due_date (Optional due date)
- is_active (Boolean status)
- created_at, updated_at (Timestamps)
```

#### 3. `student_fees`
```sql
- id (Primary Key)
- student_id (Foreign key to students)
- fee_type_id (Foreign key to fee_types)
- amount_due (Total amount due)
- amount_paid (Amount paid so far)
- status (pending/partial/paid/overdue)
- session_id (Foreign key to sessions)
- due_date (Optional due date)
- notes (Optional notes)
- created_at, updated_at (Timestamps)
```

#### 4. `fee_transactions`
```sql
- id (Primary Key)
- student_id (Foreign key to students)
- fee_type_id (Foreign key to fee_types)
- amount_paid (Payment amount)
- payment_date (Date of payment)
- payment_mode (cash/online/cheque/bank_transfer)
- receipt_no (Unique receipt number)
- session_id (Foreign key to sessions)
- collected_by (User who collected payment)
- notes (Optional notes)
- reference_no (Optional reference number)
- created_at, updated_at (Timestamps)
```

## API Endpoints

### Fee Groups
```
GET    /api/v1/fee-groups              - List all fee groups
POST   /api/v1/fee-groups              - Create new fee group
GET    /api/v1/fee-groups/{id}         - Get specific fee group
PUT    /api/v1/fee-groups/{id}         - Update fee group
DELETE /api/v1/fee-groups/{id}         - Delete fee group
GET    /api/v1/fee-groups/session/{id} - Get fee groups by session
```

### Fee Types
```
GET    /api/v1/fee-types                    - List all fee types
POST   /api/v1/fee-types                    - Create new fee type
GET    /api/v1/fee-types/{id}               - Get specific fee type
PUT    /api/v1/fee-types/{id}               - Update fee type
DELETE /api/v1/fee-types/{id}               - Delete fee type
GET    /api/v1/fee-types/fee-group/{id}     - Get fee types by group
```

### Student Fees
```
GET    /api/v1/student-fees                    - List student fees
POST   /api/v1/student-fees/assign             - Assign fees to students
POST   /api/v1/student-fees/collect-payment    - Collect fee payment
GET    /api/v1/student-fees/student/{id}/summary - Get student fee summary
GET    /api/v1/student-fees/reports            - Get fee reports
DELETE /api/v1/student-fees/{id}               - Remove fee assignment
```

### Fee Transactions
```
GET    /api/v1/fee-transactions                - List transactions
GET    /api/v1/fee-transactions/{id}           - Get specific transaction
GET    /api/v1/fee-transactions/receipt/{no}   - Get transaction by receipt
GET    /api/v1/fee-transactions/summary        - Get transaction summary
GET    /api/v1/fee-transactions/today          - Get today's collection
GET    /api/v1/fee-transactions/monthly        - Get monthly collection
GET    /api/v1/fee-transactions/{id}/receipt   - Generate receipt
PUT    /api/v1/fee-transactions/{id}/notes     - Update transaction notes
```

## Frontend Components

### 1. Fee Groups Management (`/fee-groups`)
- **Features**: CRUD operations for fee groups
- **Access**: Admin/Accountant only
- **Functionality**: Create, edit, delete fee groups with session filtering

### 2. Fee Collection (`/fee-collection`)
- **Features**: View student fees and collect payments
- **Access**: Admin/Accountant for collection, read-only for others
- **Functionality**: Search, filter, and collect payments with receipt generation

### 3. Fee Types Management (Planned)
- **Features**: CRUD operations for individual fee types
- **Access**: Admin/Accountant only
- **Functionality**: Manage fee amounts, frequencies, and due dates

### 4. Fee Reports (Planned)
- **Features**: Comprehensive fee reporting and analytics
- **Access**: Admin/Accountant for full reports, teachers for limited access
- **Functionality**: Export reports, payment analytics, overdue tracking

## Session Integration

### Key Features
- **Session-based Filtering**: All fee data automatically filtered by current academic session
- **Session Switching**: Admin can switch between sessions to view historical data
- **Data Isolation**: Fee data is completely isolated between different academic sessions
- **Default Behavior**: System defaults to active session if none specified

### Implementation
```php
// All models include session scopes
public function scopeInSession($query, $sessionId = null)
{
    if ($sessionId) {
        return $query->where('session_id', $sessionId);
    }
    
    // Default to active session
    $activeSession = Session::getActiveSession();
    return $activeSession ? $query->where('session_id', $activeSession->id) : $query;
}
```

## Security Features

### Input Validation
- **Server-side Validation**: Laravel validation rules for all inputs
- **Data Sanitization**: Automatic XSS protection and SQL injection prevention
- **Business Logic Validation**: Prevents duplicate fees, overpayment, etc.

### Access Control
```php
// Route protection
Route::middleware('role:superadmin,admin,accountant')->group(function () {
    // Fee management routes
});

// Controller-level checks
if (!$user->isAdmin() && !$user->hasRole('accountant')) {
    return response()->json(['error' => 'Access denied'], 403);
}
```

### Data Integrity
- **Foreign Key Constraints**: Database-level referential integrity
- **Transaction Safety**: Database transactions for critical operations
- **Audit Trail**: Complete payment history with user tracking

## Usage Examples

### 1. Creating a Fee Group
```php
$feeGroup = FeeGroup::create([
    'name' => 'Class 3 Fees',
    'description' => 'Standard fees for Class 3 students',
    'session_id' => $currentSession->id,
    'is_active' => true
]);
```

### 2. Assigning Fees to Students
```php
$response = await feesService.assignFees({
    student_ids: [1, 2, 3],
    fee_type_ids: [1, 2],
    session_id: currentSession.id,
    due_date: '2025-02-15',
    notes: 'First term fees'
});
```

### 3. Collecting Payment
```php
$response = await feesService.collectPayment({
    student_id: 1,
    fee_type_id: 1,
    amount_paid: 1500.00,
    payment_date: '2025-01-29',
    payment_mode: 'cash',
    session_id: currentSession.id,
    notes: 'Monthly tuition fee'
});
```

### 4. Getting Fee Reports
```php
$reports = await feesService.getFeeReports(currentSession.id, {
    class_id: 1,
    status: 'pending',
    date_from: '2025-01-01',
    date_to: '2025-01-31'
});
```

## Installation & Setup

### 1. Database Migrations
```bash
cd school_backend
php artisan migrate
```

### 2. Seed Sample Data
```bash
php artisan db:seed --class=FeeSeeder
```

### 3. Frontend Routes
The fees management routes are automatically included in the main App.tsx file.

### 4. Sidebar Navigation
Fee management menu items are automatically added to the sidebar for admin/accountant users.

## Testing

### Backend Testing
```bash
cd school_backend
php artisan test --filter=Fee
```

### Frontend Testing
```bash
cd frontend
npm test
```

## Future Enhancements

### Planned Features
1. **Fee Types Management Page**: Complete CRUD for fee types
2. **Advanced Reporting**: PDF export, email notifications
3. **Payment Gateway Integration**: Online payment processing
4. **Fee Reminders**: Automated overdue notifications
5. **Financial Analytics**: Charts and graphs for fee trends
6. **Bulk Fee Operations**: Import/export fee structures
7. **Fee Waivers**: Support for fee exemptions and discounts

### Technical Improvements
1. **Caching**: Redis caching for frequently accessed data
2. **Queue Jobs**: Background processing for bulk operations
3. **Real-time Updates**: WebSocket integration for live updates
4. **Mobile App**: React Native mobile application
5. **API Versioning**: Proper API versioning strategy

## Troubleshooting

### Common Issues

#### 1. Session Not Found
**Problem**: "No active session selected" error
**Solution**: Ensure there's an active session in the database

#### 2. Permission Denied
**Problem**: 403 Access Denied errors
**Solution**: Check user role and ensure proper middleware configuration

#### 3. Database Constraints
**Problem**: Foreign key constraint violations
**Solution**: Ensure all referenced records exist before creating fee relationships

#### 4. Frontend Loading Issues
**Problem**: Components not loading or API errors
**Solution**: Check browser console, verify API endpoints, and session context

### Debug Mode
Enable Laravel debug mode for detailed error information:
```php
// .env
APP_DEBUG=true
APP_LOG_LEVEL=debug
```

## Support & Documentation

### Additional Resources
- **API Documentation**: Swagger/OpenAPI documentation (planned)
- **User Manual**: Step-by-step user guide (planned)
- **Video Tutorials**: Screen recordings of common operations (planned)

### Contact
For technical support or feature requests, please contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: January 29, 2025  
**Compatibility**: Laravel 10+, React 18+, PHP 8.1+
