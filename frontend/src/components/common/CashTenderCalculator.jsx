import React from 'react';
import { FaMoneyBillWave, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const CashTenderCalculator = ({ totalAmount, cashTendered, onChange }) => {
  const total = Number(totalAmount) || 0;
  const numericTendered = cashTendered === "" ? total : Number(cashTendered) || 0;
  const changeDue = Math.max(0, numericTendered - total);
  const shortage = Math.max(0, total - numericTendered);

  // Generate smart quick cash suggestions
  const getSuggestions = () => {
    if (total <= 0) return [];
    const list = new Set();
    list.add(total); // Exact

    // Round up to next 10
    if (total % 10 !== 0) list.add(Math.ceil(total / 10) * 10);
    // Round up to next 50
    if (total % 50 !== 0) list.add(Math.ceil(total / 50) * 50);
    // Round up to next 100
    if (total % 100 !== 0) list.add(Math.ceil(total / 100) * 100);
    // Common notes higher than total
    if (total < 500) list.add(500);
    if (total < 1000) list.add(1000);
    if (total < 2000) list.add(2000);

    return Array.from(list).sort((a, b) => a - b).slice(0, 6);
  };

  const suggestions = getSuggestions();

  return (
    <div className="mt-3 rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/20 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-sm">
          <FaMoneyBillWave className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>Cash Tender & Change Calculator</span>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
          Bill: ₹{total.toFixed(2)}
        </span>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Cash Received from Devotee (₹)
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
          <input
            type="number"
            min="0"
            step="1"
            value={cashTendered}
            onChange={(e) => onChange(e.target.value)}
            placeholder={total.toString()}
            className="w-full pl-8 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-xl text-slate-900 dark:text-white font-bold text-lg outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Quick Cash Buttons */}
      {suggestions.length > 0 && (
        <div>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
            Quick Tender Suggestions:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => onChange(val.toString())}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  numericTendered === val
                    ? "bg-amber-500 text-white shadow-sm"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-amber-200 dark:border-slate-700 hover:bg-amber-100 dark:hover:bg-slate-700"
                }`}
              >
                {val === total ? `Exact: ₹${val}` : `₹${val}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Change / Shortage Output */}
      {cashTendered !== "" && (
        <div>
          {numericTendered >= total ? (
            <div className="p-3 rounded-xl bg-green-100 dark:bg-green-950/40 border border-green-300 dark:border-green-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-green-900 dark:text-green-200">
                    Change to Return to Devotee
                  </p>
                  <p className="text-[11px] text-green-700 dark:text-green-300">
                    Devotee gives ₹{numericTendered} → Return ₹{changeDue.toFixed(2)}
                  </p>
                </div>
              </div>
              <span className="text-xl font-extrabold text-green-800 dark:text-green-300">
                ₹{changeDue.toFixed(2)}
              </span>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950/40 border border-red-300 dark:border-red-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaExclamationCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-red-900 dark:text-red-200">
                    Insufficient Cash
                  </p>
                  <p className="text-[11px] text-red-700 dark:text-red-300">
                    Devotee gave ₹{numericTendered} of ₹{total}
                  </p>
                </div>
              </div>
              <span className="text-sm font-bold text-red-800 dark:text-red-300">
                Need ₹{shortage.toFixed(2)} more
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CashTenderCalculator;
