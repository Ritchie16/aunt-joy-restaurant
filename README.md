# 🍽️ Aunt Joy Restaurant Management System

A comprehensive restaurant management system built with React.js frontend and PHP backend API. Features user management, meal ordering, inventory management, and role-based access control.

## 🚀 Features

- **Multi-role System**: Admin, Manager, Sales Personnel, Customer
- **User Management**: Create, edit, and manage users with different roles
- **Meal Management**: Add, edit, and manage restaurant meals
- **Order Management**: Process customer orders
- **Shopping Cart**: Customer cart functionality
- **JWT Authentication**: Secure token-based authentication
- **Responsive Design**: Works on desktop and mobile devices
- **Email Notifications**: Automated credential emails for staff
- **PDF & Excel Export**: Generate reports and exports

## 🛠️ Tech Stack

### Frontend
- React.js 18
- Vite
- Tailwind CSS
- Axios for API calls
- React Router for navigation

### Backend
- PHP 8.0+
- MySQL Database
- JWT Authentication
- PHPMailer for emails
- PHPSpreadsheet for Excel exports
- TCPDF for PDF generation

## 📋 Prerequisites

Before installation, ensure you have the following installed:

- **PHP 8.0 or higher**
- **MySQL 5.7 or higher**
- **Node.js 16 or higher**
- **Composer** (PHP dependency manager)
- **Git**

## 🖥️ Installation Guide

### 1. Clone the Repository

```bash
git clone https://github.com/Ritchie16/aunt-joy-restaurant.git
cd aunt-joy-restaurant

2. Backend Setup (PHP)
Linux/macOS:
bash

# Navigate to backend
cd backend

# Install PHP dependencies including PHPMailer, PHPSpreadsheet, and TCPDF
composer install

# Create environment file
cp .env.example .env

# Edit the .env file with your database credentials
nano .env  # or use your favorite editor
```


Windows:
cmd
```bash
# Navigate to backend
cd backend

# Install PHP dependencies including PHPMailer, PHPSpreadsheet, and TCPDF
composer install

# Copy environment file
copy .env.example .env

# Edit .env file with your database credentials (use Notepad or VS Code)
notepad .env
```
Composer Dependencies

The system uses these key PHP packages:
```bash
    phpmailer/phpmailer: For sending email notifications

    phpoffice/phpspreadsheet: For Excel report generation

    tecnickcom/tcpdf: For PDF document creation
```
These are automatically installed when you run ```bash composer install```.
Configure Environment (.env):
env
```bash
DB_HOST=127.0.0.1
DB_NAME=aunt_joy_restaurant
DB_USER=your_mysql_username
DB_PASS=your_mysql_password

JWT_SECRET=your_very_secure_jwt_secret_key_change_this

# Optional: Email configuration (comment out if not needed)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your_email@gmail.com
# SMTP_PASS=your_app_password
# SMTP_FROM=your_email@gmail.com
# SMTP_FROM_NAME=Aunt Joy Restaurant

APP_URL=http://localhost:5173
API_URL=http://localhost:8000
APP_ENV=development
```

3. Database Setup
Create Database:
sql
```bash
-- Connect to MySQL and run:
CREATE DATABASE aunt_joy_restaurant;
```
Import Database Schema:
bash
```bash
# Import the provided SQL file
mysql -u your_username -p aunt_joy_restaurant < database.sql
```
Or manually create tables using the SQL commands in database.sql.
4. Frontend Setup (React)
Linux/macOS/Windows:
```bash

# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Create environment file (if needed)
cp .env.example .env
```

5. Start the Development Servers
Backend Server (PHP):
```bash

# From the backend directory
cd backend

# Start PHP development server
php -S localhost:8000 index.php
```
The API will be available at: http://localhost:8000
Frontend Server (React):
```bash

# From the frontend directory (in a new terminal)
cd frontend

# Start React development server
npm run dev
```
The application will be available at: http://localhost:5173
🔧 Configuration
Default Admin Account

After setting up the database, you can log in with the default admin account:
```bash
    Email: admin@auntjoy.com

    Password: admin123 or try password
```
Creating Additional Users

    Log in as admin

    Navigate to User Management

    Click "Add User" to create new staff accounts

Email Configuration (Optional)

To enable email sending for staff credentials:

    For Gmail:

        Enable 2-Factor Authentication

        Generate an App Password

        Use the app password in SMTP_PASS

    Update .env:
    env
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_digit_app_password
SMTP_FROM=your_email@gmail.com
SMTP_FROM_NAME=Aunt Joy Restaurant
```
📁 Project Structure
text

aunt-joy-restaurant/
├── backend/
│   ├── api/              # API endpoints
│   ├── config/           # Configuration files
│   ├── controllers/      # PHP controllers
│   ├── models/           # Database models
│   ├── middleware/       # Authentication middleware
│   ├── utils/            # Utility classes
│   ├── vendor/           # Composer dependencies
│   └── index.php         # Main entry point
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── contexts/     # React contexts
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── utils/        # Utility functions
│   └── package.json
└── README.md

🔒 Environment Security

Important: Never commit actual .env files to version control.
For Developers:

    Copy .env.example to .env in both frontend and backend directories

    Fill in your actual values

    The .gitignore is configured to protect all .env files

Required Environment Files:
text

project/
├── backend/
│   ├── .env.example ✅ (committed)
│   └── .env ❌ (never commit this!)
└── frontend/
    ├── .env.example ✅ (committed)
    └── .env ❌ (never commit this!)

Complete Security Check

Run this command to verify your environment files are protected:
```bash

# Check what .env files would be committed
git status --ignored

# Check if any .env files are tracked
git ls-files | grep .env

# Should only show .env.example files, no .env files
``` 
👥 User Roles

   Admin: Full system access, user management, reports

   Manager: Meal management, order viewing, basic reports

   Sales: Order processing, customer management

   Customer: Browse meals, place orders, view order history

🐛 Troubleshooting
Common Issues:

 CORS Errors:

   Ensure backend is running on port 8000

   Check CORS headers in PHP files

 Database Connection Issues:

   Verify MySQL is running

   Check database credentials in .env

   Ensure database exists

   Token Authentication Failures:

   Check JWT_SECRET in .env

   Clear browser localStorage
Email Not Sending:

   Verify SMTP configuration

   Check if using App Password for Gmail

   Review server logs for SMTP errors

Composer Dependencies Issues:

   Run composer install in backend directory

   Ensure PHP version is 8.0 or higher

   Check composer.json for correct dependencies

Logs:

   Backend logs: backend/logs/app.log

   Frontend logs: Browser console

🚀 Deployment
Production Build:
Frontend:
```bash

cd frontend
npm run build
```
Backend:

   Configure web server (Apache/Nginx)

   Set proper file permissions

   Update .env for production values

🤝 Contributing

  Fork the repository

  Create a feature branch

  Make your changes

  Test thoroughly

  Submit a pull request

