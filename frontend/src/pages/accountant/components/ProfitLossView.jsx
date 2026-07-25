import React, { useState, useEffect } from "react";
import { getProfitLoss } from "../../../services/accountService";
import { toast } from "react-toastify";
import { FaArrowUp, FaArrowDown, FaWallet } from "react-icons/fa";

const ProfitLossView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPL = async () => {
      try {
        const result = await getProfitLoss();
        setData(result);
      } catch (error) {
        toast.error("Failed to load Profit & Loss report");
      } finally {
        setLoading(false);
      }
    };
    loadPL();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading Profit & Loss...</div>;

  return (
    <div className="accountant-view">
      <section className="accountant-view__hero">
        <div>
          <h1>Profit & Loss</h1>
          <p>Financial overview of Income vs Expenses.</p>
        </div>
      </section>

      {data && (
        <>
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-green-50 border border-green-200 p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                  <FaArrowUp className="w-6 h-6" />
                </div>
                <h4 className="text-slate-600 font-medium">Total Income</h4>
              </div>
              <p className="text-3xl font-bold text-slate-800">Rs {data.totalIncome?.toLocaleString("en-IN")}</p>
            </div>
            <div className="bg-red-50 border border-red-200 p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                  <FaArrowDown className="w-6 h-6" />
                </div>
                <h4 className="text-slate-600 font-medium">Total Expenses</h4>
              </div>
              <p className="text-3xl font-bold text-slate-800">Rs {data.totalExpense?.toLocaleString("en-IN")}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                  <FaWallet className="w-6 h-6" />
                </div>
                <h4 className="text-slate-600 font-medium">Net Profit / Loss</h4>
              </div>
              <p className="text-3xl font-bold text-slate-800">Rs {data.netProfit?.toLocaleString("en-IN")}</p>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <section className="accountant-panel">
              <div className="accountant-panel__header">
                <h3 className="accountant-panel__title">Income by Source</h3>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  {Object.entries(data.incomeBySource || {}).map(([source, amt]) => (
                    <li key={source} className="flex justify-between items-center border-b pb-2">
                      <span className="text-slate-700 font-medium">{source}</span>
                      <span className="font-bold text-slate-900">Rs {amt?.toLocaleString("en-IN")}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
            
            <section className="accountant-panel">
              <div className="accountant-panel__header">
                <h3 className="accountant-panel__title">Expenses by Category</h3>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  {Object.entries(data.expenseByCategory || {}).map(([cat, amt]) => (
                    <li key={cat} className="flex justify-between items-center border-b pb-2">
                      <span className="text-slate-700 font-medium">{cat}</span>
                      <span className="font-bold text-slate-900">Rs {amt?.toLocaleString("en-IN")}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfitLossView;
