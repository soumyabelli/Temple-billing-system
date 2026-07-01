
const fs = require("fs");
const path = require("path");

const attendancePath = path.join("c:\\temple billing system", "frontend", "src", "pages", "staff", "Attendance.jsx");
const staffDashboardPath = path.join("c:\\temple billing system", "frontend", "src", "pages", "staff", "StaffDashboard.jsx");
const appPath = path.join("c:\\temple billing system", "frontend", "src", "App.jsx");

let attendanceCode = fs.readFileSync(attendancePath, "utf-8");

// Remove the aside and the header from Attendance
// and the <main> wrapper if any. Or we just replace the render return.

// Find the return statement of Attendance
const returnRegex = /return \(\s*<div className="staff-dashboard-page staff-attendance-page">([\s\S]*?)<\/div>\s*\);/;
const match = attendanceCode.match(returnRegex);

if (match) {
    let returnContent = match[1];
    
    // Remove the aside
    returnContent = returnContent.replace(/<aside className="staff-sidebar">[\s\S]*?<\/aside>/, "");
    
    // Remove the header
    returnContent = returnContent.replace(/<header className="staff-header attendance-header">[\s\S]*?<\/header>/, "");
    
    // Remove <main className="staff-main attendance-main"> and its closing tag, we just return a fragment or div
    returnContent = returnContent.replace(/<main className="staff-main attendance-main">/, "<div className=\"attendance-section-wrapper\">");
    returnContent = returnContent.replace(/<\/main>/, "</div>");
    
    attendanceCode = attendanceCode.replace(returnRegex, `return (${returnContent});`);
    fs.writeFileSync(attendancePath, attendanceCode, "utf-8");
    console.log("Refactored Attendance.jsx UI");
} else {
    console.log("Could not find the return block in Attendance.jsx");
}

// Now update StaffDashboard.jsx to import Attendance and render it.
let staffCode = fs.readFileSync(staffDashboardPath, "utf-8");

if (!staffCode.includes("import Attendance")) {
    staffCode = staffCode.replace(/import Notifications from "\.\/Notifications";/, `import Notifications from "./Notifications";\nimport Attendance from "./Attendance";`);
}

// Modify the navigation for Attendance
staffCode = staffCode.replace(
    /onClick=\{\(\) => navigate\("\/staff\/attendance"\)\}/g,
    `onClick={() => setActiveSection("attendance")}`
);

// Add the Attendance section rendering
if (!staffCode.includes(`activeSection === "attendance"`)) {
    const notificationsSection = /\{!loading && activeSection === "notifications" \? \([\s\S]*?\) : null\}/;
    const replacement = `{!loading && activeSection === "notifications" ? (
          <Notifications staffId={staffId} />
        ) : null}

        {!loading && activeSection === "attendance" ? (
          <Attendance />
        ) : null}`;
    
    staffCode = staffCode.replace(notificationsSection, replacement);
    fs.writeFileSync(staffDashboardPath, staffCode, "utf-8");
    console.log("Updated StaffDashboard.jsx");
}

// Update App.jsx to remove /staff/attendance route
let appCode = fs.readFileSync(appPath, "utf-8");
appCode = appCode.replace(/import Attendance from "\.\/pages\/staff\/Attendance";/, "");
appCode = appCode.replace(/<Route\s*path="\/staff\/attendance"[\s\S]*?<\/ProtectedRoute>\s*\}\s*\/>/, "");
fs.writeFileSync(appPath, appCode, "utf-8");
console.log("Updated App.jsx");

