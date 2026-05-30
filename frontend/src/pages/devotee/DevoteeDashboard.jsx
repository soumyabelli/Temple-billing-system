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
  submitDevoteeSupport,
  getSupportRequests,
  getPrasadamOrders,
  createPrasadamOrder,
  cancelPrasadamOrder,
} from "../../services/devoteeService";

const menuItems = [
  { label: "Dashboard", icon: "home" },
  { label: "Book Pooja", icon: "book" },
  { label: "My Bookings", icon: "calendar" },
  { label: "Donations", icon: "heart" },
  { label: "Prasadam Orders", icon: "bag" },
  { label: "Payment History", icon: "wallet" },
  { label: "Receipts", icon: "receipt" },
  { label: "Festival Events", icon: "temple" },
  { label: "Notifications", icon: "bell" },
  { label: "Profile", icon: "user" },
  { label: "Support", icon: "gear" },
];

const formatCurrency = (value) => {
  if (typeof value === "number") return `₹ ${value.toLocaleString()}`;
  if (typeof value === "string" && value.trim()) return value;
  return "₹ 0";
};

const glassCard =
  "rounded-[28px] border border-white/45 bg-white/60 p-5 shadow-[0_28px_80px_rgba(115,83,27,0.12)] backdrop-blur-xl";
const glassSection =
  "rounded-[28px] border border-white/40 bg-white/55 p-5 shadow-[0_22px_60px_rgba(104,78,30,0.10)] backdrop-blur-xl";
const glassInput =
  "w-full rounded-[24px] border border-white/70 bg-white/75 px-4 py-3 text-base text-[#4f3f26] outline-none shadow-sm shadow-[#d9c8a1]/40 backdrop-blur-sm";
const glassButton =
  "rounded-[24px] bg-gradient-to-r from-[#b46a13] via-[#f29f41] to-[#ffbc6e] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(184,122,57,0.22)] transition hover:shadow-[0_18px_38px_rgba(184,122,57,0.24)]";
const glassButtonSoft =
  "rounded-[24px] bg-[#fff3d8] px-5 py-3 text-sm font-semibold text-[#7f4b11] shadow-[0_8px_22px_rgba(128,88,40,0.14)] transition hover:bg-[#ffe4b4]";
const glassItem =
  "rounded-[26px] border border-white/35 bg-white/55 p-4 shadow-sm backdrop-blur-sm";

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
    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-base font-semibold transition ${
      active
        ? "bg-gradient-to-r from-[#ff9f2f] to-[#ff6a00] text-white shadow-[0_8px_24px_rgba(255,106,0,0.38)]"
        : "text-[#2d1608] border border-white/35 bg-white/35 backdrop-blur-sm hover:bg-white/60"
    }`}
  >
    <AppIcon name={icon} className="h-[17px] w-[17px]" />
    <span className="text-base leading-none">{label}</span>
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
  const [profileEditMode, setProfileEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
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

  const paymentMethods = ["UPI", "Cash", "Card", "Bank Transfer", "Net Banking"];

  const devoteeName = useMemo(() => profileData.name || user?.name || "Devotee User", [profileData.name, user?.name]);

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
        value: `${bookingsData.length}`,
        action: "View Details",
        tone: "bg-[#f2ecff] text-[#6b3df0]",
        icon: "calendar",
      },
      {
        title: "Total Donations",
        value: formatCurrency(totalDonations),
        action: "View History",
        tone: "bg-[#edf7ee] text-[#2f8d42]",
        icon: "heart",
      },
      {
        title: "Prasadam Orders",
        value: `${prasadamOrdersCount}`,
        action: "View Orders",
        tone: "bg-[#ffefea] text-[#f26037]",
        icon: "bag",
      },
    ],
    [bookingsData.length, totalDonations, prasadamOrdersCount]
  );

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
          (donationsRes.donations || []).map((donation) => ({
            ...donation,
            type: donation.category || donation.type || "Donation",
            date: donation.createdAt ? new Date(donation.createdAt).toLocaleDateString() : donation.date || "",
            amount: donation.amount,
          }))
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

  const handleBookingSubmit = async () => {
    if (!bookingService || !bookingDatetime || !bookingAmount) return;

    setBookingLoading(true);
    try {
      const payload = {
        devoteeName: profileData.name,
        devoteeEmail: profileData.email,
        service: bookingService,
        datetime: bookingDatetime,
        amount: bookingAmount,
        status: "Pending",
        contactNumber: bookingContact,
        notes: bookingNotes,
      };

      await createDevoteeBooking(payload);
      const bookingsRes = await getDevoteeBookings(user?.email);
      setBookingsData(bookingsRes.bookings || []);
      setBookingService("Abhisheka");
      setBookingDatetime("");
      setBookingAmount(501);
      setBookingContact("");
      setBookingNotes("");
      setActivePage("My Bookings");
    } catch (error) {
      console.warn("Unable to create booking", error);
    } finally {
      setBookingLoading(false);
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

    setDonationLoading(true);

    try {
      await createDevoteeDonation({
        donorName: profileData.name,
        donorEmail: profileData.email,
        amount: donationAmount,
        category: donationCategory,
        paymentMethod: donationMethod,
        contactNumber: donationContact,
        notes: donationNotes,
      });

      const updatedDonations = await getDevoteeDonations(user?.email);
      setDonationsData(updatedDonations.donations || []);
      const notificationsRes = await getDevoteeNotifications(user?.email);
      setNotificationsData(formatNotifications(notificationsRes.notifications || []));
      setDonationSuccess("Donation recorded successfully. Your receipt is available in Receipts.");
      setDonationCategory("General");
      setDonationAmount(501);
      setDonationMethod("UPI");
      setDonationContact("");
      setDonationNotes("");
      setActivePage("Payment History");
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

  const downloadPdfFile = (filename, lines) => {
    const doc = new jsPDF();
    const pageWidth = 170;
    const lineHeight = 8;
    let y = 20;

    doc.setFontSize(16);
    doc.text("Temple Billing System Receipt", 20, y);
    doc.setFontSize(11);
    y += 10;

    lines.forEach((line) => {
      const splitLines = doc.splitTextToSize(String(line), pageWidth);
      splitLines.forEach((text) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(text, 20, y);
        y += lineHeight;
      });
    });

    doc.save(filename);
  };

  const handleReceiptDownload = (item, type = "donation") => {
    const receiptDate =
      item.date || (item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "");
    const receiptId = item._id?.slice(-8) || "N/A";
    const baseLines = [
      `Receipt ID: ${receiptId}`,
      `Date: ${receiptDate}`,
      `Devotee: ${profileData.name}`,
      `Email: ${profileData.email}`,
      `Role: ${profileData.role}`,
      "",
    ];

    if (type === "prasadam") {
      downloadPdfFile(`prasadam-receipt-${receiptId}.pdf`, [
        "Prasadam Receipt",
        "----------------",
        ...baseLines,
        `Item: ${item.itemName || "Prasadam"}`,
        `Quantity: ${item.quantity || 1}`,
        `Unit Price: ${formatCurrency(item.unitPrice || 0)}`,
        `Total Amount: ${formatCurrency(item.amount)}`,
        `Payment Method: ${item.paymentMethod || "UPI"}`,
        `Status: ${item.status || "Placed"}`,
      ]);
      return;
    }

    downloadPdfFile(`donation-receipt-${receiptId}.pdf`, [
      "Donation Receipt",
      "----------------",
      ...baseLines,
      `Donation Type: ${item.category || item.type || "Donation"}`,
      `Amount: ${formatCurrency(item.amount)}`,
      `Payment Method: ${item.paymentMethod || "UPI"}`,
      `Status: ${item.status || "Completed"}`,
      item.notes ? `Notes: ${item.notes}` : "",
    ].filter(Boolean));
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
    try {
      await createPrasadamOrder({
        devoteeName: profileData.name,
        email: profileData.email,
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
      setPrasadamMessage("Prasadam order placed successfully.");
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
      });
      setProfileData(res.profile);
      if (updateUser) {
        updateUser({ name: res.profile.name, email: res.profile.email, role: res.profile.role });
      }
      setProfileEditMode(false);
      setProfileMessage("Profile updated successfully.");
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
          <article key={item.title} className={glassItem}>
            <div className="mb-4 flex items-center gap-4">
              <IconCircle className={item.tone} icon={item.icon} />
              <p className="text-[1.06rem] text-[#383838]">{item.title}</p>
            </div>
            <p className="text-[2.15rem] font-extrabold leading-none">{item.value}</p>
            <button
              type="button"
              onClick={() => {
                if (item.action === "View Details") setActivePage("My Bookings");
                if (item.action === "View History") setActivePage("Payment History");
                if (item.action === "View Orders") setActivePage("Prasadam Orders");
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
            {bookingsData.length > 0 ? (
              bookingsData.slice(0, 3).map((item) => (
                <div key={`${item.service}-${item.datetime}-${item._id || Math.random()}`} className={glassItem}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xl font-bold">{item.service}</p>
                    <span className={`rounded-full px-3 py-1 text-sm font-semibold ${item.status === "Confirmed" ? "bg-[#def5e5] text-[#16853f]" : "bg-[#faefcf] text-[#ce7a0f]"}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[#4f4f4f]">{item.datetime ? new Date(item.datetime).toLocaleString() : "-"}</p>
                </div>
              ))
            ) : (
              <div className={`${glassItem} text-[#5d5d5d]`}>No bookings found yet.</div>
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
            <button type="button" onClick={() => setActivePage("Payment History")} className="bg-transparent p-0 text-base font-semibold text-[#bc630f]">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {donationsData.length > 0 ? (
              donationsData.slice(0, 3).map((item) => (
                <div key={`${item.type}-${item.date}-${item._id || Math.random()}`} className={`${glassItem} flex items-center justify-between`}>
                  <div>
                    <p className="text-xl font-bold">{item.type}</p>
                    <p className="text-sm text-[#4f4f4f]">{item.date}</p>
                  </div>
                  <p className="text-[1.45rem] font-bold">{formatCurrency(item.amount)}</p>
                </div>
              ))
            ) : (
              <div className={`${glassItem} text-[#5d5d5d]`}>No donations yet.</div>
            )}
          </div>
          <div className="pt-4 text-right">
            <button type="button" onClick={() => setActivePage("Payment History")} className="bg-transparent p-0 text-base font-semibold text-[#3058d6]">
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
                    <p className="text-[1.45rem] font-bold">{item.title}</p>
                    <p className="text-[1.15rem] text-[#4f4f4f]">{item.date}</p>
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

      <section className="relative mt-4 overflow-hidden rounded-2xl">
        <img src={templeImage} alt="Festival banner" className="h-36 w-full object-cover sm:h-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#261009]/85 via-[#51220d]/55 to-transparent"></div>
        <div className="absolute inset-0 flex items-center justify-between px-7 text-white">
          <div>
            <p className="text-sm uppercase tracking-wide text-[#ffd56e]">Upcoming Festival</p>
            <h3 className="text-[2.35rem] font-extrabold leading-tight">Brahmotsavam 2025</h3>
            <p className="text-[1.35rem]">20 May 2025 - 28 May 2025</p>
          </div>
          <button
            type="button"
            onClick={() => setActivePage("Festival Events")}
            className="rounded-xl border border-white/60 bg-white/20 px-5 py-2 text-lg font-semibold text-white backdrop-blur-sm"
          >
            View Details
          </button>
        </div>
      </section>

      <section className="mt-4 grid gap-4 pb-8 xl:grid-cols-2">
        <article className={glassSection}>
          <h2 className="px-5 py-4 text-[2rem] font-bold">My Recent Bookings</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px]">
              <thead className="bg-[#fafafa] text-left text-sm text-[#575757]">
                <tr>
                  <th className="px-5 py-3">Pooja / Service</th>
                  <th className="px-5 py-3">Date & Time</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookingsData.length > 0 ? (
                  bookingsData.map((row) => (
                    <tr key={`${row.service}-${row.datetime || row._id}`} className="border-t border-[#f0f0f0]">
                      <td className="px-5 py-3 text-base font-semibold">{row.service}</td>
                      <td className="px-5 py-3 text-sm text-[#3f3f3f]">{row.datetime ? new Date(row.datetime).toLocaleString() : "-"}</td>
                      <td className="px-5 py-3 text-base font-semibold">{formatCurrency(row.amount)}</td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${row.status === "Confirmed" ? "bg-[#def5e5] text-[#16853f]" : "bg-[#faefcf] text-[#ce7a0f]"}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-5 py-6 text-center text-[#5d5d5d]">
                      No bookings available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-4 text-right">
            <button type="button" onClick={() => setActivePage("My Bookings")} className="rounded-xl bg-[#1b7f77] px-5 py-2 text-base font-semibold text-white">
              View All Bookings
            </button>
          </div>
        </article>

        <article className={glassSection}>
          <h2 className="px-5 py-4 text-[2rem] font-bold">Donation History</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px]">
              <thead className="bg-[#fafafa] text-left text-sm text-[#575757]">
                <tr>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {donationsData.length > 0 ? (
                  donationsData.map((row) => (
                    <tr key={`${row.type}-${row.date}-${row._id || Math.random()}`} className="border-t border-[#f0f0f0]">
                      <td className="px-5 py-3 text-base font-semibold">{row.type}</td>
                      <td className="px-5 py-3 text-sm text-[#3f3f3f]">{row.date}</td>
                      <td className="px-5 py-3 text-base font-semibold">{formatCurrency(row.amount)}</td>
                      <td className="px-5 py-3 text-[1.15rem] text-[#af6317]">
                        <button type="button" onClick={() => handleReceiptDownload(row)} className="font-semibold">
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
          <div className="px-5 py-4 text-right">
            <button type="button" onClick={() => setActivePage("Payment History")} className="rounded-xl bg-[#1b7f77] px-5 py-2 text-base font-semibold text-white">
              View All Donations
            </button>
          </div>
        </article>
      </section>
    </>
  );

  const renderBookPooja = () => (
    <div className="space-y-6">
      <div className={`${glassCard}`}>
        <h2 className="text-[2rem] font-bold">Book Pooja</h2>
        <p className="mt-2 text-[#4f4f4f]">Choose a service and book your next pooja online. Your new booking will appear under My Bookings.</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
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
              <p className="text-sm uppercase tracking-[0.08em] text-[#8d6925]">Contact number</p>
              <input
                type="tel"
                value={bookingContact}
                onChange={(e) => setBookingContact(e.target.value)}
                placeholder="Optional phone number"
                className={glassInput}
              />
            </div>

            <div>
              <p className="text-sm uppercase tracking-[0.08em] text-[#8d6925]">Notes</p>
              <textarea
                rows={4}
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                placeholder="Any special requests"
                className={glassInput}
              />
            </div>

            <button
              type="button"
              onClick={handleBookingSubmit}
              disabled={bookingLoading}
              className="mt-4 w-full rounded-2xl bg-[#1b7f77] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#166353] disabled:cursor-not-allowed disabled:bg-[#9bb8af]"
            >
              {bookingLoading ? "Booking..." : "Book Pooja"}
            </button>
          </div>

          <div className="space-y-4 rounded-[28px] border border-white/45 bg-white/62 p-6 shadow-[0_20px_52px_rgba(113,82,28,0.12)] backdrop-blur-xl">
            <h3 className="text-xl font-semibold">Popular Pooja services</h3>
            <p className="text-sm text-[#5d5d5d]">Select a service to book and check your newest booking immediately in My Bookings.</p>
            <div className="grid gap-3">
              {poojaTypes.map((service) => (
                <button
                  type="button"
                  key={service.name}
                  onClick={() => {
                    setBookingService(service.name);
                    setBookingAmount(service.price);
                  }}
                  className={`w-full rounded-3xl border px-4 py-4 text-left text-sm font-semibold transition ${
                    bookingService === service.name ? "border-[#bc630f] bg-[#fff5e7] text-[#9b5a1e]" : "border-[#ececec] bg-[#fafafa] text-[#4f4f4f] hover:border-[#bc630f]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{service.name}</span>
                    <span className="text-sm text-[#7a5d1b]">{formatCurrency(service.price)}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="rounded-[26px] border border-white/45 bg-white/65 p-4 text-sm text-[#6d5a35] shadow-sm backdrop-blur-sm">
              <p className="font-semibold">Booking summary</p>
              <p className="mt-3">Service: {bookingService}</p>
              <p>Date: {bookingDatetime ? new Date(bookingDatetime).toLocaleString() : "Not selected"}</p>
              <p>Amount: {formatCurrency(bookingAmount)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMyBookings = () => (
    <div className="space-y-6">
      <div className={`${glassCard}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-[2rem] font-bold">My Bookings</h2>
          <button type="button" className="rounded-2xl bg-[#1b7f77] px-4 py-2 text-sm font-semibold text-white">New Booking</button>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm text-[#3f3f3f]">
            <thead className="bg-[#fafafa] text-[#575757]">
              <tr>
                <th className="px-5 py-3">Service</th>
                <th className="px-5 py-3">Date & Time</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookingsData.length > 0 ? (
                bookingsData.map((row) => (
                  <tr key={`${row.service}-${row.datetime || row._id}`} className="border-t border-[#f0f0f0]">
                    <td className="px-5 py-3 font-semibold">{row.service}</td>
                    <td className="px-5 py-3">{row.datetime}</td>
                    <td className="px-5 py-3">{formatCurrency(row.amount)}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-3 py-1 text-sm font-semibold ${row.status === "Confirmed" ? "bg-[#def5e5] text-[#16853f]" : "bg-[#faefcf] text-[#ce7a0f]"}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-5 py-6 text-center text-[#5d5d5d]">
                    No bookings available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderDonations = () => (
    <div className="space-y-6">
      <div className={`${glassCard}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[2rem] font-bold">Donate</h2>
            <p className="mt-2 text-[#4f4f4f]">Give any amount and see your donation reflected in history, payment records, and receipts.</p>
          </div>
          <div className="rounded-2xl bg-[#f4f7f3] px-4 py-3 text-sm font-semibold text-[#1b7f77]">
            Total Donations: {formatCurrency(totalDonations)}
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <div className={glassSection}>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#5d5d5d]">Donation Category</label>
                <select
                  value={donationCategory}
                  onChange={(e) => setDonationCategory(e.target.value)}
                  className={glassInput}
                >
                  {donationCategories.map((category) => (
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
            </div>
          </div>

          <div className={glassSection}>
            <h3 className="text-xl font-semibold">Donation History</h3>
            <p className="mt-2 text-sm text-[#5d5d5d]">Your latest donations are stored here and used in payment history and receipts.</p>
            <div className="mt-6 space-y-3">
              {donationsData.length > 0 ? (
                donationsData.map((item) => (
                  <div key={`${item._id || Math.random()}`} className="rounded-[26px] border border-white/40 bg-white/55 p-4 shadow-sm backdrop-blur-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-[#1f1f1f]">{item.category || item.type || "Donation"}</p>
                        <p className="text-sm text-[#5d5d5d]">{item.date || new Date(item.createdAt).toLocaleDateString()}</p>
                      </div>
                      <p className="text-lg font-bold text-[#1b7f77]">{formatCurrency(item.amount)}</p>
                    </div>
                    <p className="mt-2 text-sm text-[#6b6b6b]">{item.paymentMethod || "UPI"} • {item.status || "Completed"}</p>
                  </div>
                ))
              ) : (
                <div className={glassItem}>No donations have been recorded yet.</div>
              )}
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
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
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
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Net Banking">Net Banking</option>
                </select>
                <div className="rounded-[24px] bg-[#fff7e7] px-4 py-3 text-sm font-semibold text-[#8b5a0a]">Total: {formatCurrency(totalPrice)}</div>
                <button type="button" onClick={handlePrasadamSubmit} className={glassButton}>Pay & Place Order</button>
                {prasadamMessage && <p className="text-sm text-[#1b7f77]">{prasadamMessage}</p>}
              </div>
            </div>

            <div className="grid gap-4">
              {prasadamOrders.length > 0 ? (
                prasadamOrders.map((item) => (
                  <div key={item._id} className={glassItem}>
                    <p className="text-xl font-semibold">{item.itemName}</p>
                    <p className="mt-2 text-sm text-[#5d5d5d]">Order date: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}</p>
                    <p className="mt-1 text-sm text-[#5d5d5d]">Qty: {item.quantity} | Payment: {item.paymentMethod || "UPI"}</p>
                    <p className="mt-3 text-lg font-bold">{formatCurrency(item.amount)}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${item.status === "Cancelled" ? "bg-[#fde8e8] text-[#a12525]" : "bg-[#edf7ee] text-[#16853f]"}`}>{item.status}</span>
                      {item.status !== "Cancelled" && (
                        <button type="button" onClick={() => handleCancelPrasadam(item._id)} className="rounded-lg bg-[#f26037] px-3 py-1 text-xs font-semibold text-white">Cancel</button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className={`${glassItem} text-[#5d5d5d]`}>No prasadam orders available.</div>
              )}
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
      transaction: d.category || d.type || "Donation",
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
      status: o.status || "Placed",
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
                  <td className="px-5 py-3 text-[#16853f]">{row.status}</td>
                  <td className="px-5 py-3">
                    {row.status !== "Cancelled" ? (
                      <button
                        type="button"
                        onClick={() => handleCancelPrasadam(row._id)}
                        className="rounded-lg bg-[#f26037] px-3 py-1 text-xs font-semibold text-white"
                      >
                        Cancel
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-[#a12525]">Cancelled</span>
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
  const renderReceipts = () => (
    <div className="space-y-6">
      <div className={`${glassCard}`}>
        <h2 className="text-[2rem] font-bold">Receipts</h2>
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className={glassSection}>
            <h3 className="text-xl font-semibold">Donation Receipts</h3>
            <div className="mt-4 space-y-3">
              {donationsData.length > 0 ? (
                donationsData.map((item) => (
                  <div key={`${item._id || Math.random()}`} className={glassItem}>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold">{item.category || item.type || "Donation"}</p>
                        <p className="text-sm text-[#5d5d5d]">{item.date || new Date(item.createdAt).toLocaleDateString()}</p>
                        <p className="mt-1 text-sm text-[#6b6b6b]">Receipt ID: {item._id?.slice(-8) || "N/A"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-[#1b7f77]">{formatCurrency(item.amount)}</p>
                        <button type="button" onClick={() => handleReceiptDownload(item, "donation")} className="mt-3 rounded-2xl bg-[#1b7f77] px-4 py-2 text-sm font-semibold text-white">
                          Download PDF
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`${glassItem} text-[#5d5d5d]`}>No donation receipts available.</div>
              )}
            </div>
          </div>

          <div className={glassSection}>
            <h3 className="text-xl font-semibold">Prasadam Receipts</h3>
            <div className="mt-4 space-y-3">
              {prasadamOrders.length > 0 ? (
                prasadamOrders.map((item) => (
                  <div key={item._id} className={glassItem}>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold">{item.itemName}</p>
                        <p className="text-sm text-[#5d5d5d]">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}</p>
                        <p className="mt-1 text-sm text-[#6b6b6b]">Qty: {item.quantity || 1}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-[#1b7f77]">{formatCurrency(item.amount)}</p>
                        <button type="button" onClick={() => handleReceiptDownload(item, "prasadam")} className="mt-3 rounded-2xl bg-[#1b7f77] px-4 py-2 text-sm font-semibold text-white">
                          Download PDF
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`${glassItem} text-[#5d5d5d]`}>No prasadam receipts available.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFestivalEvents = () => (
    <div className="space-y-6">
      <div className={`${glassCard}`}>
        <h2 className="text-[2rem] font-bold">Festival Events</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {eventsData.length > 0 ? (
            eventsData.map((item) => (
              <div key={`${item.title}-${item.formattedDate || item._id}`} className={`${glassItem} p-4`}>
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
                </div>
              </div>
            ))
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

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className={`${glassCard}`}>
        <h2 className="text-[2rem] font-bold">Notifications</h2>
        <div className="mt-6 space-y-4">
          {notificationsData.length > 0 ? (
            notificationsData.map((item) => (
              <div key={`${item.title}-${item.date}-${item._id || Math.random()}`} className={glassItem}>
                <p className="text-xl font-semibold">{item.title}</p>
                <p className="mt-1 text-sm text-[#5d5d5d]">{item.date}</p>
                {item.message ? (
                  <p className="mt-2 text-sm text-[#6b6b6b]">{item.message}</p>
                ) : null}
              </div>
            ))
          ) : (
            <div className={`${glassItem} text-[#5d5d5d]`}>No notifications available.</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <div className={`${glassCard}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-[2rem] font-bold">Profile</h2>
            <p className="mt-2 text-[#5d5d5d]">Manage your devotee profile and contact information.</p>
          </div>
          <button type="button" onClick={() => setProfileEditMode((prev) => !prev)} className="rounded-2xl bg-[#bc630f] px-4 py-2 text-sm font-semibold text-white">
            {profileEditMode ? "Cancel" : "Edit Profile"}
          </button>
        </div>
        {profileMessage && <div className="mt-4 rounded-xl bg-[#e8f7ef] p-3 text-sm text-[#1c6f3d]">{profileMessage}</div>}
        {profileError && <div className="mt-4 rounded-xl bg-[#fde8e8] p-3 text-sm text-[#a12525]">{profileError}</div>}
        {profileEditMode && (
          <div className="mt-4 grid gap-3 rounded-2xl border border-[#f0f0f0] bg-[#fbfaf8] p-4 sm:grid-cols-2">
            <input className={glassInput} value={profileForm.name} onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Name" />
            <input className={glassInput} value={profileForm.email} onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="Email" />
            <button type="button" onClick={handleProfileSave} className={`${glassButton} sm:col-span-2`}>Save Profile</button>
          </div>
        )}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className={glassItem}>
            <p className="text-sm text-[#7a6f5d]">Name</p>
            <p className="mt-2 text-xl font-semibold">{devoteeName}</p>
          </div>
          <div className={glassItem}>
            <p className="text-sm text-[#7a6f5d]">Email</p>
            <p className="mt-2 text-xl font-semibold">{profileData.email}</p>
          </div>
          <div className={glassItem}>
            <p className="text-sm text-[#7a6f5d]">Role</p>
            <p className="mt-2 text-xl font-semibold">{profileData.role}</p>
          </div>
          <div className={glassItem}>
            <p className="text-sm text-[#7a6f5d]">Member Since</p>
            <p className="mt-2 text-xl font-semibold">{profileData.memberSince}</p>
          </div>
        </div>
      </div>
    </div>
  );

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
              className="mt-1 w-full rounded-xl border border-white/40 bg-white/45 px-3 py-3 text-left text-base font-semibold text-[#7f470a] hover:bg-white/80"
            >
              <span className="inline-flex items-center gap-3">
                <AppIcon name="gear" className="h-[17px] w-[17px]" />
                Logout
              </span>
            </button>
          </div>
        </aside>

        <main className="flex-1 px-3 py-3 sm:px-5 sm:py-5 lg:px-8">
          <header className="rounded-2xl border border-white/65 bg-white/82 px-5 py-4 shadow-[0_12px_30px_rgba(80,40,10,0.12)] backdrop-blur-md">
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
                  <span className="absolute -right-1 -top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#e4262c] text-[10px] font-bold text-white">
                    {notificationsData.length}
                  </span>
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

          <div className="mt-4 rounded-2xl border border-white/70 bg-white/85 p-3 shadow-[0_10px_30px_rgba(80,40,10,0.1)] backdrop-blur-sm md:p-4">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DevoteeDashboard;








