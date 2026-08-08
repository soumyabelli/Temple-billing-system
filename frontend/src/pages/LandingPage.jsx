import { useNavigate } from "react-router-dom";
import { FaArrowRight, FaChartPie, FaFileInvoice, FaUsers, FaWallet } from "react-icons/fa";
import { IoPerson } from "react-icons/io5";
import { motion } from "framer-motion";
import landingImage from "../assets/login-banners/image.png";

const LandingPage = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white font-sans selection:bg-temple-500 selection:text-white">
      {/* Background Image with slow pan */}
      <motion.img
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 10, ease: "easeOut" }}
        src={landingImage}
        alt="Temple Billing System"
        className="absolute inset-0 h-full w-full object-cover opacity-80"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

      <div className="relative z-10 flex min-h-screen items-center px-6 py-8 md:px-16 lg:px-24">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[750px] rounded-[2rem] border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-xl md:p-12"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 rounded-full border border-temple-300/30 bg-temple-400/10 px-4 py-2 text-xs font-medium tracking-[0.2em] text-temple-200">
            <span className="h-1.5 w-1.5 rounded-full bg-temple-400 animate-pulse"></span>
            SRI SHANTI MAHADEV MANDIR
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="mt-6 font-serif text-6xl md:text-8xl lg:text-[100px] leading-[0.9] text-white font-semibold drop-shadow-sm">
            Temple
          </motion.h1>
          <motion.h2 variants={itemVariants} className="mt-1 font-serif text-5xl md:text-7xl lg:text-[80px] leading-[0.9] text-transparent bg-clip-text bg-gradient-to-r from-temple-300 to-temple-500 font-bold drop-shadow-sm">
            Billing System
          </motion.h2>

          <motion.p variants={itemVariants} className="mt-8 max-w-md border-l-4 border-temple-500 pl-5 text-xl md:text-2xl font-serif italic leading-relaxed text-white/90">
            Simplify temple management, enhance devotion.
          </motion.p>

          <motion.p variants={itemVariants} className="mt-6 max-w-2xl text-base md:text-lg leading-relaxed text-white/70 font-light">
            Welcome to a sacred space where tradition meets technology. Our temple platform helps manage daily pooja services, donations, devotees, and financial records with transparency and care.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-8 grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
            {[
              { title: "Temple Timings", line1: "Morning 5:00 AM - 12:00 PM", line2: "Evening 4:30 PM - 9:30 PM" },
              { title: "Daily Rituals", line1: "Mangala Aarti, Rudrabhishek", line2: "Sandhya Aarti & Prasad Seva" },
              { title: "Temple Values", line1: "Devotion, Service, Discipline", line2: "Transparency, Compassion" }
            ].map((info, idx) => (
              <div key={idx} className="group rounded-2xl border border-white/5 bg-temple-100/5 p-4 transition duration-300 hover:bg-temple-100/10 hover:border-white/10">
                <p className="text-temple-300 font-medium mb-2">{info.title}</p>
                <p className="text-white/80">{info.line1}</p>
                <p className="text-white/80">{info.line2}</p>
              </div>
            ))}
          </motion.div>

          <motion.div variants={itemVariants} className="mt-10 flex flex-col sm:flex-row gap-5">
            <button
              type="button"
              onClick={() => navigate("/auth-login")}
              className="group flex h-[72px] w-full sm:w-auto min-w-[320px] items-center justify-between rounded-full bg-gradient-to-r from-temple-500 to-temple-600 px-6 text-2xl font-semibold text-white shadow-[0_8px_30px_rgba(229,130,32,0.3)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_10px_40px_rgba(229,130,32,0.4)]"
            >
              <span className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-temple-100 text-temple-600 shadow-sm transition-transform duration-300 group-hover:scale-110">
                  <IoPerson size={20} />
                </span>
                Login
              </span>
              <FaArrowRight className="text-2xl transition-transform duration-300 group-hover:translate-x-2" />
            </button>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-10 grid grid-cols-2 gap-4 rounded-[24px] border border-white/5 bg-temple-100/5 p-6 backdrop-blur-md md:grid-cols-4">
            {[
              { icon: FaFileInvoice, text: "Easy Billing" },
              { icon: FaUsers, text: "Devotee Mgmt" },
              { icon: FaWallet, text: "Donation Track" },
              { icon: FaChartPie, text: "Analytics" }
            ].map((feature, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-temple-500/20 text-temple-400 mb-3">
                  <feature.icon size={20} />
                </div>
                <p className="text-[13px] font-medium text-white/80">{feature.text}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage;
