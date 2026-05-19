import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import templeImage from "../assets/temple.jpg.png";
import { useAuth } from "../context/AuthContext";

const menuItems = [
  { label: "Dashboard", icon: "home", active: true },
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

const stats = [
  { title: "Upcoming Bookings", value: "2", action: "View Details", tone: "bg-[#f2ecff] text-[#6b3df0]", icon: "calendar" },
  { title: "Total Donations", value: "₹ 5,750", action: "View History", tone: "bg-[#edf7ee] text-[#2f8d42]", icon: "heart" },
  { title: "Prasadam Orders", value: "1", action: "View Orders", tone: "bg-[#ffefea] text-[#f26037]", icon: "bag" },
  { title: "Wallet Balance", value: "₹ 250", action: "Add Money", tone: "bg-[#eaf1ff] text-[#3468db]", icon: "wallet" },
];

const bookings = [
  { name: "Special Seva", datetime: "18 May 2025, 06:00 AM", status: "Confirmed" },
  { name: "Abhishekam", datetime: "18 May 2025, 07:30 AM", status: "Confirmed" },
];

const recentDonations = [
  { title: "General Donation", date: "12 May 2025", amount: "₹ 1,100" },
  { title: "Annadanam", date: "10 May 2025", amount: "₹ 550" },
  { title: "Temple Construction", date: "05 May 2025", amount: "₹ 2,000" },
];

const alerts = [
  { title: "Pooja booking confirmed", date: "14 May 2025" },
  { title: "Festival Brahmotsavam starts from 20 May", date: "13 May 2025" },
  { title: "Your donation receipt generated", date: "12 May 2025" },
];

const bookingTable = [
  { service: "Special Seva", date: "18 May 2025, 06:00 AM", amount: "₹ 1,100", status: "Confirmed" },
  { service: "Abhishekam", date: "18 May 2025, 07:30 AM", amount: "₹ 550", status: "Confirmed" },
  { service: "Archana", date: "21 May 2025, 08:00 AM", amount: "₹ 350", status: "Pending" },
  { service: "Homa", date: "25 May 2025, 09:00 AM", amount: "₹ 2,200", status: "Pending" },
];

const donationTable = [
  { type: "General Donation", date: "12 May 2025", amount: "₹ 1,100" },
  { type: "Annadanam", date: "10 May 2025", amount: "₹ 550" },
  { type: "Temple Construction", date: "05 May 2025", amount: "₹ 2,000" },
  { type: "Festival Donation", date: "01 May 2025", amount: "₹ 2,100" },
];

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

const SidebarItem = ({ label, icon, active }) => (
  <button
    type="button"
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

  const devoteeName = useMemo(() => {
    if (!user?.name) return "Ramesh Kumar";
    return user.name
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }, [user?.name]);

  const handleLogout = () => {
    logoutUser();
    navigate("/");
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
              <SidebarItem key={item.label} label={item.label} icon={item.icon} active={Boolean(item.active)} />
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
                    3
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
                {bookings.map((item) => (
                  <div key={item.name} className="rounded-xl border border-[#efefef] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[1.45rem] font-bold">{item.name}</p>
                      <span className="rounded-full bg-[#def5e5] px-3 py-1 text-sm font-semibold text-[#16853f]">{item.status}</span>
                    </div>
                    <p className="mt-1 text-[1.15rem] text-[#4f4f4f]">{item.datetime}</p>
                  </div>
                ))}
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
                {recentDonations.map((item) => (
                  <div key={item.title} className="flex items-center justify-between rounded-xl border border-[#efefef] p-4">
                    <div>
                      <p className="text-[1.45rem] font-bold">{item.title}</p>
                      <p className="text-[1.15rem] text-[#4f4f4f]">{item.date}</p>
                    </div>
                    <p className="text-[1.45rem] font-bold">{item.amount}</p>
                  </div>
                ))}
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
                {alerts.map((item) => (
                  <div key={item.title} className="rounded-xl border border-[#efefef] p-4">
                    <p className="text-[1.45rem] font-bold">{item.title}</p>
                    <p className="text-[1.15rem] text-[#4f4f4f]">{item.date}</p>
                  </div>
                ))}
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
                className="rounded-xl border border-white/60 bg-white/20 px-5 py-2 text-lg font-semibold text-white backdrop-blur-sm"
              >
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
                    {bookingTable.map((row) => (
                      <tr key={`${row.service}-${row.date}`} className="border-t border-[#f0f0f0]">
                        <td className="px-5 py-3 text-[1.45rem] font-bold">{row.service}</td>
                        <td className="px-5 py-3 text-[1.15rem] text-[#3f3f3f]">{row.date}</td>
                        <td className="px-5 py-3 text-[1.45rem] font-bold">{row.amount}</td>
                        <td className="px-5 py-3">
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-semibold ${
                              row.status === "Confirmed" ? "bg-[#def5e5] text-[#16853f]" : "bg-[#faefcf] text-[#ce7a0f]"
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
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
                    {donationTable.map((row) => (
                      <tr key={`${row.type}-${row.date}`} className="border-t border-[#f0f0f0]">
                        <td className="px-5 py-3 text-[1.45rem] font-bold">{row.type}</td>
                        <td className="px-5 py-3 text-[1.15rem] text-[#3f3f3f]">{row.date}</td>
                        <td className="px-5 py-3 text-[1.45rem] font-bold">{row.amount}</td>
                        <td className="px-5 py-3 text-[1.15rem] text-[#af6317]">Download</td>
                      </tr>
                    ))}
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
        </main>
      </div>
    </div>
  );
};

export default DevoteeDashboard;
