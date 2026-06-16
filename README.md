# Temple Billing System

## Introduction
The Temple Billing System is a web-based application developed to automate and manage temple-related financial operations such as donation collection, pooja booking, prasadam billing, receipt generation, inventory management, and report generation. The system helps temple administrators, accountants, staff members, and devotees efficiently manage temple services through a centralized digital platform.

The application minimizes manual paperwork, improves transparency in temple accounting, simplifies billing processes, and enhances devotee service management.

## Objectives
- Automate temple billing operations
- Manage pooja and donation records efficiently
- Simplify receipt generation and payment tracking
- Maintain inventory of temple items and prasadam
- Generate financial and audit reports
- Improve transparency and operational efficiency

## Technology Stack
### Frontend
- React.js
- HTML5
- CSS3
- Tailwind CSS

### Backend
- Node.js
- Express

### Database
- MongoDB / MySQL

## System Modules
### 1. Admin Module
The Admin Module is the central control unit of the Temple Billing System. It manages temple services, donations, billing, inventory, staff, and reports.

Functions:
- Admin Login/Logout
- Manage Temple Services
- Manage Staff & Employees
- Monitor Donations & Collections
- Generate Reports
- Configure System Settings

Features:
- Dashboard analytics
- Revenue monitoring
- Service management
- Billing management
- Staff monitoring

Admin Dashboard:
- Total Donations
- Daily Collection
- Pooja Bookings
- Prasadam Sales
- Pending Payments
- Inventory Status

Admin Workflow:
1. Admin logs into system
2. Monitors temple activities
3. Manages bookings and donations
4. Generates reports and analytics

Database Tables/Collections:
- admins
- services
- donations
- reports

### 2. Devotee Management Module
This module manages devotee registration and records.

Functions:
- Register Devotees
- Update Devotee Information
- Track Booking History
- Maintain Donation Records

Features:
- Digital devotee profiles
- Booking history tracking
- Donation tracking
- Personalized notifications

Devotee Details:
- Devotee Name
- Contact Number
- Address
- Booking History
- Donation History

Devotee Workflow:
1. Devotee registered
2. Services booked
3. Donations recorded
4. Notifications sent

Devotee Dashboard:
- Booking Status
- Donation History
- Payment Receipts
- Festival Notifications

Database Tables/Collections:
- devotees
- devotee_profiles
- donation_history

### 3. Pooja Booking Module
This module manages pooja and seva booking operations.

Functions:
- Book Poojas
- Schedule Sevas
- Generate Booking Receipts
- Track Booking Status

Features:
- Online pooja booking
- Slot scheduling
- QR code booking confirmation
- Automated reminders

Pooja Categories:
- Archana
- Abhisheka
- Homa
- Special Seva
- Festival Pooja

Booking Workflow:
1. Devotee selects pooja
2. Date and slot selected
3. Payment processed
4. Receipt generated

Booking Dashboard:
- Today's Bookings
- Upcoming Poojas
- Completed Services
- Booking Revenue

Database Tables/Collections:
- pooja_bookings
- seva_schedule
- booking_receipts

### 4. Donation Management Module
This module manages temple donations and sponsorships.

Functions:
- Accept Donations
- Generate Donation Receipts
- Track Donation History
- Manage Sponsorship Programs

Features:
- Online donation support
- Donation categorization
- Receipt generation
- Donation analytics

Donation Categories:
- General Donation
- Annadanam
- Temple Construction Fund
- Festival Donation

Donation Workflow:
1. Donation submitted
2. Payment processed
3. Receipt generated
4. Donation recorded

Donation Dashboard:
- Daily Donations
- Monthly Revenue
- Top Donors
- Donation Categories

Database Tables/Collections:
- donations
- sponsors
- donation_receipts

### 5. Billing & Payment Module
This module handles billing and payment processing.

Functions:
- Generate Bills
- Process Payments
- Generate Receipts
- Track Transactions

Features:
- QR-based payment support
- PDF receipt generation
- Multiple payment methods
- Fast billing process

Payment Methods:
- Cash
- UPI
- Debit/Credit Card
- Net Banking

Billing Components:
- Pooja Charges
- Prasadam Charges
- Donation Amount
- Special Service Charges

Billing Workflow:
1. Service selected
2. Bill generated automatically
3. Payment processed
4. Receipt printed/generated

Billing Dashboard:
- Daily Transactions
- Revenue Summary
- Payment History
- Pending Payments

Database Tables/Collections:
- bills
- payments
- transactions

### 6. Prasadam & Inventory Management Module
This module manages prasadam sales and temple inventory.

Functions:
- Add/Edit/Delete Inventory Items
- Manage Prasadam Stock
- Track Item Usage
- Generate Inventory Reports

Features:
- Stock monitoring
- Low stock alerts
- Inventory tracking
- Expiry tracking support

Inventory Categories:
- Prasadam
- Flowers
- Oil
- Pooja Materials
- Temple Supplies

Inventory Workflow:
1. Stock added
2. Items sold or used
3. Inventory updated
4. Reports generated automatically

Inventory Dashboard:
- Available Stock
- Low Stock Alerts
- Daily Usage
- Inventory Value

Database Tables/Collections:
- inventory
- prasadam_sales
- stock_logs

### 7. Employee & Staff Management Module
This module manages temple staff and employee records.

Functions:
- Add/Edit/Delete Employees
- Manage Attendance
- Assign Duties
- Salary Management

Features:
- Attendance tracking
- Payroll management
- Shift scheduling
- Employee performance monitoring

Employee Roles:
- Priest
- Accountant
- Cashier
- Temple Staff

Employee Workflow:
1. Employee registered
2. Attendance tracked
3. Duties assigned
4. Salary processed

Employee Dashboard:
- Attendance Summary
- Salary Details
- Shift Timings
- Leave Requests

Database Tables/Collections:
- employees
- attendance
- payroll
- shifts

### 8. Festival & Event Management Module
This module manages temple festivals and special events.

Functions:
- Create Festival Events
- Manage Special Bookings
- Track Festival Donations
- Generate Event Reports

Features:
- Event scheduling
- Crowd management support
- Festival booking management
- Special notification system

Festival Workflow:
1. Festival created
2. Devotees book services
3. Donations collected
4. Reports generated

Festival Dashboard:
- Upcoming Festivals
- Event Bookings
- Festival Revenue
- Crowd Statistics

Database Tables/Collections:
- festivals
- event_bookings
- festival_donations

### 9. Notification Module
This module sends alerts and notifications to devotees and staff.

Functions:
- Booking Confirmations
- Payment Notifications
- Festival Announcements
- Reminder Alerts

Features:
- SMS notifications
- Email integration
- Push notifications
- Real-time alerts

Notification Types:
- Booking Confirmation
- Donation Receipt
- Festival Reminder
- Payment Confirmation

Notification Workflow:
1. Event triggered
2. Notification generated
3. User receives alert

Database Tables/Collections:
- notifications
- alerts
- message_logs

### 10. Report & Analytics Module
This module generates financial and operational reports.

Functions:
- Donation Reports
- Billing Reports
- Festival Reports
- Inventory Reports

Features:
- Graphical dashboards
- PDF/Excel export
- Revenue tracking
- Financial analytics

Report Types:
- Daily Collection Report
- Donation Summary
- Pooja Booking Report
- Inventory Usage Report

Analytics Dashboard:
- Revenue Growth
- Donation Trends
- Festival Collections
- Inventory Usage Statistics

Report Workflow:
1. Financial and service data collected
2. Reports generated automatically
3. Admin exports reports

Database Tables/Collections:
- reports
- analytics
- financial_summary

### 11. Authentication & Security Module
This module provides secure access and protects temple financial data.

Functions:
- User Authentication
- Password Encryption
- Session Management
- Role-Based Authorization

Features:
- JWT Authentication
- bcrypt password hashing
- Protected APIs
- Secure login system

User Roles:
- Admin
- Accountant
- Priest
- Cashier
- Staff

Security Measures:
- Encrypted passwords
- Token-based authentication
- Input validation
- Session timeout

Authentication Workflow:
1. User enters credentials
2. System verifies user
3. JWT token generated
4. Secure session created

Database Tables/Collections:
- users
- roles
- sessions

### 12. Receipt & Document Management Module
This module manages temple receipts and financial documents.

Functions:
- Generate Receipts
- Store Payment Records
- Download Reports
- Manage Financial Documents

Features:
- PDF receipt generation
- Digital document storage
- Secure file access
- Receipt history tracking

Document Types:
- Donation Receipts
- Booking Receipts
- Festival Reports
- Financial Statements

Receipt Workflow:
1. Payment completed
2. Receipt generated
3. Stored digitally
4. Download/share enabled

Receipt Dashboard:
- Recent Receipts
- Download History
- Financial Statements
- Receipt Search

Database Tables/Collections:
- receipts
- documents
- uploaded_files

## Future Enhancements
- Mobile application integration
- Online live darshan support
- QR code temple entry system
- AI-based crowd management
- Voice-enabled booking system
- Online prasadam delivery
- Cloud-based temple accounting
- Multi-language support
- Face recognition for staff attendance
- AI chatbot for devotee assistance

## Structure
- `backend` (Node.js + Express + Mongoose)
- `frontend` (React + Vite)

## Run
1. Copy `backend/.env.example` to `backend/.env`
2. Start backend:
   - `npm run dev:backend`
3. Start frontend:
   - `npm run dev:frontend`
