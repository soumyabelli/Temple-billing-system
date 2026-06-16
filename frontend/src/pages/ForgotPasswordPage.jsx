import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword, resetPassword } from "../services/authService";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [phase, setPhase] = useState("request"); // request | reset

  const handleRequestToken = async (e) => {
    e.preventDefault();
    if (!email) {
      alert("Please enter email");
      return;
    }

    try {
      setIsLoading(true);
      const res = await forgotPassword(email);
      setResetToken(res.resetToken);
      setPhase("reset");
      alert(`Reset token generated. (Token shown for demo): ${res.resetToken}`);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to generate reset token");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email || !resetToken || !newPassword) {
      alert("Email, token, and new password are required");
      return;
    }

    try {
      setIsLoading(true);
      const res = await resetPassword({
        email,
        token: resetToken,
        newPassword,
      });
      alert(res.message || "Password reset successful");
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Reset password failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg bg-white/25 backdrop-blur-2xl border border-white/60 shadow-[0_20px_70px_rgba(130,50,0,0.18)] rounded-3xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-amber-900">Forgot Password</h1>
          <p className="text-amber-800/90 mt-2">
            {phase === "request" ? "Enter your email to get a reset token." : "Set your new password using the token."}
          </p>
        </div>

        {phase === "request" ? (
          <form onSubmit={handleRequestToken} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-semibold text-amber-900">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-white/70 bg-white/80 p-3.5 outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="Enter registered email"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-all duration-300 text-white px-5 py-3.5 rounded-xl font-bold shadow-xl"
            >
              {isLoading ? "Generating..." : "Get Reset Token"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-full text-amber-900 font-semibold hover:text-amber-700"
            >
              Back to Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-semibold text-amber-900">Reset Token</label>
              <input
                type="text"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                required
                className="w-full rounded-xl border border-white/70 bg-white/80 p-3.5 outline-none focus:ring-2 focus:ring-amber-400"
              />
              <p className="text-xs text-amber-900/80 mt-2">Token is shown for demo because backend currently returns it in response.</p>
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-amber-900">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-xl border border-white/70 bg-white/80 p-3.5 outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="Minimum 6 characters"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-700 to-amber-600 hover:from-orange-800 hover:to-amber-700 transition-all duration-300 text-white px-5 py-3.5 rounded-xl font-bold shadow-xl"
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

