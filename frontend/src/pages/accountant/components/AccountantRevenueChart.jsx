import { FaCalendarAlt, FaChevronDown } from "react-icons/fa";

const AccountantRevenueChart = ({
  title = "Daily Collection Overview",
  subtitle = "Temple collections",
  points = [],
  rangeLabel = "This Week",
  summaryLabel = "Today's collection",
  summaryValue = "Rs 25,000",
  trendLabel = "+12.5% from yesterday",
}) => {
  const maxValue = Math.max(...points.map((point) => Number(point.value || 0)), 1);

  return (
    <section className="accountant-panel accountant-chart-card">
      <div className="accountant-panel__header">
        <div>
          <p className="accountant-panel__eyebrow">{subtitle}</p>
          <h3 className="accountant-panel__title">{title}</h3>
        </div>

        <button type="button" className="accountant-panel__filter">
          <FaCalendarAlt />
          <span>{rangeLabel}</span>
          <FaChevronDown />
        </button>
      </div>

      <div className="accountant-chart-card__summary">
        <div>
          <span>{summaryLabel}</span>
          <strong>{summaryValue}</strong>
        </div>
        <div className="is-positive">
          <span>Trend</span>
          <strong>{trendLabel}</strong>
        </div>
      </div>

      <div className="accountant-bar-chart" role="img" aria-label={title}>
        {points.map((point) => (
          <div key={point.label} className="accountant-bar-chart__column">
            <div className="accountant-bar-chart__track">
              <div
                className="accountant-bar-chart__bar"
                style={{ height: `${(Number(point.value || 0) / maxValue) * 100}%` }}
              />
            </div>
            <span>{point.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AccountantRevenueChart;

