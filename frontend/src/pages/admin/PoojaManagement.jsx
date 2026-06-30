import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  MdCalendarMonth,
  MdOutlineCalendarToday,
  MdOutlineTaskAlt,
  MdOutlineVerified,
  MdOutlineCurrencyRupee,
  MdOutlineSearch,
  MdOutlineClose,
} from "react-icons/md";
import { FaDownload } from "react-icons/fa6";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { getDevoteeDonations } from "../../services/devoteeService";
import { getDashboardBookings, updateBookingStatusAdmin, getBookingReceipt } from "../../services/bookingService";
import { getPoojaTypes, savePoojaTypes, removePoojaType } from "../../services/poojaTypeService";

const formatCurrency = (value) => `Rs ${Number(value || 0).toLocaleString()}`;

const statusTheme = {
  Confirmed: "bg-[#e8f6e9] text-[#187a3b]",
  Pending: "bg-[#fff1df] text-[#ea580c]",
  Booked: "bg-[#fff1df] text-[#ea580c]",
  Approved: "bg-[#e0f2fe] text-[#0369a1]",
  Assigned: "bg-[#ede9fe] text-[#6d28d9]",
  "In Progress": "bg-[#fef3c7] text-[#92400e]",
  Completed: "bg-[#e9efff] text-[#2454c9]",
  Rejected: "bg-[#fde8e8] text-[#a12525]",
  Cancelled: "bg-[#fde8e8] text-[#a12525]",
};

const PoojaManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [donations, setDonations] = useState([]);
  const [query, setQuery] = useState("");
  const [poojaTypes, setPoojaTypes] = useState(getPoojaTypes());
  const [typeName, setTypeName] = useState("");
  const [typePrice, setTypePrice] = useState(501);
  const [editingType, setEditingType] = useState(null);
  const [typeMessage, setTypeMessage] = useState("");
  
  // State for Manage Pooja Types modal
  const [showTypeModal, setShowTypeModal] = useState(false);
  
  // State for Viewing Booking Details modal
  const [viewingBooking, setViewingBooking] = useState(null);

  const loadPoojaTypes = () => setPoojaTypes(getPoojaTypes());

  const handleSaveType = () => {
    const name = typeName.trim();
    const price = Number(typePrice);
    if (!name || price <= 0) {
      setTypeMessage("Please enter a valid name and price.");
      return;
    }

    const existingPooja = getPoojaTypes().find((t) => t.name === (editingType || name));
    const isPriceChanged = existingPooja ? existingPooja.price !== price : true;

    if (isPriceChanged) {
      axios.post("http://localhost:5000/api/devotee/notifications", {
        title: existingPooja ? `Pooja Price Updated: ${name}` : `New Pooja Service: ${name}`,
        message: existingPooja
          ? `The price of ${name} Pooja has been updated to Rs ${price.toLocaleString()}.`
          : `A new Pooja service "${name}" is now available for Rs ${price.toLocaleString()}.`,
        category: "pooja",
        audienceRole: "devotee",
        broadcast: true,
      }).catch((err) => console.error("Failed to broadcast pooja price change notification:", err));
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
    setShowTypeModal(false);
  };

  const handleEditType = (type) => {
    setTypeName(type.name);
    setTypePrice(type.price);
    setEditingType(type.name);
    setTypeMessage("");
    setShowTypeModal(true);
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
        const [bRes, dRes] = await Promise.all([getDashboardBookings(), getDevoteeDonations()]);
        setBookings(bRes.latestBookings || []);
        setStatsData(bRes.stats || null);
        setDonations(dRes.donations || []);
      } catch (error) {
        console.warn("Unable to load pooja management data", error);
      }
    };
    load();
  }, []);

  const reloadData = async () => {
    const [bRes, dRes] = await Promise.all([getDashboardBookings(), getDevoteeDonations()]);
    setBookings(bRes.latestBookings || []);
    setStatsData(bRes.stats || null);
    setDonations(dRes.donations || []);
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateBookingStatusAdmin(id, status);
      await reloadData();
    } catch (error) {
      console.warn("Unable to update booking status", error);
    }
  };

  const handleDownloadReceipt = async (row) => {
    try {
      const bookingId = row.raw?._id;
      let receiptData;
      
      if (bookingId) {
        try {
          const res = await getBookingReceipt(bookingId);
          receiptData = res.receipt;
        } catch (e) {
          console.warn("Could not fetch online receipt data, fallback to row details", e);
        }
      }

      if (!receiptData) {
        const rawBooking = row.raw || {};
        receiptData = {
          receiptNumber: row.receiptId || `RC-BK${String(rawBooking._id || '').slice(-6).toUpperCase()}`,
          bookingId: row.bookingId || `BK${String(rawBooking._id || '').slice(-6).toUpperCase()}`,
          bookingNumber: rawBooking.bookingNumber || "",
          transactionId: rawBooking.transactionId || "N/A",
          devotee: {
            name:   row.devotee || rawBooking.devoteeName || rawBooking.customerName || "N/A",
            mobile: rawBooking.devoteePhone || rawBooking.contactNumber || "N/A",
            email:  rawBooking.devoteeEmail || "N/A",
          },
          pooja: {
            name:   rawBooking.service || "N/A",
            date:   rawBooking.datetime || new Date().toISOString(),
            slot:   rawBooking.datetime ? new Date(rawBooking.datetime).toLocaleTimeString("en-IN") : "N/A",
            priest: rawBooking.priestName || "Not Assigned",
          },
          payment: {
            baseAmount:  rawBooking.amount || 0,
            gst:         rawBooking.gst || 0,
            totalAmount: (rawBooking.amount || 0) + (rawBooking.gst || 0),
            method:      row.method || rawBooking.paymentMethod || "UPI",
            status:      rawBooking.paymentStatus || "Pending",
          },
          status:    rawBooking.status || "Pending",
          createdAt: rawBooking.createdAt || new Date(),
        };
      }

      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      let currentY = 15;

      doc.setFillColor(212, 120, 32);
      doc.rect(0, 0, pageW, 40, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("SRI HARIDHARA TEMPLE", pageW / 2, currentY + 5, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("123 Temple Road, Heritage Town, Bangalore - 560001", pageW / 2, currentY + 12, { align: "center" });
      doc.text("Email: contact@haridharatemple.org | Tel: +91 80 2345 6789", pageW / 2, currentY + 17, { align: "center" });

      doc.setFillColor(243, 235, 220);
      doc.rect(15, 48, pageW - 30, 10, "F");
      
      doc.setTextColor(139, 69, 19);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("POOJA BOOKING RECEIPT", pageW / 2, 54, { align: "center" });

      currentY = 68;

      doc.setTextColor(50, 50, 50);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`Receipt No: ${receiptData.receiptNumber}`, 15, currentY);
      doc.text(`Booking Date: ${new Date(receiptData.createdAt).toLocaleDateString("en-IN")}`, pageW - 15, currentY, { align: "right" });
      currentY += 6;
      doc.setFont("helvetica", "normal");
      doc.text(`Booking ID: ${receiptData.bookingId}`, 15, currentY);
      doc.text(`Transaction ID: ${receiptData.transactionId}`, pageW - 15, currentY, { align: "right" });

      currentY += 10;

      doc.autoTable({
        startY: currentY,
        theme: "plain",
        headStyles: { fillColor: [243, 235, 220], textColor: [139, 69, 19], fontStyle: "bold" },
        bodyStyles: { textColor: [50, 50, 50] },
        head: [["DEVOTEE DETAILS", ""]],
        body: [
          ["Name:", receiptData.devotee.name],
          ["Mobile:", receiptData.devotee.mobile],
          ["Email:", receiptData.devotee.email],
        ],
        margin: { left: 15, right: 15 },
        styles: { fontSize: 9, cellPadding: 2 }
      });

      currentY = doc.previousAutoTable.finalY + 6;

      doc.autoTable({
        startY: currentY,
        theme: "plain",
        headStyles: { fillColor: [243, 235, 220], textColor: [139, 69, 19], fontStyle: "bold" },
        bodyStyles: { textColor: [50, 50, 50] },
        head: [["POOJA DETAILS", ""]],
        body: [
          ["Pooja Name:", receiptData.pooja.name],
          ["Pooja Date:", new Date(receiptData.pooja.date).toLocaleDateString("en-IN")],
          ["Time Slot:", receiptData.pooja.slot],
          ["Priest Assigned:", receiptData.pooja.priest],
        ],
        margin: { left: 15, right: 15 },
        styles: { fontSize: 9, cellPadding: 2 }
      });

      currentY = doc.previousAutoTable.finalY + 6;

      const gstText = receiptData.payment.gst > 0 ? `Rs ${receiptData.payment.gst}` : "Nil (0%)";
      doc.autoTable({
        startY: currentY,
        theme: "striped",
        headStyles: { fillColor: [212, 120, 32], textColor: [255, 255, 255], fontStyle: "bold" },
        head: [["Description", "Amount"]],
        body: [
          [`Base Price for ${receiptData.pooja.name}`, `Rs ${Number(receiptData.payment.baseAmount).toLocaleString()}`],
          ["GST (CGST/SGST)", gstText],
          [`Total Paid (${receiptData.payment.method})`, `Rs ${Number(receiptData.payment.totalAmount).toLocaleString()}`]
        ],
        margin: { left: 15, right: 15 },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          1: { halign: "right", fontStyle: "bold" }
        }
      });

      currentY = doc.previousAutoTable.finalY + 12;

      doc.setFillColor(240, 240, 240);
      doc.rect(15, currentY, 60, 10, "F");
      doc.setTextColor(30, 30, 30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(`Payment Status: ${receiptData.payment.status}`, 18, currentY + 6);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.line(pageW - 65, currentY + 12, pageW - 15, currentY + 12);
      doc.text("Authorized Signatory", pageW - 40, currentY + 16, { align: "center" });

      currentY += 28;

      doc.setFillColor(212, 120, 32);
      doc.rect(0, 280, pageW, 17, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.text("Thank you for your booking. May the Lord shower His divine blessings upon you and your family.", pageW / 2, 290, { align: "center" });

      doc.save(`Receipt_${receiptData.receiptNumber}.pdf`);
    } catch (error) {
      console.error("PDF generation failed", error);
      alert("Failed to generate PDF receipt. Please check console for details.");
    }
  };

  const filteredBookings = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = bookings.map((b, idx) => ({
      id: `BK${b._id ? String(b._id).slice(-6).toUpperCase() : String(1000 + idx + 1)}`,
      devotee: b.devoteeName || b.customerName,
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

  const todays = statsData?.todays || 0;
  const upcoming = statsData?.upcoming || 0;
  const completed = statsData?.completed || 0;
  const revenue = statsData?.totalRevenue || 0;

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
    raw: b.raw,
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#f0ece6] pb-4 mb-4">
          <div>
            <h2 className="text-[30px] font-bold text-[#15141f]">Manage Pooja Types</h2>
            <p className="mt-1 text-sm text-[#5d6674]">Add, edit or remove pooja services and their booking prices.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingType(null);
              setTypeName("");
              setTypePrice(501);
              setTypeMessage("");
              setShowTypeModal(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-[#1b7f77] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#146059]"
          >
            + Add Pooja Type
          </button>
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
                      <button type="button" onClick={() => handleEditType(type)} className="rounded-lg bg-[#f8fafc] px-3 py-2 text-sm font-semibold text-[#1f2937] hover:bg-[#f1f5f9]">Edit</button>
                      <button type="button" onClick={() => handleDeleteType(type.name)} className="rounded-lg bg-[#fef2f2] px-3 py-2 text-sm font-semibold text-[#b91c1c] hover:bg-[#fee2e2]">Delete</button>
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
              <div className="flex items-center gap-4">
                <h2 className="text-[36px] font-bold text-[#15141f]">Pooja Bookings</h2>
                <Link to="/admin/pooja/all-bookings" className="rounded-xl bg-[#15141f] px-4 py-2 text-sm font-semibold text-white hover:bg-black">View All Bookings</Link>
              </div>
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
                    <td className="py-2 text-[#f97316] cursor-pointer" onClick={() => handleDownloadReceipt(row)}>
                      <FaDownload />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="xl:col-span-4 rounded-2xl border border-[#ece8e1] bg-white p-4">
          <h3 className="text-[30px] font-bold text-[#15141f]">Booking Overview</h3>
          <div className="mt-4 space-y-2 text-[15px] text-[#2f3645]">
            <div className="flex items-center justify-between"><span>Total Bookings</span><span>{statsData?.totalBookings || 0}</span></div>
            <div className="flex items-center justify-between"><span>Confirmed</span><span>{statsData?.confirmed || 0}</span></div>
            <div className="flex items-center justify-between"><span>Pending</span><span>{statsData?.pending || 0}</span></div>
            <div className="flex items-center justify-between"><span>Completed</span><span>{statsData?.completed || 0}</span></div>
            <div className="flex items-center justify-between"><span>Cancelled</span><span>{statsData?.cancelled || 0}</span></div>
            <div className="border-t border-[#f0ece6] pt-2"><p className="text-[14px] text-[#6b7280]">Total Revenue</p><p className="text-[34px] leading-none font-bold text-[#f97316]">{formatCurrency(revenue)}</p></div>
          </div>
        </div>
      </div>

      {/* ── Manage Pooja Types Popup Modal ───────────────────────────────────── */}
      {showTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-[400px] rounded-3xl border border-[#f0f0f0] bg-white p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => {
                setShowTypeModal(false);
                setEditingType(null);
                setTypeName("");
                setTypePrice(501);
                setTypeMessage("");
              }}
              className="absolute top-4 right-4 text-[#858b96] hover:text-[#15141f] text-2xl font-bold"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold text-[#15141f] mb-4">
              {editingType ? "Edit Pooja Type" : "Add Pooja Type"}
            </h3>
            <label className="block text-sm font-semibold text-[#4f4f4f]">
              Pooja Name
              <input
                type="text"
                value={typeName}
                onChange={(e) => setTypeName(e.target.value)}
                className="mt-2 w-full rounded-3xl border border-[#ded6c6] bg-white px-4 py-3 text-base outline-none focus:border-[#8b5e3c]"
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
                className="mt-2 w-full rounded-3xl border border-[#ded6c6] bg-white px-4 py-3 text-base outline-none focus:border-[#8b5e3c]"
                placeholder="Enter price"
              />
            </label>
            <div className="mt-6 flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveType}
                className="w-full rounded-3xl bg-[#1b7f77] py-3 text-sm font-semibold text-white hover:bg-[#146059]"
              >
                {editingType ? "Update Type" : "Add Type"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowTypeModal(false);
                  setEditingType(null);
                  setTypeName("");
                  setTypePrice(501);
                  setTypeMessage("");
                }}
                className="w-full rounded-3xl border border-[#d1d5db] bg-white py-3 text-sm font-semibold text-[#374151]"
              >
                Cancel
              </button>
            </div>
            {typeMessage && <p className="mt-3 text-sm text-[#1f6f5d]">{typeMessage}</p>}
          </div>
        </div>
      )}

      {/* ── Booking Details View Modal ───────────────────────────────────────── */}
      {viewingBooking && (
        <BookingDetailsModal
          booking={viewingBooking}
          onClose={() => setViewingBooking(null)}
        />
      )}
    </div>
  );
};

// Sub-component: BookingDetailsModal
const BookingDetailsModal = ({ booking, onClose }) => {
  if (!booking) return null;
  const dateStr = booking.datetime ? new Date(booking.datetime).toLocaleDateString() : "-";
  const slotStr = booking.datetime ? new Date(booking.datetime).toLocaleTimeString() : "-";
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-3xl border border-[#ece8e1] bg-white p-6 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#858b96] hover:text-[#15141f] text-2xl font-bold"
        >
          &times;
        </button>
        <h3 className="text-2xl font-bold text-[#15141f] mb-4">Booking Details</h3>
        
        <div className="space-y-3 text-[15px] text-[#2f3645]">
          <div className="flex justify-between border-b border-[#f0ece6] pb-2">
            <span className="font-semibold text-gray-500">Booking ID:</span>
            <span>BK{String(booking._id).slice(-6).toUpperCase()}</span>
          </div>
          <div className="flex justify-between border-b border-[#f0ece6] pb-2">
            <span className="font-semibold text-gray-500">Devotee Name:</span>
            <span>{booking.devoteeName || booking.customerName}</span>
          </div>
          <div className="flex justify-between border-b border-[#f0ece6] pb-2">
            <span className="font-semibold text-gray-500">Pooja Service:</span>
            <span>{booking.service}</span>
          </div>
          <div className="flex justify-between border-b border-[#f0ece6] pb-2">
            <span className="font-semibold text-gray-500">Pooja Date:</span>
            <span>{dateStr}</span>
          </div>
          <div className="flex justify-between border-b border-[#f0ece6] pb-2">
            <span className="font-semibold text-gray-500">Time Slot:</span>
            <span>{slotStr}</span>
          </div>
          <div className="flex justify-between border-b border-[#f0ece6] pb-2">
            <span className="font-semibold text-gray-500">Amount:</span>
            <span className="font-bold text-[#f97316]">Rs {Number(booking.amount || 0).toLocaleString()}</span>
          </div>
          {booking.paymentMethod && (
            <div className="flex justify-between border-b border-[#f0ece6] pb-2">
              <span className="font-semibold text-gray-500">Payment Method:</span>
              <span>{booking.paymentMethod}</span>
            </div>
          )}
          <div className="flex justify-between border-b border-[#f0ece6] pb-2">
            <span className="font-semibold text-gray-500">Status:</span>
            <span className={`rounded-lg px-2.5 py-1 text-[13px] font-semibold ${statusTheme[booking.status] || statusTheme.Pending}`}>
              {booking.status || "Pending"}
            </span>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-[#d1d5db] bg-white px-5 py-2.5 text-sm font-semibold text-[#374151] hover:bg-[#f9fafb]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PoojaManagement;
