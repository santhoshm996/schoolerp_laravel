# School ERP System

A modern, clean School ERP (Enterprise Resource Planning) system built with Laravel backend and React frontend.

## 🚀 Features

### Phase 1.1: Users, Roles & Authentication ✅
- **User Management**: Create, read, update, and delete users
- **Role-Based Access Control**: 5 distinct roles with granular permissions
- **JWT Authentication**: Secure API authentication with Laravel Sanctum
- **Clean UI**: Modern, responsive interface built with React + Tailwind CSS

### Roles & Permissions
- **Superadmin**: Full system access, can manage all users
- **Admin**: Administrative access, can manage users (except superadmin)
- **Teacher**: Access to class and student management (future)
- **Accountant**: Access to financial features (future)
- **Student**: Limited access to personal information (future)

## 🛠️ Tech Stack

### Backend
- **Laravel 10**: PHP framework
- **Laravel Sanctum**: API authentication
- **Spatie Laravel Permission**: Role and permission management
- **MySQL**: Database
- **PHP 8.1+**: Runtime

### Frontend
- **React 19**: UI framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **Heroicons**: Icon library

## 📋 Prerequisites

- PHP 8.1+
- Composer
- Node.js 18+
- MySQL 8.0+
- Laravel Herd (recommended for local development)

## 🚀 Installation

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd schoollaravel/school_backend
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Configure database in `.env`**
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=school_erp
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   ```

5. **Run migrations and seeders**
   ```bash
   php artisan migrate:fresh --seed
   ```

6. **Start the server**
   ```bash
   php artisan serve
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   ```
   
   Configure the API URL:
   ```env
   VITE_API_URL=http://localhost:8000
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🔑 Default Users

After running the seeders, you'll have these default users:

| Role | Email | Username | Password |
|------|-------|----------|----------|
| Superadmin | superadmin@school.com | superadmin | password123 |
| Admin | admin@school.com | admin | password123 |
| Teacher | teacher@school.com | teacher | password123 |
| Accountant | accountant@school.com | accountant | password123 |
| Student | student@school.com | student | password123 |

## 📚 API Endpoints

### Authentication
- `POST /api/v1/login` - User login (email/username + password)
- `POST /api/v1/logout` - User logout
- `GET /api/v1/me` - Get current user profile

### User Management (Superadmin/Admin only)
- `GET /api/v1/users` - List all users
- `POST /api/v1/users` - Create new user
- `GET /api/v1/users/{id}` - Get user details
- `PUT /api/v1/users/{id}` - Update user
- `DELETE /api/v1/users/{id}` - Delete user

## 🎯 Usage

### For Superadmin/Admin Users
1. Login with superadmin or admin credentials
2. Access the **Users** page from the sidebar
3. Create, edit, and manage system users
4. Assign appropriate roles and permissions

### For Other Users
1. Login with your assigned credentials
2. Access role-specific dashboard
3. View placeholder content for future features

## 🔒 Security Features

- **JWT Tokens**: Secure authentication with Laravel Sanctum
- **Role-Based Access**: Granular permission system
- **Input Validation**: Server-side validation for all inputs
- **CSRF Protection**: Built-in Laravel security features
- **SQL Injection Protection**: Eloquent ORM protection

## 🧪 Testing

### Backend Tests
```bash
cd school_backend
php artisan test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📁 Project Structure

```
schoollaravel/
├── school_backend/          # Laravel backend
│   ├── app/
│   │   ├── Http/Controllers/Api/V1/
│   │   │   ├── AuthController.php
│   │   │   └── UserController.php
│   │   └── Models/
│   │       ├── User.php
│   │       └── Role.php
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/api.php
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
└── README.md
```

## 🚧 Future Phases

### Phase 1.2: Class & Section Management
- Class creation and management
- Section management within classes
- Student enrollment system

### Phase 1.3: Teacher & Subject Management
- Teacher profiles and assignments
- Subject management
- Class-subject-teacher relationships

### Phase 1.4: Student & Parent Management
- Student profiles and records
- Parent accounts and relationships
- Academic progress tracking

### Phase 2: Academic Features
- Attendance management
- Grade management
- Report generation
- Academic calendar

### Phase 3: Financial Management
- Fee management
- Payment tracking
- Financial reports
- Budget management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code examples

## 🔄 Updates

Stay updated with the latest changes:
- Watch the repository
- Check the releases page
- Follow the development roadmap

---

**Built with ❤️ using Laravel and React**
