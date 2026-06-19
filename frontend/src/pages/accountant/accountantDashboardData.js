import {
  FaBell,
  FaBoxes,
  FaClock,
  FaCreditCard,
  FaDonate,
  FaFileInvoiceDollar,
  FaHome,
  FaReceipt,
  FaUserCircle,
  FaUsers,
  FaWallet,
  FaRupeeSign,
} from "react-icons/fa";
import { MdPayments, MdOutlineVolunteerActivism, MdTempleBuddhist } from "react-icons/md";
import { TbReportAnalytics } from "react-icons/tb";

export const accountantSidebarPrimary = [
  { label: "Dashboard", icon: FaHome },
  { label: "Donations", icon: FaDonate },
  { label: "Billing", icon: FaFileInvoiceDollar },
  { label: "Payments", icon: MdPayments },
  { label: "Receipts", icon: FaReceipt },
  { label: "Pooja Revenue", icon: MdTempleBuddhist },
  { label: "Prasadam Sales", icon: MdOutlineVolunteerActivism },
  { label: "Inventory Finance", icon: FaBoxes },
  { label: "Devotee Payments", icon: FaUsers },
  { label: "Reports & Analytics", icon: TbReportAnalytics },
];

export const accountantSidebarUtility = [
  { label: "Notifications", icon: FaBell },
  { label: "Profile", icon: FaUserCircle },
];

export const accountantStats = [
  {
    title: "Today's Collection",
    value: "Rs 25,000",
    change: "+12.5% from yesterday",
    tone: "up",
    icon: FaRupeeSign,
  },
  {
    title: "Monthly Revenue",
    value: "Rs 4,85,000",
    change: "+18.4% this month",
    tone: "up",
    icon: FaWallet,
  },
  {
    title: "Total Donations",
    value: "Rs 1,78,500",
    change: "+9.1% from last month",
    tone: "up",
    icon: FaDonate,
  },
  {
    title: "Pending Payments",
    value: "Rs 6,500",
    change: "-5.4% from yesterday",
    tone: "down",
    icon: FaClock,
  },
  {
    title: "Pooja Revenue",
    value: "Rs 1,12,000",
    change: "+7.1% from last month",
    tone: "up",
    icon: MdTempleBuddhist,
  },
  {
    title: "Prasadam Revenue",
    value: "Rs 82,250",
    change: "+11.6% from last month",
    tone: "up",
    icon: MdOutlineVolunteerActivism,
  },
];

export const collectionTrend = [
  { label: "17 May", value: 9000 },
  { label: "18 May", value: 15000 },
  { label: "19 May", value: 18500 },
  { label: "20 May", value: 22000 },
  { label: "21 May", value: 16000 },
  { label: "22 May", value: 26500 },
  { label: "23 May", value: 25000 },
];

export const categorySegments = [
  { label: "Donations", value: 40, valueText: "40%", color: "#f7931e" },
  { label: "Pooja Bookings", value: 30, valueText: "30%", color: "#ffa45b" },
  { label: "Prasadam Sales", value: 15, valueText: "15%", color: "#ffbf3f" },
  { label: "Special Services", value: 10, valueText: "10%", color: "#e67f1e" },
  { label: "Others", value: 5, valueText: "5%", color: "#c56b10" },
];

export const paymentSegments = [
  { label: "UPI", value: 45, valueText: "45%", color: "#ff8c1a" },
  { label: "Cash", value: 30, valueText: "30%", color: "#ffa45b" },
  { label: "Card", value: 15, valueText: "15%", color: "#ffbf3f" },
  { label: "Net Banking", value: 10, valueText: "10%", color: "#c56b10" },
];

export const recentTransactions = [
  {
    title: "Donation - General",
    receipt: "Receipt #DNT1256",
    amount: "Rs 2,500",
    time: "10:30 AM",
    icon: FaDonate,
  },
  {
    title: "Pooja Booking - Abhisheka",
    receipt: "Receipt #PJB1255",
    amount: "Rs 1,200",
    time: "09:45 AM",
    icon: MdTempleBuddhist,
  },
  {
    title: "Prasadam Sale",
    receipt: "Receipt #PRS1254",
    amount: "Rs 350",
    time: "09:20 AM",
    icon: FaReceipt,
  },
  {
    title: "Donation - Annadanam",
    receipt: "Receipt #DNT1253",
    amount: "Rs 5,000",
    time: "08:55 AM",
    icon: MdOutlineVolunteerActivism,
  },
  {
    title: "Pooja Booking - Archana",
    receipt: "Receipt #PJB1252",
    amount: "Rs 500",
    time: "08:30 AM",
    icon: FaClock,
  },
];

export const monthlySummary = [
  { label: "Total Revenue", value: "Rs 4,85,000" },
  { label: "Total Expenses", value: "Rs 1,25,000" },
  { label: "Net Income", value: "Rs 3,60,000", tone: "positive" },
  { label: "Total Transactions", value: "1,254" },
];

export const pendingBills = [
  {
    billNo: "BILL1258",
    devoteeName: "Ramesh Kumar",
    amount: "Rs 1,500",
    dueDate: "24 May 2025",
    overdue: true,
  },
  {
    billNo: "BILL1257",
    devoteeName: "Sita Devi",
    amount: "Rs 2,000",
    dueDate: "24 May 2025",
    overdue: true,
  },
  {
    billNo: "BILL1256",
    devoteeName: "Venkatesh B.",
    amount: "Rs 1,200",
    dueDate: "25 May 2025",
    overdue: true,
  },
  {
    billNo: "BILL1255",
    devoteeName: "Anitha Rao",
    amount: "Rs 1,800",
    dueDate: "26 May 2025",
    overdue: true,
  },
];

export const dashboardQuickActions = [
  "Add Donation",
  "Generate Bill",
  "Record Payment",
  "Open Receipts",
  "View Reports",
  "Send Reminder",
];

export const donationSummaryStats = [
  { label: "Today's Donations", value: "Rs 42,000", note: "18 donations recorded" },
  { label: "Monthly Donations", value: "Rs 5,80,000", note: "This month total" },
  { label: "Top Donor", value: "Shri Ramesh Kumar", note: "Rs 25,000" },
  { label: "Total Donation Revenue", value: "Rs 18,25,000", note: "All time revenue" },
];

export const donationRows = [
  {
    receiptNumber: "DNT1256",
    donorName: "Ramesh Kumar",
    mobileNumber: "9876543210",
    donationCategory: "General Donation",
    amount: "Rs 2,500",
    paymentMethod: "UPI",
    date: "23 May 2025",
    status: "Completed",
  },
  {
    receiptNumber: "DNT1255",
    donorName: "Sita Devi",
    mobileNumber: "9988776655",
    donationCategory: "Annadanam",
    amount: "Rs 5,000",
    paymentMethod: "Cash",
    date: "23 May 2025",
    status: "Completed",
  },
  {
    receiptNumber: "DNT1254",
    donorName: "Anitha Rao",
    mobileNumber: "9123456780",
    donationCategory: "Temple Renovation",
    amount: "Rs 10,000",
    paymentMethod: "Card",
    date: "22 May 2025",
    status: "Pending",
  },
  {
    receiptNumber: "DNT1253",
    donorName: "Venkatesh B.",
    mobileNumber: "9345678901",
    donationCategory: "Festival Donation",
    amount: "Rs 7,500",
    paymentMethod: "UPI",
    date: "22 May 2025",
    status: "Completed",
  },
  {
    receiptNumber: "DNT1252",
    donorName: "Lakshmi Devi",
    mobileNumber: "9012345678",
    donationCategory: "General Donation",
    amount: "Rs 1,200",
    paymentMethod: "UPI",
    date: "21 May 2025",
    status: "Completed",
  },
];

export const billingStats = [
  { label: "Total Bills", value: "1,248", note: "All generated bills" },
  { label: "Paid Bills", value: "1,094", note: "87.8% settled" },
  { label: "Pending Bills", value: "154", note: "Awaiting payment" },
  { label: "Total Billing Revenue", value: "Rs 8,45,000", note: "Current billing cycle" },
];

export const billingRows = [
  { billNumber: "BILL1258", devoteeName: "Ramesh Kumar", serviceName: "Archana Pooja", amount: "Rs 500", status: "Paid", date: "23 May 2025" },
  { billNumber: "BILL1257", devoteeName: "Sita Devi", serviceName: "Abhisheka", amount: "Rs 1,200", status: "Paid", date: "23 May 2025" },
  { billNumber: "BILL1256", devoteeName: "Anitha Rao", serviceName: "Festival Pooja", amount: "Rs 2,500", status: "Pending", date: "22 May 2025" },
  { billNumber: "BILL1255", devoteeName: "Venkatesh B.", serviceName: "Annadanam", amount: "Rs 5,000", status: "Paid", date: "22 May 2025" },
  { billNumber: "BILL1254", devoteeName: "Lakshmi Devi", serviceName: "Special Seva", amount: "Rs 1,800", status: "Pending", date: "21 May 2025" },
];

export const paymentStats = [
  { label: "Today's Payments", value: "Rs 68,450", note: "128 transactions" },
  { label: "Cash Collection", value: "Rs 21,500", note: "31.4% of total" },
  { label: "UPI Collection", value: "Rs 32,650", note: "47.7% of total" },
  { label: "Online Collection", value: "Rs 14,300", note: "20.9% of total" },
];

export const paymentRows = [
  { transactionId: "TXN1256", devoteeName: "Ramesh Kumar", amount: "Rs 2,500", paymentMethod: "UPI", paymentStatus: "Verified", date: "23 May 2025" },
  { transactionId: "TXN1255", devoteeName: "Sita Devi", amount: "Rs 5,000", paymentMethod: "Cash", paymentStatus: "Verified", date: "23 May 2025" },
  { transactionId: "TXN1254", devoteeName: "Anitha Rao", amount: "Rs 1,200", paymentMethod: "Card", paymentStatus: "Pending", date: "22 May 2025" },
  { transactionId: "TXN1253", devoteeName: "Venkatesh B.", amount: "Rs 7,500", paymentMethod: "UPI", paymentStatus: "Verified", date: "22 May 2025" },
  { transactionId: "TXN1252", devoteeName: "Lakshmi Devi", amount: "Rs 1,800", paymentMethod: "Online", paymentStatus: "Verified", date: "21 May 2025" },
];

export const paymentDailyTrend = [
  { label: "19 May", value: 14000 },
  { label: "20 May", value: 18500 },
  { label: "21 May", value: 22000 },
  { label: "22 May", value: 17500 },
  { label: "23 May", value: 25650 },
  { label: "24 May", value: 28450 },
  { label: "25 May", value: 32450 },
];

export const receiptTabs = [
  "Donation Receipts",
  "Pooja Receipts",
  "Payment Receipts",
  "Bill Receipts",
  "Festival Receipts",
  "Prasadam Receipts",
];

export const receiptRows = [
  { receiptId: "RCPT1256", receiptType: "Donation Receipts", name: "Ramesh Kumar", amount: "Rs 2,500", date: "23 May 2025" },
  { receiptId: "RCPT1255", receiptType: "Pooja Receipts", name: "Sita Devi", amount: "Rs 1,200", date: "23 May 2025" },
  { receiptId: "RCPT1254", receiptType: "Payment Receipts", name: "Anitha Rao", amount: "Rs 5,000", date: "22 May 2025" },
  { receiptId: "RCPT1253", receiptType: "Bill Receipts", name: "Venkatesh B.", amount: "Rs 1,800", date: "22 May 2025" },
  { receiptId: "RCPT1252", receiptType: "Festival Receipts", name: "Lakshmi Devi", amount: "Rs 7,500", date: "21 May 2025" },
  { receiptId: "RCPT1251", receiptType: "Prasadam Receipts", name: "Rajesh Kumar", amount: "Rs 350", date: "21 May 2025" },
];

export const poojaRevenueStats = [
  { label: "Today's Pooja Revenue", value: "Rs 18,500", note: "12 bookings completed" },
  { label: "Monthly Revenue", value: "Rs 2,85,000", note: "Current month" },
  { label: "Total Bookings", value: "248", note: "This month" },
  { label: "Completed Bookings", value: "231", note: "93.1% completion" },
];

export const poojaRevenueRows = [
  { bookingId: "BKG1256", devoteeName: "Ramesh Kumar", poojaName: "Archana", amount: "Rs 500", date: "23 May 2025" },
  { bookingId: "BKG1255", devoteeName: "Sita Devi", poojaName: "Abhisheka", amount: "Rs 1,200", date: "23 May 2025" },
  { bookingId: "BKG1254", devoteeName: "Anitha Rao", poojaName: "Sahasranama", amount: "Rs 2,000", date: "22 May 2025" },
  { bookingId: "BKG1253", devoteeName: "Venkatesh B.", poojaName: "Maha Abhisheka", amount: "Rs 2,500", date: "22 May 2025" },
  { bookingId: "BKG1252", devoteeName: "Lakshmi Devi", poojaName: "Special Seva", amount: "Rs 1,800", date: "21 May 2025" },
];

export const poojaRevenueTypeSegments = [
  { label: "Archana", value: 35, valueText: "35%", color: "#f7931e" },
  { label: "Abhisheka", value: 28, valueText: "28%", color: "#ffa45b" },
  { label: "Special Seva", value: 20, valueText: "20%", color: "#ffbf3f" },
  { label: "Festival Pooja", value: 17, valueText: "17%", color: "#c56b10" },
];

export const poojaMonthlyTrend = [
  { label: "Jan", value: 21000 },
  { label: "Feb", value: 26000 },
  { label: "Mar", value: 22000 },
  { label: "Apr", value: 28000 },
  { label: "May", value: 32000 },
  { label: "Jun", value: 30500 },
  { label: "Jul", value: 34500 },
];

export const prasadamStats = [
  { label: "Daily Sales", value: "Rs 12,780", note: "76 items sold" },
  { label: "Monthly Sales", value: "Rs 1,45,600", note: "Current month" },
  { label: "Total Revenue", value: "Rs 9,85,000", note: "All time" },
  { label: "Best Selling Item", value: "Laddu", note: "28 units sold" },
];

export const prasadamRows = [
  { itemName: "Laddu", quantitySold: "28", price: "Rs 50", totalAmount: "Rs 1,400", date: "23 May 2025" },
  { itemName: "Pulihora", quantitySold: "22", price: "Rs 40", totalAmount: "Rs 880", date: "23 May 2025" },
  { itemName: "Panakam", quantitySold: "18", price: "Rs 30", totalAmount: "Rs 540", date: "22 May 2025" },
  { itemName: "Curd Rice", quantitySold: "16", price: "Rs 35", totalAmount: "Rs 560", date: "22 May 2025" },
  { itemName: "Vada", quantitySold: "12", price: "Rs 25", totalAmount: "Rs 300", date: "21 May 2025" },
];

export const prasadamTrend = [
  { label: "19 May", value: 8400 },
  { label: "20 May", value: 9200 },
  { label: "21 May", value: 10150 },
  { label: "22 May", value: 11000 },
  { label: "23 May", value: 12780 },
  { label: "24 May", value: 11850 },
  { label: "25 May", value: 13250 },
];

export const prasadamItemSegments = [
  { label: "Laddu", value: 32, valueText: "32%", color: "#f7931e" },
  { label: "Pulihora", value: 24, valueText: "24%", color: "#ffa45b" },
  { label: "Panakam", value: 18, valueText: "18%", color: "#ffbf3f" },
  { label: "Other Items", value: 26, valueText: "26%", color: "#c56b10" },
];

export const inventoryStats = [
  { label: "Inventory Value", value: "Rs 3,25,000", note: "Current stock value" },
  { label: "Monthly Purchases", value: "Rs 1,20,000", note: "This month" },
  { label: "Total Expenses", value: "Rs 2,45,000", note: "Ledger expenses" },
  { label: "Pending Purchases", value: "Rs 18,500", note: "Awaiting approval" },
];

export const inventoryRows = [
  { itemName: "Ghee", quantity: "40 kg", purchaseCost: "Rs 18,000", supplier: "Sri Suppliers", date: "23 May 2025" },
  { itemName: "Flowers", quantity: "120 bunches", purchaseCost: "Rs 12,000", supplier: "Flora Traders", date: "23 May 2025" },
  { itemName: "Oil", quantity: "60 liters", purchaseCost: "Rs 15,000", supplier: "Temple Mart", date: "22 May 2025" },
  { itemName: "Rice", quantity: "200 kg", purchaseCost: "Rs 20,000", supplier: "Agro Supplies", date: "22 May 2025" },
  { itemName: "Incense", quantity: "50 boxes", purchaseCost: "Rs 4,500", supplier: "Divine Aroma", date: "21 May 2025" },
];

export const inventoryTrend = [
  { label: "Jan", value: 22000 },
  { label: "Feb", value: 26000 },
  { label: "Mar", value: 24000 },
  { label: "Apr", value: 28000 },
  { label: "May", value: 30000 },
  { label: "Jun", value: 32000 },
  { label: "Jul", value: 28000 },
];

export const inventoryExpenseSegments = [
  { label: "Ghee", value: 30, valueText: "30%", color: "#f7931e" },
  { label: "Flowers", value: 22, valueText: "22%", color: "#ffa45b" },
  { label: "Rice", value: 18, valueText: "18%", color: "#ffbf3f" },
  { label: "Other Supplies", value: 30, valueText: "30%", color: "#c56b10" },
];

export const devoteePaymentStats = [
  { label: "Total Devotees Paid", value: "3,154", note: "Unique devotees" },
  { label: "Pending Payments", value: "154", note: "Awaiting settlement" },
  { label: "Total Collected", value: "Rs 8,45,000", note: "All payments" },
];

export const devoteePaymentRows = [
  { devoteeName: "Ramesh Kumar", mobile: "9876543210", paymentType: "Donation", amount: "Rs 2,500", status: "Paid", date: "23 May 2025" },
  { devoteeName: "Sita Devi", mobile: "9988776655", paymentType: "Pooja", amount: "Rs 1,200", status: "Paid", date: "23 May 2025" },
  { devoteeName: "Anitha Rao", mobile: "9123456780", paymentType: "Prasadam", amount: "Rs 350", status: "Pending", date: "22 May 2025" },
  { devoteeName: "Venkatesh B.", mobile: "9345678901", paymentType: "Bill", amount: "Rs 1,800", status: "Paid", date: "22 May 2025" },
  { devoteeName: "Lakshmi Devi", mobile: "9012345678", paymentType: "Festival", amount: "Rs 7,500", status: "Paid", date: "21 May 2025" },
];

export const reportCategories = [
  "Daily Collection Report",
  "Monthly Collection Report",
  "Donation Report",
  "Billing Report",
  "Pooja Report",
  "Payment Report",
  "Inventory Report",
];

export const reportRevenueGrowth = [
  { label: "Jan", value: 180000 },
  { label: "Feb", value: 220000 },
  { label: "Mar", value: 210000 },
  { label: "Apr", value: 260000 },
  { label: "May", value: 320000 },
  { label: "Jun", value: 350000 },
  { label: "Jul", value: 380000 },
];

export const reportDonationSegments = [
  { label: "Donations", value: 45, valueText: "45%", color: "#f7931e" },
  { label: "Pooja", value: 25, valueText: "25%", color: "#ffa45b" },
  { label: "Prasadam", value: 15, valueText: "15%", color: "#ffbf3f" },
  { label: "Bills", value: 15, valueText: "15%", color: "#c56b10" },
];

export const reportExpenseSegments = [
  { label: "Inventory", value: 35, valueText: "35%", color: "#f7931e" },
  { label: "Maintenance", value: 25, valueText: "25%", color: "#ffa45b" },
  { label: "Staff", value: 20, valueText: "20%", color: "#ffbf3f" },
  { label: "Utilities", value: 20, valueText: "20%", color: "#c56b10" },
];

export const notificationTabs = [
  "All Notifications",
  "Payment Alerts",
  "Donation Alerts",
  "Billing Alerts",
];

export const notificationRows = [
  { title: "Payment Alert", type: "Payment Alerts", message: "TXN1254 is pending verification.", date: "23 May 2025", status: "Unread" },
  { title: "Donation Alert", type: "Donation Alerts", message: "New donation of Rs 10,000 recorded.", date: "23 May 2025", status: "Unread" },
  { title: "Billing Alert", type: "Billing Alerts", message: "Bill BILL1256 is overdue.", date: "22 May 2025", status: "Read" },
  { title: "Payment Alert", type: "Payment Alerts", message: "UPI settlement received from bank.", date: "22 May 2025", status: "Read" },
  { title: "Donation Alert", type: "Donation Alerts", message: "Annadanam donation campaign is active.", date: "21 May 2025", status: "Unread" },
];

export const profileDetails = {
  name: "Accountant",
  email: "accountant@temple.org",
  phone: "+91 98765 43210",
  role: "Accountant",
  joiningDate: "12 Feb 2012",
};
