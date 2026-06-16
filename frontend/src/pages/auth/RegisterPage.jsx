import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../../services/authService";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    place: "",
    password: "",
    confirmPassword: "",
    role: "devotee",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) newErrors.phone = "Phone must be 10 digits";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.place.trim()) newErrors.place = "Place/City is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await register(formData);
      alert(res.message);
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-50 flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute top-[-120px] right-[-80px] h-72 w-72 bg-amber-300/40 blur-3xl rounded-full"></div>
      <div className="absolute bottom-[-140px] left-[-90px] h-80 w-80 bg-orange-300/35 blur-3xl rounded-full"></div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white/25 backdrop-blur-2xl border border-white/60 shadow-[0_20px_70px_rgba(130,50,0,0.18)] rounded-3xl p-8 md:p-10"
      >
        <h1 className="text-3xl md:text-4xl font-extrabold text-amber-900 mb-2">Create Account</h1>
        <p className="text-amber-800/90 mb-7">Self registration is only for devotee. Other roles are created by admin.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-2">Full Name *</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              className={`w-full rounded-xl border ${
                errors.name ? "border-red-500" : "border-white/70"
              } bg-white/80 p-3.5 outline-none focus:ring-2 focus:ring-amber-400`}
              onChange={handleChange}
            />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-2">Email Address *</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              className={`w-full rounded-xl border ${
                errors.email ? "border-red-500" : "border-white/70"
              } bg-white/80 p-3.5 outline-none focus:ring-2 focus:ring-amber-400`}
              onChange={handleChange}
            />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-2">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              placeholder="Enter 10-digit phone number"
              value={formData.phone}
              className={`w-full rounded-xl border ${
                errors.phone ? "border-red-500" : "border-white/70"
              } bg-white/80 p-3.5 outline-none focus:ring-2 focus:ring-amber-400`}
              onChange={handleChange}
            />
            {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
          </div>

          {/* Place/City */}
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-2">Place/City *</label>
            <input
              type="text"
              name="place"
              placeholder="Enter your city/place"
              value={formData.place}
              className={`w-full rounded-xl border ${
                errors.place ? "border-red-500" : "border-white/70"
              } bg-white/80 p-3.5 outline-none focus:ring-2 focus:ring-amber-400`}
              onChange={handleChange}
            />
            {errors.place && <p className="text-red-600 text-sm mt-1">{errors.place}</p>}
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-amber-900 mb-2">Address *</label>
            <textarea
              name="address"
              placeholder="Enter your complete address"
              value={formData.address}
              rows="3"
              className={`w-full rounded-xl border ${
                errors.address ? "border-red-500" : "border-white/70"
              } bg-white/80 p-3.5 outline-none focus:ring-2 focus:ring-amber-400 resize-none`}
              onChange={handleChange}
            />
            {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-2">Password *</label>
            <input
              type="password"
              name="password"
              placeholder="Minimum 6 characters"
              value={formData.password}
              className={`w-full rounded-xl border ${
                errors.password ? "border-red-500" : "border-white/70"
              } bg-white/80 p-3.5 outline-none focus:ring-2 focus:ring-amber-400`}
              onChange={handleChange}
            />
            {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-2">Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              className={`w-full rounded-xl border ${
                errors.confirmPassword ? "border-red-500" : "border-white/70"
              } bg-white/80 p-3.5 outline-none focus:ring-2 focus:ring-amber-400`}
              onChange={handleChange}
            />
            {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-8 w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:from-gray-400 disabled:to-gray-400 text-white px-5 py-3.5 rounded-xl font-bold shadow-xl transition-all"
        >
          {loading ? "Creating Account..." : "Register"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="mt-4 w-full text-amber-900 font-semibold hover:text-amber-700 transition-all"
        >
          Back to Login
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
