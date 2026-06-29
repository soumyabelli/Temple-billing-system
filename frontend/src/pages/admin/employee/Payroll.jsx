import { useCallback, useEffect, useMemo, useState } from "react";
import SectionCard from "../../../components/admin/employee/SectionCard";
import { getPayrollDashboard, payEmployeePayroll } from "../../../services/payrollService";

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatMonthKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const PAYMENT_METHODS = ["Bank Transfer", "UPI", "Cash", "Cheque", "Card", "Net Banking"];

const computeNetSalary = (employee, form) => {
  const bonus = Number(form?.bonus || 0);
  const extraDutyPay = Number(form?.extraDutyPay ?? employee.extraDutyPay ?? 0);
  return Math.round(Number(employee.baseSalary || 0) - Number(employee.deduction || 0) + extraDutyPay + bonus);
};

const Payroll = () => {
  const [monthKey, setMonthKey] = useState(formatMonthKey(new Date()));
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingId, setPayingId] = useState("");
  const [paymentForms, setPaymentForms] = useState({});

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getPayrollDashboard(monthKey);
      setDashboard(response);
      const defaults = {};
      (response.employees || []).forEach((employee) => {
        defaults[employee.employeeId] = {
          paymentMethod: employee.paymentMethod || "Bank Transfer",
          bonus: employee.bonus || 0,
          extraDutyPay: employee.extraDutyPay || 0,
          transactionId: employee.transactionId || "",
          notes: "",
        };
      });
      setPaymentForms(defaults);
    } catch (loadError) {
      setError(loadError.response?.data?.message || "Failed to load payroll data.");
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  }, [monthKey]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const summaryTiles = useMemo(() => {
    const summary = dashboard?.summary || {};
    return [
      { title: "Monthly Payroll", value: formatCurrency(summary.monthlyPayroll), accent: "bg-violet-100 text-violet-700" },
      { title: "Pending Salary", value: formatCurrency(summary.pendingSalary), accent: "bg-amber-100 text-amber-700" },
      { title: "Paid Employees", value: summary.paidEmployees || 0, accent: "bg-emerald-100 text-emerald-700" },
      { title: "Bonus Distribution", value: formatCurrency(summary.bonusDistribution), accent: "bg-sky-100 text-sky-700" },
    ];
  }, [dashboard]);

  const updatePaymentForm = (employeeId, field, value) => {
    setPaymentForms((prev) => ({
      ...prev,
      [employeeId]: {
        ...(prev[employeeId] || {}),
        [field]: value,
      },
    }));
  };

  const handlePay = async (employee) => {
    const form = paymentForms[employee.employeeId] || {};
    setPayingId(employee.employeeId);
    setError("");
    try {
      await payEmployeePayroll(employee.employeeId, {
        monthKey,
        paymentMethod: form.paymentMethod || "Bank Transfer",
        bonus: Number(form.bonus || 0),
        extraDutyPay: Number(form.extraDutyPay || 0),
        transactionId: form.transactionId || "",
        notes: form.notes || "",
      });
      await loadDashboard();
    } catch (payError) {
      setError(payError.response?.data?.message || "Failed to record salary payment.");
    } finally {
      setPayingId("");
    }
  };

  return (
    <div className="space-y-8">
      <SectionCard
        title="Payroll Management"
        subtitle="Review salary payouts based on attendance, extra duty, and process employee payments."
        className="bg-gradient-to-r from-[#241f4f] via-[#3d3491] to-[#7857d2] text-white border-transparent shadow-2xl shadow-violet-600/20"
      >
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <label className="text-sm text-white/80">
            Payroll Month
            <input
              type="month"
              value={monthKey}
              onChange={(event) => setMonthKey(event.target.value)}
              className="ml-3 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white outline-none"
            />
          </label>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {summaryTiles.map((tile) => (
            <div key={tile.title} className={`rounded-[28px] border border-white/10 px-5 py-6 ${tile.accent} bg-white/10 shadow-xl shadow-slate-900/10`}>
              <p className="text-sm uppercase tracking-[0.16em] text-slate-100/70">{tile.title}</p>
              <p className="mt-4 text-3xl font-semibold text-white">{tile.value}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[1.7fr_0.9fr]">
        <div className="space-y-5">
          <SectionCard title="Payroll Table" subtitle="Salary calculated from present, absent, leave, and admin-entered extra duty pay." className="overflow-hidden">
            <div className="overflow-x-auto rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-100 text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Employee</th>
                    <th className="px-5 py-4">Present</th>
                    <th className="px-5 py-4">Absent</th>
                    <th className="px-5 py-4">Extra Duty</th>
                    <th className="px-5 py-4">Base Salary</th>
                    <th className="px-5 py-4">Deduction</th>
                    <th className="px-5 py-4">Extra Pay</th>
                    <th className="px-5 py-4">Bonus</th>
                    <th className="px-5 py-4">Net Salary</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Pay</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="11" className="px-5 py-8 text-center text-slate-500">Loading payroll records…</td>
                    </tr>
                  ) : (dashboard?.employees || []).length === 0 ? (
                    <tr>
                      <td colSpan="11" className="px-5 py-8 text-center text-slate-500">No employee payroll records found.</td>
                    </tr>
                  ) : (
                    dashboard.employees.map((employee) => {
                      const form = paymentForms[employee.employeeId] || {};
                      const isPaid = employee.status === "Paid";
                      const previewNetSalary = isPaid ? employee.netSalary : computeNetSalary(employee, form);
                      return (
                        <tr key={employee.employeeId} className="border-b border-slate-200 hover:bg-slate-50">
                          <td className="px-5 py-4">
                            <p className="font-semibold text-slate-900">{employee.employeeName}</p>
                            <p className="text-xs text-slate-500">{employee.department}</p>
                          </td>
                          <td className="px-5 py-4">{employee.presentDays}</td>
                          <td className="px-5 py-4">{employee.absentDays}</td>
                          <td className="px-5 py-4">{employee.extraDutyDays}</td>
                          <td className="px-5 py-4">{formatCurrency(employee.baseSalary)}</td>
                          <td className="px-5 py-4">{formatCurrency(employee.deduction)}</td>
                          <td className="px-5 py-4">
                            <input
                              type="number"
                              min="0"
                              disabled={isPaid || employee.extraDutyDays === 0}
                              value={form.extraDutyPay ?? employee.extraDutyPay ?? 0}
                              onChange={(event) => updatePaymentForm(employee.employeeId, "extraDutyPay", event.target.value)}
                              className="w-24 rounded-lg border border-slate-200 px-2 py-1"
                              title={employee.extraDutyDays === 0 ? "No extra duty this month" : "Enter extra duty pay amount"}
                            />
                          </td>
                          <td className="px-5 py-4">
                            <input
                              type="number"
                              min="0"
                              disabled={isPaid}
                              value={form.bonus ?? employee.bonus ?? 0}
                              onChange={(event) => updatePaymentForm(employee.employeeId, "bonus", event.target.value)}
                              className="w-24 rounded-lg border border-slate-200 px-2 py-1"
                            />
                          </td>
                          <td className="px-5 py-4 font-semibold text-slate-900">{formatCurrency(previewNetSalary)}</td>
                          <td className="px-5 py-4">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isPaid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                              {employee.status}
                            </span>
                            {isPaid ? <p className="mt-1 text-xs text-slate-500">{employee.paymentMethod}</p> : null}
                          </td>
                          <td className="px-5 py-4">
                            {isPaid ? (
                              <span className="text-xs text-slate-500">{employee.transactionId || "Paid"}</span>
                            ) : (
                              <div className="flex min-w-[220px] flex-col gap-2">
                                <select
                                  value={form.paymentMethod || "Bank Transfer"}
                                  onChange={(event) => updatePaymentForm(employee.employeeId, "paymentMethod", event.target.value)}
                                  className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                                >
                                  {PAYMENT_METHODS.map((method) => (
                                    <option key={method} value={method}>{method}</option>
                                  ))}
                                </select>
                                <input
                                  type="text"
                                  placeholder="Transaction ID"
                                  value={form.transactionId || ""}
                                  onChange={(event) => updatePaymentForm(employee.employeeId, "transactionId", event.target.value)}
                                  className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                                />
                                <button
                                  type="button"
                                  disabled={payingId === employee.employeeId}
                                  onClick={() => handlePay(employee)}
                                  className="rounded-full bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
                                >
                                  {payingId === employee.employeeId ? "Processing…" : "Pay Salary"}
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-5">
          <SectionCard title="Growth by Department" subtitle="Payroll allocation by team." className="overflow-hidden">
            <div className="space-y-4">
              {(dashboard?.departmentBreakdown || []).length === 0 ? (
                <p className="text-sm text-slate-500">No department payroll data yet.</p>
              ) : (
                dashboard.departmentBreakdown.map((item) => (
                  <div key={item.name} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="text-sm text-slate-500">Salary cost</p>
                      </div>
                      <p className="font-semibold text-slate-900">{formatCurrency(item.value)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard title="Upcoming Salary Dates" subtitle="Employees with pending salary for this month." className="overflow-hidden">
            <div className="grid gap-4">
              {(dashboard?.upcomingPayments || []).length === 0 ? (
                <p className="text-sm text-slate-500">All salaries are paid for this month.</p>
              ) : (
                dashboard.upcomingPayments.map((item) => (
                  <div key={item.employeeId} className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="text-sm text-slate-500">{item.role}</p>
                      </div>
                      <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                        {formatCurrency(item.netSalary)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default Payroll;
