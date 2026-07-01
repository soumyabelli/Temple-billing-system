import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import templeImage from "../../assets/temple.jpg.png";
import { useAuth } from "../../context/AuthContext";
import { getDonationTypes } from "../../services/donationTypeService";
import { getPoojaTypes } from "../../services/poojaTypeService";
import {
  getDevoteeBookings,
  getDevoteeDonations,
  getDevoteeNotifications,
  getDevoteeProfile,
  updateDevoteeProfile,
  getDevoteeEvents,
  createDevoteeDonation,
  createDevoteeBooking,
  createRazorpayOrder,
  verifyRazorpayPayment,
  submitDevoteeSupport,
  getSupportRequests,
  getPrasadamOrders,
  createPrasadamOrder,
  cancelPrasadamOrder,
  markNotificationAsRead,
} from "../../services/devoteeService";

const menuItems = [
  { label: "Dashboard", icon: "home" },
  { label: "Book Pooja", icon: "book" },
  { label: "My Bookings", icon: "calendar" },
  { label: "Donations", icon: "heart" },
  { label: "Receipts", icon: "receipt" },
  { label: "Festival Events", icon: "temple" },
  { label: "Notifications", icon: "bell" },
  { label: "Profile", icon: "user" },
  { label: "Support", icon: "gear" },
];

const formatCurrency = (value) => {
  const amount = Number(String(value ?? "").replace(/[^0-9.-]+/g, ""));
  return `Rs ${Number.isNaN(amount) ? 0 : amount.toLocaleString("en-IN")}`;
};

const formatDateDisplay = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTimeDisplay = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const buildReceiptId = (prefix, item = {}) => {
  const source = item.bookingNumber || item.transactionId || item._id || item.id || Date.now();
  return `${prefix}-${String(source).slice(-8).toUpperCase()}`;
};

// Helper function to check if a booking is upcoming (datetime in future)
const isUpcomingBooking = (booking) => {
  if (!booking.datetime) return false;
  const bookingTime = new Date(booking.datetime).getTime();
  const now = new Date().getTime();
  return bookingTime > now;
};

// Helper function to count unread notifications
const countUnreadNotifications = (notifications = []) => {
  return notifications.filter((n) => !n.read).length;
};

const normalizePrasadamStatus = (status) => {
  switch (status) {
    case "Placed":
      return "Pending";
    case "Preparing":
      return "Processing";
    case "Ready":
      return "Ready for Pickup";
    case "Delivered":
      return "Completed";
    default:
      return status || "Pending";
  }
};

const getPrasadamStatusTone = (status) => {
  const normalized = normalizePrasadamStatus(status);
  if (normalized === "Cancelled") return "bg-[#fde8e8] text-[#a12525]";
  if (normalized === "Rejected") return "bg-[#fde8e8] text-[#a12525]";
  if (normalized === "Pending") return "bg-[#faefcf] text-[#ce7a0f]";
  if (normalized === "Approved") return "bg-[#e6f0ff] text-[#3058d6]";
  if (normalized === "Processing") return "bg-[#eef4ff] text-[#234ea5]";
  if (normalized === "Ready for Pickup") return "bg-[#edf7ee] text-[#16853f]";
  if (normalized === "Completed") return "bg-[#edf7ee] text-[#16853f]";
  return "bg-[#edf7ee] text-[#16853f]";
};

const canCancelPrasadamOrder = (status) => {
  return false;
};

const glassCard =
  "rounded-[28px] border border-white/50 bg-white/35 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.06)] backdrop-blur-lg";
const glassSection =
  "rounded-[28px] border border-white/45 bg-white/25 p-5 shadow-[0_15px_40px_rgba(0,0,0,0.04)] backdrop-blur-lg";
const glassInput =
  "w-full rounded-[24px] border border-white/70 bg-white/75 px-4 py-3 text-base text-[#4f3f26] outline-none shadow-sm shadow-[#d9c8a1]/40 backdrop-blur-sm";
const glassButton =
  "rounded-[24px] bg-gradient-to-r from-[#b46a13] via-[#f29f41] to-[#ffbc6e] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(184,122,57,0.22)] transition hover:shadow-[0_18px_38px_rgba(184,122,57,0.24)]";
const glassButtonSoft =
  "rounded-[24px] bg-[#fff3d8] px-5 py-3 text-sm font-semibold text-[#7f4b11] shadow-[0_8px_22px_rgba(128,88,40,0.14)] transition hover:bg-[#ffe4b4]";
const glassItem =
  "rounded-[26px] border border-white/40 bg-white/20 p-4 shadow-sm backdrop-blur-md";

const AppIcon = ({ name, className = "h-5 w-5" }) => {
  const base = "fill-none stroke-current stroke-2";
  if (name === "home") {
    return (
      <svg viewBox="0 0 24 24" className={`${className} ${base}`}>
        <path d="M3 10.5L12 3l9 7.5"></path>
        <path d="M5.5 9.5V21h13V9.5"></path>
      </svg>
    );
  }
  if (name === "book") {
    return (
      <svg viewBox="0 0 24 24" className={`${className} ${base}`}>
        <rect x="4" y="4" width="16" height="16" rx="2"></rect>
        <path d="M8 4v16M11 8h5M11 12h5"></path>
      </svg>
    );
  }
  if (name === "calendar") {
    return (
      <svg viewBox="0 0 24 24" className={`${className} ${base}`}>
        <rect x="3.5" y="5" width="17" height="15.5" rx="2"></rect>
        <path d="M7 3v4M17 3v4M3.5 9h17M8.5 13h3v3h-3z"></path>
      </svg>
    );
  }
  if (name === "heart") {
    return (
      <svg viewBox="0 0 24 24" className={`${className} ${base}`}>
        <path d="M12 20s-6.5-4.2-8.5-8.2a5 5 0 0 1 8.1-5.6l.4.4.4-.4a5 5 0 0 1 8.1 5.6C18.5 15.8 12 20 12 20z"></path>
      </svg>
    );
  }
  if (name === "bag") {
    return (
      <svg viewBox="0 0 24 24" className={`${className} ${base}`}>
        <path d="M6 8h12l-1 12H7L6 8zM9 8V6a3 3 0 0 1 6 0v2"></path>
      </svg>
    );
  }
  if (name === "wallet") {
    return (
      <svg viewBox="0 0 24 24" className={`${className} ${base}`}>
        <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H19v14H5.5A2.5 2.5 0 0 1 3 16.5v-9z"></path>
        <path d="M19 9h2v6h-2M15.5 12h1"></path>
      </svg>
    );
  }
  if (name === "receipt") {
    return (
      <svg viewBox="0 0 24 24" className={`${className} ${base}`}>
        <path d="M6 3h12v18l-2.2-1.4L13.6 21l-2.2-1.4L9.2 21 7 19.6 4.8 21V3z"></path>
        <path d="M9 8h6M9 12h6"></path>
      </svg>
    );
  }
  if (name === "temple") {
    return (
      <svg viewBox="0 0 24 24" className={`${className} ${base}`}>
        <path d="M3 20h18M5 20v-6h14v6M7 14V9l5-4 5 4v5"></path>
      </svg>
    );
  }
  if (name === "bell") {
    return (
      <svg viewBox="0 0 24 24" className={`${className} ${base}`}>
        <path d="M15 18h5l-1.3-1.3a1 1 0 0 1-.3-.7V11a6.4 6.4 0 1 0-12.8 0v5a1 1 0 0 1-.3.7L4 18h5"></path>
        <path d="M10 18a2 2 0 1 0 4 0"></path>
      </svg>
    );
  }
  if (name === "user") {
    return (
      <svg viewBox="0 0 24 24" className={`${className} ${base}`}>
        <circle cx="12" cy="8" r="3.5"></circle>
        <path d="M5.5 20a6.5 6.5 0 0 1 13 0"></path>
      </svg>
    );
  }
  if (name === "gear") {
    return (
      <svg viewBox="0 0 24 24" className={`${className} ${base}`}>
        <circle cx="12" cy="12" r="3.2"></circle>
        <path d="M12 2.8v2.4M12 18.8v2.4M21.2 12h-2.4M5.2 12H2.8M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7M18.5 18.5l-1.7-1.7M7.2 7.2 5.5 5.5"></path>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={`${className} ${base}`}>
      <rect x="4" y="4" width="16" height="16" rx="2"></rect>
    </svg>
  );
};

const IconCircle = ({ className, icon }) => (
  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${className}`}>
    <AppIcon name={icon} className="h-7 w-7" />
  </div>
);

const SidebarItem = ({ label, icon, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[20px] font-semibold transition ${
      active
        ? "bg-gradient-to-r from-[#ff9f2f] to-[#ff6a00] text-white shadow-[0_8px_24px_rgba(255,106,0,0.38)]"
        : "text-[#2d1608] border border-white/35 bg-white/35 backdrop-blur-sm hover:bg-white/60"
    }`}
  >
    <AppIcon name={icon} className="h-[21px] w-[21px]" />
    <span className="text-[20px] leading-none">{label}</span>
  </button>
);

const DevoteeDashboard = () => {
  const navigate = useNavigate();
  const { user, logoutUser, updateUser } = useAuth();
  const [activePage, setActivePage] = useState("Dashboard");
  const [bookingsData, setBookingsData] = useState([]);
  const [donationsData, setDonationsData] = useState([]);
  const [notificationsData, setNotificationsData] = useState([]);
  const [eventsData, setEventsData] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [prasadamOrders, setPrasadamOrders] = useState([]);
  const [profileData, setProfileData] = useState({
    name: user?.name || "Devotee User",
    email: user?.email || "devotee@example.com",
    role: "devotee",
    memberSince: "2025",
  });
  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [poojaTypes, setPoojaTypes] = useState(getPoojaTypes());
  const [bookingService, setBookingService] = useState(getPoojaTypes()[0]?.name || "Abhisheka");
  const [bookingDatetime, setBookingDatetime] = useState("");
  const [bookingAmount, setBookingAmount] = useState(getPoojaTypes()[0]?.price || 501);
  const [bookingContact, setBookingContact] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [bookingPaymentMethod, setBookingPaymentMethod] = useState("UPI");
  const [showAllReceipts, setShowAllReceipts] = useState(false);
  const [showAllBookings, setShowAllBookings] = useState(false);
  const [showAllDonations, setShowAllDonations] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const [bookingTab, setBookingTab] = useState("Pooja");
  const [roomType, setRoomType] = useState("Standard Non-AC Room");
  const [roomCheckIn, setRoomCheckIn] = useState("");
  const [roomCheckOut, setRoomCheckOut] = useState("");
  const [roomAmount, setRoomAmount] = useState(500);
  const [roomPaymentMethod, setRoomPaymentMethod] = useState("UPI");
  const [roomLoading, setRoomLoading] = useState(false);
  const [roomSuccess, setRoomSuccess] = useState("");
  const [roomError, setRoomError] = useState("");
  const [donationCategories, setDonationCategories] = useState(getDonationTypes());
  const [donationCategory, setDonationCategory] = useState(getDonationTypes()[0] || "General");
  const [supportRequests, setSupportRequests] = useState([]);
  const [donationAmount, setDonationAmount] = useState(501);
  const [donationMethod, setDonationMethod] = useState("UPI");
  const [donationContact, setDonationContact] = useState("");
  const [donationNotes, setDonationNotes] = useState("");
  const [donationLoading, setDonationLoading] = useState(false);
  const [donationError, setDonationError] = useState("");
  const [donationSuccess, setDonationSuccess] = useState("");
  const [donationView, setDonationView] = useState("All");
  const [profileEditMode, setProfileEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", email: "", phone: "", address: "", place: "" });
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [prasadamForm, setPrasadamForm] = useState({
    itemName: "Laddu Prasadam",
    quantity: 1,
    paymentMethod: "UPI",
  });
  const [prasadamMessage, setPrasadamMessage] = useState("");
  const [supportStatus, setSupportStatus] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const prasadamMenu = useMemo(
    () => ({
      "Laddu Prasadam": 151,
      "Panchamrit Prasadam": 101,
      "Pulihora Prasadam": 121,
      "Sweet Pongal Prasadam": 131,
      "Curd Rice Prasadam": 111,
    }),
    []
  );

  const paymentMethods = ["UPI", "Card", "Bank Transfer", "Net Banking"];

  const minBookingDatetime = useMemo(() => {
    const d = new Date(currentDateTime || new Date());
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }, [currentDateTime]);

  const devoteeName = useMemo(() => profileData.name || user?.name || "Devotee User", [profileData.name, user?.name]);

  const upcomingBookings = useMemo(() => bookingsData.filter(isUpcomingBooking), [bookingsData]);

  const unreadNotificationsCount = useMemo(() => countUnreadNotifications(notificationsData), [notificationsData]);

  const formatNotifications = (notifications = []) =>
    (notifications || []).map((notification) => ({
      ...notification,
      date: notification.date
        ? new Date(notification.date).toLocaleDateString()
        : notification.createdAt
        ? new Date(notification.createdAt).toLocaleDateString()
        : "",
      message: notification.message || notification.title || "",
    }));

  const totalDonations = useMemo(
    () => donationsData.reduce((sum, donation) => sum + (typeof donation.amount === "number" ? donation.amount : Number(donation.amount) || 0), 0),
    [donationsData]
  );

  const prasadamOrdersCount = useMemo(() => prasadamOrders.length, [prasadamOrders]);

  const stats = useMemo(
    () => [
      {
        title: "Upcoming Bookings",
        value: `${upcomingBookings.length}`,
        action: "View Details",
        tone: "bg-purple-500/15 text-purple-700",
        cardStyle: "border-purple-500/30 bg-purple-500/5 text-[#58219c]",
        icon: "calendar",
      },
      {
        title: "Pooja Booked",
        value: `${bookingsData.length}`,
        action: "View Bookings",
        tone: "bg-blue-500/15 text-blue-700",
        cardStyle: "border-blue-500/30 bg-blue-500/5 text-[#1e40af]",
        icon: "calendar",
      },
      {
        title: "Total Donations",
        value: formatCurrency(totalDonations),
        action: "View History",
        tone: "bg-emerald-500/15 text-emerald-700",
        cardStyle: "border-emerald-500/30 bg-emerald-500/5 text-[#065f46]",
        icon: "heart",
      },
      {
        title: "Prasadam Orders",
        value: `${prasadamOrdersCount}`,
        action: "View Orders",
        tone: "bg-orange-500/15 text-orange-700",
        cardStyle: "border-orange-500/30 bg-orange-500/5 text-[#9a3412]",
        icon: "bag",
      },
    ],
    [upcomingBookings.length, bookingsData.length, totalDonations, prasadamOrdersCount]
  );

  const upcomingFestival = useMemo(() => {
    if (!eventsData || eventsData.length === 0) {
      return {
        title: "Ganesh Chaturthi 2026",
        dateDisplay: "07 September 2026",
      };
    }

    const now = Date.now();
    // Filter events in the future
    const futureEvents = eventsData
      .filter((e) => e.date && new Date(e.date).getTime() >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (futureEvents.length > 0) {
      const nextEv = futureEvents[0];
      return {
        title: nextEv.title || nextEv.name,
        dateDisplay: nextEv.formattedDate || new Date(nextEv.date).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }),
      };
    }

    // Fallback to the latest event
    const sorted = [...eventsData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latestEv = sorted[0];
    return {
      title: latestEv.title || latestEv.name,
      dateDisplay: latestEv.formattedDate || new Date(latestEv.date).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }),
    };
  }, [eventsData]);

  const displayCategories = useMemo(() => {
    if (selectedEventId) {
      const selectedEvent = eventsData.find((e) => e._id === selectedEventId);
      if (selectedEvent && selectedEvent.title) {
        return [selectedEvent.title];
      }
    }
    return donationCategories;
  }, [selectedEventId, eventsData, donationCategories]);

  useEffect(() => {
    if (selectedEventId) {
      const selectedEvent = eventsData.find((e) => e._id === selectedEventId);
      if (selectedEvent && selectedEvent.title) {
        setDonationCategory(selectedEvent.title);
      }
    } else {
      setDonationCategory(donationCategories[0] || "General");
    }
  }, [selectedEventId, eventsData, donationCategories]);

  useEffect(() => {
    const loadDevoteeData = async () => {
      try {
        const [bookingsRes, donationsRes, notificationsRes, profileRes, eventsRes, prasadamRes] = await Promise.all([
          getDevoteeBookings(user?.email),
          getDevoteeDonations(user?.email),
          getDevoteeNotifications(user?.email),
          getDevoteeProfile(user?.email),
          getDevoteeEvents(),
          getPrasadamOrders(user?.email),
        ]);

        setBookingsData(bookingsRes.bookings || []);
        setDonationsData(
          (donationsRes.donations || []).map((donation) => {
            const eventMatch = (eventsRes.events || []).find((ev) => ev._id === donation.eventId || ev._id === String(donation.eventId));
            return {
              ...donation,
              eventTitle: eventMatch ? eventMatch.title : undefined,
              type: donation.category || donation.type || "Donation",
              date: donation.createdAt ? new Date(donation.createdAt).toLocaleDateString() : donation.date || "",
              amount: donation.amount,
            };
          })
        );
        setNotificationsData(
          (notificationsRes.notifications || []).map((notification) => ({
            ...notification,
            date: notification.date
              ? new Date(notification.date).toLocaleDateString()
              : notification.createdAt
              ? new Date(notification.createdAt).toLocaleDateString()
              : "",
            message: notification.message || notification.title || "",
          }))
        );
        setProfileData(profileRes.profile || profileData);
        setProfileForm({
          name: profileRes?.profile?.name || user?.name || "",
          email: profileRes?.profile?.email || user?.email || "",
          phone: profileRes?.profile?.phone || "",
          address: profileRes?.profile?.address || "",
          place: profileRes?.profile?.place || "",
        });
        setPoojaTypes(getPoojaTypes());
        setBookingService((prevService) => {
          const savedTypes = getPoojaTypes();
          if (!savedTypes.length) return prevService;
          return savedTypes.some((type) => type.name === prevService) ? prevService : savedTypes[0].name;
        });
        setBookingAmount((prevAmount) => {
          const selected = getPoojaTypes().find((type) => type.name === bookingService);
          return selected?.price || prevAmount;
        });
        setDonationCategories(getDonationTypes());
        setDonationCategory((prevCategory) => {
          const types = getDonationTypes();
          return types.includes(prevCategory) ? prevCategory : types[0] || "General";
        });
        setSupportRequests((await getSupportRequests(user?.email)).requests || []);
        setEventsData(
          (eventsRes.events || []).map((event) => ({
            ...event,
            formattedDate: event.date ? new Date(event.date).toLocaleDateString() : event.date || "",
          }))
        );
        setPrasadamOrders(prasadamRes.orders || []);
      } catch (error) {
        console.warn("Unable to load devotee data", error);
      }
    };

    loadDevoteeData();
  }, []);

  useEffect(() => {
    const selected = poojaTypes.find((type) => type.name === bookingService);
    if (selected) {
      setBookingAmount(selected.price);
    }
  }, [bookingService, poojaTypes]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  const quickDonate = async (eventItem) => {
    const loadRazorpayScript = () =>
      new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });

    try {
      const amountStr = window.prompt(`Enter donation amount for ${eventItem.title}`, String(donationAmount || 501));
      if (!amountStr) return;
      const amt = Number(amountStr);
      if (Number.isNaN(amt) || amt <= 0) {
        window.alert("Please enter a valid positive amount.");
        return;
      }

      setDonationError("");
      // switch to donations page and preselect event
      setSelectedEventId(eventItem._id);
      setDonationView("Festival");
      setActivePage("Donations");
      // Create Razorpay order on backend and a pending donation record
      const { order, donation, key, simulated } = await createRazorpayOrder({
        amount: amt,
        donorName: profileData.name,
        donorEmail: profileData.email,
        donorPhone: profileData.phone,
        category: donationCategory,
        paymentMethod: donationMethod,
        notes: donationNotes,
        eventId: eventItem._id,
      });

      // If server returned a simulated donation (no Razorpay keys), treat as completed and refresh UI
      if (simulated || (donation && donation.status === "Completed")) {
        const [updatedDonations, eventsRes, notificationsRes] = await Promise.all([
          getDevoteeDonations(user?.email),
          getDevoteeEvents(),
          getDevoteeNotifications(user?.email),
        ]);

        setDonationsData(
          (updatedDonations.donations || []).map((donation) => {
            const eventMatch = (eventsRes.events || []).find((ev) => ev._id === donation.eventId || ev._id === String(donation.eventId));
            return {
              ...donation,
              eventTitle: eventMatch ? eventMatch.title : undefined,
              date: donation.createdAt ? new Date(donation.createdAt).toLocaleDateString() : donation.date || "",
              amount: donation.amount,
            };
          })
        );

        setEventsData((eventsRes.events || []).map((event) => ({ ...event, formattedDate: event.date ? new Date(event.date).toLocaleDateString() : event.date || "" })));
        setNotificationsData(formatNotifications(notificationsRes.notifications || []));

        setDonationSuccess("Donation recorded successfully! Thank you. Please note: This payment is final and non-refundable. Your receipt is available in Receipts.");
        setDonationCategory("General");
        setDonationAmount(501);
        setDonationMethod("UPI");
        setDonationContact("");
        setDonationNotes("");
        setSelectedEventId(null);
        setActivePage("Receipts");
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setDonationError("Unable to load payment gateway. Try again later.");
        return;
      }

      const options = {
        key: key || process.env.REACT_APP_RAZORPAY_KEY_ID || "",
        amount: order.amount,
        currency: order.currency,
        name: "Temple Donations",
        description: eventItem.title || "Donation",
        order_id: order.id,
        prefill: {
          name: profileData.name,
          email: profileData.email,
          contact: profileData.phone,
        },
        handler: async function (resp) {
          try {
            setDonationLoading(true);
            await verifyRazorpayPayment({
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
              donationId: donation._id,
            });

            const [updatedDonations, eventsRes, notificationsRes] = await Promise.all([
              getDevoteeDonations(user?.email),
              getDevoteeEvents(),
              getDevoteeNotifications(user?.email),
            ]);

            setDonationsData(
              (updatedDonations.donations || []).map((donation) => {
                const eventMatch = (eventsRes.events || []).find((ev) => ev._id === donation.eventId || ev._id === String(donation.eventId));
                return {
                  ...donation,
                  eventTitle: eventMatch ? eventMatch.title : undefined,
                  date: donation.createdAt ? new Date(donation.createdAt).toLocaleDateString() : donation.date || "",
                  amount: donation.amount,
                };
              })
            );

            setEventsData((eventsRes.events || []).map((event) => ({ ...event, formattedDate: event.date ? new Date(event.date).toLocaleDateString() : event.date || "" })));
            setNotificationsData(formatNotifications(notificationsRes.notifications || []));

            setDonationSuccess("Donation recorded successfully! Thank you. Please note: This payment is final and non-refundable. Your receipt is available in Receipts.");
            setDonationCategory("General");
            setDonationAmount(501);
            setDonationMethod("UPI");
            setDonationContact("");
            setDonationNotes("");
            setSelectedEventId(null);
            setActivePage("Receipts");
          } catch (err) {
            setDonationError(err?.response?.data?.error || "Payment verification failed.");
            console.warn("verify handler error", err);
          } finally {
            setDonationLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            // user closed checkout
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      setDonationError(error?.response?.data?.error || "Unable to process donation.");
      console.warn("quickDonate error", error);
    } finally {
      setDonationLoading(false);
    }
  };

  const handleBookingSubmit = async () => {
    setBookingError("");
    setBookingSuccess("");

    if (!bookingService || !bookingDatetime || !bookingAmount) {
      setBookingError("Please select a pooja, date and amount before booking.");
      return;
    }

    // Validate selected datetime is in the future
    const selected = new Date(bookingDatetime);
    if (Number.isNaN(selected.getTime()) || selected.getTime() <= Date.now()) {
      window.alert("Please select a future date and time for the booking.");
      return;
    }

    if (!bookingPaymentMethod) {
      setBookingError("Please select a payment method for the booking.");
      return;
    }

    const activeEmail = String(profileData.email || user?.email || "").trim().toLowerCase();
    const activeName = String(profileData.name || user?.name || "").trim();
    const activePhone = String(profileData.phone || bookingContact || "").trim();

    if (!activeName || !activeEmail) {
      setBookingError("Please complete your profile name and email before booking a pooja.");
      return;
    }

    const isConfirmed = window.confirm("Once paid, there is no return of money (non-refundable). Do you want to confirm booking?");
    if (!isConfirmed) return;

    setBookingLoading(true);
    try {
      const payload = {
        devoteeName: activeName,
        devoteeEmail: activeEmail,
        devoteePhone: activePhone || undefined,
        service: bookingService,
        datetime: bookingDatetime,
        amount: bookingAmount,
        paymentMethod: bookingPaymentMethod,
        contactNumber: bookingContact || activePhone || undefined,
        notes: bookingNotes || undefined,
      };

      const bookingRes = await createDevoteeBooking(payload);
      const createdBooking = bookingRes?.booking;
      if (createdBooking?._id) {
        setBookingsData((prev) => [createdBooking, ...prev.filter((booking) => booking._id !== createdBooking._id)]);
      }

      try {
        const [bookingsRes, notificationsRes] = await Promise.all([
          getDevoteeBookings(activeEmail),
          getDevoteeNotifications(activeEmail),
        ]);
        setBookingsData(bookingsRes.bookings || (createdBooking ? [createdBooking] : []));
        setNotificationsData(formatNotifications(notificationsRes.notifications || []));
      } catch (refreshError) {
        console.warn("Unable to refresh bookings after create", refreshError);
      }

      const firstPooja = poojaTypes[0];
      setBookingService(firstPooja?.name || "");
      setBookingDatetime("");
      setBookingAmount(firstPooja?.price || 0);
      setBookingContact("");
      setBookingNotes("");
      setBookingPaymentMethod("UPI");
      setBookingSuccess("Booking successful! Your order has been placed and payment is confirmed. Please note: This payment is final and non-refundable.");
      setActivePage("My Bookings");
    } catch (error) {
      console.warn("Unable to create booking", error);
      setBookingError(error?.response?.data?.error || "Unable to create booking. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleRoomSubmit = async () => {
    setRoomError("");
    setRoomSuccess("");

    if (!roomCheckIn || !roomCheckOut) {
      setRoomError("Please select check-in and check-out dates.");
      return;
    }

    const checkInDate = new Date(roomCheckIn);
    const checkOutDate = new Date(roomCheckOut);

    if (Number.isNaN(checkInDate.getTime()) || checkInDate.getTime() <= Date.now()) {
      setRoomError("Check-in date/time must be in the future.");
      return;
    }

    if (Number.isNaN(checkOutDate.getTime()) || checkOutDate.getTime() <= checkInDate.getTime()) {
      setRoomError("Check-out date/time must be after check-in date/time.");
      return;
    }

    // Calculate number of days
    const diffMs = checkOutDate.getTime() - checkInDate.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24)) || 1;
    const finalAmount = roomAmount * diffDays;

    const isConfirmed = window.confirm(`Room Booking Total: ${formatCurrency(finalAmount)} for ${diffDays} day(s). Once paid, it is non-refundable. Do you want to proceed?`);
    if (!isConfirmed) return;

    setRoomLoading(true);
    try {
      const activeEmail = String(profileData.email || user?.email || "").trim().toLowerCase();
      const activeName = String(profileData.name || user?.name || "").trim();
      const activePhone = String(profileData.phone || "").trim();

      const payload = {
        devoteeName: activeName,
        devoteeEmail: activeEmail,
        devoteePhone: activePhone || undefined,
        service: `Room Booking: ${roomType}`,
        datetime: roomCheckIn,
        amount: finalAmount,
        paymentMethod: roomPaymentMethod,
        notes: `Check-in: ${formatDateTimeDisplay(roomCheckIn)} | Check-out: ${formatDateTimeDisplay(roomCheckOut)}`,
      };

      const bookingRes = await createDevoteeBooking(payload);
      const createdBooking = bookingRes?.booking;
      if (createdBooking?._id) {
        setBookingsData((prev) => [createdBooking, ...prev.filter((booking) => booking._id !== createdBooking._id)]);
      }

      try {
        const [bookingsRes, notificationsRes] = await Promise.all([
          getDevoteeBookings(activeEmail),
          getDevoteeNotifications(activeEmail),
        ]);
        setBookingsData(bookingsRes.bookings || []);
        setNotificationsData(formatNotifications(notificationsRes.notifications || []));
      } catch (refreshError) {
        console.warn("Unable to refresh bookings after create", refreshError);
      }

      setRoomSuccess(`Room booking successful! Room Type: ${roomType} for ${diffDays} day(s). Amount paid: ${formatCurrency(finalAmount)}.`);
      setRoomCheckIn("");
      setRoomCheckOut("");
      setActivePage("My Bookings");
    } catch (error) {
      console.warn("Unable to create room booking", error);
      setRoomError(error?.response?.data?.error || "Unable to create room booking. Please try again.");
    } finally {
      setRoomLoading(false);
    }
  };

  const handleDonationSubmit = async () => {
    setDonationError("");
    setDonationSuccess("");

    if (!donationCategory.trim() || donationAmount <= 0) {
      setDonationError("Please choose a donation category and enter a valid amount.");
      return;
    }

    if (donationContact && !/^\+?[0-9\s-]{7,15}$/.test(donationContact.trim())) {
      setDonationError("Please enter a valid contact number for the donation.");
      return;
    }

    const isConfirmed = window.confirm("Once paid, there is no return of money (non-refundable). Do you want to confirm donation?");
    if (!isConfirmed) return;

    setDonationLoading(true);

    try {
      // If user chooses Cash, record donation immediately as completed
      if (!donationMethod || donationMethod === "Cash") {
        await createDevoteeDonation({
          donorName: profileData.name,
          donorEmail: profileData.email,
          donorPhone: profileData.phone,
          amount: donationAmount,
          category: donationCategory,
          paymentMethod: donationMethod || "Cash",
          contactNumber: donationContact,
          notes: donationNotes,
          eventId: selectedEventId || undefined,
        });

        const [updatedDonations, eventsRes, notificationsRes] = await Promise.all([
          getDevoteeDonations(user?.email),
          getDevoteeEvents(),
          getDevoteeNotifications(user?.email),
        ]);

        setDonationsData(
          (updatedDonations.donations || []).map((donation) => {
            const eventMatch = (eventsRes.events || []).find((ev) => ev._id === donation.eventId || ev._id === String(donation.eventId));
            return {
              ...donation,
              eventTitle: eventMatch ? eventMatch.title : undefined,
              date: donation.createdAt ? new Date(donation.createdAt).toLocaleDateString() : donation.date || "",
              amount: donation.amount,
            };
          })
        );
        setEventsData((eventsRes.events || []).map((event) => ({ ...event, formattedDate: event.date ? new Date(event.date).toLocaleDateString() : event.date || "" })));
        setNotificationsData(formatNotifications(notificationsRes.notifications || []));
        setDonationSuccess("Donation recorded successfully! Thank you. Please note: This payment is final and non-refundable. Your receipt is available in Receipts.");
        setDonationCategory("General");
        setDonationAmount(501);
        setDonationMethod("UPI");
        setDonationContact("");
        setDonationNotes("");
        setSelectedEventId(null);
        setActivePage("Receipts");
        return;
      }

      // Otherwise, treat as online payment and create a Razorpay order
      const loadRazorpayScript = () =>
        new Promise((resolve) => {
          if (window.Razorpay) return resolve(true);
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });

      const { order, donation, key, simulated } = await createRazorpayOrder({
        amount: donationAmount,
        donorName: profileData.name,
        donorEmail: profileData.email,
        donorPhone: profileData.phone,
        category: donationCategory,
        paymentMethod: donationMethod,
        notes: donationNotes,
        eventId: selectedEventId || undefined,
      });

      // If server returned a simulated donation (no Razorpay keys), treat as completed and refresh UI
      if (simulated || (donation && donation.status === "Completed")) {
        const [updatedDonations, eventsRes, notificationsRes] = await Promise.all([
          getDevoteeDonations(user?.email),
          getDevoteeEvents(),
          getDevoteeNotifications(user?.email),
        ]);

        setDonationsData(
          (updatedDonations.donations || []).map((donation) => {
            const eventMatch = (eventsRes.events || []).find((ev) => ev._id === donation.eventId || ev._id === String(donation.eventId));
            return {
              ...donation,
              eventTitle: eventMatch ? eventMatch.title : undefined,
              date: donation.createdAt ? new Date(donation.createdAt).toLocaleDateString() : donation.date || "",
              amount: donation.amount,
            };
          })
        );

        setEventsData((eventsRes.events || []).map((event) => ({ ...event, formattedDate: event.date ? new Date(event.date).toLocaleDateString() : event.date || "" })));
        setNotificationsData(formatNotifications(notificationsRes.notifications || []));

        setDonationSuccess("Donation recorded successfully! Thank you. Please note: This payment is final and non-refundable. Your receipt is available in Receipts.");
        setDonationCategory("General");
        setDonationAmount(501);
        setDonationMethod("UPI");
        setDonationContact("");
        setDonationNotes("");
        setSelectedEventId(null);
        setActivePage("Receipts");
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setDonationError("Unable to load payment gateway. Try again later.");
        return;
      }

      const options = {
        key: key || process.env.REACT_APP_RAZORPAY_KEY_ID || "",
        amount: order.amount,
        currency: order.currency,
        name: "Temple Donations",
        description: (eventsData.find((e) => e._id === selectedEventId) || {}).title || donationCategory,
        order_id: order.id,
        prefill: {
          name: profileData.name,
          email: profileData.email,
          contact: profileData.phone,
        },
        handler: async function (resp) {
          try {
            setDonationLoading(true);
            await verifyRazorpayPayment({
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
              donationId: donation._id,
            });

            const [updatedDonations, eventsRes, notificationsRes] = await Promise.all([
              getDevoteeDonations(user?.email),
              getDevoteeEvents(),
              getDevoteeNotifications(user?.email),
            ]);

            setDonationsData(
              (updatedDonations.donations || []).map((donation) => {
                const eventMatch = (eventsRes.events || []).find((ev) => ev._id === donation.eventId || ev._id === String(donation.eventId));
                return {
                  ...donation,
                  eventTitle: eventMatch ? eventMatch.title : undefined,
                  date: donation.createdAt ? new Date(donation.createdAt).toLocaleDateString() : donation.date || "",
                  amount: donation.amount,
                };
              })
            );

            setEventsData((eventsRes.events || []).map((event) => ({ ...event, formattedDate: event.date ? new Date(event.date).toLocaleDateString() : event.date || "" })));
            setNotificationsData(formatNotifications(notificationsRes.notifications || []));

            setDonationSuccess("Donation recorded successfully! Thank you. Please note: This payment is final and non-refundable. Your receipt is available in Receipts.");
            setDonationCategory("General");
            setDonationAmount(501);
            setDonationMethod("UPI");
            setDonationContact("");
            setDonationNotes("");
            setSelectedEventId(null);
            setActivePage("Receipts");
          } catch (err) {
            setDonationError(err?.response?.data?.error || "Payment verification failed.");
            console.warn("verify handler error", err);
          } finally {
            setDonationLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            // user closed checkout
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      setDonationError(error?.response?.data?.error || "Unable to process donation.");
      console.warn("Unable to submit donation", error);
    } finally {
      setDonationLoading(false);
    }
  };

  const handleSupportSubmit = async () => {
    if (!supportSubject.trim() || !supportMessage.trim()) return;

    try {
      await submitDevoteeSupport({
        name: profileData.name,
        email: profileData.email,
        subject: supportSubject,
        message: supportMessage,
      });
      setSupportSubject("");
      setSupportMessage("");
      setSupportStatus("Support request sent to admin successfully.");
      const [notificationsRes, supportRes] = await Promise.all([
        getDevoteeNotifications(user?.email),
        getSupportRequests(user?.email),
      ]);
      setNotificationsData(formatNotifications(notificationsRes.notifications || []));
      setSupportRequests(supportRes.requests || []);
    } catch (error) {
      setSupportStatus("Unable to send support request.");
      console.warn("Unable to send support request", error);
    }
  };

  const addPdfFooter = (doc, margin, pageWidth, pageHeight) => {
    doc.setDrawColor(229, 217, 197);
    doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(112, 103, 94);
    doc.text("Generated by Temple Billing System", margin, pageHeight - 10);
    doc.text("Thank you for your devotion and support.", pageWidth - margin, pageHeight - 10, { align: "right" });
  };

  const downloadPdfFile = (filename, lines) => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 16;
    let y = 42;

    doc.setFillColor(180, 106, 19);
    doc.rect(0, 0, pageWidth, 28, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Sri Shanti Mahadev Mandir", margin, 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Temple Billing System Report", margin, 20);

    doc.setTextColor(31, 29, 25);
    doc.setFontSize(10);
    lines.forEach((line) => {
      const splitLines = doc.splitTextToSize(String(line), pageWidth - margin * 2);
      splitLines.forEach((text) => {
        if (y > pageHeight - 26) {
          addPdfFooter(doc, margin, pageWidth, pageHeight);
          doc.addPage();
          y = 24;
        }
        doc.text(text, margin, y);
        y += 7;
      });
    });

    addPdfFooter(doc, margin, pageWidth, pageHeight);
    doc.save(filename);
  };

  const downloadReceiptPdf = ({ filename, title, receiptId, receiptDate, status, devotee, details, items, totalAmount, notes }) => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 16;
    let y = 18;

    doc.setFillColor(180, 106, 19);
    doc.rect(0, 0, pageWidth, 34, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.text("Sri Shanti Mahadev Mandir", margin, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Official Temple Receipt", margin, y + 8);
    doc.text(`Receipt No: ${receiptId}`, pageWidth - margin, y, { align: "right" });
    doc.text(`Date: ${receiptDate}`, pageWidth - margin, y + 8, { align: "right" });

    y = 48;
    doc.setTextColor(31, 29, 25);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text(title, margin, y);

    doc.setFontSize(9);
    doc.setFillColor(250, 247, 241);
    doc.setDrawColor(229, 217, 197);
    doc.roundedRect(pageWidth - margin - 40, y - 7, 40, 10, 2, 2, "FD");
    doc.setTextColor(116, 81, 25);
    doc.text(String(status || "Completed"), pageWidth - margin - 20, y - 1, { align: "center" });

    y += 12;
    doc.setFillColor(255, 252, 246);
    doc.setDrawColor(235, 226, 213);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 34, 2, 2, "FD");
    doc.setTextColor(31, 29, 25);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Devotee Details", margin + 4, y + 7);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Name: ${devotee.name || "-"}`, margin + 4, y + 15);
    doc.text(`Email: ${devotee.email || "-"}`, margin + 4, y + 22);
    doc.text(`Phone: ${devotee.phone || "-"}`, margin + 4, y + 29);

    y += 44;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Receipt Details", margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    details.filter(Boolean).forEach(([label, value]) => {
      doc.setTextColor(112, 92, 62);
      doc.text(`${label}:`, margin, y);
      doc.setTextColor(31, 29, 25);
      doc.text(String(value || "-"), margin + 42, y);
      y += 7;
    });

    y += 4;
    const tableX = margin;
    const tableWidth = pageWidth - margin * 2;
    const colWidths = [tableWidth - 62, 24, 38];
    const headerHeight = 10;
    doc.setFillColor(255, 240, 223);
    doc.setDrawColor(241, 206, 156);
    doc.rect(tableX, y, tableWidth, headerHeight, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(110, 69, 7);
    doc.text("Description", tableX + 3, y + 6.5);
    doc.text("Qty", tableX + colWidths[0] + 3, y + 6.5);
    doc.text("Amount", tableX + colWidths[0] + colWidths[1] + colWidths[2] - 3, y + 6.5, { align: "right" });
    y += headerHeight;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(31, 29, 25);
    items.forEach((row) => {
      const descriptionLines = doc.splitTextToSize(String(row.description || "-"), colWidths[0] - 6);
      const rowHeight = Math.max(12, descriptionLines.length * 5 + 4);
      doc.setDrawColor(232, 225, 214);
      doc.rect(tableX, y, tableWidth, rowHeight, "S");
      doc.text(descriptionLines, tableX + 3, y + 6);
      doc.text(String(row.quantity || "1"), tableX + colWidths[0] + 3, y + 6);
      doc.text(String(row.amount || "-"), tableX + tableWidth - 3, y + 6, { align: "right" });
      y += rowHeight;
    });

    y += 6;
    doc.setFillColor(250, 247, 241);
    doc.roundedRect(pageWidth - margin - 72, y, 72, 18, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(112, 92, 62);
    doc.text("Total Amount", pageWidth - margin - 68, y + 7);
    doc.setTextColor(31, 29, 25);
    doc.setFontSize(12);
    doc.text(String(totalAmount || "Rs 0"), pageWidth - margin - 4, y + 13, { align: "right" });

    if (notes) {
      y += 28;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Notes", margin, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(doc.splitTextToSize(String(notes), pageWidth - margin * 2), margin, y + 7);
    }

    addPdfFooter(doc, margin, pageWidth, pageHeight);
    doc.save(filename);
  };

  const getReceiptDevotee = (item = {}) => ({
    name: item.devoteeName || item.donorName || profileData.name,
    email: item.devoteeEmail || item.donorEmail || item.email || profileData.email,
    phone: item.devoteePhone || item.donorPhone || item.phone || item.contactNumber || profileData.phone || "",
  });

  const handleReceiptDownload = (item, type = "donation") => {
    if (type === "booking") {
      const receiptId = buildReceiptId("PB", item);
      downloadReceiptPdf({
        filename: `pooja-booking-receipt-${receiptId}.pdf`,
        title: "Pooja Booking Receipt",
        receiptId,
        receiptDate: formatDateDisplay(item.createdAt || new Date()),
        status: item.status || "Pending",
        devotee: getReceiptDevotee(item),
        details: [
          ["Service", item.service || "Pooja Booking"],
          ["Pooja Date", formatDateTimeDisplay(item.datetime)],
          ["Payment Method", item.paymentMethod || "UPI"],
          ["Booking No", item.bookingNumber || item._id || "-"],
        ],
        items: [{ description: item.service || "Pooja Booking", quantity: "1", amount: formatCurrency(item.amount) }],
        totalAmount: formatCurrency(item.amount),
        notes: item.notes,
      });
      return;
    }

    if (type === "prasadam") {
      const receiptId = buildReceiptId("PR", item);
      downloadReceiptPdf({
        filename: `prasadam-receipt-${receiptId}.pdf`,
        title: "Prasadam Receipt",
        receiptId,
        receiptDate: formatDateDisplay(item.createdAt || item.date),
        status: item.status || "Placed",
        devotee: getReceiptDevotee(item),
        details: [
          ["Item", item.itemName || "Prasadam"],
          ["Payment Method", item.paymentMethod || "UPI"],
          ["Unit Price", formatCurrency(item.unitPrice || 0)],
        ],
        items: [{ description: item.itemName || "Prasadam", quantity: item.quantity || 1, amount: formatCurrency(item.amount) }],
        totalAmount: formatCurrency(item.amount),
      });
      return;
    }

    const receiptId = buildReceiptId("DN", item);
    downloadReceiptPdf({
      filename: `donation-receipt-${receiptId}.pdf`,
      title: "Donation Receipt",
      receiptId,
      receiptDate: formatDateDisplay(item.date || item.createdAt),
      status: item.status || "Completed",
      devotee: getReceiptDevotee(item),
      details: [
        ["Donation Type", item.category || item.type || "Donation"],
        ["Payment Method", item.paymentMethod || "UPI"],
        item.eventTitle ? ["Event", item.eventTitle] : null,
        item.transactionId ? ["Transaction ID", item.transactionId] : null,
      ],
      items: [{ description: item.category || item.type || "Donation", quantity: "1", amount: formatCurrency(item.amount) }],
      totalAmount: formatCurrency(item.amount),
      notes: item.notes,
    });
  };

  const handlePaymentHistoryDownload = () => {
    if (historyTab === "Prasadam") {
      const lines = ["Temple Billing System - Prasadam Orders History", "--------------------------------------------"];
      prasadamOrders.forEach((item) => {
        lines.push(
          `${item.createdAt ? new Date(item.createdAt).toLocaleDateString() : item.date || ""} | ${item.itemName}${item.quantity ? ` x${item.quantity}` : ""} | ${formatCurrency(item.amount)} | ${item.status || "Placed"}`
        );
      });
      downloadPdfFile("prasadam-history.pdf", lines);
      return;
    }

    const lines = ["Temple Billing System - Donation History", "-------------------------------------"];
    donationsData.forEach((item) => {
      lines.push(
        `${item.date || (item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "")} | ${item.category || item.type || "Donation"} | ${formatCurrency(item.amount)} | ${item.status || "Completed"}`
      );
    });
    downloadPdfFile("donation-history.pdf", lines);
  };

  const handlePrasadamSubmit = async () => {
    setPrasadamMessage("");
    const isConfirmed = window.confirm("Once paid, there is no return of money (non-refundable). Do you want to confirm order?");
    if (!isConfirmed) return;

    try {
      await createPrasadamOrder({
        devoteeName: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        ...prasadamForm,
      });
      const ordersRes = await getPrasadamOrders(user?.email);
      setPrasadamOrders(ordersRes.orders || []);
      const notificationsRes = await getDevoteeNotifications(user?.email);
      setNotificationsData(formatNotifications(notificationsRes.notifications || []));
      setPrasadamForm({
        itemName: "Laddu Prasadam",
        quantity: 1,
        paymentMethod: "UPI",
      });
      setPrasadamMessage("Prasadam order placed successfully! Payment is confirmed. Please note: This payment is final and non-refundable.");
    } catch (error) {
      setPrasadamMessage(error?.response?.data?.error || "Unable to place prasadam order.");
    }
  };

  const handleCancelPrasadam = async (id) => {
    try {
      await cancelPrasadamOrder(id);
      const ordersRes = await getPrasadamOrders(user?.email);
      setPrasadamOrders(ordersRes.orders || []);
      setPrasadamMessage("Order cancelled successfully.");
    } catch (error) {
      setPrasadamMessage(error?.response?.data?.error || "Unable to cancel order.");
    }
  };

  const handleProfileSave = async () => {
    setProfileError("");
    setProfileMessage("");
    try {
      const res = await updateDevoteeProfile({
        currentEmail: profileData.email,
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
        address: profileForm.address,
        place: profileForm.place,
      });
      setProfileData(res.profile);
      if (updateUser) {
        updateUser({ name: res.profile.name, email: res.profile.email, role: res.profile.role });
      }
      setProfileEditMode(false);
      setProfileMessage("✅ Profile updated successfully!");
      setTimeout(() => setProfileMessage(""), 3000);
    } catch (error) {
      setProfileError(error?.response?.data?.error || "Unable to update profile.");
    }
  };

  const renderDashboard = () => (
    <>
      <section className="mb-5 mt-5">
        <h1 className="text-[2.75rem] font-extrabold leading-tight">Welcome back, {devoteeName}! 🙏</h1>
        <p className="text-[1.35rem] text-[#2d2d2d]">May your visit be blessed.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <article key={item.title} className={`rounded-[26px] border ${item.cardStyle} p-4 shadow-sm backdrop-blur-md`}>
            <div className="mb-4 flex items-center gap-4">
              <IconCircle className={item.tone} icon={item.icon} />
              <p className="text-[1.06rem] text-[#383838]">{item.title}</p>
            </div>
            <p className="text-[2.15rem] font-extrabold leading-none">{item.value}</p>
            <button
              type="button"
              onClick={() => {
                if (item.action === "View Details") setActivePage("My Bookings");
                if (item.action === "View Bookings") setActivePage("My Bookings");
                if (item.action === "View History") setActivePage("Receipts");
                if (item.action === "View Orders") {
                  setActivePage("Book Pooja");
                  setBookingTab("Prasadam");
                }
              }}
              className="mt-4 bg-transparent p-0 text-base font-semibold text-[#bc630f]"
            >
              {item.action}
            </button>
          </article>
        ))}
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-3">
        <article className={`${glassCard}`}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[2rem] font-bold">Upcoming Bookings</h2>
            <button type="button" onClick={() => setActivePage("My Bookings")} className="bg-transparent p-0 text-base font-semibold text-[#bc630f]">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {upcomingBookings.length > 0 ? (
              upcomingBookings.slice(0, 3).map((item) => (
                <div key={`${item.service}-${item.datetime}-${item._id || Math.random()}`} className={glassItem}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-base font-semibold text-[#1f1f1f]">{item.service}</p>
                  </div>
                  <p className="mt-1 text-sm text-[#4f4f4f]">{formatDateTimeDisplay(item.datetime)}</p>
                </div>
              ))
            ) : (
              <div className={`${glassItem} text-[#5d5d5d]`}>No upcoming bookings found yet.</div>
            )}
          </div>
          <div className="pt-4 text-right">
            <button type="button" onClick={() => setActivePage("My Bookings")} className="bg-transparent p-0 text-base font-semibold text-[#3058d6]">
              View All Bookings
            </button>
          </div>
        </article>

        <article className={`${glassCard}`}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[2rem] font-bold">Recent Donations</h2>
            <button type="button" onClick={() => setActivePage("Receipts")} className="bg-transparent p-0 text-base font-semibold text-[#bc630f]">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {donationsData.length > 0 ? (
              donationsData.slice(0, 3).map((item) => (
                <div key={`${item.type}-${item.date}-${item._id || Math.random()}`} className={`${glassItem} flex items-center justify-between`}>
                  <div>
                    <p className="text-base font-semibold text-[#1f1f1f]">{item.type}</p>
                    <p className="text-xs text-[#5d5d5d]">{item.date}</p>
                  </div>
                  <p className="text-base font-bold text-[#1b7f77]">{formatCurrency(item.amount)}</p>
                </div>
              ))
            ) : (
              <div className={`${glassItem} text-[#5d5d5d]`}>No donations yet.</div>
            )}
          </div>
          <div className="pt-4 text-right">
            <button type="button" onClick={() => setActivePage("Receipts")} className="bg-transparent p-0 text-base font-semibold text-[#3058d6]">
              View All Donations
            </button>
          </div>
        </article>

        <article className={`${glassCard}`}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[2rem] font-bold">Notifications</h2>
            <button type="button" onClick={() => setActivePage("Notifications")} className="bg-transparent p-0 text-base font-semibold text-[#bc630f]">
              View All
            </button>
          </div>
          <div className="space-y-3">
              {notificationsData.length > 0 ? (
                notificationsData.slice(0, 3).map((item) => (
                  <div key={`${item.title}-${item.date}-${item._id || Math.random()}`} className="rounded-[24px] border border-white/40 bg-white/55 p-4 shadow-sm backdrop-blur-sm">
                    <p className="text-base font-semibold text-[#1f1f1f]">{item.title}</p>
                    <p className="text-xs text-[#5d5d5d]">{item.date}</p>
                    {item.message ? (
                      <p className="mt-2 text-sm text-[#6b6b6b]">{item.message}</p>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className={`${glassItem} text-[#5d5d5d]`}>No notifications yet.</div>
              )}
          </div>
        </article>
      </section>

      <section className="relative mt-4 overflow-hidden rounded-2xl shadow-lg pb-4">
        <img src={templeImage} alt="Festival banner" className="h-36 w-full object-cover sm:h-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#261009]/85 via-[#51220d]/55 to-transparent"></div>
        <div className="absolute inset-0 flex items-center justify-between px-7 text-white">
          <div>
            <p className="text-xs sm:text-sm uppercase tracking-wider text-[#ffd56e] font-bold">Upcoming Festival</p>
            <h3 className="text-xl sm:text-[2.2rem] font-extrabold leading-tight mt-1">{upcomingFestival.title}</h3>
            <p className="text-sm sm:text-[1.25rem] mt-1 text-[#f3e8ff]">{upcomingFestival.dateDisplay}</p>
          </div>
          <button
            type="button"
            onClick={() => setActivePage("Festival Events")}
            className="rounded-xl border border-white/60 bg-white/20 px-4 py-2 text-sm sm:text-lg font-semibold text-white backdrop-blur-sm hover:bg-white/30 transition"
          >
            View Details
          </button>
        </div>
      </section>
    </>
  );

  const renderBookPooja = () => {
    const selectedUnitPrice = prasadamMenu[prasadamForm.itemName] || 0;
    const totalPrasadamPrice = selectedUnitPrice * (Number(prasadamForm.quantity) || 1);

    return (
      <div className="space-y-6">
        {/* Three Glassy Tabs at the Top */}
        <div className="flex gap-2 sm:gap-4 rounded-3xl bg-white/30 border border-white/40 p-2 backdrop-blur-md shadow-sm max-w-xl">
          <button
            type="button"
            onClick={() => setBookingTab("Pooja")}
            className={`flex-1 py-2.5 px-4 text-xs sm:text-sm font-bold rounded-2xl transition-all duration-200 ${
              bookingTab === "Pooja"
                ? "bg-[#1b7f77] text-white shadow-md scale-[1.02]"
                : "bg-white/40 text-amber-950 hover:bg-white/60"
            }`}
          >
            🌸 Book Pooja
          </button>
          <button
            type="button"
            onClick={() => setBookingTab("Prasadam")}
            className={`flex-1 py-2.5 px-4 text-xs sm:text-sm font-bold rounded-2xl transition-all duration-200 ${
              bookingTab === "Prasadam"
                ? "bg-[#1b7f77] text-white shadow-md scale-[1.02]"
                : "bg-white/40 text-amber-950 hover:bg-white/60"
            }`}
          >
            📦 Order Prasada
          </button>
          <button
            type="button"
            onClick={() => setBookingTab("Room")}
            className={`flex-1 py-2.5 px-4 text-xs sm:text-sm font-bold rounded-2xl transition-all duration-200 ${
              bookingTab === "Room"
                ? "bg-[#1b7f77] text-white shadow-md scale-[1.02]"
                : "bg-white/40 text-amber-950 hover:bg-white/60"
            }`}
          >
            🏨 Book Room
          </button>
        </div>

        {bookingTab === "Pooja" && (
          <div className={`${glassCard}`}>
            <h2 className="text-[2rem] font-bold">Book Pooja</h2>
            <p className="mt-2 text-[#4f4f4f]">Choose a service and book your next pooja online. Your new booking will appear under My Bookings.</p>

            <div className="mt-6 max-w-2xl mx-auto">
              <div className="space-y-5 rounded-[28px] border border-white/45 bg-white/62 p-6 shadow-[0_20px_52px_rgba(113,82,28,0.12)] backdrop-blur-xl">
                <div>
                  <p className="text-sm uppercase tracking-[0.08em] text-[#8d6925]">Service</p>
                  <select
                    value={bookingService}
                    onChange={(e) => {
                      const selectedService = e.target.value;
                      const selectedType = poojaTypes.find((type) => type.name === selectedService);
                      setBookingService(selectedService);
                      setBookingAmount(selectedType?.price || 0);
                    }}
                    className={glassInput}
                  >
                    {poojaTypes.map((service) => (
                      <option key={service.name} value={service.name}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="text-sm uppercase tracking-[0.08em] text-[#8d6925]">Date & time</p>
                  <input
                    type="datetime-local"
                    value={bookingDatetime}
                    onChange={(e) => setBookingDatetime(e.target.value)}
                    min={minBookingDatetime}
                    className={glassInput}
                  />
                </div>

                <div>
                  <p className="text-sm uppercase tracking-[0.08em] text-[#8d6925]">Amount</p>
                  <input
                    type="number"
                    min="1"
                    value={bookingAmount}
                    readOnly
                    className={glassInput}
                  />
                </div>

                <div>
                  <p className="text-sm uppercase tracking-[0.08em] text-[#8d6925]">Payment Method</p>
                  <select value={bookingPaymentMethod} onChange={(e) => setBookingPaymentMethod(e.target.value)} className={glassInput}>
                    {paymentMethods.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleBookingSubmit}
                  disabled={bookingLoading}
                  className="mt-4 w-full rounded-2xl bg-[#1b7f77] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#166353] disabled:cursor-not-allowed disabled:bg-[#9bb8af]"
                >
                  {bookingLoading ? "Booking..." : "Book Pooja"}
                </button>
                <button
                  type="button"
                  onClick={() => setActivePage("My Bookings")}
                  className="mt-2 w-full text-center text-sm font-semibold text-[#1b7f77] hover:underline bg-transparent border-0"
                >
                  View Bookings History
                </button>
                {bookingError ? (
                  <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 mt-2">{bookingError}</p>
                ) : null}
                {bookingSuccess ? (
                  <p className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 mt-2">{bookingSuccess}</p>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {bookingTab === "Prasadam" && (
          <div className={`${glassCard}`}>
            <h2 className="text-[2rem] font-bold">Order Prasadam</h2>
            <p className="mt-2 text-[#4f4f4f]">Select one of the delicious prasadam offerings below to place your order.</p>
            <div className="mt-6 max-w-2xl mx-auto">
              <div className={glassSection}>
                <h3 className="text-xl font-semibold">Order Prasadam Form</h3>
                <div className="mt-4 grid gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#5d5d5d] mb-1">Item Name</label>
                    <select
                      className={glassInput}
                      value={prasadamForm.itemName}
                      onChange={(e) => setPrasadamForm((prev) => ({ ...prev, itemName: e.target.value }))}
                    >
                      {Object.keys(prasadamMenu).map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="rounded-2xl bg-[#fff8ec] px-4 py-3 text-sm border border-amber-100">
                    Price: <strong className="text-amber-900">{formatCurrency(selectedUnitPrice)}</strong> each
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#5d5d5d] mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      className={glassInput}
                      value={prasadamForm.quantity}
                      onChange={(e) => setPrasadamForm((prev) => ({ ...prev, quantity: Number(e.target.value) }))}
                      placeholder="Quantity"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#5d5d5d] mb-1">Payment Method</label>
                    <select
                      className={glassInput}
                      value={prasadamForm.paymentMethod}
                      onChange={(e) => setPrasadamForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                    >
                      <option value="UPI">UPI</option>
                      <option value="Card">Card</option>
                      <option value="Net Banking">Net Banking</option>
                    </select>
                  </div>

                  <div className="rounded-2xl bg-[#fff7e7] px-4 py-3 text-sm font-semibold text-[#8b5a0a] border border-amber-200/50">
                    Total amount: {formatCurrency(totalPrasadamPrice)}
                  </div>
                  
                  <button type="button" onClick={handlePrasadamSubmit} className={glassButton}>Pay & Place Order</button>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePage("Receipts");
                      setHistoryTab("Prasadam");
                    }}
                    className="mt-2 w-full text-center text-sm font-semibold text-[#1b7f77] hover:underline bg-transparent border-0"
                  >
                    View Prasadam Orders History
                  </button>
                  {prasadamMessage && <p className="text-sm text-[#1b7f77] mt-2 font-semibold text-center">{prasadamMessage}</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {bookingTab === "Room" && (
          <div className={`${glassCard}`}>
            <h2 className="text-[2rem] font-bold">Book Guest Room</h2>
            <p className="mt-2 text-[#4f4f4f]">Rent a comfortable guest room at the temple premises for your visit.</p>

            <div className="mt-6 max-w-2xl mx-auto">
              <div className={glassSection}>
                <h3 className="text-xl font-semibold">Room Booking Form</h3>
                <div className="mt-4 grid gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#5d5d5d] mb-1">Room Type</label>
                    <select
                      value={roomType}
                      onChange={(e) => {
                        const selectedType = e.target.value;
                        setRoomType(selectedType);
                        if (selectedType === "Standard Non-AC Room") setRoomAmount(500);
                        else if (selectedType === "Deluxe AC Room") setRoomAmount(1000);
                        else if (selectedType === "VIP Suite") setRoomAmount(2500);
                      }}
                      className={glassInput}
                    >
                      <option value="Standard Non-AC Room">Standard Non-AC Room (Rs 500 / day)</option>
                      <option value="Deluxe AC Room">Deluxe AC Room (Rs 1,000 / day)</option>
                      <option value="VIP Suite">VIP Suite (Rs 2,500 / day)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#5d5d5d] mb-1">Check-in Date & Time</label>
                    <input
                      type="datetime-local"
                      value={roomCheckIn}
                      onChange={(e) => setRoomCheckIn(e.target.value)}
                      className={glassInput}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#5d5d5d] mb-1">Check-out Date & Time</label>
                    <input
                      type="datetime-local"
                      value={roomCheckOut}
                      onChange={(e) => setRoomCheckOut(e.target.value)}
                      className={glassInput}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#5d5d5d] mb-1">Payment Method</label>
                    <select
                      value={roomPaymentMethod}
                      onChange={(e) => setRoomPaymentMethod(e.target.value)}
                      className={glassInput}
                    >
                      <option value="UPI">UPI</option>
                      <option value="Card">Card</option>
                      <option value="Net Banking">Net Banking</option>
                    </select>
                  </div>

                  {roomCheckIn && roomCheckOut && (() => {
                    const days = Math.ceil((new Date(roomCheckOut) - new Date(roomCheckIn)) / (1000 * 60 * 60 * 24)) || 1;
                    if (days > 0) {
                      return (
                        <div className="rounded-2xl bg-[#fff7e7] px-4 py-3 text-sm font-semibold text-[#8b5a0a] border border-amber-200/50">
                          Total Duration: {days} Day(s) | Total Price: {formatCurrency(roomAmount * days)}
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <button
                    type="button"
                    onClick={handleRoomSubmit}
                    disabled={roomLoading}
                    className={glassButton}
                  >
                    {roomLoading ? "Processing room booking..." : "Confirm & Book Room"}
                  </button>

                  {roomError && (
                    <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 mt-2">{roomError}</p>
                  )}
                  {roomSuccess && (
                    <p className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 mt-2">{roomSuccess}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMyBookings = () => {
    // Combine bookingsData (poojas & rooms) and prasadamOrders
    const poojaAndRoomBookings = bookingsData.map(b => ({
      ...b,
      isPrasadam: false,
      isRoom: b.service && b.service.toLowerCase().includes("room"),
      datetimeForSort: b.createdAt ? new Date(b.createdAt).getTime() : (b.datetime ? new Date(b.datetime).getTime() : 0),
    }));

    const prasadamList = (prasadamOrders || []).map(o => ({
      ...o,
      bookingNumber: o.orderNumber || buildReceiptId("PO", o),
      service: `Prasada Order: ${o.itemName} (x${o.quantity || 1})`,
      datetime: o.createdAt || o.date,
      datetimeForSort: o.createdAt ? new Date(o.createdAt).getTime() : (o.date ? new Date(o.date).getTime() : 0),
      amount: o.amount,
      status: o.status || "Placed",
      isPrasadam: true,
      isRoom: false,
    }));

    const combinedList = [...poojaAndRoomBookings, ...prasadamList].sort((a, b) => b.datetimeForSort - a.datetimeForSort);
    const displayedBookings = showAllBookings ? combinedList : combinedList.slice(0, 5);

    return (
      <div className="space-y-6">
        <div className={`${glassCard}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-[2rem] font-bold">My Bookings</h2>
            <div className="flex items-center gap-3">
              {combinedList.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAllBookings(!showAllBookings)}
                  className="rounded-xl bg-[#1b7f77]/10 hover:bg-[#1b7f77]/20 text-[#1b7f77] px-4 py-2 text-sm font-semibold transition"
                >
                  {showAllBookings ? "Show Recent 5" : "View All"}
                </button>
              )}
              <button type="button" onClick={() => { setActivePage("Book Pooja"); setBookingTab("Pooja"); }} className="rounded-2xl bg-[#1b7f77] px-4 py-2 text-sm font-semibold text-white">New Booking</button>
            </div>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm text-[#3f3f3f] border-collapse">
              <thead className="bg-[#fafafa] text-[#575757]">
                <tr className="border-b border-[#ececec]">
                  <th className="px-4 py-3">Booking/Order No</th>
                  <th className="px-4 py-3">Item/Service</th>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedBookings.length > 0 ? (
                  displayedBookings.map((row) => {
                    const itemNo = row.bookingNumber || buildReceiptId(row.isPrasadam ? "PO" : "PB", row);
                    
                    return (
                      <tr key={row._id || `${row.service}-${row.datetime}`} className="border-t border-[#f0f0f0] hover:bg-black/5 transition-colors">
                        <td className="px-4 py-2.5 font-mono text-xs font-semibold text-[#6b6b6b]">{itemNo}</td>
                        <td className="px-4 py-2.5 font-semibold text-[#1a1a1a]">
                          {row.isRoom ? (
                            <span className="flex items-center gap-1.5">
                              <span>🏨</span> {row.service}
                            </span>
                          ) : row.isPrasadam ? (
                            <span className="flex items-center gap-1.5">
                              <span>📦</span> {row.service}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5">
                              <span>🌸</span> {row.service}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-[#4f4f4f]">{formatDateTimeDisplay(row.datetime)}</td>
                        <td className="px-4 py-2.5 font-bold text-[#1b7f77]">{formatCurrency(row.amount)}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex justify-center">
                            <button
                              type="button"
                              onClick={() => handleReceiptDownload(row, row.isPrasadam ? "prasadam" : "booking")}
                              className="rounded-lg bg-[#1b7f77] hover:bg-[#1b7f77]/90 px-3 py-1.5 text-xs font-bold text-white transition shadow-sm"
                            >
                              Download
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-5 text-center text-[#5d5d5d]">
                      No bookings or orders available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderDonations = () => (
    <div className="space-y-6">
      <div className={`${glassCard}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[2rem] font-bold">Donate</h2>
            <p className="mt-2 text-[#4f4f4f]">Give any amount and see your donation reflected in history, payment records, and receipts.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#f4f7f3] px-4 py-3 text-sm font-semibold text-[#1b7f77]">
              Total Donations: {formatCurrency(totalDonations)}
            </div>
            <div className="rounded-xl border border-[#ececec] bg-white px-3 py-1 text-sm">
              <button
                type="button"
                onClick={() => setDonationView("All")}
                className={`px-3 py-1 text-sm font-semibold ${donationView === "All" ? "bg-[#1b7f77] text-white rounded-lg" : "text-[#4f5866] rounded"}`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setDonationView("Festival")}
                className={`ml-2 px-3 py-1 text-sm font-semibold ${donationView === "Festival" ? "bg-[#ff8b00] text-white rounded-lg" : "text-[#4f5866] rounded"}`}
              >
                Festival
              </button>
            </div>
          </div>
        </div>

        <div id="donation-form" className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <div className={glassSection}>
            {selectedEventId && (
              <div className="mb-4 rounded-xl border border-[#efe7de] bg-[#fffaf4] p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#6b6b6b]">Selected Festival</p>
                    <p className="text-lg font-semibold">{(eventsData.find(e => e._id === selectedEventId) || {}).title || "Selected Event"}</p>
                    <p className="text-sm text-[#6b6b6b]">{(eventsData.find(e => e._id === selectedEventId) || {}).formattedDate || ""}</p>
                  </div>
                  <div>
                    <button type="button" onClick={() => { setSelectedEventId(null); }} className="rounded-lg border px-3 py-1 text-sm">Change</button>
                  </div>
                </div>
              </div>
            )}
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#5d5d5d]">Donation Category</label>
                <select
                  value={donationCategory}
                  onChange={(e) => setDonationCategory(e.target.value)}
                  className={glassInput}
                >
                  {displayCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#5d5d5d]">Amount</label>
                <input
                  type="number"
                  min="1"
                  id="donation-amount-input"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(Number(e.target.value))}
                  className={glassInput}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#5d5d5d]">Payment Method</label>
                <select
                  value={donationMethod}
                  onChange={(e) => setDonationMethod(e.target.value)}
                  className={glassInput}
                >
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#5d5d5d]">Contact Number</label>
                <input
                  type="tel"
                  value={donationContact}
                  placeholder="Optional contact"
                  onChange={(e) => setDonationContact(e.target.value)}
                  className={glassInput}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#5d5d5d]">Notes</label>
                <textarea
                  rows={4}
                  value={donationNotes}
                  onChange={(e) => setDonationNotes(e.target.value)}
                  placeholder="Any message for the temple"
                  className={glassInput}
                />
              </div>

              {donationError && <div className="rounded-3xl bg-[#fde8e8] p-4 text-sm text-[#a12525]">{donationError}</div>}
              {donationSuccess && <div className="rounded-3xl bg-[#e8f7ef] p-4 text-sm text-[#1c6f3d]">{donationSuccess}</div>}

              <button
                type="button"
                onClick={handleDonationSubmit}
                disabled={donationLoading}
                className={glassButton}
              >
                {donationLoading ? "Processing donation..." : "Donate Now"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActivePage("Receipts");
                  setHistoryTab("Donations");
                }}
                className="mt-2 w-full text-center text-sm font-semibold text-[#b46a13] hover:underline bg-transparent border-0"
              >
                View Donation History
              </button>
            </div>
          </div>

          <div className={glassSection}>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Donation History</h3>
              {donationsData.length > 5 && (
                <button
                  type="button"
                  onClick={() => setShowAllDonations(!showAllDonations)}
                  className="rounded-xl bg-[#1b7f77]/10 hover:bg-[#1b7f77]/20 text-[#1b7f77] px-3 py-1.5 text-xs font-semibold transition"
                >
                  {showAllDonations ? "Show Recent 5" : "View All"}
                </button>
              )}
            </div>
            <p className="mt-2 text-sm text-[#5d5d5d]">Your latest donations are stored here and used in payment history and receipts.</p>
            <div className="mt-6 space-y-3">
              {(() => {
                const filtered = donationView === "Festival"
                  ? (selectedEventId ? donationsData.filter((d) => String(d.eventId) === String(selectedEventId)) : donationsData.filter((d) => d.eventId))
                  : donationsData;

                if (!filtered || filtered.length === 0) return <div className={glassItem}>No donations have been recorded yet.</div>;

                const displayed = showAllDonations ? filtered : filtered.slice(0, 5);

                return displayed.map((item) => (
                  <div key={`${item._id || Math.random()}`} className="rounded-[26px] border border-white/40 bg-white/55 p-4 shadow-sm backdrop-blur-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-[#1f1f1f]">{item.category || item.type || (item.eventTitle ? `Donation - ${item.eventTitle}` : "Donation")}</p>
                        <p className="text-sm text-[#5d5d5d]">{item.eventTitle ? `${item.eventTitle} • ${item.date || new Date(item.createdAt).toLocaleDateString()}` : item.date || new Date(item.createdAt).toLocaleDateString()}</p>
                      </div>
                      <p className="text-lg font-bold text-[#1b7f77]">{formatCurrency(item.amount)}</p>
                    </div>
                    <p className="mt-2 text-sm text-[#6b6b6b]">{item.paymentMethod || "UPI"} • {item.status || "Completed"}</p>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  const renderPrasadam = () => {
    const selectedUnitPrice = prasadamMenu[prasadamForm.itemName] || 0;
    const totalPrice = selectedUnitPrice * (Number(prasadamForm.quantity) || 1);

    return (
      <div className="space-y-6">
        <div className={`${glassCard}`}>
          <h2 className="text-[2rem] font-bold">Prasadam Orders</h2>
          <div className="mt-6 max-w-2xl mx-auto">
            <div className={glassSection}>
              <h3 className="text-xl font-semibold">Order Prasadam</h3>
              <div className="mt-4 grid gap-3">
                <select className={glassInput} value={prasadamForm.itemName} onChange={(e) => setPrasadamForm((prev) => ({ ...prev, itemName: e.target.value }))}>
                  {Object.keys(prasadamMenu).map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
                <div className="rounded-[24px] bg-[#fff8ec] px-4 py-3 text-sm">Price: {formatCurrency(selectedUnitPrice)} each</div>
                <input type="number" min="1" className={glassInput} value={prasadamForm.quantity} onChange={(e) => setPrasadamForm((prev) => ({ ...prev, quantity: Number(e.target.value) }))} placeholder="Quantity" />
                <select className={glassInput} value={prasadamForm.paymentMethod} onChange={(e) => setPrasadamForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Net Banking">Net Banking</option>
                </select>
                 <div className="rounded-[24px] bg-[#fff7e7] px-4 py-3 text-sm font-semibold text-[#8b5a0a]">Total: {formatCurrency(totalPrice)}</div>
                <button type="button" onClick={handlePrasadamSubmit} className={glassButton}>Pay & Place Order</button>
                <button
                  type="button"
                  onClick={() => {
                    setActivePage("Receipts");
                    setHistoryTab("Prasadam");
                  }}
                  className="mt-2 w-full text-center text-sm font-semibold text-[#b46a13] hover:underline bg-transparent border-0"
                >
                  View Prasadam Orders History
                </button>
                {prasadamMessage && <p className="text-sm text-[#1b7f77] mt-2">{prasadamMessage}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const [historyTab, setHistoryTab] = useState("Donations");

  const renderDonationHistoryForTab = () => {
    const donationRows = (donationsData || []).map((d) => ({
      _id: d._id,
      transaction: d.eventTitle ? `${d.eventTitle} (Donation)` : d.category || d.type || "Donation",
      date: d.date || (d.createdAt ? new Date(d.createdAt).toLocaleDateString() : ""),
      amount: d.amount,
      status: d.status || "Completed",
    }));

    return (
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[650px] text-left text-sm text-[#3f3f3f]">
          <thead className="bg-[#fafafa] text-[#575757]">
            <tr>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Receipt</th>
            </tr>
          </thead>
          <tbody>
            {donationRows.length > 0 ? (
              donationRows.map((row) => (
                <tr key={`Donation-${row._id || Math.random()}`} className="border-t border-[#f0f0f0]">
                  <td className="px-5 py-3 font-semibold">{row.transaction}</td>
                  <td className="px-5 py-3 text-sm text-[#3f3f3f]">{row.date}</td>
                  <td className="px-5 py-3 font-semibold">{formatCurrency(row.amount)}</td>
                  <td className="px-5 py-3 text-[1.15rem] text-[#af6317]">
                    <button type="button" onClick={() => handleReceiptDownload(donationsData.find((x) => x._id === row._id) || row)} className="font-semibold">
                      Download
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-5 py-6 text-center text-[#5d5d5d]">
                  No donations available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderPrasadamHistoryForTab = () => {
    const prasadamRows = (prasadamOrders || []).map((o) => ({
      _id: o._id,
      transaction: `${o.itemName}${o.quantity ? ` x${o.quantity}` : ""}`,
      date: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "",
      amount: o.amount,
      status: normalizePrasadamStatus(o.status),
    }));

    return (
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[650px] text-left text-sm text-[#3f3f3f]">
          <thead className="bg-[#fafafa] text-[#575757]">
            <tr>
              <th className="px-5 py-3">Item</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {prasadamRows.length > 0 ? (
              prasadamRows.map((row) => (
                <tr key={`Prasadam-${row._id || Math.random()}`} className="border-t border-[#f0f0f0]">
                  <td className="px-5 py-3 font-semibold">{row.transaction}</td>
                  <td className="px-5 py-3 text-sm text-[#3f3f3f]">{row.date}</td>
                  <td className="px-5 py-3 font-semibold">{formatCurrency(row.amount)}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getPrasadamStatusTone(row.status)}`}>{row.status}</span>
                  </td>
                  <td className="px-5 py-3">
                    {canCancelPrasadamOrder(row.status) ? (
                      <button
                        type="button"
                        onClick={() => handleCancelPrasadam(row._id)}
                        className="rounded-lg bg-[#f26037] px-3 py-1 text-xs font-semibold text-white"
                      >
                        Cancel
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-[#a12525]">{row.status}</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-5 py-6 text-center text-[#5d5d5d]">
                  No prasadam orders available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderPaymentHistory = () => (
    <div className="space-y-6">
      <div className={`${glassCard}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[2rem] font-bold">Payment History</h2>

          <div className="flex items-center gap-2 rounded-2xl bg-[#f7f7f7] p-2">
            <button
              type="button"
              onClick={() => setHistoryTab("Donations")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                historyTab === "Donations" ? "bg-[#1b7f77] text-white" : "bg-transparent text-[#3058d6] hover:bg-white"
              }`}
            >
              Donations
            </button>
            <button
              type="button"
              onClick={() => setHistoryTab("Prasadam")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                historyTab === "Prasadam" ? "bg-[#1b7f77] text-white" : "bg-transparent text-[#3058d6] hover:bg-white"
              }`}
            >
              Prasadam Orders
            </button>
          </div>

          <button
            type="button"
            onClick={historyTab === "Donations" ? handlePaymentHistoryDownload : handlePaymentHistoryDownload}
            className="rounded-2xl bg-[#1b7f77] px-4 py-2 text-sm font-semibold text-white"
          >
            Download
          </button>
        </div>

        {historyTab === "Donations" ? renderDonationHistoryForTab() : renderPrasadamHistoryForTab()}
      </div>
    </div>
  );
  const renderReceipts = () => {
    const bookingItems = bookingsData.map(b => ({
      ...b,
      type: "Pooja Booking",
      dateKey: b.createdAt || b.datetime,
      dateDisplay: formatDateDisplay(b.datetime || b.createdAt),
      oneLineSummary: `Pooja Booking: ${b.service || "Booking"}`,
      receiptId: buildReceiptId("PB", b),
      downloadType: "booking",
      amount: b.amount,
    }));
 
    const donationItems = donationsData.map(d => ({
      ...d,
      type: "Donation",
      dateKey: d.createdAt || d.date,
      dateDisplay: formatDateDisplay(d.date || d.createdAt),
      oneLineSummary: `Donation: ${d.category || d.type || "General"}`,
      receiptId: buildReceiptId("DN", d),
      downloadType: "donation",
      amount: d.amount,
    }));
 
    const prasadamItems = prasadamOrders.map(p => ({
      ...p,
      type: "Prasadam Order",
      dateKey: p.createdAt || p.date,
      dateDisplay: formatDateDisplay(p.createdAt || p.date),
      oneLineSummary: `Prasadam: ${p.itemName} (Qty: ${p.quantity || 1})`,
      receiptId: p.orderNumber || buildReceiptId("PR", p),
      downloadType: "prasadam",
      amount: p.amount,
    }));
 
    const allReceipts = [...bookingItems, ...donationItems, ...prasadamItems].sort((a, b) => {
      const timeB = b.dateKey ? new Date(b.dateKey).getTime() : 0;
      const timeA = a.dateKey ? new Date(a.dateKey).getTime() : 0;
      return timeB - timeA;
    });

    const displayedReceipts = showAllReceipts ? allReceipts : allReceipts.slice(0, 5);

    return (
      <div className="space-y-6">
        <div className={`${glassCard}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-[2rem] font-bold">Receipts</h2>
            {allReceipts.length > 5 && (
              <button
                type="button"
                onClick={() => setShowAllReceipts(!showAllReceipts)}
                className="rounded-xl bg-[#1b7f77]/10 hover:bg-[#1b7f77]/20 text-[#1b7f77] px-4 py-2 text-sm font-semibold transition"
              >
                {showAllReceipts ? "Show Recent 5" : "View All"}
              </button>
            )}
          </div>
          
          <div className="mt-6 space-y-3">
            {displayedReceipts.length > 0 ? (
              displayedReceipts.map((item, idx) => (
                <div key={item._id || idx} className={`${glassItem} p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-base font-semibold text-amber-950 truncate">{item.oneLineSummary}</span>
                      <span className="text-xs text-amber-700 bg-amber-100/50 px-2 py-0.5 rounded-md font-medium">
                        {item.dateDisplay}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#6b6b6b]">Receipt ID: {item.receiptId}</p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <span className="text-lg font-bold text-[#1b7f77]">{formatCurrency(item.amount)}</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setViewingReceipt(item)}
                        className="rounded-xl bg-amber-500 hover:bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white transition shadow-sm"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReceiptDownload(item, item.downloadType)}
                        className="rounded-xl bg-[#1b7f77] hover:bg-[#1b7f77]/90 px-3 py-1.5 text-xs font-semibold text-white transition shadow-sm"
                      >
                        Download PDF
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={`${glassItem} text-[#5d5d5d] p-6 text-center`}>No receipts available.</div>
            )}
          </div>
        </div>

        {/* Modal/Popup for Details */}
        {viewingReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-[#fffdfa] rounded-3xl border border-amber-200/50 shadow-2xl p-6 md:p-8 relative max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                    {viewingReceipt.type}
                  </span>
                  <h3 className="text-2xl font-bold mt-2 text-amber-950">Receipt Details</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingReceipt(null)}
                  className="text-amber-900 hover:text-amber-700 font-bold text-xl p-1"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 border-t border-b border-amber-100 py-6 my-4">
                <div className="flex justify-between text-sm">
                  <span className="text-amber-800/80 font-medium">Receipt ID</span>
                  <span className="font-semibold text-amber-950">{viewingReceipt.receiptId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-amber-800/80 font-medium">Date</span>
                  <span className="font-semibold text-amber-950">{viewingReceipt.dateDisplay}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-amber-800/80 font-medium">Service / Category</span>
                  <span className="font-semibold text-amber-950">
                    {viewingReceipt.service || viewingReceipt.category || viewingReceipt.itemName || "N/A"}
                  </span>
                </div>

                {viewingReceipt.type === "Pooja Booking" && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-amber-800/80 font-medium">Booking Status</span>
                      <span className="font-semibold text-[#1b7f77]">{viewingReceipt.status || "Confirmed"}</span>
                    </div>
                    {viewingReceipt.contactNumber && (
                      <div className="flex justify-between text-sm">
                        <span className="text-amber-800/80 font-medium">Contact Number</span>
                        <span className="font-semibold text-amber-950">{viewingReceipt.contactNumber}</span>
                      </div>
                    )}
                  </>
                )}

                {viewingReceipt.type === "Donation" && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-amber-800/80 font-medium">Transaction ID</span>
                      <span className="font-semibold text-amber-950 truncate max-w-[200px]" title={viewingReceipt.transactionId}>
                        {viewingReceipt.transactionId || "N/A"}
                      </span>
                    </div>
                    {viewingReceipt.donorName && (
                      <div className="flex justify-between text-sm">
                        <span className="text-amber-800/80 font-medium">Donor Name</span>
                        <span className="font-semibold text-amber-950">{viewingReceipt.donorName}</span>
                      </div>
                    )}
                  </>
                )}

                {viewingReceipt.type === "Prasadam Order" && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-amber-800/80 font-medium">Quantity</span>
                      <span className="font-semibold text-amber-950">{viewingReceipt.quantity || 1}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-amber-800/80 font-medium">Order Status</span>
                      <span className="font-semibold text-amber-950">{viewingReceipt.status || "Placed"}</span>
                    </div>
                  </>
                )}

                {viewingReceipt.paymentMethod && (
                  <div className="flex justify-between text-sm">
                    <span className="text-amber-800/80 font-medium">Payment Method</span>
                    <span className="font-semibold text-amber-950">{viewingReceipt.paymentMethod}</span>
                  </div>
                )}

                {viewingReceipt.notes && (
                  <div className="pt-2 border-t border-amber-50">
                    <span className="text-xs text-amber-800/60 font-medium block mb-1">Notes</span>
                    <p className="text-xs text-amber-900 bg-amber-50/50 p-2.5 rounded-lg border border-amber-100/50 leading-relaxed">
                      {viewingReceipt.notes}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-amber-100">
                  <span className="text-base font-bold text-amber-950">Total Amount</span>
                  <span className="text-2xl font-extrabold text-[#1b7f77]">{formatCurrency(viewingReceipt.amount)}</span>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => handleReceiptDownload(viewingReceipt, viewingReceipt.downloadType)}
                  className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all text-sm"
                >
                  Download Receipt PDF
                </button>
                <button
                  type="button"
                  onClick={() => setViewingReceipt(null)}
                  className="flex-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold py-3.5 px-4 rounded-xl transition-all text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFestivalEvents = () => {
    const getMyDonationTotalForEvent = (eventId) => {
      if (!eventId) return 0;
      return (donationsData || [])
        .filter((d) => d && d.eventId != null && String(d.eventId) === String(eventId))
        .reduce((sum, d) => sum + (typeof d.amount === "number" ? d.amount : Number(d.amount) || 0), 0);
    };

    return (
      <div className="space-y-6">
        <div className={`${glassCard}`}>
          <h2 className="text-[2rem] font-bold">Festival Events</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {eventsData.length > 0 ? (
              eventsData.map((item) => {
                const isSelected = selectedEventId === item._id;
                const myTotal = getMyDonationTotalForEvent(item._id);
                return (
                  <div
                    key={`${item.title}-${item.formattedDate || item._id}`}
                    onClick={() => setSelectedEventId(item._id)}
                    className={`${glassItem} p-4 cursor-pointer ${isSelected ? "ring-2 ring-offset-2 ring-[#ff8b00]" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-lg font-semibold text-[#17151f]">{item.title}</p>
                        <p className="mt-2 flex items-center gap-2 text-sm text-[#5d5d5d]">
                          <span className="text-base">📅</span>
                          {item.formattedDate || item.date}
                        </p>
                        {item.location && (
                          <p className="mt-1 flex items-center gap-2 text-sm text-[#5d5d5d]">
                            <span className="text-base">📍</span>
                            {item.location}
                          </p>
                        )}
                        {item.description && (
                          <p className="mt-2 text-xs text-[#6b6b6b]">{item.description.substring(0, 60)}...</p>
                        )}
                      </div>
                      <div className="ml-4 flex flex-col items-end gap-2">
                        <div className="text-sm text-[#6b6b6b]">{item.registrations || 0} regs</div>
                        <div className="text-lg font-bold text-[#1b7f77]">{formatCurrency(myTotal || 0)}</div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            // switch to donations page and preselect this event
                            setSelectedEventId(item._id);
                            setActivePage("Donations");
                            // after navigation/render, scroll to form and focus amount
                            setTimeout(() => {
                              const form = document.getElementById("donation-form");
                              if (form) {
                                form.scrollIntoView({ behavior: "smooth" });
                                const amt = document.getElementById("donation-amount-input");
                                if (amt) amt.focus();
                              }
                            }, 250);
                          }}
                          className="mt-2 rounded-xl bg-[#ff8b00] px-3 py-1 text-sm font-semibold text-white"
                        >
                          Donate
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={`${glassItem} col-span-full text-center text-[#5d5d5d] py-8`}>
                <p className="text-lg">No festival events available.</p>
                <p className="mt-1 text-sm">Check back later for upcoming festivals!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleMarkAllRead = async () => {
    const unread = notificationsData.filter((n) => !n.read && n._id);
    if (unread.length === 0) return;
    try {
      await Promise.all(unread.map((n) => markNotificationAsRead(n._id)));
      setNotificationsData((prev) =>
        prev.map((n) => ({ ...n, read: true, readAt: new Date() }))
      );
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const renderNotifications = () => {
    const unread = notificationsData.filter((n) => !n.read);

    const getNotificationStyle = (title) => {
      const t = String(title || "").toLowerCase();
      if (t.includes("booking") || t.includes("pooja")) {
        return {
          icon: "calendar",
          color: "bg-[#eaf1ff] text-[#3468db]",
        };
      }
      if (t.includes("donation") || t.includes("received") || t.includes("payment")) {
        return {
          icon: "heart",
          color: "bg-[#edf7ee] text-[#16853f]",
        };
      }
      if (t.includes("feedback") || t.includes("reply") || t.includes("support")) {
        return {
          icon: "gear",
          color: "bg-[#fcf0e4] text-[#cf7c2b]",
        };
      }
      return {
        icon: "bell",
        color: "bg-[#f1f1f1] text-[#6b6b6b]",
      };
    };

    return (
      <div className="space-y-6">
        <div className={`${glassCard}`}>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#f3ebde]/80 pb-4">
            <div>
              <h2 className="text-[2.2rem] font-bold text-[#2d1b08]">Notifications</h2>
              <p className="mt-1 text-sm text-[#665e55]">Stay updated with your temple activities, bookings, and donations.</p>
            </div>
            {unread.length > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="rounded-full bg-[#1b7f77]/10 px-4 py-2 text-sm font-semibold text-[#1b7f77] transition hover:bg-[#1b7f77] hover:text-white"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="mt-6 space-y-4">
            {notificationsData.length > 0 ? (
              notificationsData.map((item) => {
                const style = getNotificationStyle(item.title);
                return (
                  <div
                    key={`${item.title}-${item.date}-${item._id || Math.random()}`}
                    onClick={() => {
                      if (!item.read && item._id) {
                        markNotificationAsRead(item._id)
                          .then(() => {
                            setNotificationsData((prev) =>
                              prev.map((n) =>
                                n._id === item._id ? { ...n, read: true, readAt: new Date() } : n
                              )
                            );
                          })
                          .catch((err) => console.error("Failed to mark notification as read:", err));
                      }
                    }}
                    className={`group relative flex items-start gap-4 rounded-2xl border p-5 transition-all duration-300 cursor-pointer ${
                      !item.read
                        ? "border-[#fecdd3] bg-[#fff0f3] shadow-[0_8px_20px_rgba(244,63,94,0.06)]"
                        : "border-[#e5e7eb] bg-white hover:bg-[#fafafa]"
                    }`}
                  >
                    <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl shadow-sm ${style.color}`}>
                      <AppIcon name={style.icon} className="h-5 w-5" />
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className={`text-base font-bold transition group-hover:text-[#bc6c10] ${!item.read ? "text-[#3f2711]" : "text-[#5c564f]"}`}>
                          {item.title}
                        </p>
                        <span className="text-xs text-[#8c857b] font-medium">{item.date}</span>
                      </div>
                      {item.message && (
                        <p className={`mt-2 text-sm leading-relaxed ${!item.read ? "text-[#5d4f3f]" : "text-[#797268]"}`}>
                          {item.message}
                        </p>
                      )}
                      {item.attachment && (
                        <div className="mt-3">
                          {item.attachment.startsWith("data:image/") ? (
                            <img src={item.attachment} alt="Invitation" className="max-h-60 rounded-lg object-contain border border-[#ececec]" />
                          ) : (
                            <a
                              href={item.attachment}
                              download={`Invitation-${item.title.replace(/\s+/g, "_")}.pdf`}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-2 rounded-xl bg-[#1b7f77] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#166353]"
                            >
                              📄 Download PDF Invitation
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    {!item.read && (
                      <span className="absolute right-4 top-4 h-2.5 w-2.5 rounded-full bg-[#f43f5e] ring-4 ring-[#f43f5e]/20 animate-pulse"></span>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-[#fcf9f5] p-4 text-[#8d6925]/40 mb-4">
                  <AppIcon name="bell" className="h-12 w-12" />
                </div>
                <p className="text-base font-semibold text-[#5c544d]">No notifications yet</p>
                <p className="text-sm text-[#8c847b] mt-1">We will notify you when something happens.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderProfile = () => {
    const displayValue = (v) => {
      const s = v == null ? "" : String(v).trim();
      return s ? s : "-";
    };

    return (
      <div className="space-y-6">
        <div className={`${glassCard}`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-[2rem] font-bold">Profile</h2>
              <p className="mt-2 text-[#5d5d5d]">Manage your devotee profile and contact information.</p>
            </div>
            <button
              type="button"
              onClick={() => setProfileEditMode((prev) => !prev)}
              className="rounded-2xl bg-[#bc630f] px-4 py-2 text-sm font-semibold text-white"
            >
              {profileEditMode ? "Cancel" : "Edit Profile"}
            </button>
          </div>
          {profileMessage && <div className="mt-4 rounded-xl bg-[#e8f7ef] p-3 text-sm text-[#1c6f3d]">{profileMessage}</div>}
          {profileError && <div className="mt-4 rounded-xl bg-[#fde8e8] p-3 text-sm text-[#a12525]">{profileError}</div>}
          {profileEditMode && (
            <div className="mt-4 grid gap-3 rounded-2xl border border-[#f0f0f0] bg-[#fbfaf8] p-4">
              <div>
                <label className="block text-sm font-medium text-[#5d5d5d] mb-2">Full Name *</label>
                <input className={glassInput} value={profileForm.name} onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Enter full name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5d5d5d] mb-2">Email Address *</label>
                <input className={glassInput} value={profileForm.email} onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="Enter email" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5d5d5d] mb-2">Phone Number *</label>
                <input className={glassInput} value={profileForm.phone} onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))} placeholder="Enter 10-digit phone number" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5d5d5d] mb-2">Place/City *</label>
                <input className={glassInput} value={profileForm.place} onChange={(e) => setProfileForm((prev) => ({ ...prev, place: e.target.value }))} placeholder="Enter place or city" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5d5d5d] mb-2">Address *</label>
                <textarea rows="3" className={glassInput} value={profileForm.address} onChange={(e) => setProfileForm((prev) => ({ ...prev, address: e.target.value }))} placeholder="Enter complete address" />
              </div>
              <button type="button" onClick={handleProfileSave} className={`${glassButton} col-span-full mt-4`}>💾 Save Changes</button>
            </div>
          )}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className={glassItem}>
              <p className="text-sm text-[#7a6f5d]">Full Name</p>
              <p className="mt-2 text-lg font-semibold text-[#1f1f1f]">{profileData.name || devoteeName}</p>
            </div>
            <div className={glassItem}>
              <p className="text-sm text-[#7a6f5d]">Email Address</p>
              <p className="mt-2 text-lg font-semibold text-[#1f1f1f]">{profileData.email}</p>
            </div>
            <div className={glassItem}>
              <p className="text-sm text-[#7a6f5d]">Phone Number</p>
              <p className="mt-2 text-lg font-semibold text-[#1f1f1f]">{displayValue(profileData.phone)}</p>
            </div>
            <div className={glassItem}>
              <p className="text-sm text-[#7a6f5d]">Place/City</p>
              <p className="mt-2 text-lg font-semibold text-[#1f1f1f]">{displayValue(profileData.place)}</p>
            </div>
            <div className={`${glassItem} sm:col-span-2 lg:col-span-1`}>
              <p className="text-sm text-[#7a6f5d]">Role</p>
              <p className="mt-2 text-lg font-semibold text-[#1f1f1f]">{profileData.role || "devotee"}</p>
            </div>
            <div className={glassItem}>
              <p className="text-sm text-[#7a6f5d]">Member Since</p>
              <p className="mt-2 text-lg font-semibold text-[#1f1f1f]">{profileData.memberSince || "2026"}</p>
            </div>
            <div className={`${glassItem} lg:col-span-2`}>
              <p className="text-sm text-[#7a6f5d]">Address</p>
              <p className="mt-2 text-sm text-[#1f1f1f] leading-relaxed">{displayValue(profileData.address)}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSupport = () => (
    <div className="space-y-6">
      <div className={`${glassCard}`}>
        <h2 className="text-[2rem] font-bold">Support</h2>
        <p className="mt-2 text-[#5d5d5d]">Raise an issue or get help with your bookings and donations.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="block space-y-2 text-sm text-[#5d5d5d]">
            Subject
            <input
              type="text"
              value={supportSubject}
              onChange={(e) => setSupportSubject(e.target.value)}
              placeholder="Enter subject"
              className={glassInput}
            />
          </label>
          <label className="block space-y-2 text-sm text-[#5d5d5d] md:col-span-2">
            Message
            <textarea
              rows={5}
              value={supportMessage}
              onChange={(e) => setSupportMessage(e.target.value)}
              placeholder="Describe your issue"
              className={glassInput}
            />
          </label>
        </div>
        <button
          type="button"
          onClick={handleSupportSubmit}
          className={`${glassButton} mt-5`}
        >
          Send Request
        </button>
        {supportStatus && <p className="mt-3 text-sm font-semibold text-[#1b7f77]">{supportStatus}</p>}
      </div>

      <div className={glassSection}>
        <h3 className="text-xl font-bold">Your Feedback & Replies</h3>
        <div className="mt-4 space-y-4">
          {supportRequests.length > 0 ? (
            supportRequests.map((request) => (
              <div key={request._id} className={glassItem}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{request.subject}</p>
                    <p className="text-sm text-[#6b7280]">{new Date(request.createdAt).toLocaleString()}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-sm font-semibold ${request.status === "Closed" ? "bg-[#def5e5] text-[#166534]" : "bg-[#fef3c7] text-[#92400e]"}`}>{request.status || "Open"}</span>
                </div>
                <p className="mt-3 text-sm text-[#374151]">{request.message}</p>
                {request.reply && (
                  <div className="mt-4 rounded-[26px] border border-white/35 bg-white/70 p-3 text-sm text-[#1f2937] shadow-sm backdrop-blur-sm">
                    <p className="font-semibold">Admin Reply</p>
                    <p className="mt-2">{request.reply}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-[#5d5d5d]">You have not submitted any feedback yet.</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activePage) {
      case "Book Pooja":
        return renderBookPooja();
      case "My Bookings":
        return renderMyBookings();
      case "Donations":
        return renderDonations();
      case "Prasadam Orders":
        return renderPrasadam();
      case "Payment History":
        return renderPaymentHistory();
      case "Receipts":
        return renderReceipts();
      case "Festival Events":
        return renderFestivalEvents();
      case "Notifications":
        return renderNotifications();
      case "Profile":
        return renderProfile();
      case "Support":
        return renderSupport();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#fff7ed] via-[#fff1d4] to-[#ffe2aa] text-[#2c1d12]">
      <div className="flex w-full">
        <aside className="relative hidden min-h-screen w-[320px] overflow-hidden border-r border-white/35 bg-[radial-gradient(circle_at_top_left,_rgba(255,220,146,0.36),_transparent_28%)] bg-gradient-to-b from-[#ffecce]/70 to-[#ffd6a6]/40 shadow-[0_0_42px_rgba(153,90,31,0.22)] backdrop-blur-md lg:block">
          <div className="pointer-events-none absolute inset-0">
            <img src={templeImage} alt="Temple background" className="h-full w-full object-cover object-[56%_center]" />
            <div className="absolute inset-0 bg-[#fff0dc]/22"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-[#fff4df]/68 via-[#ffdcb1]/24 to-[#ff9f44]/20"></div>
          </div>
          <div className="relative z-10 px-5 pb-5 pt-8">
            <p className="text-[2.55rem] font-black leading-[1.03] text-[#bc6c10]">Sri Shanti</p>
            <p className="text-[2.1rem] font-black leading-[1.03]">Mahadev Mandir</p>
          </div>
          <div className="relative z-10 space-y-2 px-4">
            {menuItems.map((item) => (
              <SidebarItem
                key={item.label}
                label={item.label}
                icon={item.icon}
                active={activePage === item.label}
                onClick={() => setActivePage(item.label)}
              />
            ))}
            <button
              type="button"
              onClick={handleLogout}
              className="mt-1 w-full rounded-xl border border-white/40 bg-white/45 px-3 py-3 text-left text-[20px] font-semibold text-[#7f470a] hover:bg-white/80"
            >
              <span className="inline-flex items-center gap-3">
                <AppIcon name="gear" className="h-[21px] w-[21px]" />
                Logout
              </span>
            </button>
          </div>
        </aside>

        <main className="flex-1 px-3 py-3 sm:px-5 sm:py-5 lg:px-8">
          <header className="rounded-2xl border border-white/60 bg-white/40 px-5 py-4 shadow-[0_12px_30px_rgba(80,40,10,0.06)] backdrop-blur-md">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex min-w-[360px] flex-1 items-center gap-4">
                <button type="button" className="hidden text-[#8d551f] lg:block">
                  <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current">
                    <path d="M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z"></path>
                  </svg>
                </button>
                <div className="relative w-full max-w-[520px]">
                  <input
                    type="text"
                    placeholder="Search here..."
                    className="w-full rounded-xl border border-[#e8d8c2] bg-white/85 py-3 pl-12 pr-4 text-sm text-[#4d4d4d] outline-none placeholder:text-[#9a9a9a]"
                  />
                  <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 fill-none stroke-[#8d551f] stroke-2">
                    <circle cx="11" cy="11" r="7"></circle>
                    <path d="m20 20-3.5-3.5"></path>
                  </svg>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => setActivePage("Notifications")} className="relative mr-1 hidden rounded-xl bg-white/80 p-2 shadow-sm transition hover:scale-105 lg:block">
                  <AppIcon name="bell" className="h-7 w-7 text-[#302d2b]" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -right-1 -top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#e4262c] text-[10px] font-bold text-white">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>
                <div className="rounded-xl border border-[#ead6c0] bg-white/70 px-4 py-2 text-sm font-bold text-[#7e4310]">
                  {currentDateTime.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "short", day: "numeric" })} {currentDateTime.toLocaleTimeString()}
                </div>
                <div className="flex items-center gap-3 rounded-full px-1">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e2ccb2] text-sm font-bold text-[#5d3310]">
                    {devoteeName
                      .split(" ")
                      .slice(0, 2)
                      .map((part) => part.charAt(0))
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div className="hidden leading-tight sm:block">
                    <p className="text-base font-bold">{devoteeName}</p>
                    <p className="text-xs text-[#565656]">Devotee</p>
                  </div>
                </div>
              </div>
            </div>
          </header>
 
          <div className="mt-4 rounded-2xl border border-white/60 bg-white/35 p-3 shadow-[0_10px_30px_rgba(80,40,10,0.04)] backdrop-blur-md md:p-4">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DevoteeDashboard;
