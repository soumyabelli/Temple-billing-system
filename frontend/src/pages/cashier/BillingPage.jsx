import { useEffect, useMemo, useState } from "react";
import templeBg from "../../assets/temple-bg.jpg";
import CashierPageShell from "../../components/cashier/CashierPageShell";
import {
 createBill,
 verifyBillPayment,
 createCashierNotification,
 fetchBills,
 formatCurrency,
 formatDateTime,
 getBillReference,
 inferBillType,
 sumBy,
 toDateKey,
 isToday,
} from "../../services/cashierService";
import { useAuth } from "../../context/AuthContext";
import { downloadReceiptPDF } from "../../utils/receiptGenerator";

const emptyForm = {
 devoteeName: "",
 devoteePhone: "",
 devoteeEmail: "",
 devoteeAddress: "",
 paymentMode: "Cash",
 billType: "Combined",
 notes: "",
 cartItems: [],
};

const emptyItem = {
 itemType: "Pooja",
 itemName: "",
 amount: "",
};

const itemTypes = ["Pooja", "Donation", "Prasadam", "Room", "Other"];
const billTypeOptions = ["All", "Combined", "Pooja Booking", "Donation", "Prasadam Sale", "Other"];

const BillingPage = () => {
 const [loading, setLoading] = useState(true);
 const [bills, setBills] = useState([]);
 const [query, setQuery] = useState("");
 const [billTypeFilter, setBillTypeFilter] = useState("All");
 const [form, setForm] = useState(emptyForm);
 const [currentItem, setCurrentItem] = useState(emptyItem);
 const [saving, setSaving] = useState(false);
 const [message, setMessage] = useState("");
 const { user } = useAuth();

 const handleAddItem = () => {
 if (!currentItem.itemName.trim() || Number(currentItem.amount) <= 0) {
 setMessage("Please enter a valid item name and amount.");
 return;
 }
 setForm(prev => ({
 ...prev,
 cartItems: [...prev.cartItems, { ...currentItem, amount: Number(currentItem.amount) }]
 }));
 setCurrentItem(emptyItem);
 setMessage("");
 };

 const handleRemoveItem = (index) => {
 setForm(prev => {
 const newItems = [...prev.cartItems];
 newItems.splice(index, 1);
 return { ...prev, cartItems: newItems };
 });
 };

 const totalAmount = useMemo(() => {
 return form.cartItems.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
 }, [form.cartItems]);

 const loadBills = async () => {
 setLoading(true);
 try {
 const rows = await fetchBills();
 setBills(rows);
 } catch (error) {
 setBills([]);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 loadBills();
 }, []);

 const filteredBills = useMemo(() => {
 const q = query.trim().toLowerCase();
 return bills.filter((bill) => {
 const inferredType = inferBillType(bill);
 const matchesType = billTypeFilter === "All" || inferredType === billTypeFilter;
 const matchesQuery =
 !q ||
 [bill.referenceNo, bill.devoteeName, bill.sevaType, bill.paymentMode, bill.billType]
 .filter(Boolean)
 .some((value) => String(value).toLowerCase().includes(q));
 return matchesType && matchesQuery;
 });
 }, [bills, billTypeFilter, query]);

 const totals = useMemo(
 () => ({
 today: sumBy(bills.filter((bill) => isToday(bill.billDate)), (bill) => bill.amount),
 total: sumBy(bills, (bill) => bill.amount),
 pooja: sumBy(bills.filter((bill) => inferBillType(bill) === "Pooja Booking"), (bill) => bill.amount),
 donation: sumBy(bills.filter((bill) => inferBillType(bill) === "Donation"), (bill) => bill.amount),
 prasadam: sumBy(bills.filter((bill) => inferBillType(bill) === "Prasadam Sale"), (bill) => bill.amount),
 }),
 [bills]
 );

 const stats = [
 { title: "Today's Bills", value: bills.filter((bill) => isToday(bill.billDate)).length, note: formatCurrency(totals.today), tone: "orange" },
 { title: "Ledger Total", value: formatCurrency(totals.total), note: `${bills.length} bill entries`, tone: "gold" },
 { title: "Pooja Bills", value: formatCurrency(totals.pooja), note: "Bookings captured", tone: "blue" },
 { title: "Donation Bills", value: formatCurrency(totals.donation), note: "Donation counter", tone: "green" },
 ];

 const handleSubmit = async (event) => {
 event.preventDefault();
 setMessage("");

 if (!form.devoteeName.trim() || form.cartItems.length === 0 || totalAmount <= 0) {
 setMessage("Please enter devotee name and add at least one item with a valid amount.");
 return;
 }

 setSaving(true);
 try {
 const billRes = await createBill({
 devoteeName: form.devoteeName.trim(),
 devoteeEmail: form.devoteeEmail.trim(),
 devoteePhone: form.devoteePhone.trim(),
 devoteeAddress: form.devoteeAddress.trim(),
 items: form.cartItems,
 amount: totalAmount,
 paymentMode: form.paymentMode,
 billType: form.billType,
 notes: form.notes.trim(),
 referenceNo: `MB-${Date.now().toString().slice(-6)}`,
 });

 const { bill, order, key, simulated } = billRes;

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
 name: "Temple Billing",
 description: bill.sevaType,
 order_id: order.id,
 prefill: {
 name: bill.devoteeName,
 },
 handler: async function (resp) {
 try {
 setSaving(true);
 await verifyBillPayment({
 razorpay_order_id: resp.razorpay_order_id,
 razorpay_payment_id: resp.razorpay_payment_id,
 razorpay_signature: resp.razorpay_signature,
 billId: bill._id,
 });

 await createCashierNotification({
 title: "Bill Recorded & Paid",
 message: `${form.devoteeName.trim()} bill was added to the cashier ledger.`,
 audienceRole: "cashier",
 broadcast: true,
 category: "billing",
 }).catch(() => null);

 setForm(emptyForm);
 setMessage("Bill saved successfully and paid.");
 await loadBills();

  const billItems = bill.items || [];
  const poojaBookings = billItems.filter(i => i.itemType === "Pooja").map((i, idx) => ({ slNo: idx + 1, name: i.itemName, date: formatDateTime(bill.billDate || bill.createdAt), qty: i.quantity || 1, amount: Number(i.amount != null && !isNaN(Number(i.amount)) && Number(i.amount) > 0 ? i.amount : (Number(i.price || 0) * (i.quantity || 1))) || 0 }));
  const prasadamOrders = billItems.filter(i => i.itemType === "Prasadam").map((i, idx) => ({ slNo: idx + 1, name: i.itemName, date: formatDateTime(bill.billDate || bill.createdAt), qty: i.quantity || 1, amount: Number(i.amount != null && !isNaN(Number(i.amount)) && Number(i.amount) > 0 ? i.amount : (Number(i.price || 0) * (i.quantity || 1))) || 0 }));
  const roomBookings = billItems.filter(i => i.itemType === "Room").map((i, idx) => ({ slNo: idx + 1, name: i.itemName, date: formatDateTime(bill.billDate || bill.createdAt), qty: i.quantity || 1, amount: Number(i.amount != null && !isNaN(Number(i.amount)) && Number(i.amount) > 0 ? i.amount : (Number(i.price || 0) * (i.quantity || 1))) || 0 }));
  const donations = billItems.filter(i => i.itemType === "Donation").map((i, idx) => ({ slNo: idx + 1, name: i.itemName, date: formatDateTime(bill.billDate || bill.createdAt), qty: 1, amount: Number(i.amount != null && !isNaN(Number(i.amount)) && Number(i.amount) > 0 ? i.amount : Number(i.price || 0)) || 0 }));

  const receiptData = {
    isOnline: false,
    receiptNo: getBillReference(bill),
    bookingDate: formatDateTime(bill.billDate || bill.createdAt || new Date()),
    paymentMode: bill.paymentMode || form.paymentMode,
    transactionId: resp.razorpay_payment_id || "-",
    cashierName: user?.name || "Cashier",
    devoteeName: bill.devoteeName || form.devoteeName || "-",
    mobile: bill.devoteePhone || form.devoteePhone || "-",
    email: bill.devoteeEmail || form.devoteeEmail || "-",
    address: bill.devoteeAddress || form.devoteeAddress || "-",
    devotee: {
      name: bill.devoteeName || form.devoteeName || "Devotee",
      phone: bill.devoteePhone || form.devoteePhone || "-",
      email: bill.devoteeEmail || form.devoteeEmail || "-",
      address: bill.devoteeAddress || form.devoteeAddress || "-",
    },
    poojaBookings,
    prasadamOrders,
    roomBookings,
    donations,
    subTotal: bill.amount,
    templeCharges: 0,
    grandTotal: bill.amount,
    amountInWords: `Rs. ${bill.amount}`,
    devoteeMaterials: [],
    templeMaterials: [],
    notes: [bill.notes || form.notes, ...(bill.items || []).filter(i => !["Pooja", "Prasadam", "Room", "Donation"].includes(i.itemType)).map(i => `${i.itemType}: ${i.itemName}`)].filter(Boolean)
  };
  downloadReceiptPDF(receiptData, `receipt-${receiptData.receiptNo}.pdf`).catch(err => console.error("Receipt generation failed", err));

 } catch (err) {
 setMessage("Payment verification failed.");
 console.warn("verify bill payment handler error", err);
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

 await createCashierNotification({
 title: "Bill Recorded",
 message: `${form.devoteeName.trim()} bill was added to the cashier ledger.`,
 audienceRole: "cashier",
 broadcast: true,
 category: "billing",
 }).catch(() => null);

 setForm(emptyForm);
 setMessage("Bill saved successfully.");
 await loadBills();

  const billItems = bill.items || [];
  const poojaBookings = billItems.filter(i => i.itemType === "Pooja").map((i, idx) => ({ slNo: idx + 1, name: i.itemName, date: formatDateTime(bill.billDate || bill.createdAt), qty: i.quantity || 1, amount: Number(i.amount != null && !isNaN(Number(i.amount)) && Number(i.amount) > 0 ? i.amount : (Number(i.price || 0) * (i.quantity || 1))) || 0 }));
  const prasadamOrders = billItems.filter(i => i.itemType === "Prasadam").map((i, idx) => ({ slNo: idx + 1, name: i.itemName, date: formatDateTime(bill.billDate || bill.createdAt), qty: i.quantity || 1, amount: Number(i.amount != null && !isNaN(Number(i.amount)) && Number(i.amount) > 0 ? i.amount : (Number(i.price || 0) * (i.quantity || 1))) || 0 }));
  const roomBookings = billItems.filter(i => i.itemType === "Room").map((i, idx) => ({ slNo: idx + 1, name: i.itemName, date: formatDateTime(bill.billDate || bill.createdAt), qty: i.quantity || 1, amount: Number(i.amount != null && !isNaN(Number(i.amount)) && Number(i.amount) > 0 ? i.amount : (Number(i.price || 0) * (i.quantity || 1))) || 0 }));
  const donations = billItems.filter(i => i.itemType === "Donation").map((i, idx) => ({ slNo: idx + 1, name: i.itemName, date: formatDateTime(bill.billDate || bill.createdAt), qty: 1, amount: Number(i.amount != null && !isNaN(Number(i.amount)) && Number(i.amount) > 0 ? i.amount : Number(i.price || 0)) || 0 }));

  const receiptData = {
    isOnline: false,
    receiptNo: getBillReference(bill),
    bookingDate: formatDateTime(bill.billDate || bill.createdAt || new Date()),
    paymentMode: bill.paymentMode || form.paymentMode,
    transactionId: "-",
    cashierName: user?.name || "Cashier",
    devoteeName: bill.devoteeName || form.devoteeName || "-",
    mobile: bill.devoteePhone || form.devoteePhone || "-",
    email: bill.devoteeEmail || form.devoteeEmail || "-",
    address: bill.devoteeAddress || form.devoteeAddress || "-",
    devotee: {
      name: bill.devoteeName || form.devoteeName || "Devotee",
      phone: bill.devoteePhone || form.devoteePhone || "-",
      email: bill.devoteeEmail || form.devoteeEmail || "-",
      address: bill.devoteeAddress || form.devoteeAddress || "-",
    },
    poojaBookings,
    prasadamOrders,
    roomBookings,
    donations,
    subTotal: bill.amount,
    templeCharges: 0,
    grandTotal: bill.amount,
    amountInWords: `Rs. ${bill.amount}`,
    devoteeMaterials: [],
    templeMaterials: [],
    notes: [bill.notes || form.notes, ...(bill.items || []).filter(i => !["Pooja", "Prasadam", "Room", "Donation"].includes(i.itemType)).map(i => `${i.itemType}: ${i.itemName}`)].filter(Boolean)
  };
  downloadReceiptPDF(receiptData, `receipt-${receiptData.receiptNo}.pdf`).catch(err => console.error("Receipt generation failed", err));

 } catch (error) {
 setMessage(error.response?.data?.message || "Failed to save bill.");
 } finally {
 setSaving(false);
 }
 };

 return (
 <CashierPageShell
 eyebrow="Billing"
 image={templeBg}
 imageAlt="Temple billing register"
 stats={stats}
 actions={
 <>
 <button
 type="button"
 onClick={loadBills}
 className="rounded-full border border-[#f0c58f] bg-temple-100 dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-[#fff8ef] dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 "
 >
 Refresh Bills
 </button>
 </>
 }
 >
      <div className="w-full">
        {/* Ledger Section */}
        <section className="w-full rounded-[22px] border border-[#f0d3a2] bg-temple-100/95 dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 p-5 shadow-sm">
 <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
 <div>
 <h2 className="text-xl font-extrabold text-slate-950">Bill register</h2>
 <p className="mt-1 text-sm font-medium text-slate-600">Search and filter the full cashier ledger.</p>
 </div>

 <div className="grid gap-3 sm:grid-cols-2">
 <input
 value={query}
 onChange={(e) => setQuery(e.target.value)}
 placeholder="Search devotee, receipt or service"
 className="rounded-2xl border border-[#ead7bb] bg-[#fffaf4] dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 px-4 py-3 text-sm outline-none focus:border-[#f28c18]"
 />
 <select
 value={billTypeFilter}
 onChange={(e) => setBillTypeFilter(e.target.value)}
 className="rounded-2xl border border-[#ead7bb] bg-[#fffaf4] dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 px-4 py-3 text-sm outline-none focus:border-[#f28c18]"
 >
 {billTypeOptions.map((type) => (
 <option key={type} value={type}>
 {type}
 </option>
 ))}
 </select>
 </div>
 </div>

 <div className="mt-5 overflow-x-auto">
 <table className="w-full min-w-[980px] text-left text-sm">
 <thead className="bg-[#fff7eb] dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 text-slate-600">
 <tr>
 <th className="px-4 py-3 font-bold">Receipt</th>
 <th className="px-4 py-3 font-bold">Devotee</th>
 <th className="px-4 py-3 font-bold">Type</th>
 <th className="px-4 py-3 font-bold">Service</th>
 <th className="px-4 py-3 font-bold">Amount</th>
 <th className="px-4 py-3 font-bold">Payment</th>
 <th className="px-4 py-3 font-bold">Date</th>
 <th className="px-4 py-3 font-bold">Status</th>
 </tr>
 </thead>
 <tbody>
 {loading ? (
 <tr>
 <td colSpan="8" className="px-4 py-8 text-center text-slate-500">
 Loading bills...
 </td>
 </tr>
 ) : filteredBills.length ? (
 filteredBills
 .sort((a, b) => new Date(b.billDate || b.createdAt || 0) - new Date(a.billDate || a.createdAt || 0))
 .map((bill, index) => (
 <tr key={bill._id || bill.referenceNo || index} className="border-b border-[#f2e7d7]">
 <td className="px-4 py-3 font-bold text-slate-950">{getBillReference(bill, index)}</td>
 <td className="px-4 py-3 font-semibold text-slate-800">{bill.devoteeName}</td>
 <td className="px-4 py-3">{inferBillType(bill)}</td>
 <td className="px-4 py-3">{bill.sevaType}</td>
 <td className="px-4 py-3 font-bold text-slate-950">{formatCurrency(bill.amount)}</td>
 <td className="px-4 py-3">{bill.paymentMode || "-"}</td>
 <td className="px-4 py-3 text-slate-600">{formatDateTime(bill.billDate || bill.createdAt)}</td>
 <td className="px-4 py-3">
 <span className="inline-flex rounded-full bg-[#fff1d6] dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-700 px-3 py-1 text-xs font-bold text-[#8a5200]">
 {bill.status || "Paid"}
 </span>
 </td>
 </tr>
 ))
 ) : (
 <tr>
 <td colSpan="8" className="px-4 py-8 text-center text-slate-500">
 No bills match the current filter.
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </section>
 </div>
 </CashierPageShell>
 );
};

export default BillingPage;
