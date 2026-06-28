import {
  MdTempleBuddhist,
  MdPerson,
  MdNotificationsNone,
  MdCreditCard,
  MdTune,
  MdSecurity,
  MdBackup,
  MdSupportAgent,
  MdEmail,
  MdPhone,
  MdLockOutline,
  MdOutlineVisibilityOff,
  MdOutlineKeyboardArrowDown,
  MdAccessTime,
} from "react-icons/md";
import { useAuth } from "../../context/AuthContext";

const fieldClass =
  "h-9 w-full rounded-lg border border-[#ece8e1] bg-[#faf9f7] px-3 text-sm text-[#202632] outline-none";

const selectClass =
  "h-9 w-full appearance-none rounded-lg border border-[#ece8e1] bg-[#faf9f7] px-3 pr-8 text-sm text-[#202632] outline-none";

const sectionClass =
  "rounded-2xl border border-[#ece8e1] bg-[#fffdfb] p-5 shadow-sm";

const sectionTitleClass =
  "text-[20px] font-bold text-[#17151f]";

const Toggle = ({ checked = true }) => (
  <label className="relative inline-flex h-6 w-11 items-center">
    <input
      type="checkbox"
      defaultChecked={checked}
      className="peer sr-only"
    />

    <span className="h-6 w-11 rounded-full bg-[#d7dbe1] transition peer-checked:bg-[#ff8b00]" />

    <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-5" />
  </label>
);

const SelectField = ({ value }) => (
  <div className="relative">
    <select defaultValue={value} className={selectClass}>
      <option>{value}</option>
    </select>

    <MdOutlineKeyboardArrowDown
      className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#7b8492]"
      size={20}
    />
  </div>
);

const SettingsManagement = () => {
  const { user } = useAuth();
  const avatarSrc = user?.photo || "";
  const avatarInitial = (user?.name || "Admin").charAt(0).toUpperCase();
  const displayName = user?.name || "Admin";
  const displayRole = user?.role === "admin"
    ? "Super Admin"
    : user?.role
      ? `${user.role.charAt(0).toUpperCase()}${user.role.slice(1)}`
    : "Super Admin";

  return (
    <div className="mt-5 space-y-4 pb-6">

      {/* HEADER */}

      <div>
        <h1 className={sectionTitleClass}>Settings</h1>

        <p className="text-[15px] text-[#5c6675]">
          Manage system preferences, temple details,
          accounts, notifications and security.
        </p>

        <div className="mt-2 h-1 w-12 rounded-full bg-[#ff8b00]" />
      </div>

      {/* TOP GRID */}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">

        {/* TEMPLE INFO */}

        <div className={`${sectionClass} xl:col-span-3`}>

          <div className="mb-4 flex items-center gap-2">

            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-[#ff8b00]">
              <MdTempleBuddhist size={20} />
            </span>

            <h3 className="text-[20px] font-bold text-[#1d1b19]">
              Temple Information
            </h3>
          </div>

          <div className="space-y-2 text-sm">

            <p>Temple Name</p>
            <input
              defaultValue="Sri Shanti Mahadev Mandir"
              className={fieldClass}
            />

            <p>Address</p>

            <textarea
              defaultValue="1-8-276/A, Kukatpally, Hyderabad, Telangana - 500072"
              className="w-full rounded-lg border border-[#ece8e1] bg-[#faf9f7] px-3 py-2 text-sm text-[#202632] outline-none"
              rows={2}
            />

            <p>Phone</p>
            <input
              defaultValue="040-12345678"
              className={fieldClass}
            />

            <p>Email</p>
            <input
              defaultValue="info@ssmm.in"
              className={fieldClass}
            />

            <p>GST Number</p>
            <input
              defaultValue="36AAATS1234A1Z5"
              className={fieldClass}
            />

            <div className="pt-1">

              <p className="mb-2">Temple Logo</p>

              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#ece8e1] bg-orange-50 text-[#ff8b00]">
                  <MdTempleBuddhist size={22} />
                </div>

                <button className="h-10 rounded-lg border border-[#f4caa8] px-3 text-sm font-semibold text-[#f07f00]">
                  Change Logo
                </button>

              </div>
            </div>

            <button className="mt-2 h-10 w-full rounded-lg bg-[#ff8b00] text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.01] hover:bg-[#ef7f00]">
              Save Changes
            </button>

          </div>
        </div>

        {/* ADMIN SETTINGS */}

        <div className={`${sectionClass} xl:col-span-3`}>

          <div className="mb-4 flex items-center gap-2">

            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-700">
              <MdPerson size={20} />
            </span>

            <h3 className="text-[20px] font-bold text-[#1d1b19]">
              Admin Account Settings
            </h3>

          </div>

          <div className="space-y-2 text-sm">

            <p>Full Name</p>
            <input defaultValue="Admin" className={fieldClass} />

            <p>Email</p>
            <input defaultValue="admin@ssmm.in" className={fieldClass} />

            <p>Username</p>
            <input defaultValue="superadmin" className={fieldClass} />

            <p>Current Password</p>

            <div className="relative">

              <input
                defaultValue="..........."
                className={`${fieldClass} pr-9`}
              />

              <MdOutlineVisibilityOff className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7b8492]" />

            </div>

            <p>New Password</p>

            <div className="relative">

              <input
                defaultValue="..........."
                className={`${fieldClass} pr-9`}
              />

              <MdOutlineVisibilityOff className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7b8492]" />

            </div>

            <p>Confirm Password</p>

            <div className="relative">

              <input
                defaultValue="..........."
                className={`${fieldClass} pr-9`}
              />

              <MdOutlineVisibilityOff className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7b8492]" />

            </div>

            <div className="mt-2 flex gap-2">

              <button className="h-10 flex-1 rounded-lg bg-[#ff8b00] text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.01] hover:bg-[#ef7f00]">
                Update Profile
              </button>

              <button className="h-10 flex-1 rounded-lg border border-[#ece8e1] text-sm font-semibold text-[#4b5563]">
                Reset Password
              </button>

            </div>

          </div>
        </div>

        {/* NOTIFICATIONS */}

        <div className={`${sectionClass} xl:col-span-3`}>

          <div className="mb-4 flex items-center gap-2">

            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700">
              <MdNotificationsNone size={20} />
            </span>

            <h3 className="text-[20px] font-bold text-[#1d1b19]">
              Notification Settings
            </h3>

          </div>

          <div className="space-y-3 pt-2 text-sm text-[#252b37]">

            {[
              ["SMS Notifications", true],
              ["Email Alerts", true],
              ["Booking Reminders", true],
              ["Festival Announcements", true],
              ["Payment Receipts", true],
              ["System Updates", false],
              ["Marketing Notifications", false],
            ].map(([label, on]) => (

              <div
                key={label}
                className="flex items-center justify-between"
              >
                <span>{label}</span>

                <Toggle checked={on} />
              </div>
            ))}
          </div>

          <button className="mt-5 h-10 w-full rounded-lg bg-[#ff8b00] text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.01] hover:bg-[#ef7f00]">
            Save Preferences
          </button>

        </div>

        {/* ADMIN PROFILE */}

        <div className={`${sectionClass} xl:col-span-3`}>

          <h3 className="text-[20px] font-bold text-[#1d1b19]">
            Admin Profile
          </h3>

          <div className="mt-3 flex items-center gap-3">
            <div className="h-20 w-20 overflow-hidden rounded-full border border-[#ece8e1] bg-[#f8f5ef]">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-2xl font-bold text-[#ff8b00]">
                  {avatarInitial}
                </div>
              )}
            </div>

            <div>

              <p className="text-[18px] font-bold text-[#17151f]">
                {displayName}
              </p>

              <span className="mt-1 inline-block rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-[#b66000]">
                {displayRole}
              </span>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default SettingsManagement;
