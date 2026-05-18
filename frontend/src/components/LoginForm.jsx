import { useNavigate } from "react-router-dom";
import { useState } from "react";
import RoleSelector from "./RoleSelector";

const LoginForm = () => {

  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("");

  return (
    <div
      className="
      w-[480px]
      bg-white/20
      backdrop-blur-2xl
      border border-white/30
      rounded-[35px]
      p-10
      shadow-2xl
      text-white
      "
    >

      {/* Heading */}
      <div className="text-center mb-8">

        <h1 className="text-4xl font-bold text-amber-900 drop-shadow-lg">
          Sri Shanti Mahadev Mandir
        </h1>

        <div className="flex items-center justify-center gap-3 mt-4">

          <div className="h-[2px] w-16 bg-orange-300"></div>

          <p className="text-amber-800 text-lg font-semibold">
            Sacred Management Portal
          </p>

          <div className="h-[2px] w-16 bg-orange-300"></div>

        </div>
      </div>

      {/* Roles */}
      <RoleSelector
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
      />

      {/* Form */}
      <form className="mt-8 space-y-6">

        {/* Username */}
        <div>
          <label className="block mb-3 text-lg font-medium">
            Username or Email
          </label>

          <input
            type="text"
            placeholder="Enter username or email"
            className="
            w-full
            p-4
            rounded-2xl
            bg-white/90
            text-black
            outline-none
            text-lg
            shadow-lg
            "
          />
        </div>

        {/* Password */}
        <div>
          <label className="block mb-3 text-lg font-medium">
            Password
          </label>

          <input
            type="password"
            placeholder="Enter password"
            className="
            w-full
            p-4
            rounded-2xl
            bg-white/90
            text-black
            outline-none
            text-lg
            shadow-lg
            "
          />
        </div>

        {/* Login Button */}
        <button
          type="button"
          onClick={() => {
            if (selectedRole) {
              navigate(`/${selectedRole}`);
            } else {
              alert("Please select a role");
            }
          }}
          className="
          w-full
          bg-gradient-to-r
          from-orange-500
          to-amber-500
          hover:from-orange-600
          hover:to-amber-600
          transition-all
          duration-300
          p-4
          rounded-2xl
          font-bold
          text-xl
          shadow-xl
          "
        >
          Login
        </button>

      </form>

      {/* Footer */}
      <div className="text-center mt-8 text-orange-100 text-xl">
        हर हर महादेव
      </div>

    </div>
  );
};

export default LoginForm;