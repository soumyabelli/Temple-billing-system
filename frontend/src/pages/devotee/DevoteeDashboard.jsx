import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import templeImage from "../../assets/temple.jpg.png";
import { useAuth } from "../../context/AuthContext";
import {
  getDevoteeBookings,
  getDevoteeDonations,
  getDevoteeNotifications,
  getDevoteeProfile,
  getDevoteeEvents,
  createDevoteeDonation,
  createDevoteeBooking,
  submitDevoteeSupport,
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
      active ? "bg-[#d78722] text-white shadow-[0_6px_16px_rgba(202,122,29,0.3)]" : "text-[#211b13] hover:bg-white/70"
    }`}
  >
    <AppIcon name={icon} className="h-[17px] w-[17px]" />
    <span className="text-base leading-none">{label}</span>
  </button>
);

const DevoteeDashboard = () => {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();
  const [activePage, setActivePage] = useState("Dashboard");
  const [bookingsData, setBookingsData] = useState([]);
  const [donationsData, setDonationsData] = useState([]);
  const [notificationsData, setNotificationsData] = useState([]);
  const [eventsData, setEventsData] = useState([]);
  const [profileData, setProfileData] = useState({
    name: user?.name || "Devotee User",
    email: user?.email || "devotee@example.com",
    role: "devotee",
    memberSince: "2025",
  });
  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [bookingService, setBookingService] = useState("Abhisheka");
  const [bookingDatetime, setBookingDatetime] = useState("");
  const [bookingAmount, setBookingAmount] = useState(501);
  const [bookingContact, setBookingContact] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [donationCategory, setDonationCategory] = useState("General");
  const [donationAmount, setDonationAmount] = useState(501);
  const [donationMethod, setDonationMethod] = useState("UPI");
  const [donationContact, setDonationContact] = useState("");
  const [donationNotes, setDonationNotes] = useState("");
  const [donationLoading, setDonationLoading] = useState(false);
  const [donationError, setDonationError] = useState("");
  const [donationSuccess, setDonationSuccess] = useState("");

  const availablePoojaServices = [
    "Abhisheka",
    "Archana",
    "Special Homa",
    "Satyanarayana Puja",
    "Maha Lakshmi Pooja",
  ];
  const donationCategories = ["General", "Festival Donation", "Prasadam", "Temple Restoration", "Annadanam"];
  const paymentMethods = ["UPI", "Cash", "Card", "Bank Transfer", "Net Banking"];

  const devoteeName = useMemo(() => {
    if (user?.name) return user.name;
    return profileData.name;
  }, [profileData.name, user?.name]);

  const totalDonations = useMemo(
    () => donationsData.reduce((sum, donation) => sum + (typeof donation.amount === "number" ? donation.amount : Number(donation.amount) || 0), 0),
    [donationsData]
  );

  const prasadamOrdersCount = useMemo(
    () => donationsData.filter((donation) => (donation.category || donation.type || "").toLowerCase().includes("prasadam")).length,
    [donationsData]
  );

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
      {
        title: "Wallet Balance",
        value: "₹ 250",
        action: "Add Money",
        tone: "bg-[#eaf1ff] text-[#3468db]",
        icon: "wallet",
      },
    ],
    [bookingsData.length, totalDonations, prasadamOrdersCount]
  );

  useEffect(() => {
    const loadDevoteeData = async () => {
      try {
        const [bookingsRes, donationsRes, notificationsRes, profileRes, eventsRes] = await Promise.all([
          getDevoteeBookings(),
          getDevoteeDonations(),
          getDevoteeNotifications(),
          getDevoteeProfile(),
          getDevoteeEvents(),
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
            date: notification.date ? new Date(notification.date).toLocaleDateString() : notification.date || "",
          }))
        );
        setProfileData(profileRes.profile || profileData);
        setEventsData(
          (eventsRes.events || []).map((event) => ({
            ...event,
            formattedDate: event.date ? new Date(event.date).toLocaleDateString() : event.date || "",
          }))
        );
      } catch (error) {
        console.warn("Unable to load devotee data", error);
      }
    };

    loadDevoteeData();
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
        service: bookingService,
        datetime: bookingDatetime,
        amount: bookingAmount,
        status: "Pending",
        contactNumber: bookingContact,
        notes: bookingNotes,
      };

      await createDevoteeBooking(payload);
      const bookingsRes = await getDevoteeBookings();
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
        amount: donationAmount,
        category: donationCategory,
        paymentMethod: donationMethod,
        contactNumber: donationContact,
        notes: donationNotes,
      });

      const updatedDonations = await getDevoteeDonations();
      setDonationsData(updatedDonations.donations || []);
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
      setActivePage("Dashboard");
    } catch (error) {
      console.warn("Unable to send support request", error);
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
          <article key={item.title} className="rounded-2xl border border-[#ececec] bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-4">
              <IconCircle className={item.tone} icon={item.icon} />
              <p className="text-[1.06rem] text-[#383838]">{item.title}</p>
            </div>
            <p className="text-[2.15rem] font-extrabold leading-none">{item.value}</p>
            <button type="button" className="mt-4 bg-transparent p-0 text-base font-semibold text-[#bc630f]">
              {item.action}
            </button>
          </article>
        ))}
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-3">
        <article className="rounded-2xl border border-[#ececec] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[2rem] font-bold">Upcoming Bookings</h2>
            <button type="button" className="bg-transparent p-0 text-base font-semibold text-[#bc630f]">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {bookingsData.length > 0 ? (
              bookingsData.slice(0, 3).map((item) => (
                <div key={`${item.service}-${item.datetime}-${item._id || Math.random()}`} className="rounded-xl border border-[#efefef] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[1.45rem] font-bold">{item.service}</p>
                    <span className={`rounded-full px-3 py-1 text-sm font-semibold ${item.status === "Confirmed" ? "bg-[#def5e5] text-[#16853f]" : "bg-[#faefcf] text-[#ce7a0f]"}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-1 text-[1.15rem] text-[#4f4f4f]">{item.datetime}</p>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-[#efefef] p-4 text-[#5d5d5d]">No bookings found yet.</p>
            )}
          </div>
          <div className="pt-4 text-right">
            <button type="button" className="bg-transparent p-0 text-base font-semibold text-[#3058d6]">
              View All Bookings
            </button>
          </div>
        </article>

        <article className="rounded-2xl border border-[#ececec] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[2rem] font-bold">Recent Donations</h2>
            <button type="button" className="bg-transparent p-0 text-base font-semibold text-[#bc630f]">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {donationsData.length > 0 ? (
              donationsData.slice(0, 3).map((item) => (
                <div key={`${item.type}-${item.date}-${item._id || Math.random()}`} className="flex items-center justify-between rounded-xl border border-[#efefef] p-4">
                  <div>
                    <p className="text-[1.45rem] font-bold">{item.type}</p>
                    <p className="text-[1.15rem] text-[#4f4f4f]">{item.date}</p>
                  </div>
                  <p className="text-[1.45rem] font-bold">{formatCurrency(item.amount)}</p>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-[#efefef] p-4 text-[#5d5d5d]">No donations yet.</p>
            )}
          </div>
          <div className="pt-4 text-right">
            <button type="button" className="bg-transparent p-0 text-base font-semibold text-[#3058d6]">
              View All Donations
            </button>
          </div>
        </article>

        <article className="rounded-2xl border border-[#ececec] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[2rem] font-bold">Notifications</h2>
            <button type="button" className="bg-transparent p-0 text-base font-semibold text-[#bc630f]">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {notificationsData.length > 0 ? (
              notificationsData.slice(0, 3).map((item) => (
                <div key={`${item.title}-${item.date}-${item._id || Math.random()}`} className="rounded-xl border border-[#efefef] p-4">
                  <p className="text-[1.45rem] font-bold">{item.title}</p>
                  <p className="text-[1.15rem] text-[#4f4f4f]">{item.date}</p>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-[#efefef] p-4 text-[#5d5d5d]">No notifications yet.</p>
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
          <button type="button" className="rounded-xl border border-white/60 bg-white/20 px-5 py-2 text-lg font-semibold text-white backdrop-blur-sm">
            View Details
          </button>
        </div>
      </section>

      <section className="mt-4 grid gap-4 pb-8 xl:grid-cols-2">
        <article className="overflow-hidden rounded-2xl border border-[#ececec] bg-white shadow-sm">
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
                      <td className="px-5 py-3 text-[1.45rem] font-bold">{row.service}</td>
                      <td className="px-5 py-3 text-[1.15rem] text-[#3f3f3f]">{row.datetime}</td>
                      <td className="px-5 py-3 text-[1.45rem] font-bold">{formatCurrency(row.amount)}</td>
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
            <button type="button" className="rounded-xl bg-[#1b7f77] px-5 py-2 text-base font-semibold text-white">
              View All Bookings
            </button>
          </div>
        </article>

        <article className="overflow-hidden rounded-2xl border border-[#ececec] bg-white shadow-sm">
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
                      <td className="px-5 py-3 text-[1.45rem] font-bold">{row.type}</td>
                      <td className="px-5 py-3 text-[1.15rem] text-[#3f3f3f]">{row.date}</td>
                      <td className="px-5 py-3 text-[1.45rem] font-bold">{formatCurrency(row.amount)}</td>
                      <td className="px-5 py-3 text-[1.15rem] text-[#af6317]">Download</td>
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
            <button type="button" className="rounded-xl bg-[#1b7f77] px-5 py-2 text-base font-semibold text-white">
              View All Donations
            </button>
          </div>
        </article>
      </section>
    </>
  );

  const renderBookPooja = () => (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#ececec] bg-white p-5 shadow-sm">
        <h2 className="text-[2rem] font-bold">Book Pooja</h2>
        <p className="mt-2 text-[#4f4f4f]">Choose a service and book your next pooja online. Your new booking will appear under My Bookings.</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-5 rounded-3xl border border-[#f0f0f0] bg-[#fbfaf8] p-6">
            <div>
              <p className="text-sm uppercase tracking-[0.08em] text-[#8d6925]">Service</p>
              <select
                value={bookingService}
                onChange={(e) => setBookingService(e.target.value)}
                className="mt-3 w-full rounded-3xl border border-[#ded6c6] bg-white px-4 py-3 text-base outline-none"
              >
                {availablePoojaServices.map((service) => (
                  <option key={service} value={service}>
                    {service}
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
                className="mt-3 w-full rounded-3xl border border-[#ded6c6] bg-white px-4 py-3 text-base outline-none"
              />
            </div>

            <div>
              <p className="text-sm uppercase tracking-[0.08em] text-[#8d6925]">Amount</p>
              <input
                type="number"
                min="1"
                value={bookingAmount}
                onChange={(e) => setBookingAmount(Number(e.target.value))}
                className="mt-3 w-full rounded-3xl border border-[#ded6c6] bg-white px-4 py-3 text-base outline-none"
              />
            </div>

            <div>
              <p className="text-sm uppercase tracking-[0.08em] text-[#8d6925]">Contact number</p>
              <input
                type="tel"
                value={bookingContact}
                onChange={(e) => setBookingContact(e.target.value)}
                placeholder="Optional phone number"
                className="mt-3 w-full rounded-3xl border border-[#ded6c6] bg-white px-4 py-3 text-base outline-none"
              />
            </div>

            <div>
              <p className="text-sm uppercase tracking-[0.08em] text-[#8d6925]">Notes</p>
              <textarea
                rows={4}
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                placeholder="Any special requests"
                className="mt-3 w-full rounded-3xl border border-[#ded6c6] bg-white px-4 py-3 text-base outline-none"
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

          <div className="space-y-4 rounded-3xl border border-[#f0f0f0] bg-white p-6">
            <h3 className="text-xl font-semibold">Popular Pooja services</h3>
            <p className="text-sm text-[#5d5d5d]">Select a service to book and check your newest booking immediately in My Bookings.</p>
            <div className="grid gap-3">
              {availablePoojaServices.map((service) => (
                <button
                  type="button"
                  key={service}
                  onClick={() => setBookingService(service)}
                  className={`w-full rounded-3xl border px-4 py-4 text-left text-sm font-semibold transition ${
                    bookingService === service ? "border-[#bc630f] bg-[#fff5e7] text-[#9b5a1e]" : "border-[#ececec] bg-[#fafafa] text-[#4f4f4f] hover:border-[#bc630f]"
                  }`}
                >
                  {service}
                </button>
              ))}
            </div>
            <div className="rounded-3xl border border-[#f0f0f0] bg-[#fffdf8] p-4 text-sm text-[#6d5a35]">
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
      <div className="rounded-2xl border border-[#ececec] bg-white p-5 shadow-sm">
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
      <div className="rounded-2xl border border-[#ececec] bg-white p-5 shadow-sm">
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
          <div className="rounded-3xl border border-[#f0f0f0] bg-[#fbfaf8] p-6">
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#5d5d5d]">Donation Category</label>
                <select
                  value={donationCategory}
                  onChange={(e) => setDonationCategory(e.target.value)}
                  className="mt-2 w-full rounded-3xl border border-[#ded6c6] bg-white px-4 py-3 text-base outline-none"
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
                  className="mt-2 w-full rounded-3xl border border-[#ded6c6] bg-white px-4 py-3 text-base outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#5d5d5d]">Payment Method</label>
                <select
                  value={donationMethod}
                  onChange={(e) => setDonationMethod(e.target.value)}
                  className="mt-2 w-full rounded-3xl border border-[#ded6c6] bg-white px-4 py-3 text-base outline-none"
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
                  className="mt-2 w-full rounded-3xl border border-[#ded6c6] bg-white px-4 py-3 text-base outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#5d5d5d]">Notes</label>
                <textarea
                  rows={4}
                  value={donationNotes}
                  onChange={(e) => setDonationNotes(e.target.value)}
                  placeholder="Any message for the temple"
                  className="mt-2 w-full rounded-3xl border border-[#ded6c6] bg-white px-4 py-3 text-base outline-none"
                />
              </div>

              {donationError && <div className="rounded-3xl bg-[#fde8e8] p-4 text-sm text-[#a12525]">{donationError}</div>}
              {donationSuccess && <div className="rounded-3xl bg-[#e8f7ef] p-4 text-sm text-[#1c6f3d]">{donationSuccess}</div>}

              <button
                type="button"
                onClick={handleDonationSubmit}
                disabled={donationLoading}
                className="mt-2 w-full rounded-2xl bg-[#1b7f77] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#166353] disabled:cursor-not-allowed disabled:bg-[#9bb8af]"
              >
                {donationLoading ? "Processing donation..." : "Donate Now"}
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-[#f0f0f0] bg-white p-6">
            <h3 className="text-xl font-semibold">Donation History</h3>
            <p className="mt-2 text-sm text-[#5d5d5d]">Your latest donations are stored here and used in payment history and receipts.</p>
            <div className="mt-6 space-y-3">
              {donationsData.length > 0 ? (
                donationsData.map((item) => (
                  <div key={`${item._id || Math.random()}`} className="rounded-3xl border border-[#ececec] p-4">
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
                <div className="rounded-3xl border border-[#efefef] p-4 text-[#5d5d5d]">No donations have been recorded yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrasadam = () => {
    const prasadamDonations = donationsData.filter((item) => (item.type || item.category || "").toLowerCase().includes("prasadam"));

    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-[#ececec] bg-white p-5 shadow-sm">
          <h2 className="text-[2rem] font-bold">Prasadam Orders</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {prasadamDonations.length > 0 ? (
              prasadamDonations.map((item) => (
                <div key={`${item.type}-${item.date}-${item._id || Math.random()}`} className="rounded-3xl border border-[#f0f0f0] p-5">
                  <p className="text-xl font-semibold">{item.type}</p>
                  <p className="mt-2 text-sm text-[#5d5d5d]">Order date: {item.date}</p>
                  <p className="mt-3 text-lg font-bold">{formatCurrency(item.amount)}</p>
                  <button type="button" className="mt-4 rounded-2xl bg-[#1b7f77] px-4 py-3 text-sm font-semibold text-white">
                    Track Order
                  </button>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-[#efefef] p-4 text-[#5d5d5d]">No prasadam orders available.</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPaymentHistory = () => (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#ececec] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-[2rem] font-bold">Payment History</h2>
          <button type="button" className="rounded-2xl bg-[#1b7f77] px-4 py-2 text-sm font-semibold text-white">Download</button>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm text-[#3f3f3f]">
            <thead className="bg-[#fafafa] text-[#575757]">
              <tr>
                <th className="px-5 py-3">Transaction</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {donationsData.length > 0 ? (
                donationsData.map((item) => (
                  <tr key={`${item.category || item.type}-${item.date}-${item._id || Math.random()}`} className="border-t border-[#f0f0f0]">
                    <td className="px-5 py-3 font-semibold">{item.category || item.type || "Donation"}</td>
                    <td className="px-5 py-3">{item.date || new Date(item.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3">{formatCurrency(item.amount)}</td>
                    <td className="px-5 py-3 text-[#16853f]">{item.status || "Paid"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-5 py-6 text-center text-[#5d5d5d]">
                    No payment history available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderReceipts = () => (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#ececec] bg-white p-5 shadow-sm">
        <h2 className="text-[2rem] font-bold">Receipts</h2>
        <div className="mt-6 space-y-3">
          {donationsData.length > 0 ? (
            donationsData.map((item) => (
              <div key={`${item._id || Math.random()}`} className="flex flex-wrap items-center justify-between rounded-3xl border border-[#f0f0f0] p-4">
                <div>
                  <p className="text-xl font-semibold">{item.category || item.type || "Donation"}</p>
                  <p className="text-sm text-[#5d5d5d]">{item.date || new Date(item.createdAt).toLocaleDateString()}</p>
                  <p className="mt-1 text-sm text-[#6b6b6b]">Receipt ID: {item._id?.slice(-8) || "N/A"}</p>
                </div>
                <button type="button" className="rounded-2xl bg-[#1b7f77] px-4 py-2 text-sm font-semibold text-white">
                  Download
                </button>
              </div>
            ))
          ) : (
            <p className="rounded-xl border border-[#efefef] p-4 text-[#5d5d5d]">No receipts found.</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderFestivalEvents = () => (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#ececec] bg-white p-5 shadow-sm">
        <h2 className="text-[2rem] font-bold">Festival Events</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {eventsData.length > 0 ? (
            eventsData.map((item) => (
              <div key={`${item.title}-${item.formattedDate || item._id}`} className="rounded-3xl border border-[#f0f0f0] p-5">
                <p className="text-xl font-semibold">{item.title}</p>
                <p className="mt-2 text-sm text-[#5d5d5d]">{item.formattedDate || item.date}</p>
              </div>
            ))
          ) : (
            <p className="rounded-xl border border-[#efefef] p-4 text-[#5d5d5d]">No festival events available.</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#ececec] bg-white p-5 shadow-sm">
        <h2 className="text-[2rem] font-bold">Notifications</h2>
        <div className="mt-6 space-y-4">
          {notificationsData.length > 0 ? (
            notificationsData.map((item) => (
              <div key={`${item.title}-${item.date}-${item._id || Math.random()}`} className="rounded-3xl border border-[#f0f0f0] p-4">
                <p className="text-xl font-semibold">{item.title}</p>
                <p className="mt-1 text-sm text-[#5d5d5d]">{item.date}</p>
              </div>
            ))
          ) : (
            <p className="rounded-xl border border-[#efefef] p-4 text-[#5d5d5d]">No notifications available.</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#ececec] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-[2rem] font-bold">Profile</h2>
            <p className="mt-2 text-[#5d5d5d]">Manage your devotee profile and contact information.</p>
          </div>
          <button type="button" className="rounded-2xl bg-[#bc630f] px-4 py-2 text-sm font-semibold text-white">
            Edit Profile
          </button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-[#f0f0f0] bg-[#fbf6ef] p-5">
            <p className="text-sm text-[#7a6f5d]">Name</p>
            <p className="mt-2 text-xl font-semibold">{devoteeName}</p>
          </div>
          <div className="rounded-3xl border border-[#f0f0f0] bg-[#fbf6ef] p-5">
            <p className="text-sm text-[#7a6f5d]">Email</p>
            <p className="mt-2 text-xl font-semibold">{profileData.email}</p>
          </div>
          <div className="rounded-3xl border border-[#f0f0f0] bg-[#fbf6ef] p-5">
            <p className="text-sm text-[#7a6f5d]">Role</p>
            <p className="mt-2 text-xl font-semibold">{profileData.role}</p>
          </div>
          <div className="rounded-3xl border border-[#f0f0f0] bg-[#fbf6ef] p-5">
            <p className="text-sm text-[#7a6f5d]">Member Since</p>
            <p className="mt-2 text-xl font-semibold">{profileData.memberSince}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSupport = () => (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#ececec] bg-white p-5 shadow-sm">
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
              className="w-full rounded-3xl border border-[#ececec] bg-[#fafafa] px-4 py-3 outline-none"
            />
          </label>
          <label className="block space-y-2 text-sm text-[#5d5d5d] md:col-span-2">
            Message
            <textarea
              rows={5}
              value={supportMessage}
              onChange={(e) => setSupportMessage(e.target.value)}
              placeholder="Describe your issue"
              className="w-full rounded-3xl border border-[#ececec] bg-[#fafafa] px-4 py-3 outline-none"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={handleSupportSubmit}
          className="mt-5 rounded-2xl bg-[#1b7f77] px-5 py-3 text-sm font-semibold text-white"
        >
          Send Request
        </button>
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
    <div className="min-h-screen bg-[#f7f7f9] text-[#181818]">
      <div className="mx-auto flex max-w-[1540px]">
        <aside className="relative hidden min-h-screen w-[270px] overflow-hidden border-r border-[#e3d0bb] bg-[#f8f0e4] lg:block">
          <div className="pointer-events-none absolute inset-0">
            <img src={templeImage} alt="Temple background" className="h-full w-full object-cover object-[56%_center]" />
            <div className="absolute inset-0 bg-[#f6eadb]/28"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-[#f8efe2]/62 via-[#f5e7d6]/24 to-[#c98d44]/6"></div>
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
              className="mt-1 w-full rounded-xl px-3 py-3 text-left text-base font-semibold text-[#7f470a] hover:bg-white/80"
            >
              <span className="inline-flex items-center gap-3">
                <AppIcon name="gear" className="h-[17px] w-[17px]" />
                Logout
              </span>
            </button>
          </div>
        </aside>

        <main className="flex-1 px-6 py-6 lg:px-7">
          <header className="rounded-2xl border border-[#ebebeb] bg-white px-5 py-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex min-w-[360px] flex-1 items-center gap-4">
                <button type="button" className="hidden text-[#8d551f] lg:block">
                  <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current">
                    <path d="M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z"></path>
                  </svg>
                </button>
                <div className="relative w-full max-w-[460px]">
                  <input
                    type="text"
                    placeholder="Search here..."
                    className="w-full rounded-xl border border-[#ebebeb] bg-[#fdfdfd] py-3 pl-12 pr-4 text-sm text-[#4d4d4d] outline-none placeholder:text-[#9a9a9a]"
                  />
                  <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 fill-none stroke-[#8d551f] stroke-2">
                    <circle cx="11" cy="11" r="7"></circle>
                    <path d="m20 20-3.5-3.5"></path>
                  </svg>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative mr-1 hidden lg:block">
                  <AppIcon name="bell" className="h-7 w-7 text-[#302d2b]" />
                  <span className="absolute -right-1 -top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#e4262c] text-[10px] font-bold text-white">
                    {notificationsData.length}
                  </span>
                </div>
                <div className="rounded-xl border border-[#ead6c0] px-4 py-2 text-sm font-bold text-[#7e4310]">14 May 2025, Wednesday</div>
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

          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default DevoteeDashboard;
