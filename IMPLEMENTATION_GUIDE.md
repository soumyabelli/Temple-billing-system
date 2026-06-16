# Devotee Registration & Multi-Channel Notification System - Implementation Guide

## 🎯 Overview

This comprehensive system enables devotees to register with complete personal information and automatically receive notifications via Email, SMS, and phone when they make bookings, donations, or order prasadam.

## ✅ What's Been Implemented

### 1. **Enhanced User Registration**
- **New Registration Fields:**
  - Name (required)
  - Email (required)
  - Phone Number (required) - 10 digits
  - Address (required)
  - Place/City (required)
  - Password (required) - minimum 6 characters
  - Confirm Password (required) - must match password

**File:** `frontend/src/pages/auth/RegisterPage.jsx`

### 2. **Backend Models Updated**
All models now support devotee information tracking:

#### User Model
```javascript
{
  name, email, phone, address, place, password, role, etc.
}
```
**File:** `backend/src/models/User.js`

#### Booking Model
- Added `devoteeId` (reference to User)
- Added `devoteePhone` field
- Existing fields: `devoteeName`, `devoteeEmail`, `service`, `datetime`, `amount`, `status`, `contactNumber`, `notes`

**File:** `backend/src/models/Booking.js`

#### Donation Model
- Added `donorPhone` field
- Existing fields: `donorName`, `donorEmail`, `amount`, `category`, `transactionId`, etc.

**File:** `backend/src/models/Donation.js`

#### PrasadamOrder Model
- Added `devoteeId` reference
- Added `phone` field
- Existing fields: `devoteeName`, `email`, `itemName`, `quantity`, `amount`, `status`, etc.

**File:** `backend/src/models/PrasadamOrder.js`

### 3. **Multi-Channel Communication Service**
A complete notification system that sends messages via:
- **Email** - HTML formatted messages with details
- **SMS** - Concise text messages
- **In-App Notifications** - Stored in database

**File:** `backend/src/utils/communicationService.js`

**Key Functions:**
```javascript
// Send booking confirmation
await sendBookingConfirmation(devotee, booking);

// Send donation receipt
await sendDonationReceipt(donor, donation);

// Send prasadam order confirmation
await sendPrasadamOrderConfirmation(devotee, order);

// Send individual notifications
await sendEmail({to, subject, html, text});
await sendSMS({to, message});
await sendNotification({to, subject, message});
```

### 4. **Enhanced Authentication Controller**
- Updated `registerUser()` to accept and validate all new fields
- Password confirmation validation
- Updated `sanitizeUser()` to include new fields

**File:** `backend/src/controllers/authController.js`

### 5. **Enhanced Devotee Controller**
Updated all endpoints to:
- Capture devotee phone and contact information
- Send multi-channel notifications on booking/donation/order
- Include profile management with all fields
- Store devotee references for tracking

**Files:** 
- `backend/src/controllers/devoteeController.js`

**Updated Methods:**
- `createBooking()` - Now sends email + SMS
- `createDonation()` - Now sends email + SMS
- `createPrasadamOrder()` - Now sends email + SMS
- `getProfile()` - Returns all profile fields
- `updateProfile()` - Allows updating all fields

### 6. **Devotee Profile Component**
New React component for viewing and editing profile information.

**File:** `frontend/src/components/DevoteeProfile.jsx`

**Features:**
- View complete profile information
- Edit profile with validation
- Shows which phone/email will receive notifications
- Loading states and error handling

## 📝 API Endpoints

### Registration (No Auth Required)
```
POST /api/auth/register
Body: {
  name: "John Devotee",
  email: "john@example.com",
  phone: "9876543210",
  address: "123 Main Street",
  place: "Chennai",
  password: "secure123",
  confirmPassword: "secure123",
  role: "devotee"
}
```

### Get Profile
```
GET /api/devotee/profile?email=john@example.com
Response: {
  profile: {
    id, name, email, phone, address, place, role, memberSince
  }
}
```

### Update Profile
```
PUT /api/devotee/profile
Body: {
  currentEmail: "john@example.com",
  name: "John Updated",
  email: "john@example.com",
  phone: "9876543210",
  address: "456 Oak Street",
  place: "Bangalore"
}
```

### Create Booking (Now with Notifications)
```
POST /api/devotee/bookings
Body: {
  devoteeId: "user_id",
  devoteeName: "John Devotee",
  devoteeEmail: "john@example.com",
  devoteePhone: "9876543210",
  service: "Pooja Booking",
  datetime: "2026-06-15 10:00 AM",
  amount: 5000,
  notes: "Special requirements"
}
Response: Booking created + Email sent + SMS sent
```

### Create Donation (Now with Notifications)
```
POST /api/devotee/donations
Body: {
  donorName: "John Devotee",
  donorEmail: "john@example.com",
  donorPhone: "9876543210",
  amount: 1000,
  category: "Temple Maintenance",
  paymentMethod: "UPI",
  transactionId: "TXN123456"
}
Response: Donation created + Email receipt + SMS confirmation
```

### Create Prasadam Order (Now with Notifications)
```
POST /api/devotee/prasadam-orders
Body: {
  devoteeId: "user_id",
  devoteeName: "John Devotee",
  email: "john@example.com",
  phone: "9876543210",
  itemName: "Laddu Prasadam",
  quantity: 2,
  paymentMethod: "UPI"
}
Response: Order created + Email confirmation + SMS notification
```

## 🔔 Notification Flow

### When Booking is Created:
1. ✅ Booking saved to database
2. ✅ Database notification created
3. 📧 Email sent to `devoteeEmail`
4. 📱 SMS sent to `devoteePhone`
5. 💾 Communications logged to `/backend/src/logs/communications.log`

### When Donation is Received:
1. ✅ Donation saved to database
2. ✅ Donation notification created
3. 📧 Receipt email sent with details
4. 📱 SMS confirmation sent
5. 💾 Transaction logged

### When Prasadam Order Placed:
1. ✅ Order saved to database
2. ✅ Order notification created
3. 📧 Confirmation email sent
4. 📱 SMS notification sent
5. 💾 Order logged

## 🚀 Frontend Integration

### Using the Profile Component
```jsx
import DevoteeProfile from "../../components/DevoteeProfile";

// In your dashboard/profile page:
<DevoteeProfile />
```

### Using Registration
Users can register at:
```
/register
```

The form includes all validation for:
- Email format validation
- Phone number (10 digits)
- Password confirmation matching
- Required field validation

## 📧 Email & SMS Setup (TODO - Production)

The communication service is currently configured with **mock implementations** for testing. 

### To Enable Real Email Delivery:
Install and configure a mail service (Nodemailer, SendGrid, AWS SES):
```bash
npm install nodemailer
```

Update `backend/src/utils/communicationService.js`:
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async ({to, subject, html, text}) => {
  return transporter.sendMail({to, subject, html, text});
};
```

### To Enable Real SMS Delivery:
Install Twilio or AWS SNS:
```bash
npm install twilio
```

Update `backend/src/utils/communicationService.js`:
```javascript
const twilio = require('twilio')(accountSid, authToken);

const sendSMS = async ({to, message}) => {
  return twilio.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE,
    to: to
  });
};
```

## 📊 Database Migration Notes

If you have existing users, run this migration:
```javascript
db.users.updateMany(
  { phone: { $exists: false } },
  { $set: { phone: "", address: "", place: "" } }
);
```

## 🧪 Testing Checklist

- [ ] Register new devotee with all fields
- [ ] Verify profile shows all information
- [ ] Create booking and check email/SMS logs
- [ ] Create donation and check receipt sent
- [ ] Place prasadam order and verify notifications
- [ ] Update profile and verify changes saved
- [ ] Check communications.log file for records

## 📁 Files Modified

1. **Backend Models:**
   - `src/models/User.js` - Added phone, address, place
   - `src/models/Booking.js` - Added devoteeId, devoteePhone
   - `src/models/Donation.js` - Added donorPhone
   - `src/models/PrasadamOrder.js` - Added devoteeId, phone

2. **Backend Controllers:**
   - `src/controllers/authController.js` - Enhanced registration
   - `src/controllers/devoteeController.js` - Multi-channel notifications

3. **Backend Services:**
   - `src/utils/communicationService.js` - NEW: Complete notification system

4. **Frontend Pages:**
   - `src/pages/auth/RegisterPage.jsx` - Enhanced with all fields

5. **Frontend Components:**
   - `src/components/DevoteeProfile.jsx` - NEW: Profile management UI

## 🔐 Security Notes

1. **Passwords:** Already hashed with bcrypt (10 rounds)
2. **Emails:** Normalized (lowercase, trimmed)
3. **Phone:** Validated for 10-digit format
4. **Validation:** Client-side and server-side validation

## 📞 Support

For issues or questions:
1. Check the logs at `/backend/src/logs/communications.log`
2. Verify environment variables are set correctly
3. Ensure database is running and connected
4. Check browser console for frontend errors

---

**Status:** ✅ Complete - Ready for Testing & Production Integration
