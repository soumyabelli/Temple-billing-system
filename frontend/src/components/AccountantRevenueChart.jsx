const weekRevenue = [56800, 80500, 67500, 64300, 69500, 57600, 62000];
const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const maxRevenue = Math.max(...weekRevenue);

const AccountantRevenueChart = () => {
  return (
    <div className="accountant-panel">
      <div className="accountant-panel__header">
        <h3>Revenue Summary <span>(This Week)</span></h3>
        <button type="button">This Week</button>
      </div>

      <div className="accountant-bar-chart" role="img" aria-label="Weekly revenue bar chart">
        {weekRevenue.map((value, index) => (
          <div key={labels[index]} className="accountant-bar-chart__column">
            <div className="accountant-bar-chart__track">
              <div className="accountant-bar-chart__bar" style={{ height: `${(value / maxRevenue) * 100}%` }} />
            </div>
            <span>{labels[index]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountantRevenueChart;