import { FaBell, FaCog, FaSearch, FaUserFriends, FaWallet, FaHandHoldingUsd, FaMoneyCheckAlt, FaCalendarAlt, FaChevronRight } from "react-icons/fa";
import { MdPayments, MdOutlineVolunteerActivism } from "react-icons/md";
import { RiMenu2Fill } from "react-icons/ri";
import AccountantSidebar from "../components/accountantsidebar";
import AccountantRevenueChart from "../components/AccountantRevenueChart";
import "../styles/accountantdashboard.css";

const statCards = [
  { title: "Today's Revenue", amount: "Rs 48,650", change: "8.2%", up: true, icon: FaHandHoldingUsd },
  { title: "This Month Revenue", amount: "Rs 12,45,360", change: "14.6%", up: true, icon: MdPayments },
  { title: "Total Expenses", amount: "Rs 3,45,200", change: "5.3%", up: false, icon: FaWallet },
  { title: "Pending Payments", amount: "Rs 12,560", change: "3.2%", up: false, icon: FaMoneyCheckAlt },
  { title: "Total Donations", amount: "Rs 75,230", change: "15.4%", up: true, icon: MdOutlineVolunteerActivism },
  { title: "Total Transactions", amount: "1,248", change: "9.7%", up: true, icon: FaUserFriends },
];

const recentTransactions = [
  ["14 May 2025, 02:30 PM", "Pooja Booking - Special Seva", "Income", "1,100", "UPI", "Completed"],
  ["14 May 2025, 01:45 PM", "Donation - General", "Income", "510", "UPI", "Completed"],
  ["14 May 2025, 12:30 PM", "Prasadam Sales", "Income", "320", "Cash", "Completed"],
  ["14 May 2025, 11:20 AM", "Flower Purchase", "Expense", "450", "Cash", "Completed"],
  ["14 May 2025, 10:10 AM", "Salary Payment - Staff", "Expense", "8,500", "Bank Transfer", "Completed"],
];

const categorySummary = [
  ["Pooja Bookings", "4,25,680", "-"],
  ["Donations", "3,75,230", "-"],
  ["Prasadam Sales", "1,50,900", "-"],
  ["Other Income", "2,93,550", "-"],
  ["Staff Salary", "-", "2,45,000"],
  ["Purchase & Inventory", "-", "85,200"],
  ["Utilities & Maintenance", "-", "15,000"],
];

const quickActions = [
  "Generate Report",
  "Daily Collection Report",
  "Donation Report",
  "Expense Report",
  "Export Transactions",
];

const AccountantDashboard = () => {
  return (
    <div className="accountant-layout">
      <AccountantSidebar />

      <main className="accountant-main">
        <header className="accountant-topbar">
          <button type="button" className="icon-btn"><RiMenu2Fill /></button>
          <label className="accountant-search">
            <FaSearch />
            <input type="text" placeholder="Search here..." />
          </label>

          <div className="accountant-topbar__right">
            <button type="button" className="icon-btn with-badge">
              <FaBell />
              <span>4</span>
            </button>
            <button type="button" className="icon-btn"><FaCog /></button>

            <div className="accountant-user">
              <div className="accountant-user__avatar">A</div>
              <div>
                <strong>Accountant</strong>
                <p>Accountant</p>
              </div>
            </div>
          </div>
        </header>

        <section className="accountant-title-row">
          <div>
            <h1>Welcome back, Accountant!</h1>
            <p>Here&apos;s the financial overview.</p>
          </div>
          <div className="accountant-date-badge">
            <FaCalendarAlt />
            <span>14 May 2025, Wednesday</span>
          </div>
        </section>

        <section className="accountant-stats-grid">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <article className="accountant-stat-card" key={card.title}>
                <div className="accountant-stat-card__icon">
                  <Icon />
                </div>
                <div>
                  <p>{card.title}</p>
                  <h3>{card.amount}</h3>
                  <small className={card.up ? "is-up" : "is-down"}>{card.up ? "+" : "-"} {card.change}</small>
                </div>
              </article>
            );
          })}
        </section>

        <section className="accountant-grid-two">
          <AccountantRevenueChart />

          <div className="accountant-panel">
            <div className="accountant-panel__header">
              <h3>Recent Transactions</h3>
              <button type="button" className="link-btn">View All</button>
            </div>

            <div className="accountant-table-wrap">
              <table className="accountant-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Amount (Rs)</th>
                    <th>Payment Method</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((row) => (
                    <tr key={`${row[0]}-${row[1]}`}>
                      <td>{row[0]}</td>
                      <td>{row[1]}</td>
                      <td>
                        <span className={`pill ${row[2] === "Income" ? "income" : "expense"}`}>{row[2]}</span>
                      </td>
                      <td>{row[3]}</td>
                      <td>{row[4]}</td>
                      <td><span className="pill completed">{row[5]}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="accountant-grid-bottom">
          <div className="accountant-panel split-panel">
            <h3>Income vs Expense <span>(This Month)</span></h3>
            <div className="donut-block">
              <div className="donut income-expense">
                <div className="donut-center">
                  <strong>Rs 12,45,360</strong>
                  <span>Total</span>
                </div>
              </div>
              <div className="legend-list">
                <p><i className="dot income-dot" />Total Income <strong>Rs 12,45,360 (78%)</strong></p>
                <p><i className="dot expense-dot" />Total Expense <strong>Rs 3,45,200 (22%)</strong></p>
              </div>
            </div>
          </div>

          <div className="accountant-panel">
            <div className="accountant-panel__header">
              <h3>Category Wise Summary</h3>
              <button type="button">This Month</button>
            </div>

            <div className="accountant-table-wrap">
              <table className="accountant-table compact">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Income (Rs)</th>
                    <th>Expense (Rs)</th>
                  </tr>
                </thead>
                <tbody>
                  {categorySummary.map((row) => (
                    <tr key={row[0]}>
                      <td>{row[0]}</td>
                      <td>{row[1]}</td>
                      <td>{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td>Total</td>
                    <td className="total-income">12,45,360</td>
                    <td className="total-expense">3,45,200</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="accountant-panel split-panel">
            <h3>Payment Methods <span>(This Month)</span></h3>
            <div className="donut-block">
              <div className="donut payment-methods">
                <div className="donut-center">
                  <strong><FaWallet /></strong>
                </div>
              </div>
              <div className="legend-list">
                <p><i className="dot upi" />UPI <strong>Rs 6,25,450 (50%)</strong></p>
                <p><i className="dot cash" />Cash <strong>Rs 3,12,300 (25%)</strong></p>
                <p><i className="dot card" />Card <strong>Rs 2,37,600 (19%)</strong></p>
                <p><i className="dot net" />Net Banking <strong>Rs 70,010 (6%)</strong></p>
              </div>
            </div>
          </div>

          <div className="accountant-panel">
            <h3>Quick Actions</h3>
            <div className="quick-actions">
              {quickActions.map((action) => (
                <button type="button" key={action}>
                  <span>{action}</span>
                  <FaChevronRight />
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AccountantDashboard;