import { useEffect, useMemo, useState } from "react";
import { getPrasadamOrders } from "../../services/devoteeService";

const inventoryItems = [
  { name: "Ghee Bottles", stock: 8, unitPrice: 280 },
  { name: "Camphor Packs", stock: 5, unitPrice: 120 },
  { name: "Agarbatti Boxes", stock: 11, unitPrice: 45 },
  { name: "Coconut Stock", stock: 7, unitPrice: 40 },
  { name: "Laddu Packets", stock: 14, unitPrice: 55 },
];

const formatCurrency = (value) => `₹ ${Number(value || 0).toLocaleString()}`;

const InventoryManagement = () => {
  const [prasadamOrders, setPrasadamOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getPrasadamOrders();
        setPrasadamOrders(res.orders || []);
      } catch (error) {
        console.warn("Unable to load prasadam data", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const lowStockItems = useMemo(
    () => inventoryItems.filter((item) => item.stock <= 8),
    []
  );

  const totalInventoryValue = useMemo(
    () => inventoryItems.reduce((sum, item) => sum + item.stock * item.unitPrice, 0),
    []
  );

  const totalPrasadamRevenue = useMemo(
    () => prasadamOrders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0),
    [prasadamOrders]
  );

  const recentOrders = useMemo(
    () => prasadamOrders
      .slice(0, 8)
      .map((order) => ({
        id: order._id,
        item: order.itemName,
        qty: order.quantity,
        price: order.totalPrice,
        status: order.status || "Pending",
        date: order.createdAt || order.updatedAt || "",
      })),
    [prasadamOrders]
  );

  return (
    <div className="mt-5 space-y-6">
      <div className="rounded-2xl border border-[#ece8e1] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-[42px] font-bold text-[#111827]">Prasadam & Inventory</h1>
            <p className="mt-2 text-[#525252]">Manage stock levels, prasadam orders, and low-stock alerts from one dashboard.</p>
          </div>
          <div className="rounded-3xl bg-[#fffbeb] px-5 py-3 text-sm font-semibold text-[#92400e]">Live order and stock overview</div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-[#e5e7eb] bg-[#f8fafc] p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-[#475569]">Inventory value</p>
            <p className="mt-4 text-[2rem] font-bold text-[#0f172a]">{formatCurrency(totalInventoryValue)}</p>
            <p className="mt-2 text-sm text-[#475569]">Estimated value of current stock.</p>
          </div>
          <div className="rounded-3xl border border-[#e5e7eb] bg-white p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-[#475569]">Total items</p>
            <p className="mt-4 text-[2rem] font-bold text-[#0f172a]">{inventoryItems.length}</p>
            <p className="mt-2 text-sm text-[#475569]">Different inventory SKUs in the temple store.</p>
          </div>
          <div className="rounded-3xl border border-[#e5e7eb] bg-white p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-[#475569]">Low stock alerts</p>
            <p className="mt-4 text-[2rem] font-bold text-[#0f172a]">{lowStockItems.length}</p>
            <p className="mt-2 text-sm text-[#475569]">Items that need replenishment soon.</p>
          </div>
          <div className="rounded-3xl border border-[#e5e7eb] bg-white p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-[#475569]">Prasadam revenue</p>
            <p className="mt-4 text-[2rem] font-bold text-[#0f172a]">{formatCurrency(totalPrasadamRevenue)}</p>
            <p className="mt-2 text-sm text-[#475569]">Current prasadam order income.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-2xl border border-[#ece8e1] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-[#111827]">Inventory Stock</h2>
          <p className="mt-2 text-sm text-[#64748b]">Monitor each pooja supply and reorder in time.</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {inventoryItems.map((item) => (
              <div key={item.name} className="rounded-3xl border border-[#e2e8f0] bg-[#f8fafc] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[#0f172a]">{item.name}</p>
                    <p className="mt-2 text-sm text-[#475569]">Unit price {formatCurrency(item.unitPrice)}</p>
                  </div>
                  <span className={`rounded-2xl px-3 py-1 text-sm font-semibold ${item.stock <= 6 ? "bg-[#fee2e2] text-[#b91c1c]" : item.stock <= 10 ? "bg-[#fef3c7] text-[#92400e]" : "bg-[#d1fae5] text-[#166534]"}`}>
                    {item.stock} left
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#ece8e1] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-[#111827]">Low Stock Alerts</h2>
          <p className="mt-2 text-sm text-[#64748b]">Keep an eye on items running low before stockouts.</p>
          <div className="mt-5 space-y-3">
            {lowStockItems.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-3xl border border-[#f1f5f9] bg-[#fff7ed] px-4 py-4">
                <div>
                  <p className="font-semibold text-[#92400e]">{item.name}</p>
                  <p className="text-sm text-[#6b7280]">Reorder when below 5 units</p>
                </div>
                <span className="font-bold text-[#b91c1c]">{item.stock}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#ece8e1] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#111827]">Recent Prasadam Orders</h2>
            <p className="mt-2 text-sm text-[#64748b]">Latest orders coming through the platform.</p>
          </div>
          <span className="rounded-full bg-[#eef2ff] px-3 py-1 text-sm font-semibold text-[#3730a3]">{prasadamOrders.length} orders</span>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm text-[#334155]">
            <thead className="border-b border-[#e2e8f0] text-[#475569]">
              <tr>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="px-4 py-6 text-center text-sm text-[#64748b]">Loading orders…</td></tr>
              ) : recentOrders.length === 0 ? (
                <tr><td colSpan="5" className="px-4 py-6 text-center text-sm text-[#64748b]">No prasadam orders yet.</td></tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc]">
                    <td className="px-4 py-4 font-semibold text-[#0f172a]">{order.item}</td>
                    <td className="px-4 py-4">{order.qty}</td>
                    <td className="px-4 py-4 font-semibold text-[#0f172a]">{formatCurrency(order.price)}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${order.status === "Cancelled" ? "bg-[#fee2e2] text-[#b91c1c]" : order.status === "Completed" ? "bg-[#d1fae5] text-[#166534]" : "bg-[#fef3c7] text-[#92400e]"}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">{order.date ? new Date(order.date).toLocaleString() : "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;
