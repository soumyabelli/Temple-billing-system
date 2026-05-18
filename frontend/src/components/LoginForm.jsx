import { useNavigate } from "react-router-dom";
import { useState } from "react";
import RoleSelector from "./RoleSelector";
import { login } from "../services/authService";
import { useAuth } from "../context/AuthContext";

const LoginForm = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [selectedRole, setSelectedRole] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async () => {
    if (!selectedRole) {
      alert("Please select a role");
      return;
    }

    try {
      const res = await login(formData);
      const userRole = res.user?.role;

      if (userRole !== selectedRole) {
        alert(`This account is for ${userRole}. Please select the correct role.`);
        return;
      }

      loginUser({ token: res.token, user: res.user });
      alert("Login Successful");
      navigate(`/${userRole}`);
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="w-[480px] bg-white/20 backdrop-blur-2xl border border-white/30 rounded-[35px] p-10 shadow-2xl text-white">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-amber-900 drop-shadow-lg">Sri Shanti Mahadev Mandir</h1>
        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="h-[2px] w-16 bg-orange-300"></div>
          <p className="text-amber-800 text-lg font-semibold">Sacred Management Portal</p>
          <div className="h-[2px] w-16 bg-orange-300"></div>
        </div>
      </div>

      <RoleSelector selectedRole={selectedRole} setSelectedRole={setSelectedRole} />

      <form className="mt-8 space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block mb-3 text-lg font-medium">Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-4 rounded-2xl bg-white/90 text-black outline-none text-lg shadow-lg"
          />
        </div>

        <div>
          <label className="block mb-3 text-lg font-medium">Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-4 rounded-2xl bg-white/90 text-black outline-none text-lg shadow-lg"
          />
        </div>

        <button
          type="button"
          onClick={handleLogin}
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-all duration-300 p-4 rounded-2xl font-bold text-xl shadow-xl"
        >
          Login
        </button>
      </form>

      <div className="text-center mt-6">
        <p className="text-amber-100">Don't have an account?</p>
        <button onClick={() => navigate("/register")} className="mt-2 text-yellow-300 font-semibold hover:text-yellow-400">
          Register Here
        </button>
      </div>

      <div className="text-center mt-8 text-orange-100 text-xl">Har Har Mahadev</div>
    </div>
  );
};

export default LoginForm;
