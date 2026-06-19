# Priest Dashboard - Setup & Implementation Guide

## Overview
A comprehensive priest dashboard has been created for the Sri Shanti Mahadev Mandir temple billing system. This dashboard appears after a priest logs in and displays personalized information for that specific priest.

## Features Implemented

### 1. **Welcome Header**
- Displays personalized greeting with priest's name
- Shows current date and day
- Professional header design

### 2. **Statistics Cards**
- **Today's Pooja**: Number of poojas scheduled for today
- **Upcoming Pooja**: Number of poojas scheduled for upcoming days
- **Completed Today**: Number of services completed today
- **Pending Services**: Number of services pending
- **Total Devotees**: Total devotees registered in the system

### 3. **Today's Schedule**
- Detailed table showing all services for today
- Columns: Time, Pooja/Service, Devotee, Status
- Color-coded status indicators:
  - ✅ Completed (Green)
  - ⏳ In Progress (Amber)
  - 📅 Upcoming (Blue)
  - ⏹️ Pending (Red)

### 4. **Today's Seva Duties**
- List of important duties to be performed
- Time slots for each duty
- Detailed descriptions of each duty
- Icons for visual distinction

### 5. **Upcoming Poojas Section**
- Shows next scheduled poojas
- Includes date/time and devotee name
- Quick access to view all upcoming poojas

### 6. **Completed Services Section**
- Shows services completed by the priest
- Historical data for verification and records

### 7. **Announcements Section**
- Important announcements and notifications
- Festival notifications (e.g., Brahmotsavam 2025)
- Meeting schedules
- Special events

### 8. **Quick Actions**
- View Assigned Poojas
- Update Service Status
- View Devotees
- Easy access to common functions

## File Structure

```
frontend/
├── src/
│   ├── pages/
│   │   └── priest/
│   │       ├── PriestDashboard.jsx     (Main dashboard component)
│   │       └── PriestDashboard.css     (Dashboard styling)
│   ├── layouts/
│   │   └── PriestLayout.jsx            (Optional layout wrapper)
│   ├── services/
│   │   └── priestService.js            (API service calls)
│   └── App.jsx                         (Routing configured)
```

## How It Works

### 1. **Authentication Flow**
1. Priest logs in at `/auth-login` page
2. Enters credentials and selects "Priest" role
3. Backend authenticates and returns user data with role="priest"
4. Frontend redirects to `/priest` route
5. PriestDashboard component loads with priest's personalized data

### 2. **User Data**
- User information comes from `useAuth()` context
- Priest name is displayed in the header: "Welcome back, {user?.name}! 🙏"
- User ID can be used to fetch priest-specific data

### 3. **Data Display**
- Current dashboard shows demo data
- Production integration will use API calls from `priestService.js`
- Data can be real-time or cached based on requirements

## Installation & Setup

### 1. **Backend Endpoints Required** (if implementing live data)
```
GET /api/priests/:priestId/dashboard         - Get dashboard stats
GET /api/priests/:priestId/schedule/today    - Get today's schedule
GET /api/priests/:priestId/poojas/upcoming   - Get upcoming poojas
GET /api/priests/:priestId/services/completed - Get completed services
GET /api/priests/:priestId/duties             - Get seva duties
GET /api/announcements                        - Get announcements
GET /api/devotees                             - Get devotee list
PUT /api/poojas/:poojaId/status              - Update pooja status
```

### 2. **Frontend Setup**
```bash
cd frontend
npm install  # Ensure react-icons, axios are installed
npm run dev  # Run development server
```

### 3. **Test the Dashboard**
1. Start the backend server
2. Start the frontend development server
3. Navigate to http://localhost:5173/auth-login
4. Use priest credentials to login
5. You should be redirected to `/priest` dashboard

## Component Integration

### Using the PriestService
```javascript
import { getPriestDashboard, getPriestTodaySchedule } from "../../services/priestService";

// In a useEffect hook
useEffect(() => {
  const fetchData = async () => {
    try {
      const dashboardData = await getPriestDashboard(user.id);
      setStats(dashboardData.stats);
      const schedule = await getPriestTodaySchedule(user.id);
      setTodaySchedule(schedule);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  fetchData();
}, [user.id]);
```

## Customization

### 1. **Change Colors**
Modify the Tailwind classes in PriestDashboard.jsx:
- Primary color: `orange-500` → Change to your preferred color
- Secondary color: `purple-500` → Change to your preferred color
- Accent colors in stat cards can be customized

### 2. **Add More Sections**
Create new components and import them into PriestDashboard.jsx

### 3. **Dark Mode**
Dark mode toggle is available and fully implemented using Tailwind CSS classes

### 4. **Responsive Design**
Dashboard is fully responsive:
- Mobile: Single column layout
- Tablet: 2-3 column layout
- Desktop: Full multi-column layout

## Dark Mode Toggle

The dashboard includes a dark mode toggle in the topbar. Users can:
1. Click the dark mode icon in the topbar
2. Toggle between light and dark themes
3. Theme preference is maintained during the session

## Styling Details

### Tailwind Classes Used
- `bg-[#f5f3ef]` - Light background
- `bg-[#0f172a]` - Dark background
- `border-[#ece8e1]` - Light border
- `border-[#374151]` - Dark border
- `text-[#1d1b19]` - Light text
- `text-slate-100` - Dark text

### Responsive Classes
- `grid-cols-1` - Mobile
- `md:grid-cols-5` - Tablet and above
- `lg:col-span-2` - Large screens

## Security Considerations

1. **Protected Route**: `/priest` route is protected by `ProtectedRoute` component
2. **Role Verification**: Only users with "priest" role can access
3. **User Data**: Priest data comes from authenticated user context
4. **API Calls**: All API calls should include authentication headers (handled by axios interceptor)

## Future Enhancements

1. **Real-time Notifications**: Add WebSocket for real-time updates
2. **Analytics**: Add charts and analytics for priest performance
3. **Task Management**: Add task assignment and tracking
4. **Leave Management**: Integration with leave management system
5. **Reports**: Generate performance and duty reports
6. **Settings**: Personal dashboard settings and preferences
7. **Notifications Panel**: Expandable notification center

## Troubleshooting

### Issue: Dashboard not showing priest name
**Solution**: Verify that `useAuth()` context is properly providing user data from localStorage

### Issue: Data not loading
**Solution**: Check browser console for API errors, verify backend is running on port 5000

### Issue: Styling looks broken
**Solution**: Ensure Tailwind CSS is properly configured in `tailwind.config.js`

### Issue: Dark mode not working
**Solution**: Check that darkMode state is being passed correctly to all child components

## File References

- [PriestDashboard Component](./src/pages/priest/PriestDashboard.jsx)
- [PriestDashboard Styles](./src/pages/priest/PriestDashboard.css)
- [Priest Service](./src/services/priestService.js)
- [App Routing](./src/App.jsx) - Line 490-493
- [Auth Context](./src/context/AuthContext.jsx)
- [Auth Service](./src/services/authService.js)

## Support

For issues or questions about the priest dashboard implementation, refer to the file structure above or check the existing admin/staff dashboard implementations for reference patterns.
