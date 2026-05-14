import { useEffect, useState } from "react";

const initialForm = {
  devoteeName: "",
  sevaType: "",
  amount: "",
  paymentMode: "Cash",
  billDate: "",
};

function App() {
  const [bills, setBills] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchBills = async () => {
    try {
      const res = await fetch("/api/bills");
      const data = await res.json();
      setBills(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage("Could not load bills. Make sure backend is running.");
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount),
      };

      const res = await fetch("/api/bills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create bill");
      }

      setFormData(initialForm);
      setMessage("Bill created successfully.");
      await fetchBills();
    } catch (error) {
      setMessage(error.message || "Failed to create bill.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <h1>Temple Billing System</h1>
      <p className="subtitle">MERN starter for managing temple bills</p>

      <section className="card">
        <h2>Create Bill</h2>
        <form onSubmit={handleSubmit} className="form">
          <input
            type="text"
            name="devoteeName"
            placeholder="Devotee Name"
            value={formData.devoteeName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="sevaType"
            placeholder="Seva Type"
            value={formData.sevaType}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={formData.amount}
            onChange={handleChange}
            required
            min="1"
          />
          <select name="paymentMode" value={formData.paymentMode} onChange={handleChange}>
            <option>Cash</option>
            <option>UPI</option>
            <option>Card</option>
            <option>Bank Transfer</option>
          </select>
          <input type="date" name="billDate" value={formData.billDate} onChange={handleChange} />
          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Create Bill"}
          </button>
        </form>
        {message && <p className="message">{message}</p>}
      </section>

      <section className="card">
        <h2>Recent Bills</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Devotee</th>
                <th>Seva</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {bills.length === 0 ? (
                <tr>
                  <td colSpan="5">No bills yet.</td>
                </tr>
              ) : (
                bills.map((bill) => (
                  <tr key={bill._id}>
                    <td>{bill.devoteeName}</td>
                    <td>{bill.sevaType}</td>
                    <td>Rs. {bill.amount}</td>
                    <td>{bill.paymentMode}</td>
                    <td>{new Date(bill.billDate).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default App;

