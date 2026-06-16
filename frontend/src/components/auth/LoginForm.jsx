import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { changePassword, googleLogin, login } from "../../services/authService";

import { useAuth } from "../../context/AuthContext";
import RoleSelector from "./RoleSelector";

const LoginForm = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [selectedRole, setSelectedRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordResetToken, setPasswordResetToken] = useState(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setErrorMessage("");
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setErrorMessage("Please enter email and password.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");
      const res = await login({ ...formData, role: selectedRole });
      const userRole = res.user?.role;
      if (!userRole) {
        setErrorMessage("Role not found for this account. Please contact admin.");
        return;
      }

      if (res.user?.mustChangePassword && userRole !== "devotee") {
        loginUser({ token: res.token, user: res.user });
        alert("First login detected. You are logged in, but please change your password soon.");
        navigate(`/${userRole}`);
        return;
      }

      loginUser({ token: res.token, user: res.user });
      if (selectedRole && selectedRole !== userRole) {
        alert(`Logged in as ${userRole}. Selected role was ${selectedRole}.`);
      } else {
        alert(`Login Successful as ${userRole}`);
      }
      navigate(`/${userRole}`);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Login failed. Please check server and credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFirstLoginPasswordChange = async (e) => {
    e.preventDefault();
    if (!passwordResetToken) return;

    try {
      setIsLoading(true);
      const res = await changePassword({
        token: passwordResetToken,
        currentPassword,
        newPassword,
      });
      loginUser({ token: res.token, user: res.user });
      setPasswordResetToken(null);
      setNewPassword("");
      alert("Password changed. Login completed.");
      navigate(`/${res.user.role}`);
    } catch (error) {
      alert(error.response?.data?.message || "Password update failed");
    } finally {
      setIsLoading(false);
    }
  };



  const handleGoogleLogin = async () => {
    const email = window.prompt("Enter Google email");
    if (!email) return;
    const name = window.prompt("Enter display name", "Devotee") || "Devotee";

    try {
      setIsLoading(true);
      const res = await googleLogin({ email, name });
      loginUser({ token: res.token, user: res.user });
      alert("Google login successful");
      navigate("/devotee");
    } catch (error) {
      alert(error.response?.data?.message || "Google login failed");
    } finally {
      setIsLoading(false);
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

      {errorMessage ? (
        <div className="mt-5 rounded-2xl border border-red-300/50 bg-red-950/50 px-4 py-3 text-sm text-red-100">
          {errorMessage}
        </div>
      ) : null}

      <form className="mt-8 space-y-6" onSubmit={handleLogin}>
        <div>
          <label className="block mb-3 text-lg font-medium">Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
            required
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
            required
            className="w-full p-4 rounded-2xl bg-white/90 text-black outline-none text-lg shadow-lg"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-all duration-300 p-4 rounded-2xl font-bold text-xl shadow-xl"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>

      {passwordResetToken && (
        <form className="mt-5 space-y-3" onSubmit={handleFirstLoginPasswordChange}>
          <p className="text-amber-100 text-sm">Change password to continue (required for non-devotee first login).</p>
          <input
            type="password"
            placeholder="New password"
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-3 rounded-xl bg-white/90 text-black outline-none"
            required
          />
          <button type="submit" className="w-full bg-amber-600 p-3 rounded-xl font-semibold">
            Update Password
          </button>
        </form>
      )}

      

      <div className="mt-5">
        <button
          type="button"
          onClick={() => navigate("/forgot-password")}
          className="w-full bg-orange-600 hover:bg-orange-700 transition-colors p-3 rounded-xl font-semibold"
        >
          Forgot Password
        </button>
      </div>


      <div className="text-center mt-6">
        {selectedRole === "devotee" ? (
          <>
            <p className="text-amber-100">Don't have an account?</p>
            <button onClick={() => navigate("/register")} className="mt-2 text-yellow-300 font-semibold hover:text-yellow-400">
              Register Here
            </button>
          </>
        ) : (
          <>
            
          </>
        )}
      </div>

      <div className="text-center mt-8 text-orange-100 text-xl">Har Har Mahadev</div>
    </div>
  );
};

export default LoginForm;
