import "./CashierDashboard.css";
import temple from "../assets/temple-sidebar.png";

import {
  FaHome,
  FaMoneyBill,
  FaReceipt,
  FaQrcode,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaBell,
} from "react-icons/fa";

const CashierDashboard = ({ children }) => {
  return (
    <div className="dashboard">

      {/* SIDEBAR */}

      <div className="sidebar">

        <div className="logo">
          <h2>Sri Shanti Mahadev Mandir</h2>
        </div>

        <ul>

          <li className="active">
            <FaHome /> Dashboard
          </li>

          <li>
            <FaMoneyBill /> New Billing
          </li>

          <li>
            <FaReceipt /> Payments
          </li>

          <li>
            <FaReceipt /> Receipts
          </li>

          <li>
            <FaQrcode /> QR Payments
          </li>

          <li>
            <FaChartBar /> Reports
          </li>

          <li>
            <FaCog /> Settings
          </li>

          <li>
            <FaSignOutAlt /> Logout
          </li>

        </ul>

        <div
  className="sidebar-background"
  style={{
    backgroundImage: `url(${temple})`,
  }}
></div>

      </div>

      {/* MAIN CONTENT */}

      <div className="main-content">

        {/* HEADER */}

        <div className="header">

          <input
            type="text"
            placeholder="Search by bill no., devotee..."
          />

          <div className="header-right">

            <FaBell />

            <div className="profile">

              <img
                src="https://i.pravatar.cc/40"
                alt=""
              />

              <div>
                <h4>Cashier</h4>
                <p>Cashier</p>
              </div>

            </div>

          </div>

        </div>

        {/* WELCOME */}

        <div className="welcome">

          <h1>Welcome back, Cashier! 🙏</h1>

          <p>
            Here's what's happening at the counter today.
          </p>

        </div>

        {/* TOP CARDS */}

        <div className="cards">

          <div className="card">
            <h4>Today's Transactions</h4>
            <h2>78</h2>
            <p>View Details</p>
          </div>

          <div className="card">
            <h4>Today's Collection</h4>
            <h2>₹ 48,650</h2>
            <p>View Details</p>
          </div>

          <div className="card">
            <h4>Pending Bills</h4>
            <h2>5</h2>
            <p>View Details</p>
          </div>

          <div className="card">
            <h4>Prasadam Sales</h4>
            <h2>₹ 6,430</h2>
            <p>View Details</p>
          </div>

        </div>

        {/* MAIN GRID */}

        <div className="main-grid">

          <div className="bottom-grid">

  <div className="recent-box">
    <h3>Recent Bills</h3>

    <table>
      <tbody>
        <tr>
          <td>BIL1258</td>
          <td>₹1100</td>
          <td>Paid</td>
        </tr>

        <tr>
          <td>BIL1257</td>
          <td>₹550</td>
          <td>Paid</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div className="prasadam-box">
    <h3>Prasadam Sales</h3>

    <table>
      <tbody>
        <tr>
          <td>Laddu</td>
          <td>₹2700</td>
        </tr>

        <tr>
          <td>Pulihora</td>
          <td>₹1250</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div className="actions-box">

    <h3>Quick Actions</h3>

    <div className="actions-grid">

      <button>New Billing</button>
      <button>Prasadam</button>
      <button>Receipt</button>
      <button>Report</button>

    </div>

  </div>

</div>

          {/* BILLING */}

          <div className="billing-box">

            <h3>Quick Billing</h3>

            <input
              type="text"
              placeholder="Select Service / Item"
            />

            <input
              type="text"
              placeholder="Devotee Name"
            />

            <div className="bill-items">

              <div>
                <span>Special Seva</span>
                <span>₹1100</span>
              </div>

              <div>
                <span>Laddu</span>
                <span>₹200</span>
              </div>

            </div>

            <h2>Total ₹1300</h2>

            <button>
              Proceed to Payment
            </button>

          </div>

          {/* TRANSACTIONS */}

          <div className="transactions-box">

            <h3>Today's Transactions</h3>

            <table>

              <thead>

                <tr>
                  <th>Bill</th>
                  <th>Devotee</th>
                  <th>Amount</th>
                </tr>

              </thead>

              <tbody>

                <tr>
                  <td>BIL1258</td>
                  <td>Ramesh</td>
                  <td>₹1100</td>
                </tr>

                <tr>
                  <td>BIL1257</td>
                  <td>Lakshmi</td>
                  <td>₹550</td>
                </tr>

                <tr>
                  <td>BIL1256</td>
                  <td>Suresh</td>
                  <td>₹2200</td>
                </tr>

              </tbody>

            </table>

          </div>

          {/* PAYMENT CHART */}

          <div className="payment-box">

            <h3>Payment Methods</h3>

            <div className="circle-chart">
              <span>40%</span>
            </div>

            <div className="payment-list">

              <div>
                <span>UPI</span>
                <span>₹19,460</span>
              </div>

              <div>
                <span>Cash</span>
                <span>₹14,590</span>
              </div>

              <div>
                <span>Card</span>
                <span>₹9,730</span>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default CashierDashboard;