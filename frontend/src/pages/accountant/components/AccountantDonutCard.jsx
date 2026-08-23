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
    <section className="accountant-panel accountant-donut-card relative overflow-hidden rounded-[24px] border border-amber-200/70 bg-white/80 p-6 backdrop-blur-xl shadow-lg shadow-amber-950/5 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-600/15 hover:-translate-y-1">
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-amber-400/15 to-orange-500/0 blur-2xl" />
      <div className="accountant-panel__header mb-4">
        <div>
          <p className="accountant-panel__eyebrow text-xs font-bold uppercase tracking-wider text-amber-900/60">{subtitle}</p>
          <h3 className="accountant-panel__title text-xl font-bold font-serif text-slate-900">{title}</h3>
        </div>
      </div>

      <div className="accountant-donut flex flex-col md:flex-row items-center gap-6">
        <div className="accountant-donut__figure relative flex h-40 w-40 shrink-0 items-center justify-center rounded-full shadow-inner p-3" style={{ background: backgroundStyle }}>
          <div className="accountant-donut__center flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white/95 backdrop-blur-md text-center shadow-md">
            <strong className="text-xl font-extrabold text-slate-900 leading-none">{centerValue}</strong>
            <span className="mt-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{centerLabel}</span>
          </div>
        </div>

        <div className="accountant-donut__legend w-full space-y-2.5">
          {segments.map((segment) => (
            <div key={segment.label} className="accountant-donut__legend-item flex items-center justify-between rounded-xl bg-amber-50/50 p-2.5 border border-amber-100/60">
              <span className="accountant-donut__legend-label flex items-center gap-2 text-xs font-semibold text-slate-700">
                <i className="accountant-donut__dot h-2.5 w-2.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: segment.color }} />
                {segment.label}
              </span>
              <strong className="text-xs font-extrabold text-slate-900">{segment.valueText || `${segment.value}%`}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AccountantDonutCard;
