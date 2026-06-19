const buildGradientStops = (segments) => {
  const total = segments.reduce((sum, segment) => sum + Number(segment.value || 0), 0) || 1;
  let cursor = 0;

  return segments
    .map((segment) => {
      const degrees = (Number(segment.value || 0) / total) * 360;
      const start = cursor;
      const end = cursor + degrees;
      cursor = end;
      return `${segment.color} ${start}deg ${end}deg`;
    })
    .join(", ");
};

const AccountantDonutCard = ({
  title,
  subtitle,
  segments = [],
  centerValue,
  centerLabel,
}) => {
  const gradient = buildGradientStops(segments);
  const backgroundStyle = gradient ? `conic-gradient(${gradient})` : "linear-gradient(180deg, #ffbd61 0%, #ff8b1f 100%)";

  return (
    <section className="accountant-panel accountant-donut-card">
      <div className="accountant-panel__header">
        <div>
          <p className="accountant-panel__eyebrow">{subtitle}</p>
          <h3 className="accountant-panel__title">{title}</h3>
        </div>
      </div>

      <div className="accountant-donut">
        <div className="accountant-donut__figure" style={{ background: backgroundStyle }}>
          <div className="accountant-donut__center">
            <strong>{centerValue}</strong>
            <span>{centerLabel}</span>
          </div>
        </div>

        <div className="accountant-donut__legend">
          {segments.map((segment) => (
            <div key={segment.label} className="accountant-donut__legend-item">
              <span className="accountant-donut__legend-label">
                <i className="accountant-donut__dot" style={{ backgroundColor: segment.color }} />
                {segment.label}
              </span>
              <strong>{segment.valueText || `${segment.value}%`}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AccountantDonutCard;
