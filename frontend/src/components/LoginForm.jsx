import RoleSelector from "./RoleSelector";

const LoginForm = () => {
  return (
    <div className="bg-white/20 backdrop-blur-lg border border-white/20 rounded-3xl p-8 w-full max-w-md text-white shadow-2xl">

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">
          Sri Shanti Mahadev Mandir
        </h1>

        <p className="text-sm text-gray-200 mt-2">
          Sacred Management Portal
        </p>
      </div>

      <RoleSelector />

      <form className="mt-6 space-y-4">

        <div>
          <label className="block mb-2 text-sm">
            Username or Email
          </label>

          <input
            type="text"
            placeholder="Enter username"
            className="w-full p-3 rounded-xl bg-white/20 border border-white/30 outline-none"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm">
            Password
          </label>

          <input
            type="password"
            placeholder="Enter password"
            className="w-full p-3 rounded-xl bg-white/20 border border-white/30 outline-none"
          />
        </div>

        <button
          className="w-full bg-orange-500 hover:bg-orange-600 transition p-3 rounded-xl font-semibold"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginForm;