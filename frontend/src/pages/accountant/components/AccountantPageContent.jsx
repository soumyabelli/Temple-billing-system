import { useState } from "react";
import {
  FaBell,
  FaCalendarAlt,
  FaCamera,
  FaCheckCircle,
  FaDownload,
  FaEdit,
  FaEye,
  FaFileExcel,
  FaFilePdf,
  FaFilter,
  FaHistory,
  FaLock,
  FaPaperPlane,
  FaPlus,
  FaPrint,
  FaSearch,
  FaShieldAlt,
  FaTrash,
  FaUser,
} from "react-icons/fa";
import { MdTempleBuddhist } from "react-icons/md";
import AccountantDonutCard from "./AccountantDonutCard";
import AccountantRevenueChart from "./AccountantRevenueChart";
import {
  accountantStats,
  billingRows,
  billingStats,
  categorySegments,
  collectionTrend,
  dashboardQuickActions,
  devoteePaymentRows,
  devoteePaymentStats,
  donationRows,
  donationSummaryStats,
  inventoryExpenseSegments,
  inventoryRows,
  inventoryStats,
  inventoryTrend,
  monthlySummary,
  notificationRows,
  notificationTabs,
  paymentDailyTrend,
  paymentRows,
  paymentSegments,
  paymentStats,
  pendingBills,
  poojaMonthlyTrend,
  poojaRevenueRows,
  poojaRevenueStats,
  poojaRevenueTypeSegments,
  prasadamItemSegments,
  prasadamRows,
  prasadamStats,
  prasadamTrend,
  profileDetails,
  receiptRows,
  receiptTabs,
  reportCategories,
  reportDonationSegments,
  reportExpenseSegments,
  reportRevenueGrowth,
  recentTransactions,
} from "../accountantDashboardData";

const slugifyStatus = (value) => String(value || "").toLowerCase().replace(/\s+/g, "-");
const titleCase = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const ViewHero = ({ eyebrow, title, description, right }) => (
  <section className="accountant-view__hero">
    <div>
      {eyebrow ? <p className="accountant-view__eyebrow">{eyebrow}</p> : null}
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
    {right ? <div className="accountant-view__heroActions">{right}</div> : null}
  </section>
);

const IconStatGrid = ({ items }) => (
  <section className="accountant-stats">
    {items.map((card) => {
      const Icon = card.icon;
      return (
        <article className="accountant-stat-card" key={card.title}>
          <div className="accountant-stat-card__icon" aria-hidden="true">
            <Icon />
          </div>
          <div>
            <p className="accountant-stat-card__title">{card.title}</p>
            <div className="accountant-stat-card__value">{card.value}</div>
            <div className={`accountant-stat-card__change ${card.tone === "down" ? "is-down" : "is-up"}`}>
              <span>{card.change}</span>
            </div>
          </div>
        </article>
      );
    })}
  </section>
);

const SummaryGrid = ({ items, stacked = false }) => (
  <div className={`accountant-summaryGrid ${stacked ? "accountant-summaryGrid--stacked" : ""}`}>
    {items.map((item) => (
      <article className={`accountant-summaryCard ${item.tone ? `is-${item.tone}` : ""}`} key={item.label}>
        <p className="accountant-summaryCard__label">{item.label}</p>
        <strong className="accountant-summaryCard__value">{item.value}</strong>
        <span className="accountant-summaryCard__note">{item.note}</span>
      </article>
    ))}
  </div>
);

const Toolbar = ({ children }) => <div className="accountant-toolbar">{children}</div>;

const TabsRow = ({ tabs, activeTab, onChange }) => (
  <div className="accountant-tabs" role="tablist" aria-label="Accountant view tabs">
    {tabs.map((tab) => (
      <button
        key={tab}
        type="button"
        role="tab"
        aria-selected={activeTab === tab}
        className={`accountant-tab ${activeTab === tab ? "is-active" : ""}`}
        onClick={() => onChange(tab)}
      >
        {tab}
      </button>
    ))}
  </div>
);

const DataTable = ({ columns, rows, renderRow, emptyText = "No records found." }) => (
  <div className="accountant-tableWrap">
    <table className="accountant-table accountant-table--wide">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column}>{column}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length ? (
          rows.map((row) => renderRow(row))
        ) : (
          <tr>
            <td className="accountant-emptyState" colSpan={columns.length}>
              {emptyText}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

const StatusBadge = ({ value }) => <span className={`accountant-status ${slugifyStatus(value)}`}>{value}</span>;

const RowActions = ({ actions }) => (
  <div className="accountant-actionGroup">
    {actions.map((action) => {
      const Icon = action.icon;
      return (
        <button key={action.label} type="button" className={`accountant-actionButton ${action.tone ? `is-${action.tone}` : ""}`}>
          <Icon />
          <span>{action.label}</span>
        </button>
      );
    })}
  </div>
);

const ProfileField = ({ label, value }) => (
  <div className="accountant-profileField">
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

const DashboardView = ({ user, currentDate, currentWeekday }) => (
  <div className="accountant-view">
    <ViewHero
      eyebrow="Accountant Workspace"
      title="Welcome Accountant"
      description={`Overview of temple financial activities for ${currentWeekday}, ${currentDate}.`}
      right={
        <>
          <span className="accountant-chip">
            <FaCalendarAlt />
            {currentDate}
          </span>
          <span className="accountant-chip">
            <FaUser />
            {user?.name || "Accountant"}
          </span>
          <span className="accountant-chip">
            <MdTempleBuddhist />
            Live Ledger
          </span>
        </>
      }
    />

    <IconStatGrid items={accountantStats} />

    <section className="accountant-panels accountant-panels--top">
      <AccountantRevenueChart
        title="Revenue Charts"
        subtitle="Daily Collection Overview"
        points={collectionTrend}
        rangeLabel="This Week"
        summaryLabel="Today"
        summaryValue="Rs 25,000"
        trendLabel="+12.5% from yesterday"
      />

      <AccountantDonutCard
        title="Collection by Category"
        subtitle="Collection Charts"
        segments={categorySegments}
        centerValue="Rs 25,000"
        centerLabel="Collection total"
      />

      <article className="accountant-panel">
        <div className="accountant-panel__header">
          <div>
            <p className="accountant-panel__eyebrow">Live feed</p>
            <h3 className="accountant-panel__title">Recent Transactions</h3>
          </div>
          <span className="accountant-panel__link">View All</span>
        </div>

        <div className="accountant-transactionList">
          {recentTransactions.map((transaction) => {
            const Icon = transaction.icon;
            return (
              <div className="accountant-transaction" key={transaction.receipt}>
                <div className="accountant-transaction__meta">
                  <div className="accountant-transaction__icon" aria-hidden="true">
                    <Icon />
                  </div>
                  <div>
                    <p className="accountant-transaction__title">{transaction.title}</p>
                    <p className="accountant-transaction__receipt">{transaction.receipt}</p>
                  </div>
                </div>
                <div className="accountant-transaction__amount">
                  <div>{transaction.amount}</div>
                  <div className="accountant-transaction__time">{transaction.time}</div>
                </div>
              </div>
            );
          })}
        </div>
      </article>
    </section>

    <section className="accountant-panels accountant-panels--bottom">
      <AccountantDonutCard
        title="Payment Methods"
        subtitle="Revenue split"
        segments={paymentSegments}
        centerValue="Rs 18,500"
        centerLabel="Payments received"
      />

      <article className="accountant-panel">
        <div className="accountant-panel__header">
          <div>
            <p className="accountant-panel__eyebrow">Performance</p>
            <h3 className="accountant-panel__title">Monthly Summary</h3>
          </div>
        </div>

        <div className="accountant-summary">
          {monthlySummary.map((row) => (
            <div className={`accountant-summary__row ${row.tone === "positive" ? "is-positive" : ""}`} key={row.label}>
              <span>{row.label}</span>
              <strong>{row.value}</strong>
            </div>
          ))}
        </div>
      </article>

      <article className="accountant-panel">
        <div className="accountant-panel__header">
          <div>
            <p className="accountant-panel__eyebrow">Alerts</p>
            <h3 className="accountant-panel__title">Pending Payments</h3>
          </div>
          <span className="accountant-panel__link">View All</span>
        </div>

        <div className="accountant-tableWrap">
          <table className="accountant-table">
            <thead>
              <tr>
                <th>Bill No.</th>
                <th>Devotee Name</th>
                <th>Amount</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {pendingBills.map((bill) => (
                <tr key={bill.billNo}>
                  <td>{bill.billNo}</td>
                  <td>{bill.devoteeName}</td>
                  <td>{bill.amount}</td>
                  <td className={bill.overdue ? "accountant-table__due" : ""}>{bill.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>

    <section className="accountant-actionStrip">
      {dashboardQuickActions.map((action) => (
        <button key={action} type="button" className="accountant-actionTile">
          <span>{action}</span>
          <FaPlus />
        </button>
      ))}
    </section>

    <section className="accountant-banner">
      <div className="accountant-banner__icon" aria-hidden="true">
        <MdTempleBuddhist />
      </div>
      <div>
        <p className="accountant-banner__copy">May this temple prosper and all devotees be blessed.</p>
        <p className="accountant-banner__blessing">Om Namo Venkateshaya</p>
      </div>
    </section>
  </div>
);

const DonationsView = () => (
  <div className="accountant-view">
    <ViewHero
      eyebrow="Donation Management"
      title="Donations"
      description="Track donation receipts, donor details, payment methods and settlement status."
      right={
        <button type="button" className="accountant-primaryButton">
          <FaPlus />
          Add Donation
        </button>
      }
    />

    <Toolbar>
      <label className="accountant-field accountant-field--search">
        <FaSearch />
        <input type="text" placeholder="Search donation" />
      </label>
      <button type="button" className="accountant-secondaryButton">
        <FaCalendarAlt />
        Filter By Date
      </button>
      <button type="button" className="accountant-secondaryButton">
        <FaFilter />
        Filter By Category
      </button>
    </Toolbar>

    <div className="accountant-twoColumn">
      <section className="accountant-panel">
        <div className="accountant-panel__header">
          <div>
            <p className="accountant-panel__eyebrow">Donation Ledger</p>
            <h3 className="accountant-panel__title">Donation Table</h3>
          </div>
        </div>

        <DataTable
          columns={["Receipt Number", "Donor Name", "Mobile Number", "Donation Category", "Amount", "Payment Method", "Date", "Status", "Actions"]}
          rows={donationRows}
          renderRow={(row) => (
            <tr key={row.receiptNumber}>
              <td>{row.receiptNumber}</td>
              <td>{row.donorName}</td>
              <td>{row.mobileNumber}</td>
              <td>{row.donationCategory}</td>
              <td>{row.amount}</td>
              <td>{row.paymentMethod}</td>
              <td>{row.date}</td>
              <td>
                <StatusBadge value={row.status} />
              </td>
              <td>
                <RowActions
                  actions={[
                    { icon: FaEye, label: "View Receipt" },
                    { icon: FaDownload, label: "Download PDF", tone: "primary" },
                    { icon: FaPrint, label: "Print Receipt" },
                    { icon: FaTrash, label: "Delete", tone: "danger" },
                  ]}
                />
              </td>
            </tr>
          )}
        />
      </section>

      <aside className="accountant-sideRail">
        <SummaryGrid items={donationSummaryStats} stacked />
      </aside>
    </div>
  </div>
);

const BillingView = () => (
  <div className="accountant-view">
    <ViewHero
      eyebrow="Billing Management"
      title="Billing"
      description="Generate, track and audit all temple bills from one billing workspace."
      right={
        <button type="button" className="accountant-primaryButton">
          <FaPlus />
          Generate New Bill
        </button>
      }
    />

    <SummaryGrid items={billingStats} />

    <section className="accountant-panel">
      <div className="accountant-panel__header">
        <div>
          <p className="accountant-panel__eyebrow">Bills</p>
          <h3 className="accountant-panel__title">Billing Table</h3>
        </div>
      </div>

      <DataTable
        columns={["Bill Number", "Devotee Name", "Service Name", "Amount", "Status", "Date", "Actions"]}
        rows={billingRows}
        renderRow={(row) => (
          <tr key={row.billNumber}>
            <td>{row.billNumber}</td>
            <td>{row.devoteeName}</td>
            <td>{row.serviceName}</td>
            <td>{row.amount}</td>
            <td>
              <StatusBadge value={row.status} />
            </td>
            <td>{row.date}</td>
            <td>
              <RowActions
                actions={[
                  { icon: FaEye, label: "View Bill" },
                  { icon: FaEdit, label: "Edit Bill", tone: "primary" },
                  { icon: FaPrint, label: "Print Bill" },
                  { icon: FaTrash, label: "Delete Bill", tone: "danger" },
                ]}
              />
            </td>
          </tr>
        )}
      />
    </section>
  </div>
);

const PaymentsView = () => (
  <div className="accountant-view">
    <ViewHero
      eyebrow="Payment Management"
      title="Payments"
      description="Monitor daily payments, verify settlements and review channel-wise collections."
      right={
        <button type="button" className="accountant-primaryButton">
          <FaShieldAlt />
          Verify Selected
        </button>
      }
    />

    <SummaryGrid items={paymentStats} />

    <div className="accountant-twoColumn accountant-twoColumn--charts">
      <section className="accountant-panel">
        <div className="accountant-panel__header">
          <div>
            <p className="accountant-panel__eyebrow">Transactions</p>
            <h3 className="accountant-panel__title">Payment Table</h3>
          </div>
        </div>

        <DataTable
          columns={["Transaction ID", "Devotee Name", "Amount", "Payment Method", "Payment Status", "Date", "Actions"]}
          rows={paymentRows}
          renderRow={(row) => (
            <tr key={row.transactionId}>
              <td>{row.transactionId}</td>
              <td>{row.devoteeName}</td>
              <td>{row.amount}</td>
              <td>{row.paymentMethod}</td>
              <td>
                <StatusBadge value={row.paymentStatus} />
              </td>
              <td>{row.date}</td>
              <td>
                <RowActions
                  actions={[
                    { icon: FaEye, label: "View" },
                    { icon: FaShieldAlt, label: "Verify", tone: "primary" },
                    { icon: FaDownload, label: "Download Receipt" },
                  ]}
                />
              </td>
            </tr>
          )}
        />
      </section>

      <aside className="accountant-sideRail accountant-sideRail--chart">
        <AccountantDonutCard
          title="Payment Method Distribution"
          subtitle="Charts"
          segments={paymentSegments}
          centerValue="Rs 68,450"
          centerLabel="Today's payments"
        />
        <AccountantRevenueChart
          title="Daily Collection Graph"
          subtitle="Payments trend"
          points={paymentDailyTrend}
          rangeLabel="This Week"
          summaryLabel="Today's payments"
          summaryValue="Rs 68,450"
          trendLabel="+14.2% from yesterday"
        />
      </aside>
    </div>
  </div>
);

const ReceiptsView = () => {
  const [activeTab, setActiveTab] = useState(receiptTabs[0]);
  const visibleRows = receiptRows.filter((row) => row.receiptType === activeTab);

  return (
    <div className="accountant-view">
      <ViewHero
        eyebrow="Receipt Center"
        title="Receipts"
        description="Browse all system receipts across donations, poojas, payments, bills, festivals and prasadam."
        right={
          <span className="accountant-chip">
            <FaPrint />
            Receipt Archive
          </span>
        }
      />

      <TabsRow tabs={receiptTabs} activeTab={activeTab} onChange={setActiveTab} />

      <section className="accountant-panel">
        <div className="accountant-panel__header">
          <div>
            <p className="accountant-panel__eyebrow">{activeTab}</p>
            <h3 className="accountant-panel__title">System Receipts</h3>
          </div>
        </div>

        <DataTable
          columns={["Receipt ID", "Receipt Type", "Name", "Amount", "Date", "Actions"]}
          rows={visibleRows}
          renderRow={(row) => (
            <tr key={row.receiptId}>
              <td>{row.receiptId}</td>
              <td>{row.receiptType}</td>
              <td>{row.name}</td>
              <td>{row.amount}</td>
              <td>{row.date}</td>
              <td>
                <RowActions
                  actions={[
                    { icon: FaEye, label: "View" },
                    { icon: FaDownload, label: "Download PDF", tone: "primary" },
                    { icon: FaPrint, label: "Print" },
                  ]}
                />
              </td>
            </tr>
          )}
        />
      </section>
    </div>
  );
};

const PoojaRevenueView = () => (
  <div className="accountant-view">
    <ViewHero
      eyebrow="Pooja Revenue"
      title="Pooja Revenue"
      description="Revenue from pooja services, booking activity and monthly collection trends."
      right={<span className="accountant-chip"><MdTempleBuddhist /> Revenue Focus</span>}
    />

    <SummaryGrid items={poojaRevenueStats} />

    <div className="accountant-twoColumn accountant-twoColumn--charts">
      <section className="accountant-panel">
        <div className="accountant-panel__header">
          <div>
            <p className="accountant-panel__eyebrow">Revenue Ledger</p>
            <h3 className="accountant-panel__title">Pooja Revenue Table</h3>
          </div>
        </div>

        <DataTable
          columns={["Booking ID", "Devotee Name", "Pooja Name", "Amount", "Date"]}
          rows={poojaRevenueRows}
          renderRow={(row) => (
            <tr key={row.bookingId}>
              <td>{row.bookingId}</td>
              <td>{row.devoteeName}</td>
              <td>{row.poojaName}</td>
              <td>{row.amount}</td>
              <td>{row.date}</td>
            </tr>
          )}
        />
      </section>

      <aside className="accountant-sideRail accountant-sideRail--chart">
        <AccountantDonutCard
          title="Revenue by Pooja Type"
          subtitle="Charts"
          segments={poojaRevenueTypeSegments}
          centerValue="Rs 2,85,000"
          centerLabel="Monthly revenue"
        />
        <AccountantRevenueChart
          title="Monthly Pooja Revenue"
          subtitle="Revenue charts"
          points={poojaMonthlyTrend}
          rangeLabel="This Year"
          summaryLabel="Monthly revenue"
          summaryValue="Rs 2,85,000"
          trendLabel="+7.8% from previous month"
        />
      </aside>
    </div>
  </div>
);

const PrasadamSalesView = () => (
  <div className="accountant-view">
    <ViewHero
      eyebrow="Prasadam Sales"
      title="Prasadam Sales"
      description="Track daily sales, monthly revenue and item-wise performance for prasadam counters."
      right={<span className="accountant-chip"><FaCheckCircle /> Best Seller: Laddu</span>}
    />

    <SummaryGrid items={prasadamStats} />

    <div className="accountant-twoColumn accountant-twoColumn--charts">
      <section className="accountant-panel">
        <div className="accountant-panel__header">
          <div>
            <p className="accountant-panel__eyebrow">Sales Ledger</p>
            <h3 className="accountant-panel__title">Prasadam Table</h3>
          </div>
        </div>

        <DataTable
          columns={["Item Name", "Quantity Sold", "Price", "Total Amount", "Date"]}
          rows={prasadamRows}
          renderRow={(row) => (
            <tr key={`${row.itemName}-${row.date}`}>
              <td>{row.itemName}</td>
              <td>{row.quantitySold}</td>
              <td>{row.price}</td>
              <td>{row.totalAmount}</td>
              <td>{row.date}</td>
            </tr>
          )}
        />
      </section>

      <aside className="accountant-sideRail accountant-sideRail--chart">
        <AccountantRevenueChart
          title="Sales Trend"
          subtitle="Prasadam charts"
          points={prasadamTrend}
          rangeLabel="This Week"
          summaryLabel="Daily sales"
          summaryValue="Rs 12,780"
          trendLabel="+9.4% from yesterday"
        />
        <AccountantDonutCard
          title="Item-wise Revenue"
          subtitle="Revenue split"
          segments={prasadamItemSegments}
          centerValue="Rs 1,45,600"
          centerLabel="Monthly sales"
        />
      </aside>
    </div>
  </div>
);

const InventoryFinanceView = () => (
  <div className="accountant-view">
    <ViewHero
      eyebrow="Inventory Finance"
      title="Inventory Finance"
      description="Monitor inventory expense tracking, purchase trends and pending procurement."
      right={<span className="accountant-chip"><FaFilter /> Expense Tracking</span>}
    />

    <SummaryGrid items={inventoryStats} />

    <div className="accountant-twoColumn accountant-twoColumn--charts">
      <section className="accountant-panel">
        <div className="accountant-panel__header">
          <div>
            <p className="accountant-panel__eyebrow">Purchases</p>
            <h3 className="accountant-panel__title">Inventory Purchase Table</h3>
          </div>
        </div>

        <DataTable
          columns={["Item Name", "Quantity", "Purchase Cost", "Supplier", "Date"]}
          rows={inventoryRows}
          renderRow={(row) => (
            <tr key={`${row.itemName}-${row.date}`}>
              <td>{row.itemName}</td>
              <td>{row.quantity}</td>
              <td>{row.purchaseCost}</td>
              <td>{row.supplier}</td>
              <td>{row.date}</td>
            </tr>
          )}
        />
      </section>

      <aside className="accountant-sideRail accountant-sideRail--chart">
        <AccountantDonutCard
          title="Expense Analysis"
          subtitle="Ledger charts"
          segments={inventoryExpenseSegments}
          centerValue="Rs 2,45,000"
          centerLabel="Total expenses"
        />
        <AccountantRevenueChart
          title="Purchase Trend"
          subtitle="Expense charts"
          points={inventoryTrend}
          rangeLabel="This Year"
          summaryLabel="Monthly purchases"
          summaryValue="Rs 1,20,000"
          trendLabel="+6.2% from last month"
        />
      </aside>
    </div>
  </div>
);

const DevoteePaymentsView = () => (
  <div className="accountant-view">
    <ViewHero
      eyebrow="Devotee Payments"
      title="Devotee Payments"
      description="Review all payments made by devotees and manage follow-up reminders."
      right={<span className="accountant-chip"><FaHistory /> Payment History</span>}
    />

    <SummaryGrid items={devoteePaymentStats} />

    <section className="accountant-panel">
      <div className="accountant-panel__header">
        <div>
          <p className="accountant-panel__eyebrow">Devotee Ledger</p>
          <h3 className="accountant-panel__title">All Devotee Payments</h3>
        </div>
      </div>

      <DataTable
        columns={["Devotee Name", "Mobile", "Payment Type", "Amount", "Status", "Date", "Actions"]}
        rows={devoteePaymentRows}
        renderRow={(row) => (
          <tr key={`${row.devoteeName}-${row.date}`}>
            <td>{row.devoteeName}</td>
            <td>{row.mobile}</td>
            <td>{row.paymentType}</td>
            <td>{row.amount}</td>
            <td>
              <StatusBadge value={row.status} />
            </td>
            <td>{row.date}</td>
            <td>
              <RowActions
                actions={[
                  { icon: FaHistory, label: "View History" },
                  { icon: FaDownload, label: "Download Receipt", tone: "primary" },
                  { icon: FaPaperPlane, label: "Send Reminder" },
                ]}
              />
            </td>
          </tr>
        )}
      />
    </section>
  </div>
);

const ReportsAnalyticsView = () => (
  <div className="accountant-view">
    <ViewHero
      eyebrow="Reports & Analytics"
      title="Reports & Analytics"
      description="Export reports, compare trends and review temple-wide revenue and expense analytics."
      right={
        <div className="accountant-exportGroup">
          <button type="button" className="accountant-secondaryButton">
            <FaFilePdf />
            Export PDF
          </button>
          <button type="button" className="accountant-secondaryButton">
            <FaFileExcel />
            Export Excel
          </button>
          <button type="button" className="accountant-primaryButton">
            <FaPrint />
            Print Report
          </button>
        </div>
      }
    />

    <section className="accountant-reportGrid">
      {reportCategories.map((label) => (
        <button key={label} type="button" className="accountant-reportCard">
          <span className="accountant-reportCard__label">{label}</span>
          <span className="accountant-reportCard__desc">Open report</span>
        </button>
      ))}
    </section>

    <section className="accountant-panels accountant-panels--top">
      <AccountantRevenueChart
        title="Revenue Growth"
        subtitle="Reports"
        points={reportRevenueGrowth}
        rangeLabel="This Year"
        summaryLabel="Growth"
        summaryValue="Rs 38,00,000"
        trendLabel="+16.5% from last year"
      />

      <AccountantDonutCard
        title="Donation Trends"
        subtitle="Reports"
        segments={reportDonationSegments}
        centerValue="45%"
        centerLabel="Donation share"
      />

      <AccountantDonutCard
        title="Collection Analysis"
        subtitle="Reports"
        segments={categorySegments}
        centerValue="Rs 25,000"
        centerLabel="Daily collection"
      />

      <AccountantDonutCard
        title="Expense Analysis"
        subtitle="Reports"
        segments={reportExpenseSegments}
        centerValue="20%"
        centerLabel="Utilities share"
      />
    </section>
  </div>
);

const NotificationsView = () => {
  const [activeTab, setActiveTab] = useState(notificationTabs[0]);
  const visibleRows =
    activeTab === "All Notifications"
      ? notificationRows
      : notificationRows.filter((row) => row.type === activeTab);

  return (
    <div className="accountant-view">
      <ViewHero
        eyebrow="Notification Center"
        title="Notifications"
        description="Track payment alerts, donation alerts and billing alerts from one location."
        right={
          <button type="button" className="accountant-primaryButton">
            <FaBell />
            Send Notification
          </button>
        }
      />

      <TabsRow tabs={notificationTabs} activeTab={activeTab} onChange={setActiveTab} />

      <Toolbar>
        <button type="button" className="accountant-secondaryButton">
          <FaCheckCircle />
          Mark Read
        </button>
        <button type="button" className="accountant-secondaryButton">
          <FaTrash />
          Delete
        </button>
        <button type="button" className="accountant-secondaryButton">
          <FaPaperPlane />
          Send Notification
        </button>
      </Toolbar>

      <section className="accountant-panel">
        <div className="accountant-panel__header">
          <div>
            <p className="accountant-panel__eyebrow">{activeTab}</p>
            <h3 className="accountant-panel__title">Notification Center</h3>
          </div>
        </div>

        <div className="accountant-notificationList">
          {visibleRows.map((row) => (
            <article className="accountant-notificationItem" key={`${row.title}-${row.date}`}>
              <div className="accountant-notificationItem__meta">
                <div className="accountant-notificationItem__icon" aria-hidden="true">
                  <FaBell />
                </div>
                <div>
                  <h4>{row.title}</h4>
                  <p>{row.message}</p>
                </div>
              </div>
              <div className="accountant-notificationItem__side">
                <StatusBadge value={row.status} />
                <span>{row.date}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

const ProfileView = ({ user }) => (
  <div className="accountant-view">
    <ViewHero
      eyebrow="Profile"
      title="Accountant Profile"
      description="Review profile details, security settings and account preferences."
      right={
        <button type="button" className="accountant-primaryButton">
          <FaEdit />
          Edit Profile
        </button>
      }
    />

    <div className="accountant-profileLayout">
      <section className="accountant-profileCard">
        <div className="accountant-profileAvatar">
          <FaUser />
        </div>
        <h3>{user?.name || profileDetails.name}</h3>
        <p>{profileDetails.role}</p>

        <div className="accountant-profileDetails">
          <ProfileField label="Name" value={user?.name || profileDetails.name} />
          <ProfileField label="Email" value={user?.email || profileDetails.email} />
          <ProfileField label="Phone" value={user?.phone || profileDetails.phone} />
          <ProfileField label="Role" value={titleCase(user?.role || profileDetails.role)} />
          <ProfileField label="Joining Date" value={profileDetails.joiningDate} />
        </div>
      </section>

      <section className="accountant-profileActions">
        <button type="button" className="accountant-profileAction">
          <FaEdit />
          Edit Profile
        </button>
        <button type="button" className="accountant-profileAction">
          <FaLock />
          Change Password
        </button>
        <button type="button" className="accountant-profileAction">
          <FaCamera />
          Update Photo
        </button>
      </section>
    </div>
  </div>
);

const AccountantPageContent = ({ activeItem, user, currentDate, currentWeekday }) => {
  switch (activeItem) {
    case "Donations":
      return <DonationsView />;
    case "Billing":
      return <BillingView />;
    case "Payments":
      return <PaymentsView />;
    case "Receipts":
      return <ReceiptsView />;
    case "Pooja Revenue":
      return <PoojaRevenueView />;
    case "Prasadam Sales":
      return <PrasadamSalesView />;
    case "Inventory Finance":
      return <InventoryFinanceView />;
    case "Devotee Payments":
      return <DevoteePaymentsView />;
    case "Reports & Analytics":
      return <ReportsAnalyticsView />;
    case "Notifications":
      return <NotificationsView />;
    case "Profile":
      return <ProfileView user={user} />;
    case "Dashboard":
    default:
      return <DashboardView user={user} currentDate={currentDate} currentWeekday={currentWeekday} />;
  }
};

export default AccountantPageContent;
