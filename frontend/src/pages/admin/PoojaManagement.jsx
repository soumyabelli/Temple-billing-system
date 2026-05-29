import { useEffect, useMemo, useState } from "react";
import {
  MdCalendarMonth,
  MdOutlineCalendarToday,
  MdOutlineTaskAlt,
  MdOutlineVerified,
  MdOutlineCurrencyRupee,
  MdOutlineSearch,
  MdOutlineFilterAlt,
  MdOutlineRemoveRedEye,
  MdOutlinePrint,
} from "react-icons/md";
import { FaDownload } from "react-icons/fa6";
import { getDevoteeBookings, getDevoteeDonations, updateBookingStatus } from "../../services/devoteeService";
import { getPoojaTypes, savePoojaTypes, removePoojaType } from "../../services/poojaTypeService";

const formatCurrency = (value) => `Rs ${Number(value || 0).toLocaleString()}`;

const statusTheme = {
  Confirmed: "bg-[#e8f6e9] text-[#187a3b]",
  Pending: "bg-[#fff1df] text-[#ea580c]",
  Completed: "bg-[#e9efff] text-[#2454c9]",
  Cancelled: "bg-[#fde8e8] text-[#a12525]",
};

const PoojaManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [donations, setDonations] = useState([]);
  const [query, setQuery] = useState("");
  const [poojaTypes, setPoojaTypes] = useState(getPoojaTypes());
  const [typeName, setTypeName] = useState("");
  const [typePrice, setTypePrice] = useState(501);
  const [editingType, setEditingType] = useState(null);
  const [typeMessage, setTypeMessage] = useState("");

  const loadPoojaTypes = () => setPoojaTypes(getPoojaTypes());

  const handleSaveType = () => {
    const name = typeName.trim();
    const price = Number(typePrice);
    if (!name || price <= 0) {
      setTypeMessage("Please enter a valid name and price.");
      return;
    }
    const updated = savePoojaTypes([
      ...getPoojaTypes().filter((type) => type.name !== (editingType || name)),
      { name, price },
    ]);
    setPoojaTypes(updated);
    setTypeMessage(editingType ? "Pooja type updated." : "Pooja type added.");
    setEditingType(null);
    setTypeName("");
    setTypePrice(501);
  };

  const handleEditType = (type) => {
    setTypeName(type.name);
    setTypePrice(type.price);
    setEditingType(type.name);
    setTypeMessage("");
  };

  const handleDeleteType = (name) => {
    const updated = removePoojaType(name);
    setPoojaTypes(updated);
    if (editingType === name) {
      setEditingType(null);
      setTypeName("");
      setTypePrice(501);
    }
    setTypeMessage("Pooja type removed.");
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [bRes, dRes] = await Promise.all([getDevoteeBookings(), getDevoteeDonations()]);
        setBookings(bRes.bookings || []);
        setDonations(dRes.donations || []);
      } catch (error) {
        console.warn("Unable to load pooja management data", error);
      }
    };
    load();
  }, []);

  const reloadData = async () => {
    const [bRes, dRes] = await Promise.all([getDevoteeBookings(), getDevoteeDonations()]);
    setBookings(bRes.bookings || []);
    setDonations(dRes.donations || []);
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateBookingStatus(id, status);
      await reloadData();
    } catch (error) {
      console.warn("Unable to update booking status", error);
    }
  };

  const filteredBookings = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = bookings.map((b, idx) => ({
      id: `BK${String(1000 + idx + 1)}`,
      devotee: b.devoteeName,
      pooja: b.service,
      date: b.datetime ? new Date(b.datetime).toLocaleDateString() : "-",
      slot: b.datetime ? new Date(b.datetime).toLocaleTimeString() : "-",
      amount: Number(b.amount || 0),
      status: b.status || "Pending",
      createdAt: b.createdAt,
      raw: b,
    }));
    if (!q) return rows;
    return rows.filter((r) => (r.devotee || "").toLowerCase().includes(q) || (r.pooja || "").toLowerCase().includes(q) || (r.id || "").toLowerCase().includes(q));
  }, [bookings, query]);

  const today = new Date().toDateString();
  const todays = filteredBookings.filter((b) => b.raw?.datetime && new Date(b.raw.datetime).toDateString() === today).length;
  const upcoming = filteredBookings.filter((b) => b.raw?.datetime && new Date(b.raw.datetime) > new Date()).length;
  const completed = filteredBookings.filter((b) => (b.status || "").toLowerCase() === "completed").length;
  const revenue = filteredBookings.reduce((sum, b) => sum + Number(b.amount || 0), 0);

  const stats = [
    { title: "Today's Bookings", value: todays, icon: MdOutlineCalendarToday, iconBg: "bg-[#fff1e2]", iconText: "text-[#f97316]" },
    { title: "Upcoming Poojas", value: upcoming, icon: MdOutlineTaskAlt, iconBg: "bg-[#eaf6e8]", iconText: "text-[#15803d]" },
    { title: "Completed Services", value: completed, icon: MdOutlineVerified, iconBg: "bg-[#efe9ff]", iconText: "text-[#6d28d9]" },
    { title: "Booking Revenue", value: formatCurrency(revenue), icon: MdOutlineCurrencyRupee, iconBg: "bg-[#fff3db]", iconText: "text-[#ea580c]" },
  ];

  const receipts = filteredBookings.slice(0, 8).map((b, idx) => ({
    receiptId: `RC${String(2000 + idx + 1)}`,
    bookingId: b.id,
    devotee: b.devotee,
    amount: formatCurrency(b.amount),
    method: donations.find((d) => (d.donorName || "") === b.devotee)?.paymentMethod || "UPI",
    date: b.createdAt ? new Date(b.createdAt).toLocaleString() : "-",
  }));

  return (
    <div className="mt-5 space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-[42px] leading-tight font-bold text-[#15141f]">Pooja Booking Management</h1>
          <p className="mt-1 text-[20px] text-[#5d6674]">Live pooja schedules, bookings, receipts and seva operations.</p>
        </div>

        <div className="inline-flex h-12 items-center gap-2 rounded-xl border border-[#f0e1d2] bg-[#fff7ee] px-4 text-[20px] font-semibold text-[#a64b0f]">
          <MdCalendarMonth size={22} />
          {new Date().toLocaleDateString(undefined, { weekday: "long", day: "2-digit", month: "short", year: "numeric" })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        {stats.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="rounded-2xl border border-[#ece8e1] bg-white p-5">
              <div className="flex items-center gap-4">
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${card.iconBg}`}><Icon className={card.iconText} size={30} /></div>
                <div>
                  <p className="text-[20px] font-medium text-[#323946]">{card.title}</p>
                  <p className="text-[38px] leading-none font-bold text-[#111827]">{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-[#ece8e1] bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-[30px] font-bold text-[#15141f]">Manage Pooja Types</h2>
            <p className="mt-1 text-sm text-[#5d6674]">Add, edit or remove pooja services and their booking prices.</p>
          </div>
          <div className="w-full max-w-[360px] rounded-3xl border border-[#f0f0f0] bg-[#fafaf9] p-5">
            <label className="block text-sm font-semibold text-[#4f4f4f]">
              Pooja Name
              <input
                type="text"
                value={typeName}
                onChange={(e) => setTypeName(e.target.value)}
                className="mt-2 w-full rounded-3xl border border-[#ded6c6] bg-white px-4 py-3 text-base outline-none"
                placeholder="e.g. Lakshmi Archana"
              />
            </label>
            <label className="mt-4 block text-sm font-semibold text-[#4f4f4f]">
              Price
              <input
                type="number"
                min="1"
                value={typePrice}
                onChange={(e) => setTypePrice(Number(e.target.value))}
                className="mt-2 w-full rounded-3xl border border-[#ded6c6] bg-white px-4 py-3 text-base outline-none"
                placeholder="Enter price"
              />
            </label>
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveType}
                className="rounded-2xl bg-[#1b7f77] px-4 py-3 text-sm font-semibold text-white"
              >
                {editingType ? "Update Type" : "Add Type"}
              </button>
              {editingType && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingType(null);
                    setTypeName("");
                    setTypePrice(501);
                    setTypeMessage("");
                  }}
                  className="rounded-2xl border border-[#d1d5db] bg-white px-4 py-3 text-sm font-semibold text-[#374151]"
                >
                  Cancel
                </button>
              )}
            </div>
            {typeMessage && <p className="mt-3 text-sm text-[#1f6f5d]">{typeMessage}</p>}
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm text-[#3f3f3f]">
            <thead className="bg-[#fafafa] text-[#575757]">
              <tr>
                <th className="px-4 py-3 font-semibold">Pooja Type</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {poojaTypes.length > 0 ? (
                poojaTypes.map((type) => (
                  <tr key={type.name} className="border-t border-[#f0ece6]">
                    <td className="px-4 py-3 font-medium">{type.name}</td>
                    <td className="px-4 py-3">{`₹ ${type.price.toLocaleString()}`}</td>
                    <td className="px-4 py-3 space-x-2">
                      <button type="button" onClick={() => handleEditType(type)} className="rounded-lg bg-[#f8fafc] px-3 py-2 text-sm font-semibold text-[#1f2937]">Edit</button>
                      <button type="button" onClick={() => handleDeleteType(type.name)} className="rounded-lg bg-[#fef2f2] px-3 py-2 text-sm font-semibold text-[#b91c1c]">Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-4 py-6 text-center text-[#5d5d5d]">No pooja types available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8 space-y-4">
          <div className="overflow-hidden rounded-2xl border border-[#ece8e1] bg-white">
            <div className="flex flex-col gap-3 border-b border-[#f0ece6] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-[36px] font-bold text-[#15141f]">Pooja Bookings</h2>
              <div className="flex h-11 items-center gap-2 rounded-xl border border-[#ece8e1] bg-[#faf9f7] px-3 text-[#858b96]">
                <MdOutlineSearch size={20} />
                <input value={query} onChange={(e) => setQuery(e.target.value)} className="w-[220px] bg-transparent text-[16px] text-[#242938] outline-none placeholder:text-[#9ca3af]" placeholder="Search booking..." />
              </div>
            </div>

            <div className="overflow-auto">
              <table className="w-full min-w-[920px] text-[15px]">
                <thead className="bg-[#faf9f7] text-[#2b3240]">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Booking ID</th>
                    <th className="px-4 py-3 text-left font-semibold">Devotee</th>
                    <th className="px-4 py-3 text-left font-semibold">Pooja</th>
                    <th className="px-4 py-3 text-left font-semibold">Date</th>
                    <th className="px-4 py-3 text-left font-semibold">Slot</th>
                    <th className="px-4 py-3 text-left font-semibold">Amount</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((row) => (
                    <tr key={row.id} className="border-t border-[#f0ece6] text-[#2f3645]">
                      <td className="px-4 py-3">{row.id}</td>
                      <td className="px-4 py-3 font-medium">{row.devotee}</td>
                      <td className="px-4 py-3">{row.pooja}</td>
                      <td className="px-4 py-3">{row.date}</td>
                      <td className="px-4 py-3">{row.slot}</td>
                      <td className="px-4 py-3 font-semibold">{formatCurrency(row.amount)}</td>
                      <td className="px-4 py-3"><span className={`rounded-lg px-2.5 py-1 text-[13px] font-semibold ${statusTheme[row.status] || statusTheme.Pending}`}>{row.status}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => handleStatusChange(row.raw._id, "Confirmed")} className="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">Approve</button>
                          <button type="button" onClick={() => handleStatusChange(row.raw._id, "Rejected")} className="rounded bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700">Reject</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="overflow-auto rounded-2xl border border-[#ece8e1] bg-white p-4">
            <h2 className="mb-3 text-[32px] font-bold text-[#15141f]">Recent Receipts</h2>
            <table className="w-full min-w-[860px] text-[15px]">
              <thead className="text-[#2b3240]">
                <tr className="border-b border-[#f0ece6]">
                  <th className="py-2 text-left font-semibold">Receipt ID</th>
                  <th className="py-2 text-left font-semibold">Booking ID</th>
                  <th className="py-2 text-left font-semibold">Devotee</th>
                  <th className="py-2 text-left font-semibold">Amount</th>
                  <th className="py-2 text-left font-semibold">Payment Method</th>
                  <th className="py-2 text-left font-semibold">Date</th>
                  <th className="py-2 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((row) => (
                  <tr key={row.receiptId} className="border-b border-[#f0ece6] text-[#2f3645]">
                    <td className="py-2">{row.receiptId}</td>
                    <td className="py-2">{row.bookingId}</td>
                    <td className="py-2">{row.devotee}</td>
                    <td className="py-2 font-semibold">{row.amount}</td>
                    <td className="py-2">{row.method}</td>
                    <td className="py-2">{row.date}</td>
                    <td className="py-2 text-[#f97316]"><FaDownload /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="xl:col-span-4 rounded-2xl border border-[#ece8e1] bg-white p-4">
          <h3 className="text-[30px] font-bold text-[#15141f]">Booking Overview</h3>
          <div className="mt-4 space-y-2 text-[15px] text-[#2f3645]">
            <div className="flex items-center justify-between"><span>Total Bookings</span><span>{filteredBookings.length}</span></div>
            <div className="flex items-center justify-between"><span>Confirmed</span><span>{filteredBookings.filter((b) => b.status === "Confirmed").length}</span></div>
            <div className="flex items-center justify-between"><span>Pending</span><span>{filteredBookings.filter((b) => b.status === "Pending").length}</span></div>
            <div className="flex items-center justify-between"><span>Completed</span><span>{filteredBookings.filter((b) => b.status === "Completed").length}</span></div>
            <div className="border-t border-[#f0ece6] pt-2"><p className="text-[14px] text-[#6b7280]">Total Revenue</p><p className="text-[34px] leading-none font-bold text-[#f97316]">{formatCurrency(revenue)}</p></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoojaManagement;
