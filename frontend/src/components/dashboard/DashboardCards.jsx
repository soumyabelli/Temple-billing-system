import DashboardCard from "../DashboardCard";

const DashboardCards = ({ cards }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-5">
      {cards.map((card) => (
        <DashboardCard key={card.title} {...card} />
      ))}
    </div>
  );
};

export default DashboardCards;
