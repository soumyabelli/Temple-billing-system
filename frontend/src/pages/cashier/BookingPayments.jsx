import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaCheckCircle, FaClock, FaSearch } from "react-icons/fa";
import templeBg from "../../assets/temple-bg.jpg";
import CashierPageShell from "../../components/cashier/CashierPageShell";
import {
 createBooking,
 verifyBookingPayment,
 fetchBills,
 fetchBookings,
 fetchDevotees,
 formatCurrency,
 formatDateTime,
 isToday,
 sumBy,
} from "../../services/cashierService";
import { getPoojaTypes } from "../../services/poojaTypeService";
import { getPrasadamTypes } from "../../services/prasadamTypeService";
import { useNotifications } from "../../context/NotificationContext";
import { useAuth } from "../../context/AuthContext";
import { downloadReceiptPDF } from "../../utils/receiptGenerator";
import CashTenderCalculator from "../../components/common/CashTenderCalculator";

const emptyForm = {
 devoteeName: "",
 devoteeEmail: "",
 devoteePhone: "",
 devoteeAddress: "",
 cartItems: [],
 datetime: "",
 paymentMethod: "Cash",
 notes: "",
};

const statusStyles = {
 Pending: "bg-[#fff1d7] dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 text-[#9a5a00]",
 Confirmed: "bg-[#def7e3] dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 text-[#166534]",
 Rejected: "bg-[#fee2e2] dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 text-[#b91c1c]",
 Cancelled: "bg-[#fee2e2] dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 text-[#b91c1c]",
};

const buildMinDateTime = () => {
 const now = new Date();
 const year = now.getFullYear();
 const month = String(now.getMonth() + 1).padStart(2, "0");
 const day = String(now.getDate()).padStart(2, "0");
 const hours = String(now.getHours()).padStart(2, "0");
 const minutes = String(now.getMinutes()).padStart(2, "0");
 return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const BookingPayments = () => {
 const navigate = useNavigate();
 const { loadNotifications } = useNotifications();
 const { user } = useAuth();
 const [poojaTypes, setPoojaTypes] = useState([]);
 const [bookings, setBookings] = useState([]);
 const [bills, setBills] = useState([]);
 const [devotees, setDevotees] = useState([]);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [message, setMessage] = useState("");
 const [query, setQuery] = useState("");
 const [serviceSearch, setServiceSearch] = useState("");
 const [statusFilter, setStatusFilter] = useState("All");
 const [showHistory, setShowHistory] = useState(false);
 const [activeCategory, setActiveCategory] = useState("pooja");
 const [expandedSections, setExpandedSections] = useState({ pooja: false, prasadam: false, room: false });
 const [cashTendered, setCashTendered] = useState("");
 const [itemQuantities, setItemQuantities] = useState({});
 const [expandedRules, setExpandedRules] = useState({});
 const [form, setForm] = useState({
 ...emptyForm,
 datetime: buildMinDateTime(),
 });

 const checkPoojaAvailability = (pooja, datetimeStr) => {
 if (!datetimeStr || !pooja) return { available: true, label: "Available", reason: "" };

 const parsed = new Date(datetimeStr);
 if (isNaN(parsed.getTime())) return { available: true, label: "Available", reason: "" };

 const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
 const selectedDay = dayNames[parsed.getDay()];

 const y = parsed.getFullYear();
 const m = String(parsed.getMonth() + 1).padStart(2, "0");
 const d = String(parsed.getDate()).padStart(2, "0");
 const selectedDateStr = `${y}-${m}-${d}`;

 if (pooja.status && pooja.status.toLowerCase() === "inactive") {
 return { available: false, label: "Inactive Pooja", reason: "This pooja is currently inactive in the temple master." };
 }

 const hasSpecificDates = Array.isArray(pooja.availableDates) && pooja.availableDates.length > 0;
 const hasSpecificDays = Array.isArray(pooja.availableDays) && pooja.availableDays.length > 0;

 // Specific dates condition
 if (hasSpecificDates) {
 const isDateMatch = pooja.availableDates.some((ad) => {
 if (!ad) return false;
 const cleanAd = String(ad).split("T")[0].trim();
 return cleanAd === selectedDateStr;
 });

 if (isDateMatch) {
 return {
 available: true,
 label: `Special Date: ${parsed.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`,
 reason: "",
 };
 }

 if (!hasSpecificDays) {
 const formattedDates = pooja.availableDates
 .map((ad) => {
 const pd = new Date(ad);
 return !isNaN(pd.getTime())
 ? pd.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
 : ad;
 })
 .join(", ");
 return {
 available: false,
 label: `Only on ${formattedDates}`,
 reason: `Special pooja only scheduled on: ${formattedDates}. Not available on ${selectedDay} (${selectedDateStr}).`,
 };
 }
 }

 // Specific days condition
 if (hasSpecificDays) {
 const isEveryday = pooja.availableDays.some((day) =>
 ["everyday", "all", "all days", "daily"].includes(String(day).toLowerCase().trim())
 );
 if (isEveryday) {
 return { available: true, label: "Available Everyday", reason: "" };
 }

 const isDayMatch = pooja.availableDays.some(
 (day) => String(day).toLowerCase().trim() === selectedDay.toLowerCase()
 );

 if (isDayMatch) {
 return { available: true, label: `Available on ${selectedDay}s`, reason: "" };
 }

 const allowedDaysStr = pooja.availableDays.join(", ");
 return {
 available: false,
 label: `Not on ${selectedDay}s`,
 reason: `Pooja is only scheduled on: ${allowedDaysStr}. Not available on ${selectedDay}.`,
 };
 }

 return { available: true, label: "Available", reason: "" };
 };

 const loadData = async () => {
 setLoading(true);
 try {
 const [bookingRows, billRows, poojaRes, devRows] = await Promise.allSettled([
 fetchBookings(),
 fetchBills(),
 getPoojaTypes(),
 fetchDevotees(),
 ]);
 setBookings(bookingRows.status === "fulfilled" ? bookingRows.value : []);
 setBills(billRows.status === "fulfilled" ? billRows.value : []);
 setDevotees(devRows.status === "fulfilled" ? (devRows.value || []) : []);

 const loadedPoojas = poojaRes.status === "fulfilled" ? (poojaRes.value.poojas || poojaRes.value || []) : [];
 const loadedPrasadams = getPrasadamTypes();
 
 const combinedCatalog = [
 ...loadedPoojas.map(p => ({ ...p, catalogType: "pooja" })),
 ...loadedPrasadams.map(p => ({ ...p, catalogType: "prasadam" })),
 { name: "Standard Room - AC", price: 1500, catalogType: "room" },
 { name: "Standard Room - Non AC", price: 800, catalogType: "room" },
 { name: "Family Suite - AC", price: 2500, catalogType: "room" },
 { name: "Premium Suite - AC", price: 4000, catalogType: "room" },
 { name: "Dormitory Bed", price: 200, catalogType: "room" },
 { name: "Cottage - AC", price: 3000, catalogType: "room" },
 ];
 
 setPoojaTypes(combinedCatalog);

 if (loadedPoojas.length > 0) {
 setForm((prev) => {
 if (prev.service) return prev;
 return {
 ...prev,
 service: loadedPoojas[0].name,
 amount: loadedPoojas[0].price,
 };
 });
 }
 } catch (error) {
 setBookings([]);
 setBills([]);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 loadData();

 const syncPoojaTypes = async () => {
 const res = await getPoojaTypes();
 setPoojaTypes(res.poojas || res || []);
 };

 const onStorage = (event) => {
 if (event.key === "poojaTypes") {
 syncPoojaTypes();
 }
 };

 window.addEventListener("storage", onStorage);
 return () => window.removeEventListener("storage", onStorage);
 }, []);

 useEffect(() => {
 if (!poojaTypes.length) return;
 // Removed old auto-select logic to prevent adding a random pooja to the cart automatically
 }, [poojaTypes]);

 const billMap = useMemo(() => {
 const map = new Map();
 bills.forEach((bill) => {
 if (bill?.sourceId) {
 map.set(String(bill.sourceId), bill);
 }
 });
 return map;
 }, [bills]);

 const filteredBookings = useMemo(() => {
 const q = query.trim().toLowerCase();
 return [...bookings]
 .filter((booking) => {
 const matchesStatus = statusFilter === "All" || (booking.status || "Pending") === statusFilter;
 const matchesQuery =
 !q ||
 [booking.devoteeName, booking.devoteeEmail, booking.devoteePhone, booking.service, booking.paymentMethod]
 .filter(Boolean)
 .some((value) => String(value).toLowerCase().includes(q));
 return matchesStatus && matchesQuery;
 })
 .sort((a, b) => new Date(b.createdAt || b.datetime || 0) - new Date(a.createdAt || a.datetime || 0));
 }, [bookings, query, statusFilter]);

 const stats = useMemo(
 () => [
 {
 title: "Today Bookings",
 value: bookings.filter((booking) => isToday(booking.createdAt)).length,
 note: "Recorded bookings today",
 tone: "orange",
 },
 {
 title: "Total Value",
 value: formatCurrency(sumBy(bookings, (booking) => booking.amount)),
 note: `${bookings.length} bookings stored`,
 tone: "gold",
 },
 {
 title: "Confirmed",
 value: bookings.filter((booking) => (booking.status || "Pending") === "Confirmed").length,
 note: "Approved by counter",
 tone: "green",
 },
 ],
 [bookings]
 );

 const handleServiceSelect = (service, qtyToAdd = 1) => {
 if (service.catalogType === "pooja") {
 const avail = checkPoojaAvailability(service, form.datetime);
 if (!avail.available) {
 setMessage(`Cannot add "${service.name}": ${avail.reason}`);
 return;
 }
 }

 const validQty = Math.max(1, Number(qtyToAdd) || 1);

 setForm((prev) => {
 const existingIdx = prev.cartItems.findIndex(
 (item) => item.name === service.name && item.type === (service.catalogType || "pooja")
 );
 if (existingIdx >= 0) {
 const updated = [...prev.cartItems];
 const item = updated[existingIdx];
 const currentQty = item.qty || 1;
 const newQty = currentQty + validQty;
 const unitPrice = item.unitPrice || service.price || (currentQty ? item.amount / currentQty : item.amount) || 0;
 updated[existingIdx] = {
 ...item,
 qty: newQty,
 unitPrice,
 amount: unitPrice * newQty,
 };
 return { ...prev, cartItems: updated };
 }

 return {
 ...prev,
 cartItems: [
 ...prev.cartItems,
 {
 type: service.catalogType || "pooja",
 name: service.name,
 date: prev.datetime,
 qty: validQty,
 unitPrice: service.price || 0,
 amount: (service.price || 0) * validQty,
 },
 ],
 };
 });
 };

 const handleUpdateItemQty = (index, newQty) => {
 if (newQty <= 0) {
 handleRemoveItem(index);
 return;
 }
 setForm((prev) => {
 const updated = [...prev.cartItems];
 const item = updated[index];
 const unitPrice = item.unitPrice || (item.qty ? item.amount / item.qty : item.amount) || 0;
 updated[index] = {
 ...item,
 qty: newQty,
 unitPrice,
 amount: unitPrice * newQty,
 };
 return { ...prev, cartItems: updated };
 });
 };

 const handleRemoveItem = (index) => {
 setForm((prev) => {
 const newItems = [...prev.cartItems];
 newItems.splice(index, 1);
 return { ...prev, cartItems: newItems };
 });
 };

 const totalAmount = useMemo(() => {
 return form.cartItems.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
 }, [form.cartItems]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!form.devoteeName.trim() || form.cartItems.length === 0 || totalAmount <= 0) {
      setMessage("Please fill devotee name and add at least one item to the cart.");
      return;
    }

    // Verify all poojas in cart are available on the selected date
    for (const item of form.cartItems) {
      if (item.type === "pooja") {
        const poojaDef = poojaTypes.find((p) => p.name === item.name && p.catalogType === "pooja");
        if (poojaDef) {
          const avail = checkPoojaAvailability(poojaDef, form.datetime);
          if (!avail.available) {
            setMessage(`Cannot complete booking: "${item.name}" is not scheduled on this date. ${avail.reason}`);
            return;
          }
        }
      }
    }

    if (form.paymentMethod === "Cash") {
      const tenderNum = cashTendered === "" ? totalAmount : Number(cashTendered);
      if (tenderNum < totalAmount) {
        setMessage(`Cash received (₹${tenderNum}) is less than total bill amount (₹${totalAmount}). Please collect ₹${(totalAmount - tenderNum).toFixed(2)} more from the devotee.`);
        return;
      }
    }

    setSaving(true);
    try {
      const tenderAmt = form.paymentMethod === "Cash" ? (cashTendered === "" ? totalAmount : Number(cashTendered)) : null;
      const changeAmt = tenderAmt ? Math.max(0, tenderAmt - totalAmount) : null;
      const tenderNote = form.paymentMethod === "Cash" && tenderAmt ? `Cash Tendered: ₹${tenderAmt.toFixed(2)} | Change Returned: ₹${changeAmt.toFixed(2)}` : "";
      const finalNotes = [form.notes.trim(), tenderNote].filter(Boolean).join(" | ");

      const bookingRes = await createBooking({
        devoteeName: form.devoteeName.trim(),
        devoteeEmail: form.devoteeEmail.trim() || undefined,
        devoteePhone: form.devoteePhone.trim() || undefined,
        devoteeAddress: form.devoteeAddress.trim() || undefined,
        address: form.devoteeAddress.trim() || undefined,
        service: form.cartItems[0]?.name || "Pooja Booking",
        datetime: form.datetime || buildMinDateTime(),
        amount: totalAmount,
        paymentMethod: form.paymentMethod,
        notes: finalNotes,
        status: "Confirmed",
        source: "Counter",
        isCashier: true,
        isCombined: true,
        items: form.cartItems,
      });

      const { booking: createdBooking, order, key, simulated } = bookingRes;

      if (!simulated && order) {
        const loadRazorpayScript = () =>
          new Promise((resolve) => {
            if (window.Razorpay) return resolve(true);
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
          });

        const loaded = await loadRazorpayScript();
        if (!loaded) {
          setMessage("Unable to load payment gateway. Try again later.");
          setSaving(false);
          return;
        }

        const options = {
          key: key || "",
          amount: order.amount,
          currency: order.currency,
          name: "Temple Pooja Booking",
          description: "Multiple Items Cart",
          order_id: order.id,
          prefill: {
            name: form.devoteeName.trim(),
            email: form.devoteeEmail.trim(),
            contact: form.devoteePhone.trim(),
          },
          handler: async function (resp) {
            try {
              setSaving(true);
              await verifyBookingPayment({
                razorpay_order_id: resp.razorpay_order_id,
                razorpay_payment_id: resp.razorpay_payment_id,
                razorpay_signature: resp.razorpay_signature,
                bookingId: createdBooking._id,
              });

              setForm({
                ...emptyForm,
                datetime: buildMinDateTime(),
              });
              setCashTendered("");
              setMessage("Pooja booking saved successfully and paid.");
              await loadData();
              loadNotifications().catch(() => { });

              const rawItems = createdBooking.items || form.cartItems || [];
              const poojaBookings = rawItems.filter(i => (i.type || i.catalogType || "pooja") === "pooja").map((i, idx) => ({
                slNo: idx + 1,
                name: i.name,
                date: formatDateTime(i.date || form.datetime || createdBooking.createdAt),
                qty: i.qty || 1,
                amount: Number(i.amount != null && !isNaN(Number(i.amount)) && Number(i.amount) > 0 ? i.amount : (Number(i.price || 0) * (i.qty || 1))) || 0
              }));
              const prasadamOrders = rawItems.filter(i => (i.type || i.catalogType) === "prasadam").map((i, idx) => ({
                slNo: idx + 1,
                name: i.name,
                date: formatDateTime(i.date || form.datetime || createdBooking.createdAt),
                qty: i.qty || 1,
                amount: Number(i.amount != null && !isNaN(Number(i.amount)) && Number(i.amount) > 0 ? i.amount : (Number(i.price || 0) * (i.qty || 1))) || 0
              }));
              const roomBookings = rawItems.filter(i => (i.type || i.catalogType) === "room").map((i, idx) => ({
                slNo: idx + 1,
                name: i.name,
                date: formatDateTime(i.date || form.datetime || createdBooking.createdAt),
                qty: i.qty || 1,
                amount: Number(i.amount != null && !isNaN(Number(i.amount)) && Number(i.amount) > 0 ? i.amount : (Number(i.price || 0) * (i.qty || 1))) || 0
              }));

              // Generate Receipt
              const receiptData = {
                isOnline: false,
                receiptNo: createdBooking.bookingNumber || createdBooking.referenceNo || `BK-${Date.now().toString().slice(-6)}`,
                bookingDate: formatDateTime(createdBooking.createdAt || new Date()),
                paymentMode: createdBooking.paymentMethod || form.paymentMethod,
                transactionId: resp.razorpay_payment_id || "-",
                cashierName: user?.name || "Cashier",
                devoteeName: createdBooking.devoteeName || form.devoteeName,
                mobile: createdBooking.devoteePhone || createdBooking.contactNumber || form.devoteePhone || "-",
                email: createdBooking.devoteeEmail || form.devoteeEmail || "-",
                address: createdBooking.devoteeAddress || createdBooking.address || form.devoteeAddress || "-",
                devotee: {
                  name: createdBooking.devoteeName || form.devoteeName,
                  phone: createdBooking.devoteePhone || createdBooking.contactNumber || form.devoteePhone || "-",
                  email: createdBooking.devoteeEmail || form.devoteeEmail || "-",
                  address: createdBooking.devoteeAddress || createdBooking.address || form.devoteeAddress || "-",
                },
                poojaBookings,
                prasadamOrders,
                roomBookings,
                donations: [],
                subTotal: createdBooking.amount || totalAmount,
                templeCharges: 0,
                grandTotal: createdBooking.amount || totalAmount,
                amountInWords: `Rs. ${createdBooking.amount || totalAmount}`,
                devoteeMaterials: [],
                templeMaterials: [],
                notes: [createdBooking.notes || form.notes].filter(Boolean),
              };
              downloadReceiptPDF(receiptData, `receipt-${receiptData.receiptNo}.pdf`).catch(err => console.error("Receipt generation failed", err));

            } catch (err) {
              setMessage("Payment verification failed.");
              console.warn("verify booking payment handler error", err);
            } finally {
              setSaving(false);
            }
          },
          modal: {
            ondismiss: function () {
              setSaving(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        return;
      }

      setForm({
        ...emptyForm,
        datetime: buildMinDateTime(),
      });
      setCashTendered("");
      const successMsg = form.paymentMethod === "Cash" && tenderAmt
        ? `Booking saved successfully! Cash Received: ₹${tenderAmt}. Change to return: ₹${changeAmt.toFixed(2)}.`
        : "Pooja booking saved successfully. The history and bill ledger were updated.";
      setMessage(successMsg);
      await loadData();
      loadNotifications().catch(() => { });

      const rawItems = createdBooking.items || form.cartItems || [];
      const poojaBookings = rawItems.filter(i => (i.type || i.catalogType || "pooja") === "pooja").map((i, idx) => ({
        slNo: idx + 1,
        name: i.name,
        date: formatDateTime(i.date || form.datetime || createdBooking.createdAt),
        qty: i.qty || 1,
        amount: Number(i.amount != null && !isNaN(Number(i.amount)) && Number(i.amount) > 0 ? i.amount : (Number(i.price || 0) * (i.qty || 1))) || 0
      }));
      const prasadamOrders = rawItems.filter(i => (i.type || i.catalogType) === "prasadam").map((i, idx) => ({
        slNo: idx + 1,
        name: i.name,
        date: formatDateTime(i.date || form.datetime || createdBooking.createdAt),
        qty: i.qty || 1,
        amount: Number(i.amount != null && !isNaN(Number(i.amount)) && Number(i.amount) > 0 ? i.amount : (Number(i.price || 0) * (i.qty || 1))) || 0
      }));
      const roomBookings = rawItems.filter(i => (i.type || i.catalogType) === "room").map((i, idx) => ({
        slNo: idx + 1,
        name: i.name,
        date: formatDateTime(i.date || form.datetime || createdBooking.createdAt),
        qty: i.qty || 1,
        amount: Number(i.amount != null && !isNaN(Number(i.amount)) && Number(i.amount) > 0 ? i.amount : (Number(i.price || 0) * (i.qty || 1))) || 0
      }));

      // Generate Receipt
      const receiptData = {
        isOnline: false,
        receiptNo: createdBooking.bookingNumber || createdBooking.referenceNo || `BK-${Date.now().toString().slice(-6)}`,
        bookingDate: formatDateTime(createdBooking.createdAt || new Date()),
        paymentMode: createdBooking.paymentMethod || form.paymentMethod,
        transactionId: "-",
        cashierName: user?.name || "Cashier",
        devoteeName: createdBooking.devoteeName || form.devoteeName,
        mobile: createdBooking.devoteePhone || createdBooking.contactNumber || form.devoteePhone || "-",
        email: createdBooking.devoteeEmail || form.devoteeEmail || "-",
        address: createdBooking.devoteeAddress || createdBooking.address || form.devoteeAddress || "-",
        devotee: {
          name: createdBooking.devoteeName || form.devoteeName,
          phone: createdBooking.devoteePhone || createdBooking.contactNumber || form.devoteePhone || "-",
          email: createdBooking.devoteeEmail || form.devoteeEmail || "-",
          address: createdBooking.devoteeAddress || createdBooking.address || form.devoteeAddress || "-",
        },
        poojaBookings,
        prasadamOrders,
        roomBookings,
        donations: [],
        subTotal: createdBooking.amount || totalAmount,
        templeCharges: 0,
        grandTotal: createdBooking.amount || totalAmount,
        amountInWords: `Rs. ${createdBooking.amount || totalAmount}`,
        devoteeMaterials: [],
        templeMaterials: [],
        notes: [createdBooking.notes || form.notes, tenderNote].filter(Boolean),
        cashReceived: tenderAmt,
        changeReturned: changeAmt,
      };
      downloadReceiptPDF(receiptData, `receipt-${receiptData.receiptNo}.pdf`).catch(err => console.error("Receipt generation failed", err));

    } catch (error) {
      setMessage(error.response?.data?.error || error.response?.data?.message || "Failed to save booking.");
    } finally {
      setSaving(false);
    }
  };

 return (
 <CashierPageShell
 eyebrow="Pooja Bookings"
 image={templeBg}
 imageAlt="Temple pooja booking counter"
 stats={stats}
 actions={
 <>
 <button
 type="button"
 onClick={loadData}
 className="rounded-full border border-[#f0c58f] bg-temple-100 dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-[#fff8ef] dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 "
 >
 Refresh History
 </button>
 <button
 type="button"
 onClick={() => setShowHistory((prev) => !prev)}
 className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
 >
 {showHistory ? "Hide History" : "View History"}
 </button>
 <button
 type="button"
 onClick={() => navigate("/cashier/billing")}
 className="rounded-full bg-[#f28c18] dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-95"
 >
 Open Billing
 </button>
 </>
 }
 >
 <div className="w-full">
 {!showHistory ? (
 <section className="rounded-[22px] border border-[#f0d3a2] bg-temple-100/95 dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 p-5 shadow-sm">
 <div className="flex items-center justify-between gap-3">
 <div>
 <h2 className="text-2xl font-extrabold text-slate-950">Admin added services</h2>
 <p className="mt-1 text-sm font-medium text-slate-700">
 Tap a service below to auto-fill the booking form and amount.
 </p>
 </div>
 <FaCalendarAlt className="text-[#f28c18]" size={22} />
 </div>

 <div className="mt-5">
 <label className="block mb-4">
 <span className="mb-2 block text-sm font-bold text-slate-800">Search & Add Services to Cart</span>
 <div className="relative">
 <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#f28c18]" />
 <input
 type="text"
 value={serviceSearch}
 onChange={(e) => setServiceSearch(e.target.value)}
 placeholder="Search for pooja, homa, or prasadam..."
 className="w-full rounded-2xl border border-[#ead7bb] bg-[#fffaf4] dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 py-3 pl-12 pr-4 text-base outline-none transition focus:border-[#f28c18] focus:ring-2 focus:ring-[#f28c18]/20"
 />
 </div>
 </label>

 <div className="mb-4 flex space-x-2 border-b border-[#f2e7d7] pb-2">
 {["pooja", "prasadam", "room"].map((cat) => (
 <button
 key={cat}
 type="button"
 onClick={() => setActiveCategory(cat)}
 className={`rounded-full px-4 py-2 text-sm font-bold capitalize transition ${
 activeCategory === cat
 ? "bg-[#f28c18] dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 text-white shadow-sm"
 : "bg-[#fffaf4] dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 text-slate-600 hover:bg-[#fff4e6] dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 hover:text-slate-800"
 }`}
 >
 {cat} Booking
 </button>
 ))}
 </div>

 <div className="space-y-5">
 {[activeCategory].map((cat) => {
 const filtered = poojaTypes
 .filter((p) => p.catalogType === cat)
 .filter((p) => p.name.toLowerCase().includes(serviceSearch.toLowerCase()));

 if (filtered.length === 0) {
 return (
 <div key={cat} className="rounded-2xl border border-[#ead7bb] bg-temple-100 dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 p-8 text-center text-slate-500">
 No {cat}s found matching "{serviceSearch}"
 </div>
 );
 }

 const isExpanded = expandedSections[cat];
 const displayed = isExpanded ? filtered : filtered.slice(0, 5);

 return (
 <div key={cat} className="rounded-2xl border border-[#ead7bb] bg-temple-100 dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
 <div className="bg-[#fff4e6] dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between border-b border-[#f2e7d7]">
 <h3 className="font-bold text-slate-800 capitalize">{cat} Booking ({filtered.length})</h3>
 {filtered.length > 5 && (
 <button
 type="button"
 onClick={() => setExpandedSections(prev => ({ ...prev, [cat]: !prev[cat] }))}
 className="text-sm font-bold text-[#f28c18] hover:underline"
 >
 {isExpanded ? "Show Less" : "View All"}
 </button>
 )}
 </div>
                  <table className="w-full text-left text-sm">
                    <tbody className="divide-y divide-[#f2e7d7]">
                      {displayed.map((type) => {
                        const isPooja = type.catalogType === "pooja";
                        const isPrasadam = type.catalogType === "prasadam";
                        const avail = isPooja ? checkPoojaAvailability(type, form.datetime) : { available: true };
                        const currentQty = itemQuantities[type.name] || 1;
                        const inCartItem = form.cartItems.find(i => i.name === type.name && i.type === type.catalogType);
                        const rulesList = Array.isArray(type.rules) ? type.rules.filter(r => r && String(r).trim().toLowerCase() !== "no") : [];
                        const showRules = expandedRules[type.name];

                        return (
                          <tr
                            key={type.name}
                            className={`transition ${!avail.available ? "bg-red-50/40 dark:bg-red-950/20" : "hover:bg-[#fff7ec] dark:bg-[#0f172a] dark:text-slate-200"}`}
                          >
                            <td className="px-4 py-3 align-top">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-slate-900 dark:text-slate-100">{type.name}</span>
                                {inCartItem && (
                                  <span className="bg-[#def7e3] text-[#166534] text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                                    In Cart ({inCartItem.qty})
                                  </span>
                                )}
                              </div>

                              {/* Pooja Schedule & Rules Metadata */}
                              {isPooja && (
                                <div className="mt-1.5 flex flex-wrap gap-1.5 text-xs">
                                  {type.availableStartTime && type.availableEndTime && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 font-medium">
                                      <FaClock className="text-amber-600" size={10} />
                                      {type.availableStartTime} - {type.availableEndTime}
                                    </span>
                                  )}
                                  {type.duration && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium">
                                      ⏳ {type.duration}
                                    </span>
                                  )}
                                  {type.availableDays && type.availableDays.length > 0 && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800 font-medium">
                                      📅 Days: {type.availableDays.join(", ")}
                                    </span>
                                  )}
                                  {type.availableDates && type.availableDates.length > 0 && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-800 font-medium">
                                      🗓️ Special Dates: {type.availableDates.join(", ")}
                                    </span>
                                  )}
                                  {type.dressCode && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 font-medium">
                                      👔 {type.dressCode}
                                    </span>
                                  )}
                                  {rulesList.length > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => setExpandedRules(prev => ({ ...prev, [type.name]: !prev[type.name] }))}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-100 dark:bg-orange-950/50 text-orange-900 dark:text-orange-200 font-bold hover:bg-orange-200 transition"
                                    >
                                      📜 Rules ({rulesList.length}) {showRules ? "▲" : "▼"}
                                    </button>
                                  )}
                                </div>
                              )}

                              {/* Expandable Rules List */}
                              {isPooja && rulesList.length > 0 && showRules && (
                                <div className="mt-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-950 dark:text-amber-100">
                                  <p className="font-bold mb-1 text-amber-900 dark:text-amber-200">Pooja Rules & Guidelines:</p>
                                  <ul className="list-disc list-inside space-y-0.5">
                                    {rulesList.map((r, i) => (
                                      <li key={i}>{r}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Availability Status Badge */}
                              {isPooja && (
                                <div className="mt-1.5">
                                  {avail.available ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                                      <FaCheckCircle size={10} /> {avail.label}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 dark:text-red-300 bg-red-100/90 dark:bg-red-950/50 px-2.5 py-0.5 rounded-full border border-red-300 dark:border-red-800" title={avail.reason}>
                                      ⛔ {avail.label} — <span className="font-normal">{avail.reason}</span>
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>

                            <td className="px-4 py-3 align-top font-bold text-[#8a5200] dark:text-amber-400 whitespace-nowrap">
                              {formatCurrency(type.price)}
                            </td>

                            <td className="px-4 py-3 align-top text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                {/* Quantity Stepper for Prasadam or Room */}
                                {(isPrasadam || type.catalogType === "room") && (
                                  <div className="flex items-center bg-white dark:bg-[#1e293b] border border-[#ead7bb] dark:border-slate-700 rounded-full px-1.5 py-0.5 shadow-sm">
                                    <button
                                      type="button"
                                      onClick={() => setItemQuantities(prev => ({ ...prev, [type.name]: Math.max(1, (prev[type.name] || 1) - 1) }))}
                                      className="w-5 h-5 flex items-center justify-center rounded-full text-slate-600 dark:text-slate-300 hover:bg-[#fff4e6] font-bold text-xs"
                                    >
                                      -
                                    </button>
                                    <input
                                      type="number"
                                      min="1"
                                      max="1000"
                                      value={currentQty}
                                      onChange={(e) => {
                                        const v = Math.max(1, parseInt(e.target.value) || 1);
                                        setItemQuantities(prev => ({ ...prev, [type.name]: v }));
                                      }}
                                      className="w-9 text-center font-bold text-slate-800 dark:text-slate-200 text-xs bg-transparent outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setItemQuantities(prev => ({ ...prev, [type.name]: (prev[type.name] || 1) + 1 }))}
                                      className="w-5 h-5 flex items-center justify-center rounded-full text-slate-600 dark:text-slate-300 hover:bg-[#fff4e6] font-bold text-xs"
                                    >
                                      +
                                    </button>
                                  </div>
                                )}

                                {/* Action Add Button */}
                                {avail.available ? (
                                  <button
                                    type="button"
                                    onClick={() => handleServiceSelect(type, isPrasadam || type.catalogType === "room" ? currentQty : 1)}
                                    className="rounded-full bg-[#f28c18] dark:bg-[#f28c18] px-4 py-1.5 text-xs font-bold text-white shadow-sm transition hover:opacity-90 active:scale-95 cursor-pointer"
                                  >
                                    + Add {(isPrasadam || type.catalogType === "room") && currentQty > 1 ? `(${currentQty})` : ""}
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    disabled
                                    title={avail.reason}
                                    className="rounded-full bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-3 py-1.5 text-xs font-bold cursor-not-allowed border border-slate-300 dark:border-slate-700"
                                  >
                                    Not Available
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <datalist id="devotee-suggestions">
            {devotees.map((d, idx) => (
              <option key={idx} value={d.name}>
                {d.phone ? `${d.phone} • ` : ""}{d.email ? `${d.email} • ` : ""}{d.address || d.place || ""}
              </option>
            ))}
          </datalist>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-800">Devotee name</span>
              <input
                list="devotee-suggestions"
                value={form.devoteeName}
                onChange={(e) => {
                  const val = e.target.value;
                  const match = devotees.find(d => d.name?.trim().toLowerCase() === val.trim().toLowerCase());
                  if (match) {
                    setForm(prev => ({
                      ...prev,
                      devoteeName: val,
                      devoteePhone: match.phone || prev.devoteePhone,
                      devoteeEmail: match.email || prev.devoteeEmail,
                      devoteeAddress: match.address || match.place || prev.devoteeAddress,
                    }));
                  } else {
                    setForm(prev => ({ ...prev, devoteeName: val }));
                  }
                }}
                className="w-full rounded-2xl border border-[#ead7bb] bg-[#fffaf4] dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 px-4 py-3 text-base outline-none focus:border-[#f28c18]"
                placeholder="Enter devotee name"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-800">Phone number</span>
              <input
                value={form.devoteePhone}
                onChange={(e) => {
                  const val = e.target.value;
                  const cleanP = val.replace(/\D/g, '').slice(-10);
                  const match = cleanP.length >= 7 ? devotees.find(d => String(d.phone || '').replace(/\D/g, '').slice(-10) === cleanP) : null;
                  if (match) {
                    setForm(prev => ({
                      ...prev,
                      devoteePhone: val,
                      devoteeName: prev.devoteeName || match.name,
                      devoteeEmail: prev.devoteeEmail || match.email,
                      devoteeAddress: prev.devoteeAddress || match.address || match.place,
                    }));
                  } else {
                    setForm(prev => ({ ...prev, devoteePhone: val }));
                  }
                }}
                className="w-full rounded-2xl border border-[#ead7bb] bg-[#fffaf4] dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 px-4 py-3 text-base outline-none focus:border-[#f28c18]"
                placeholder="+91 98765 43210"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-800">Email</span>
              <input
                type="email"
                value={form.devoteeEmail}
                onChange={(e) => setForm((prev) => ({ ...prev, devoteeEmail: e.target.value }))}
                className="w-full rounded-2xl border border-[#ead7bb] bg-[#fffaf4] dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 px-4 py-3 text-base outline-none focus:border-[#f28c18]"
                placeholder="devotee@email.com"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-800">Address / City</span>
              <input
                value={form.devoteeAddress}
                onChange={(e) => setForm((prev) => ({ ...prev, devoteeAddress: e.target.value }))}
                className="w-full rounded-2xl border border-[#ead7bb] bg-[#fffaf4] dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 px-4 py-3 text-base outline-none focus:border-[#f28c18]"
                placeholder="e.g. Kapu, Udupi"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-800">
                Date & Time {form.datetime && !isNaN(new Date(form.datetime).getTime()) ? `(${new Date(form.datetime).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })})` : ""}
              </span>
              <input
                type="datetime-local"
                min={buildMinDateTime()}
                value={form.datetime}
                onChange={(e) => setForm((prev) => ({ ...prev, datetime: e.target.value }))}
                className="w-full rounded-2xl border border-[#ead7bb] bg-[#fffaf4] dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 px-4 py-3 text-base outline-none focus:border-[#f28c18]"
              />
              <span className="mt-1 block text-xs text-slate-500">
                Pooja availability and schedule re-validate automatically when you pick this date.
              </span>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-800">Payment mode</span>
              <select
                value={form.paymentMethod}
                onChange={(e) => {
                  const newMode = e.target.value;
                  setForm((prev) => ({ ...prev, paymentMethod: newMode }));
                  if (newMode === "Cash" && totalAmount > 0) {
                    setCashTendered(totalAmount.toString());
                  }
                }}
                className="w-full rounded-2xl border border-[#ead7bb] bg-[#fffaf4] dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 px-4 py-3 text-base outline-none focus:border-[#f28c18]"
              >
                <option value="Cash">Cash (Counter)</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Net Banking">Net Banking</option>
              </select>
            </label>
          </div>

          {/* Cash Tender & Change Calculator for Cashier */}
          {form.paymentMethod === "Cash" && totalAmount > 0 && (
            <div className="mt-4">
              <CashTenderCalculator
                totalAmount={totalAmount}
                cashTendered={cashTendered}
                onChange={setCashTendered}
              />
            </div>
          )}

          {form.cartItems.length > 0 && (
            <div className="mt-6 overflow-hidden rounded-2xl border border-[#f0c58f] bg-[#fffaf4] dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 shadow-sm">
              <div className="border-b border-[#f0c58f] bg-[#fff4e6] dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 px-4 py-3 text-sm font-bold text-slate-800 flex justify-between items-center">
                <span>Cart Items ({form.cartItems.length})</span>
                <span className="text-xs font-normal text-slate-600">Adjust count anytime below</span>
              </div>
              <ul className="divide-y divide-[#f2e7d7]">
                {form.cartItems.map((item, index) => (
                  <li key={index} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{item.name}</p>
                      <p className="text-xs font-semibold text-slate-500">
                        {item.type.toUpperCase()} • {formatDateTime(item.date)}
                        {item.unitPrice ? ` (₹${Number(item.unitPrice).toFixed(2)} each)` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Quantity Stepper in Cart */}
                      <div className="flex items-center gap-1 bg-white dark:bg-[#1e293b] border border-[#ead7bb] dark:border-slate-700 rounded-full px-2 py-0.5 shadow-sm">
                        <span className="text-[11px] font-semibold text-slate-500 mr-0.5">Qty:</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateItemQty(index, (item.qty || 1) - 1)}
                          className="w-5 h-5 flex items-center justify-center rounded-full text-slate-700 dark:text-slate-300 hover:bg-[#fff4e6] font-bold text-xs"
                          title="Decrease count"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="1000"
                          value={item.qty || 1}
                          onChange={(e) => handleUpdateItemQty(index, parseInt(e.target.value) || 1)}
                          className="w-10 text-center font-bold text-slate-900 dark:text-slate-100 text-xs bg-transparent outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateItemQty(index, (item.qty || 1) + 1)}
                          className="w-5 h-5 flex items-center justify-center rounded-full text-slate-700 dark:text-slate-300 hover:bg-[#fff4e6] font-bold text-xs"
                          title="Increase count"
                        >
                          +
                        </button>
                      </div>

                      <p className="font-bold text-[#8a5200] dark:text-amber-400 min-w-[75px] text-right">
                        {formatCurrency(item.amount)}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-500 hover:text-red-700 text-sm font-semibold ml-1 cursor-pointer"
                        title="Remove item"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="bg-[#fff4e6] dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 px-4 py-3 text-right">
                <p className="text-sm font-bold text-slate-600">
                  Total Amount: <span className="text-lg text-slate-950 dark:text-slate-100 font-extrabold">{formatCurrency(totalAmount)}</span>
                </p>
              </div>
            </div>
          )}

 <label className="block">
 <span className="mb-2 block text-sm font-bold text-slate-800">Notes</span>
 <textarea
 rows="4"
 value={form.notes}
 onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
 className="w-full rounded-2xl border border-[#ead7bb] bg-[#fffaf4] dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 px-4 py-3 text-base outline-none focus:border-[#f28c18]"
 placeholder="Optional notes for the counter or priest"
 />
 </label>

 {message ? (
 <div className="rounded-2xl border border-[#f4d0a3] bg-[#fff7eb] dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 px-4 py-3 text-sm font-semibold text-[#8a5200]">
 {message}
 </div>
 ) : null}

 <button
 type="submit"
 disabled={saving}
 className="rounded-2xl bg-[#f28c18] dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 px-5 py-3 text-base font-extrabold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
 >
 {saving ? "Saving..." : "Save Pooja Booking"}
 </button>
 </form>
 </section>
 ) : (
 <div>
 <button
 onClick={() => setShowHistory(false)}
 className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#f0c58f] bg-temple-100 dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-[#fff8ef] dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 "
 >
 ← Back to Booking Form
 </button>
 <section className="rounded-[22px] border border-[#f0d3a2] bg-temple-100/95 dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 p-5 shadow-sm">
 <div className="flex items-center justify-between gap-3">
 <div>
 <h2 className="text-2xl font-extrabold text-slate-950">Booking history</h2>
 <p className="mt-1 text-sm font-medium text-slate-700">
 Saved bookings and matching bill receipts appear here.
 </p>
 </div>
 <div className="flex items-center gap-2 text-sm text-slate-700">
 <FaSearch />
 <input
 value={query}
 onChange={(e) => setQuery(e.target.value)}
 placeholder="Search devotee"
 className="w-[170px] rounded-full border border-[#ead7bb] bg-[#fffaf4] dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 px-3 py-2 outline-none focus:border-[#f28c18]"
 />
 </div>
 </div>

 <div className="mt-4 flex flex-wrap gap-2">
 {["All", "Pending", "Confirmed", "Rejected", "Cancelled"].map((status) => (
 <button
 key={status}
 type="button"
 onClick={() => setStatusFilter(status)}
 className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${statusFilter === status
 ? "border-[#f28c18] bg-[#fff1df] dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 text-[#8a5200]"
 : "border-[#ead7bb] bg-temple-100 dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 text-slate-700 hover:bg-[#fff8ef] dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 "
 }`}
 >
 {status}
 </button>
 ))}
 </div>

 <div className="mt-5 overflow-x-auto">
 <table className="w-full min-w-[860px] text-left text-sm">
 <thead className="bg-[#fff7eb] dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 text-slate-600">
 <tr>
 <th className="px-4 py-3 font-bold">Receipt</th>
 <th className="px-4 py-3 font-bold">Devotee</th>
 <th className="px-4 py-3 font-bold">Service</th>
 <th className="px-4 py-3 font-bold">Date</th>
 <th className="px-4 py-3 font-bold">Amount</th>
 <th className="px-4 py-3 font-bold">Payment</th>
 <th className="px-4 py-3 font-bold">Status</th>
 </tr>
 </thead>
 <tbody>
 {loading ? (
 <tr>
 <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
 Loading bookings...
 </td>
 </tr>
 ) : filteredBookings.length ? (
 filteredBookings.map((booking) => {
 const bill = billMap.get(String(booking._id));
 return (
 <tr key={booking._id} className="border-b border-[#f2e7d7]">
 <td className="px-4 py-3 font-bold text-slate-950">{bill?.referenceNo || `BK-${String(booking._id).slice(-6).toUpperCase()}`}</td>
 <td className="px-4 py-3 font-semibold text-slate-800">{booking.devoteeName}</td>
 <td className="px-4 py-3">{booking.service}</td>
 <td className="px-4 py-3 text-slate-700">{formatDateTime(booking.datetime || booking.createdAt)}</td>
 <td className="px-4 py-3 font-bold text-slate-950">{formatCurrency(booking.amount)}</td>
 <td className="px-4 py-3">{booking.paymentMethod || "Cash"}</td>
 <td className="px-4 py-3">
 <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${statusStyles[booking.status || "Pending"] || statusStyles.Pending}`}>
 {(booking.status || "Pending") === "Confirmed" ? <FaCheckCircle /> : <FaClock />}
 {booking.status || "Pending"}
 </span>
 </td>
 </tr>
 );
 })
 ) : (
 <tr>
 <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
 No bookings found. Add a pooja booking from the form on the left.
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </section>
 </div>
 )}
 </div>
 </CashierPageShell>
 );
};

export default BookingPayments;
