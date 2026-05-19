import Background from "../components/Background";
import LoginForm from "../components/LoginForm";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user?.role) {
      navigate(`/${user.role}`, { replace: true });
    }
  }, [isAuthenticated, user?.role, navigate]);

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-between px-16">

      {/* Background */}
      <Background />

      {/* Left Divine Content */}
      <div className="relative z-10 max-w-2xl text-white">

        {/* Sanskrit */}
        <p className="text-4xl text-amber-300 mb-6 tracking-widest font-semibold drop-shadow-lg">
          ॐ नमः शिवाय
        </p>

        {/* Welcome */}
        <h2 className="text-5xl md:text-7xl font-bold leading-tight text-white drop-shadow-[0_5px_20px_rgba(0,0,0,0.8)]">
          Welcome to
        </h2>

        {/* Sri Shanti */}
        <h1 className="text-6xl md:text-8xl font-extrabold text-amber-400 mt-4 leading-tight drop-shadow-[0_5px_25px_rgba(0,0,0,0.9)]">
          Sri Shanti
        </h1>

        {/* Mahadev Mandir */}
        <h1 className="text-6xl md:text-8xl font-extrabold text-white leading-tight drop-shadow-[0_5px_25px_rgba(0,0,0,0.9)]">
          Mahadev Mandir
        </h1>

        {/* Line */}
        <div className="h-1 w-56 bg-amber-400 rounded-full my-8 shadow-lg"></div>

        {/* Billing System */}
        <p className="text-4xl font-semibold text-amber-300 drop-shadow-lg">
          Billing System
        </p>

        {/* Subtitle */}
        <p className="mt-6 text-2xl text-orange-100 tracking-wide font-medium drop-shadow-lg">
          Divine Management. Devoted Service.
        </p>

      </div>

      {/* Login Form */}
      <div className="relative z-10">
        <LoginForm />
      </div>

    </div>
  );
};

export default LoginPage;
