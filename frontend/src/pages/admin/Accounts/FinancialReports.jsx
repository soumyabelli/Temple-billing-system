import React, { useState, useEffect } from "react";
import { getMonthlyReport, getAnnualReport, getProfitLoss } from "../../../services/accountService";
import ProfitLossView from "../../accountant/components/ProfitLossView";
import { useAuth } from "../../../context/AuthContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FiDownload, FiArrowLeft } from "react-icons/fi";
import { toast } from "react-toastify";
import { 
  BiCalendar, BiCalendarCheck, BiChart, BiWallet, 
  BiBookAlt, BiBuilding, BiMoney, BiCreditCard, 
  BiReceipt, BiArchive, BiUserCheck, BiCheckShield 
} from "react-icons/bi";

const MonthlyReportView = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMonthly = async () => {
      try {
        const result = await getMonthlyReport();
        setData(result);
      } catch (error) {
        toast.error("Failed to load Monthly Report");
      } finally {
        setLoading(false);
      }
    };
    loadMonthly();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-600">Loading Monthly Report...</div>;

  return (
    <div className="overflow-x-auto bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h3 className="text-xl font-bold text-slate-800 mb-6">Monthly Financial Breakdown</h3>
      <table className="w-full text-left text-sm text-slate-800">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-6 py-4 font-semibold uppercase text-xs tracking-wider">Month</th>
            <th className="px-6 py-4 font-semibold uppercase text-xs tracking-wider text-emerald-600">Income (₹)</th>
            <th className="px-6 py-4 font-semibold uppercase text-xs tracking-wider text-red-600">Expense (₹)</th>
            <th className="px-6 py-4 font-semibold uppercase text-xs tracking-wider text-blue-600">Net Balance (₹)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 font-medium">{row.month}</td>
              <td className="px-6 py-4 text-emerald-700 font-medium">{row.income.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
              <td className="px-6 py-4 text-red-700 font-medium">{row.expense.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
              <td className={`px-6 py-4 font-bold ${row.netBalance >= 0 ? "text-blue-700" : "text-orange-600"}`}>
                {row.netBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AnnualReportView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnnual = async () => {
      try {
        const result = await getAnnualReport();
        setData(result);
      } catch (error) {
        toast.error("Failed to load Annual Report");
      } finally {
        setLoading(false);
      }
    };
    loadAnnual();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-600">Loading Annual Report...</div>;
  if (!data) return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h3 className="text-xl font-bold text-slate-800 mb-6">Annual Financial Summary</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-100">
          <p className="text-emerald-700 font-medium mb-2 text-sm uppercase tracking-wider">Total Income</p>
          <p className="text-3xl font-bold text-emerald-800">₹{data.totalIncome.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="p-6 rounded-xl bg-red-50 border border-red-100">
          <p className="text-red-700 font-medium mb-2 text-sm uppercase tracking-wider">Total Expense</p>
          <p className="text-3xl font-bold text-red-800">₹{data.totalExpense.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="p-6 rounded-xl bg-blue-50 border border-blue-100">
          <p className="text-blue-700 font-medium mb-2 text-sm uppercase tracking-wider">Net Profit</p>
          <p className="text-3xl font-bold text-blue-800">₹{data.netProfit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h4 className="font-bold text-slate-800 mb-4 pb-2 border-b border-slate-200">Top Income Sources</h4>
          <ul className="space-y-3">
            {data.incomeBreakdown.map((item, i) => (
              <li key={i} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                <span className="text-slate-600 font-medium">{item._id}</span>
                <span className="font-bold text-emerald-600">₹{item.amount.toLocaleString("en-IN")}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-slate-800 mb-4 pb-2 border-b border-slate-200">Top Expense Categories</h4>
          <ul className="space-y-3">
            {data.expenseBreakdown.map((item, i) => (
              <li key={i} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                <span className="text-slate-600 font-medium">{item._id}</span>
                <span className="font-bold text-red-600">₹{item.amount.toLocaleString("en-IN")}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const FinancialReports = () => {
  const { role } = useAuth();
  const [selectedReport, setSelectedReport] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const annualData = await getAnnualReport();
      const monthlyData = await getMonthlyReport();

      const doc = new jsPDF();
      
      // Document Title
      doc.setFontSize(22);
      doc.setTextColor(40, 40, 40);
      doc.text("Temple Billing - Audit Report", 14, 20);
      
      // Summary Details
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      
      // Annual Summary Highlights
      doc.setFontSize(14);
      doc.setTextColor(20, 20, 20);
      doc.text("Annual Summary Highlights", 14, 45);
      
      doc.setFontSize(12);
      doc.setTextColor(0, 128, 0); // Green for income
      doc.text(`Total Income: Rs ${annualData.totalIncome.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 14, 55);
      
      doc.setTextColor(200, 0, 0); // Red for expense
      doc.text(`Total Expense: Rs ${annualData.totalExpense.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 14, 63);
      
      doc.setTextColor(0, 0, 200); // Blue for net
      doc.text(`Net Profit: Rs ${annualData.netProfit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 14, 71);

      // Monthly Table
      const tableColumn = ["Month", "Income (Rs)", "Expense (Rs)", "Net Balance (Rs)"];
      const tableRows = [];

      monthlyData.forEach(row => {
        const rowData = [
          row.month,
          row.income.toLocaleString("en-IN", { minimumFractionDigits: 2 }),
          row.expense.toLocaleString("en-IN", { minimumFractionDigits: 2 }),
          row.netBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })
        ];
        tableRows.push(rowData);
      });

      autoTable(doc, {
        startY: 85,
        head: [tableColumn],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        styles: { fontSize: 10, cellPadding: 5 },
      });

      let finalY = doc.lastAutoTable.finalY;

      // Income Sources Breakdown Table
      doc.setFontSize(14);
      doc.setTextColor(20, 20, 20);
      doc.text("Income Sources Breakdown", 14, finalY + 15);

      const incomeColumns = ["Income Source", "Amount (Rs)"];
      const incomeRows = annualData.incomeBreakdown.map(item => [
        item._id,
        item.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })
      ]);

      autoTable(doc, {
        startY: finalY + 20,
        head: [incomeColumns],
        body: incomeRows,
        theme: 'grid',
        headStyles: { fillColor: [39, 174, 96], textColor: 255 },
        styles: { fontSize: 10, cellPadding: 4 },
      });

      let finalY2 = doc.lastAutoTable.finalY;

      // Expense Categories Breakdown Table
      doc.setFontSize(14);
      doc.setTextColor(20, 20, 20);
      doc.text("Expense Categories Breakdown", 14, finalY2 + 15);

      const expenseColumns = ["Expense Category", "Amount (Rs)"];
      const expenseRows = annualData.expenseBreakdown.map(item => [
        item._id,
        item.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })
      ]);

      autoTable(doc, {
        startY: finalY2 + 20,
        head: [expenseColumns],
        body: expenseRows,
        theme: 'grid',
        headStyles: { fillColor: [192, 57, 43], textColor: 255 },
        styles: { fontSize: 10, cellPadding: 4 },
      });

      doc.save("Audit_Report_Temple_Billing.pdf");
      toast.success("Audit Report Downloaded Successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const reportCards = [
    { id: "daily", title: "Daily Report", icon: BiCalendar, color: "text-purple-500", bg: "bg-purple-50", desc: "View day-wise income, expense and balance." },
    { id: "monthly", title: "Monthly Report", icon: BiCalendarCheck, color: "text-emerald-500", bg: "bg-emerald-50", desc: "View month-wise financial summary." },
    { id: "annual", title: "Annual Report", icon: BiChart, color: "text-red-500", bg: "bg-red-50", desc: "View year-wise financial summary." },
    { id: "pnl", title: "Profit & Loss", icon: BiWallet, color: "text-orange-500", bg: "bg-orange-50", desc: "View profit and loss statement." },
    { id: "balance", title: "Balance Sheet", icon: BiBookAlt, color: "text-blue-500", bg: "bg-blue-50", desc: "View balance sheet statement." },
    { id: "cash", title: "Cash Book", icon: BiMoney, color: "text-green-500", bg: "bg-green-50", desc: "View cash book report." },
    { id: "bank", title: "Bank Book", icon: BiBuilding, color: "text-indigo-500", bg: "bg-indigo-50", desc: "View bank book report." },
    { id: "invexp", title: "Income vs Expense", icon: BiCreditCard, color: "text-rose-500", bg: "bg-rose-50", desc: "View income vs expense analysis." },
    { id: "donation", title: "Donation Report", icon: BiReceipt, color: "text-pink-500", bg: "bg-pink-50", desc: "View donation summary report." },
    { id: "inventory", title: "Inventory Expense", icon: BiArchive, color: "text-amber-500", bg: "bg-amber-50", desc: "View inventory expense report." },
    { id: "salary", title: "Salary Report", icon: BiUserCheck, color: "text-cyan-500", bg: "bg-cyan-50", desc: "View salary payment report." },
    { id: "audit", title: "Audit Report", icon: BiCheckShield, color: "text-emerald-600", bg: "bg-emerald-100", desc: "View audit trail and summary." },
  ];

  const handleCardClick = (id) => {
    if (id === "pnl") setSelectedReport("Profit & Loss");
    else if (id === "monthly") setSelectedReport("Monthly Report");
    else if (id === "annual") setSelectedReport("Annual Report");
    else if (id === "audit") {
      if (role === "admin") handleExportPDF();
      else toast.error("Only Admins can download the Audit Report");
    }
    else toast.info("Report coming soon!");
  };

  return (
    <div className="p-4 md:p-8 bg-[#faf9f7] min-h-screen font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          {selectedReport ? (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedReport(null)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600"
              >
                <FiArrowLeft size={24} />
              </button>
              <h1 className="text-2xl font-bold text-[#1d1b19]">{selectedReport}</h1>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-[#1d1b19]">Reports</h1>
              <p className="text-sm text-[#5c6675]">Accounts & Finance &gt; Reports</p>
            </>
          )}
        </div>

        {selectedReport === "Monthly Report" || selectedReport === "Annual Report" ? (
          <button 
            onClick={handleExportPDF}
            disabled={isExporting || role !== "admin"}
            className="flex items-center gap-2 bg-[#ff8b00] hover:bg-[#e67a00] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 shadow-sm"
          >
            <FiDownload /> {isExporting ? "Exporting..." : "Export Audit PDF"}
          </button>
        ) : null}
      </div>

      {selectedReport === "Profit & Loss" ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <ProfitLossView hideHeader={true} />
        </div>
      ) : selectedReport === "Monthly Report" ? (
        <MonthlyReportView />
      ) : selectedReport === "Annual Report" ? (
        <AnnualReportView />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reportCards.map((card) => (
            <div key={card.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.bg} ${card.color}`}>
                  <card.icon size={24} />
                </div>
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-2">{card.title}</h3>
              <p className="text-sm text-slate-500 mb-6 min-h-[40px]">{card.desc}</p>
              
              <button 
                onClick={() => handleCardClick(card.id)}
                className="text-sm font-bold text-[#ff8b00] hover:text-[#e67a00] flex items-center gap-1 transition-colors group"
              >
                View Report 
                <FiArrowLeft className="rotate-180 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FinancialReports;
