import { motion } from "framer-motion";
import Background from "../components/Background";
import LoginForm from "../components/LoginForm";

const LoginPage = () => {
  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col md:flex-row items-center justify-between px-8 md:px-16 lg:px-24 font-sans selection:bg-temple-500 selection:text-white">

      {/* Background Component */}
      <Background />

      {/* Left Divine Content */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-2xl text-white mt-12 md:mt-0"
      >
        {/* Sanskrit */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="text-2xl md:text-3xl lg:text-4xl text-temple-300 mb-6 tracking-[0.2em] font-medium drop-shadow-md"
        >
          ॐ नमः शिवाय
        </motion.p>

        {/* Welcome */}
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif font-semibold leading-tight text-white drop-shadow-lg">
          Welcome to
        </h2>

        {/* Sri Shanti */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-temple-300 to-temple-500 mt-2 leading-tight drop-shadow-lg">
          Sri Shanti
        </h1>

        {/* Mahadev Mandir */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white leading-tight drop-shadow-lg">
          Mahadev Mandir
        </h1>

        {/* Line */}
        <motion.div 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
          className="h-1.5 w-48 bg-gradient-to-r from-temple-400 to-transparent rounded-full my-8 origin-left"
        />

        {/* Billing System */}
        <p className="text-3xl md:text-4xl font-medium text-temple-200 drop-shadow-md tracking-wide">
          Billing System
        </p>

        {/* Subtitle */}
        <p className="mt-6 text-xl md:text-2xl text-white/80 tracking-wide font-light border-l-4 border-temple-500 pl-4">
          Divine Management. <span className="font-medium text-temple-100">Devoted Service.</span>
        </p>

      </motion.div>

      {/* Login Form */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
        className="relative z-10 mt-12 md:mt-0 w-full md:w-auto flex justify-center"
      >
        <LoginForm />
      </motion.div>

    </div>
  );
};

export default LoginPage;
