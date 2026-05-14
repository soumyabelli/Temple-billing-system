import { useEffect, useState } from "react";

const initialForm = {
  devoteeName: "",
  sevaType: "",
  amount: "",
  paymentMode: "Cash",
  billDate: ""
};

function App() {
  const [bills, setBills] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [message, setMessage] = useState("");

  const fetchBills = async () => {
    const res = await fetch("/api/bills");
    const data = await res.json();
    setBills(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchBills().catch(() => setMessage("Backend not running."));
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const payload = { ...formData, amount: Number(formData.amount) };

    const res = await fetch("/api/bills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json();
      setMessage(err.message || "Failed to create bill");
      return;
    }

    setFormData(initialForm);
    setMessage("Bill created successfully.");
    fetchBills();
  };

  return (
    <main className="container">
      <h1>Temple Billing System</h1>
      <form onSubmit={onSubmit} className="card form">
        <input name="devoteeName" placeholder="Devotee Name" value={formData.devoteeName} onChange={onChange} required />
        <input name="sevaType" placeholder="Seva Type" value={formData.sevaType} onChange={onChange} required />
        <input type="number" name="amount" placeholder="Amount" min="1" value={formData.amount} onChange={onChange} required />
        <select name="paymentMode" value={formData.paymentMode} onChange={onChange}>
          <option></option>
          <option>UPI</option>
          <option>Card</option>
          <option>Bank Transfer</option>
        </select>
        <input type="date" name="billDate" value={formData.billDate} onChange={onChange} />
        <button type="submit">Create Bill</button>
      </form>

      {message && <p>{message}</p>}

      <section className="card">
        <h2>Recent Bills</h2>
        <ul>
          {bills.map((bill) => (
            <li key={bill._id}>
              {bill.devoteeName} - {bill.sevaType} - Rs. {bill.amount}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default App;