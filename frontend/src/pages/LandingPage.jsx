import { useNavigate } from "react-router-dom";
import { FaArrowRight, FaChartPie, FaFileInvoice, FaUsers, FaWallet } from "react-icons/fa";
import { IoPerson } from "react-icons/io5";
import landingImage from "../assets/login-banners/image.png";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <img
        src={landingImage}
        alt="Temple Billing System"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/35" />

      <div className="relative z-10 flex min-h-screen items-center px-6 py-8 md:px-12">
        <div className="w-full max-w-[700px] rounded-[32px] border border-white/25 bg-white/10 p-6 shadow-[0_16px_50px_rgba(0,0,0,0.4)] backdrop-blur-md md:p-8">
          <p className="inline-flex rounded-full border border-amber-200/60 bg-amber-300/15 px-4 py-2 text-sm tracking-[0.18em] text-amber-100">
            SRI SHANTI MAHADEV MANDIR
          </p>
          <h1 className="mt-4 font-serif text-6xl leading-none text-white md:text-8xl">Temple</h1>
          <h2 className="mt-2 font-serif text-5xl leading-none text-amber-300 md:text-7xl">Billing System</h2>

          <p className="mt-6 max-w-md border-l-4 border-amber-400 pl-4 text-2xl leading-snug text-white/95">
            Simplify temple management, enhance devotion.
          </p>

          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-amber-50/95 md:text-xl">
            Welcome to a sacred space where tradition meets technology. Our temple platform helps manage daily pooja services, donations, devotees, and financial records with transparency and care.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-3 text-sm text-white/95 md:grid-cols-3">
            <div className="rounded-2xl border border-white/25 bg-white/10 p-3 backdrop-blur-sm">
              <p className="text-amber-200">Temple Timings</p>
              <p className="mt-1 font-semibold">Morning 5:00 AM - 12:00 PM</p>
              <p className="font-semibold">Evening 4:30 PM - 9:30 PM</p>
            </div>
            <div className="rounded-2xl border border-white/25 bg-white/10 p-3 backdrop-blur-sm">
              <p className="text-amber-200">Daily Rituals</p>
              <p className="mt-1 font-semibold">Mangala Aarti, Rudrabhishek</p>
              <p className="font-semibold">Sandhya Aarti & Prasad Seva</p>
            </div>
            <div className="rounded-2xl border border-white/25 bg-white/10 p-3 backdrop-blur-sm">
              <p className="text-amber-200">Temple Values</p>
              <p className="mt-1 font-semibold">Devotion, Service, Discipline</p>
              <p className="font-semibold">Transparency, Compassion</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/auth-login")}
            className="mt-7 flex h-20 w-full max-w-[430px] items-center justify-between rounded-full border-2 border-amber-300 bg-gradient-to-r from-amber-200 to-amber-400 px-7 text-4xl font-semibold text-amber-900 shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition hover:brightness-105 md:text-5xl"
          >
            <span className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl text-amber-700">
                <IoPerson />
              </span>
              Login
            </span>
            <FaArrowRight className="text-3xl" />
          </button>

          <div className="mt-8 grid grid-cols-2 gap-3 rounded-3xl border border-white/30 bg-black/35 p-4 backdrop-blur-sm md:grid-cols-4">
            <div className="text-center">
              <FaFileInvoice className="mx-auto text-4xl text-amber-400" />
              <p className="mt-2 text-xl">Easy Billing</p>
            </div>
            <div className="text-center">
              <FaUsers className="mx-auto text-4xl text-amber-400" />
              <p className="mt-2 text-xl">Devotee Management</p>
            </div>
            <div className="text-center">
              <FaWallet className="mx-auto text-4xl text-amber-400" />
              <p className="mt-2 text-xl">Donation Tracking</p>
            </div>
            <div className="text-center">
              <FaChartPie className="mx-auto text-4xl text-amber-400" />
              <p className="mt-2 text-xl">Reports & Analytics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
