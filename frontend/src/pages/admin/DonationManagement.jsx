import DonationStats from "../../components/dashboard/donation/DonationStats";
import DonationCharts from "../../components/dashboard/donation/DonationCharts";
import DonationFilters from "../../components/dashboard/donation/DonationFilters";
import DonationTable from "../../components/dashboard/donation/DonationTable";
import RecentDonations from "../../components/dashboard/donation/RecentDonations";
import TopDonors from "../../components/dashboard/donation/TopDonors";

const DonationManagement = () => {
  return (
    <div className="space-y-6 mt-5">

          {/* HERO SECTION */}
          <div
            className="
            relative
            overflow-hidden
            rounded-[32px]
            p-8
            bg-gradient-to-r
            from-orange-500
            via-amber-500
            to-yellow-400
            shadow-xl
          "
          >

            <div className="absolute inset-0 bg-black/10"></div>

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

              <div>
                <h1 className="text-4xl font-bold text-white">
                  Donation Management
                </h1>

                <p className="text-orange-100 mt-3 text-lg">
                  Manage temple donations, sponsors,
                  analytics, and receipts.
                </p>
              </div>

              <div className="flex gap-4">

                <button
                  className="
                  bg-white
                  text-orange-600
                  px-6
                  py-3
                  rounded-2xl
                  font-semibold
                "
                >
                  + Add Donation
                </button>

                <button
                  className="
                  bg-black/20
                  backdrop-blur-lg
                  border border-white/20
                  text-white
                  px-6
                  py-3
                  rounded-2xl
                "
                >
                  Export Report
                </button>

              </div>

            </div>

          </div>

          {/* STATS */}
          <DonationStats />

          {/* CHARTS */}
          <DonationCharts />

          {/* FILTERS */}
          <DonationFilters />

          {/* TABLE */}
          <DonationTable />

          {/* BOTTOM SECTION */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            <RecentDonations />

            <TopDonors />

          </div>

    </div>
  );
};

export default DonationManagement;