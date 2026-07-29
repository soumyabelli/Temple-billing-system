import React, { useState, useEffect } from "react";
import { getMonthlyReport, getAnnualReport, getProfitLoss } from "../../../services/accountService";
import ProfitLossView from "../../accountant/components/ProfitLossView";
import { useAuth } from "../../../context/AuthContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FiDownload } from "react-icons/fi";
import { toast } from "react-toastify";

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

  if (loading) return <div className="p-8 text-center text-slate-600 dark:text-white/70">Loading Monthly Report...</div>;

  return (
    <div className="overflow-x-auto">
      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Monthly Financial Breakdown</h3>
      <table className="w-full text-left text-sm text-slate-800 dark:text-white">
        <thead className="bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white/90">
          <tr>
            <th className="px-6 py-4 font-semibold">Month</th>
            <th className="px-6 py-4 font-semibold text-emerald-600 dark:text-emerald-400">Income (Rs)</th>
            <th className="px-6 py-4 font-semibold text-red-600 dark:text-red-400">Expense (Rs)</th>
            <th className="px-6 py-4 font-semibold text-blue-600 dark:text-blue-400">Net Balance (Rs)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-white/10">
          {data.map((row, idx) => {
            const net = row.income - row.expense;
            return (
              <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-medium">{row.month}</td>
                <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400">{row.income.toLocaleString("en-IN")}</td>
                <td className="px-6 py-4 text-red-600 dark:text-red-400">{row.expense.toLocaleString("en-IN")}</td>
                <td className={`px-6 py-4 font-semibold ${net >= 0 ? "text-blue-600 dark:text-blue-400" : "text-orange-500 dark:text-orange-400"}`}>
                  {net.toLocaleString("en-IN")}
                </td>
              </tr>
            );
          })}
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

  if (loading) return <div className="p-8 text-center text-slate-600 dark:text-white/70">Loading Annual Report...</div>;

  return (
    <div>
      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Annual Summary</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 p-6 rounded-2xl text-center">
          <h4 className="text-emerald-800 dark:text-emerald-300 font-semibold mb-2">Total Income</h4>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">Rs {data?.totalIncome?.toLocaleString("en-IN") || 0}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 p-6 rounded-2xl text-center">
          <h4 className="text-red-800 dark:text-red-300 font-semibold mb-2">Total Expense</h4>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">Rs {data?.totalExpense?.toLocaleString("en-IN") || 0}</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 p-6 rounded-2xl text-center">
          <h4 className="text-blue-800 dark:text-blue-300 font-semibold mb-2">Net Profit</h4>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">Rs {data?.netProfit?.toLocaleString("en-IN") || 0}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h4 className="font-semibold text-slate-700 dark:text-white/80 mb-3 border-b border-slate-200 dark:border-white/20 pb-2">Income Sources</h4>
          <ul className="space-y-2">
            {data?.incomeBySource && Object.entries(data.incomeBySource).length > 0 ? (
              Object.entries(data.incomeBySource).map(([source, amt], idx) => (
                <li key={idx} className="flex justify-between text-slate-600 dark:text-white/70">
                  <span>{source || "Other"}</span>
                  <span className="font-medium">Rs {amt.toLocaleString("en-IN")}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-500">No data available</li>
            )}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-slate-700 dark:text-white/80 mb-3 border-b border-slate-200 dark:border-white/20 pb-2">Expense Categories</h4>
          <ul className="space-y-2">
            {data?.expenseByCategory && Object.entries(data.expenseByCategory).length > 0 ? (
              Object.entries(data.expenseByCategory).map(([category, amt], idx) => (
                <li key={idx} className="flex justify-between text-slate-600 dark:text-white/70">
                  <span>{category || "Other"}</span>
                  <span className="font-medium">Rs {amt.toLocaleString("en-IN")}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-500">No data available</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

const FinancialReports = () => {
  const [activeTab, setActiveTab] = useState("pnl");
  const { user } = useAuth();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Temple Financial Audit Report", 14, 22);
      
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

      // Fetch Annual data
      const annualData = await getAnnualReport();
      const monthlyData = await getMonthlyReport();

      // Annual Summary Table
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("Annual Summary", 14, 45);
      
      const summaryBody = [
        ["Total Income", `Rs ${annualData.totalIncome?.toLocaleString("en-IN") || 0}`],
        ["Total Expense", `Rs ${annualData.totalExpense?.toLocaleString("en-IN") || 0}`],
        ["Net Profit", `Rs ${annualData.netProfit?.toLocaleString("en-IN") || 0}`],
      ];

      autoTable(doc, {
        startY: 50,
        head: [["Metric", "Amount"]],
        body: summaryBody,
        theme: "grid",
        headStyles: { fillColor: [245, 158, 11] }, // Amber 500
      });

      // Monthly Breakdown Table
      const finalY = doc.lastAutoTable?.finalY || 50 + summaryBody.length * 10;
      doc.setFontSize(14);
      doc.text("Monthly Breakdown", 14, finalY + 15);

      const monthlyBody = monthlyData.map(row => [
        row.month,
        `Rs ${row.income.toLocaleString("en-IN")}`,
        `Rs ${row.expense.toLocaleString("en-IN")}`,
        `Rs ${(row.income - row.expense).toLocaleString("en-IN")}`
      ]);

      autoTable(doc, {
        startY: finalY + 20,
        head: [["Month", "Income", "Expense", "Net Balance"]],
        body: monthlyBody,
        theme: "striped",
        headStyles: { fillColor: [30, 41, 59] }, // Slate 800
      });

      // Income Sources
      const finalY2 = doc.lastAutoTable?.finalY || finalY + 50;
      doc.setFontSize(14);
      doc.text("Income Sources Breakdown", 14, finalY2 + 15);

      const incomeBody = Object.entries(annualData.incomeBySource || {}).map(([source, amt]) => [
        source,
        `Rs ${amt.toLocaleString("en-IN")}`
      ]);

      autoTable(doc, {
        startY: finalY2 + 20,
        head: [["Source", "Total Income"]],
        body: incomeBody.length > 0 ? incomeBody : [["No data", "Rs 0"]],
        theme: "grid",
        headStyles: { fillColor: [16, 185, 129] }, // Emerald 500
      });

      // Expense Categories
      const finalY3 = doc.lastAutoTable?.finalY || finalY2 + 50;
      doc.setFontSize(14);
      doc.text("Expense Categories Breakdown", 14, finalY3 + 15);

      const expenseBody = Object.entries(annualData.expenseByCategory || {}).map(([category, amt]) => [
        category,
        `Rs ${amt.toLocaleString("en-IN")}`
      ]);

      autoTable(doc, {
        startY: finalY3 + 20,
        head: [["Category", "Total Expense"]],
        body: expenseBody.length > 0 ? expenseBody : [["No data", "Rs 0"]],
        theme: "grid",
        headStyles: { fillColor: [239, 68, 68] }, // Red 500
      });

      doc.save(`Audit_Report_${new Date().getTime()}.pdf`);
      toast.success("Audit Report downloaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Financial Reports</h2>
        
        {user?.role === "admin" && (
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow disabled:opacity-50"
          >
            <FiDownload />
            {isDownloading ? "Generating..." : "Download Audit Report (PDF)"}
          </button>
        )}
      </div>
      
      <div className="flex gap-4 mb-6 border-b border-slate-200 dark:border-white/20 pb-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab("pnl")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeTab === "pnl" ? "bg-amber-500 text-white" : "text-slate-600 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Profit & Loss
        </button>
        <button
          onClick={() => setActiveTab("monthly")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeTab === "monthly" ? "bg-amber-500 text-white" : "text-slate-600 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Monthly Report
        </button>
        <button
          onClick={() => setActiveTab("annual")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeTab === "annual" ? "bg-amber-500 text-white" : "text-slate-600 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Annual Report
        </button>
      </div>

      <div className="bg-white dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/20 p-6 rounded-2xl shadow-xl min-h-[400px]">
        {activeTab === "pnl" && <ProfitLossView hideHeader={true} />}
        {activeTab === "monthly" && <MonthlyReportView />}
        {activeTab === "annual" && <AnnualReportView />}
      </div>
    </div>
  );
};

export default FinancialReports;
