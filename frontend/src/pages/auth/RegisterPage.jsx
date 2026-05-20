import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../../services/authService";

const roles = ["admin", "accountant", "cashier", "priest", "staff", "devotee"];

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "devotee",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await register(formData);
      alert(res.message);
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-50 flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute top-[-120px] right-[-80px] h-72 w-72 bg-amber-300/40 blur-3xl rounded-full"></div>
      <div className="absolute bottom-[-140px] left-[-90px] h-80 w-80 bg-orange-300/35 blur-3xl rounded-full"></div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white/25 backdrop-blur-2xl border border-white/60 shadow-[0_20px_70px_rgba(130,50,0,0.18)] rounded-3xl p-8 md:p-10"
      >
        <h1 className="text-3xl md:text-4xl font-extrabold text-amber-900 mb-2">Create Account</h1>
        <p className="text-amber-800/90 mb-7">Register and continue to your role dashboard.</p>

        <div className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            className="w-full rounded-xl border border-white/70 bg-white/80 p-3.5 outline-none focus:ring-2 focus:ring-amber-400"
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            className="w-full rounded-xl border border-white/70 bg-white/80 p-3.5 outline-none focus:ring-2 focus:ring-amber-400"
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password (minimum 6)"
            value={formData.password}
            className="w-full rounded-xl border border-white/70 bg-white/80 p-3.5 outline-none focus:ring-2 focus:ring-amber-400"
            onChange={handleChange}
            minLength={6}
            required
          />

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/70 bg-white/80 p-3.5 capitalize outline-none focus:ring-2 focus:ring-amber-400"
            required
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        <button className="mt-6 w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-5 py-3.5 rounded-xl font-bold shadow-xl transition-all">
          Register
        </button>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="mt-4 w-full text-amber-900 font-semibold hover:text-amber-700"
        >
          Back to Login
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
