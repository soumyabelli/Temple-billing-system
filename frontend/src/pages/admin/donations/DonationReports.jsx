import { useEffect, useState } from "react";
import axios from "axios";
import SectionCard from "../../../components/admin/employee/SectionCard";
import DonationPageShell from "../../../components/admin/donations/DonationPageShell";

const DonationReports = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/donations");
      setDonations(Array.isArray(res.data?.donations) ? res.data.donations : []);
    } catch (error) {
      console.error("Unable to load donation reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const buildReportHtml = () => {
    const rows = donations
      .map(
        (donation) => `
          <tr>
            <td style="padding:10px;border:1px solid #d1d5db">${donation._id?.slice(-8).toUpperCase() || "—"}</td>
            <td style="padding:10px;border:1px solid #d1d5db">${donation.donorName || "—"}</td>
            <td style="padding:10px;border:1px solid #d1d5db">${donation.category || "—"}</td>
            <td style="padding:10px;border:1px solid #d1d5db">₹${donation.amount?.toLocaleString() || "0"}</td>
            <td style="padding:10px;border:1px solid #d1d5db">${donation.paymentMethod || "—"}</td>
            <td style="padding:10px;border:1px solid #d1d5db">${donation.transactionId || "—"}</td>
            <td style="padding:10px;border:1px solid #d1d5db">${new Date(donation.createdAt || Date.now()).toLocaleDateString()}</td>
            <td style="padding:10px;border:1px solid #d1d5db">${donation.status || "—"}</td>
          </tr>`
      )
      .join("");

    return `
      <html>
        <head>
          <title>Donation Report</title>
          <style>
            body { font-family: Arial, sans-serif; color: #0f172a; padding: 24px; }
            h1 { font-size: 28px; margin-bottom: 8px; }
            p { color: #475569; margin-bottom: 24px; }
            table { border-collapse: collapse; width: 100%; margin-top: 16px; }
            th, td { border: 1px solid #d1d5db; padding: 10px; text-align: left; }
            th { background: #f8fafc; }
          </style>
        </head>
        <body>
          <h1>Donation Report</h1>
          <p>Generated on ${new Date().toLocaleString()} — total records: ${donations.length}</p>
          <table>
            <thead>
              <tr>
                <th>Receipt ID</th>
                <th>Donor</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Transaction ID</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
          <p style="margin-top:24px; color:#64748b">Use your browser print dialog to save this report as PDF.</p>
        </body>
      </html>`;
  };

  const handleViewReport = () => {
    const reportWindow = window.open("", "DonationReport");
    if (!reportWindow) return;
    reportWindow.document.write(buildReportHtml());
    reportWindow.document.close();
  };

  const handleExportPdf = () => {
    const reportWindow = window.open("", "DonationReportPdf");
    if (!reportWindow) return;
    reportWindow.document.write(buildReportHtml());
    reportWindow.document.close();
    reportWindow.onload = () => reportWindow.print();
  };

  return (
    <DonationPageShell
      title="Donation Reports"
      subtitle="Generate PDF, Excel and CSV reports for temple finance, festivals and donors."
      actions={
        <div className="flex flex-col gap-3 sm:flex-row">
          <button onClick={handleViewReport} className="rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-200">
            View Report
          </button>
          <button onClick={handleExportPdf} className="rounded-2xl bg-amber-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-300">
            Save as PDF
          </button>
        </div>
      }
    >
      <SectionCard title="Report Center" subtitle="Choose a report type and generate a shareable preview.">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-slate-950/10 p-5">
            <p className="text-sm text-slate-400">Donation report count</p>
            <p className="mt-3 text-3xl font-semibold text-white">{donations.length}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-950/10 p-5">
            <p className="text-sm text-slate-400">Last refresh</p>
            <p className="mt-3 text-xl text-white">
              {loading ? "Loading..." : new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Report Actions" subtitle="Use this export panel to preview and print live donation records." className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-slate-950/10 p-5">
          <p className="text-sm text-slate-400">View a formatted report in a new window.</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-950/10 p-5">
          <p className="text-sm text-slate-400">Export directly to PDF via browser print dialog.</p>
        </div>
      </SectionCard>
    </DonationPageShell>
  );
};

export default DonationReports;
