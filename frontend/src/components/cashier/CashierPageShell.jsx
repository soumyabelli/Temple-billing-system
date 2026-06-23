const StatCard = ({ title, value, note, tone = "orange" }) => {
  const toneStyles = {
    orange: "bg-[#fff8eb] border-[#f7c78e] text-[#7a3e00]",
    gold: "bg-[#fffbe0] border-[#efd98f] text-[#805500]",
    green: "bg-[#eefaf0] border-[#bfe6c6] text-[#116530]",
    blue: "bg-[#edf4ff] border-[#bed0ff] text-[#234ea5]",
  };

  return (
    <div className={`rounded-[18px] border p-4 shadow-sm ${toneStyles[tone] || toneStyles.orange}`}>
      <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-80">{title}</p>
      <p className="mt-3 text-[2.1rem] md:text-[2.3rem] leading-none font-extrabold text-slate-950">{value}</p>
      {note ? <p className="mt-2 text-sm font-medium text-slate-800">{note}</p> : null}
    </div>
  );
};

const CashierPageShell = ({
  title,
  eyebrow = "Cashier",
  description,
  image,
  imageAlt = "",
  actions,
  stats = [],
  children,
  accent = "orange",
}) => {
  const accentStyles = {
    orange: "from-[#fff1dc] via-[#fff9f1] to-[#ffffff] border-[#f3d5a3]",
    gold: "from-[#fff0c9] via-[#fff8e1] to-[#ffffff] border-[#efd98f]",
  };

  return (
    <div className="space-y-6 text-slate-950">
      <section
        className={`overflow-hidden rounded-[24px] border shadow-sm bg-gradient-to-br ${
          accentStyles[accent] || accentStyles.orange
        }`}
      >
        <div className="grid gap-0">
          <div className="p-6 md:p-8 lg:p-10">
            <div className="inline-flex items-center rounded-full border border-[#f6d29b] bg-white/85 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-[#8a5200]">
              {eyebrow}
            </div>
            {title ? (
              <h1 className="mt-4 text-[2.35rem] md:text-[3rem] lg:text-[3.6rem] font-extrabold leading-tight text-slate-950">
                {title}
              </h1>
            ) : null}
            {description ? (
              <p className="mt-3 max-w-3xl text-[1.02rem] md:text-[1.1rem] font-medium leading-8 text-slate-800">
                {description}
              </p>
            ) : null}

            {actions ? <div className="mt-6 flex flex-wrap gap-3">{actions}</div> : null}

            {stats.length ? (
              <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                  <StatCard key={stat.title} {...stat} />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {children}
    </div>
  );
};

export default CashierPageShell;
