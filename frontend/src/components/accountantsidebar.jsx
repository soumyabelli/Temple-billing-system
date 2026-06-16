import { FaChartLine, FaClipboardList, FaDonate, FaFileInvoiceDollar, FaUserCircle, FaCog, FaSignOutAlt, FaFileExport, FaHome } from "react-icons/fa";
import { MdOutlineReceiptLong, MdTempleBuddhist } from "react-icons/md";
import { TbReportAnalytics } from "react-icons/tb";
import templeBg from "../assets/temple-bg.jpg";

const accountantMenu = [
  { label: "Dashboard", icon: FaHome, active: true },
  { label: "Transactions", icon: FaClipboardList },
  { label: "Donations", icon: FaDonate },
  { label: "Billing", icon: FaFileInvoiceDollar },
  { label: "Reports", icon: TbReportAnalytics },
  { label: "Financial Statements", icon: FaChartLine },
  { label: "Receipt History", icon: MdOutlineReceiptLong },
  { label: "Export Reports", icon: FaFileExport },
  { label: "Profile", icon: FaUserCircle },
  { label: "Settings", icon: FaCog },
  { label: "Logout", icon: FaSignOutAlt },
];

const AccountantSidebar = () => {
  return (
    <aside className="accountant-sidebar" style={{ backgroundImage: `url(${templeBg})` }}>
      <div className="accountant-sidebar__overlay">
        <div className="accountant-brand">
          <span className="accountant-brand__icon"><MdTempleBuddhist /></span>
          <h2>Sri Shanti<br />Mahadev Mandir</h2>
        </div>

        <nav className="accountant-nav" aria-label="Accountant navigation">
          {accountantMenu.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.label} type="button" className={`accountant-nav__item ${item.active ? "is-active" : ""}`}>
                <Icon />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <p className="accountant-sidebar__footer">(c) 2025 Sri Shanti Mahadev Mandir<br />All rights reserved.</p>
      </div>
    </aside>
  );
};

export default AccountantSidebar;