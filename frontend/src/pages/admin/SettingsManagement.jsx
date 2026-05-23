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

const fieldClass = "h-10 w-full rounded-lg border border-[#ece8e1] bg-[#faf9f7] px-3 text-sm text-[#202632] outline-none";
const selectClass = "h-10 w-full appearance-none rounded-lg border border-[#ece8e1] bg-[#faf9f7] px-3 pr-8 text-sm text-[#202632] outline-none";
const sectionClass = "rounded-2xl border border-[#ece8e1] bg-white p-4";
const sectionTitleClass = "text-[32px] font-bold text-[#17151f]";

const Toggle = ({ checked = true }) => (
  <label className="relative inline-flex h-6 w-11 items-center">
    <input type="checkbox" defaultChecked={checked} className="peer sr-only" />
    <span className="h-6 w-11 rounded-full bg-[#d7dbe1] transition peer-checked:bg-[#ff8b00]" />
    <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-5" />
  </label>
);

const SelectField = ({ value }) => (
  <div className="relative">
    <select defaultValue={value} className={selectClass}>
      <option>{value}</option>
    </select>
    <MdOutlineKeyboardArrowDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#7b8492]" size={20} />
  </div>
);

const SettingsManagement = () => {
  return (
    <div className="mt-5 space-y-4">
      <div>
        <h1 className={sectionTitleClass}>Settings</h1>
        <p className="text-[18px] text-[#5c6675]">Manage system preferences, temple details, accounts, notifications and security.</p>
        <div className="mt-2 h-1 w-12 rounded-full bg-[#ff8b00]" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className={`${sectionClass} xl:col-span-3`}>
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-[#ff8b00]"><MdTempleBuddhist size={20} /></span>
            <h3 className="text-[24px] font-bold text-[#1d1b19]">Temple Information</h3>
          </div>
          <div className="space-y-2 text-sm">
            <p>Temple Name</p><input defaultValue="Sri Shanti Mahadev Mandir" className={fieldClass} />
            <p>Address</p><textarea defaultValue="1-8-276/A, Kukatpally, Hyderabad, Telangana - 500072" className="w-full rounded-lg border border-[#ece8e1] bg-[#faf9f7] px-3 py-2 text-sm text-[#202632] outline-none" rows={2} />
            <p>Phone</p><input defaultValue="040-12345678" className={fieldClass} />
            <p>Email</p><input defaultValue="info@ssmm.in" className={fieldClass} />
            <p>GST Number</p><input defaultValue="36AAATS1234A1Z5" className={fieldClass} />
            <div className="pt-1">
              <p className="mb-2">Temple Logo</p>
              <div className="flex items-center gap-3">
                <img src="https://i.pravatar.cc/100?img=14" alt="Temple" className="h-14 w-14 rounded-full border border-[#ece8e1] object-cover" />
                <button className="h-10 rounded-lg border border-[#f4caa8] px-3 text-sm font-semibold text-[#f07f00]">Change Logo</button>
              </div>
            </div>
            <button className="mt-2 h-10 w-full rounded-lg bg-[#ff8b00] text-sm font-semibold text-white hover:bg-[#ef7f00]">Save Changes</button>
          </div>
        </div>

        <div className={`${sectionClass} xl:col-span-3`}>
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-700"><MdPerson size={20} /></span>
            <h3 className="text-[24px] font-bold text-[#1d1b19]">Admin Account Settings</h3>
          </div>
          <div className="space-y-2 text-sm">
            <p>Full Name</p><input defaultValue="Admin" className={fieldClass} />
            <p>Email</p><input defaultValue="admin@ssmm.in" className={fieldClass} />
            <p>Username</p><input defaultValue="superadmin" className={fieldClass} />
            <p>Current Password</p>
            <div className="relative"><input defaultValue="..........." className={`${fieldClass} pr-9`} /><MdOutlineVisibilityOff className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7b8492]" /></div>
            <p>New Password</p>
            <div className="relative"><input defaultValue="..........." className={`${fieldClass} pr-9`} /><MdOutlineVisibilityOff className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7b8492]" /></div>
            <p>Confirm Password</p>
            <div className="relative"><input defaultValue="..........." className={`${fieldClass} pr-9`} /><MdOutlineVisibilityOff className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7b8492]" /></div>
            <div className="mt-2 flex gap-2">
              <button className="h-10 flex-1 rounded-lg bg-[#ff8b00] text-sm font-semibold text-white hover:bg-[#ef7f00]">Update Profile</button>
              <button className="h-10 flex-1 rounded-lg border border-[#ece8e1] text-sm font-semibold text-[#4b5563]">Reset Password</button>
            </div>
          </div>
        </div>

        <div className={`${sectionClass} xl:col-span-3`}>
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700"><MdNotificationsNone size={20} /></span>
            <h3 className="text-[24px] font-bold text-[#1d1b19]">Notification Settings</h3>
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
              <div key={label} className="flex items-center justify-between">
                <span>{label}</span>
                <Toggle checked={on} />
              </div>
            ))}
          </div>
          <button className="mt-5 h-10 w-full rounded-lg bg-[#ff8b00] text-sm font-semibold text-white hover:bg-[#ef7f00]">Save Preferences</button>
        </div>

        <div className={`${sectionClass} xl:col-span-3`}>
          <h3 className="text-[24px] font-bold text-[#1d1b19]">Admin Profile</h3>
          <div className="mt-3 flex items-center gap-3">
            <img src="https://i.pravatar.cc/100?img=14" alt="Admin" className="h-20 w-20 rounded-full border border-[#ece8e1] object-cover" />
            <div>
              <p className="text-[34px] leading-none font-bold text-[#17151f]">Admin</p>
              <span className="mt-1 inline-block rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-[#b66000]">Super Admin</span>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm text-[#2b3240]">
            <p className="flex items-start gap-2"><MdAccessTime className="mt-0.5" /> <span><strong>Last Login</strong><br />21 May 2026, 10:30 AM</span></p>
            <p className="flex items-start gap-2"><MdEmail className="mt-0.5" /> <span><strong>Email</strong><br />admin@ssmm.in</span></p>
            <p className="flex items-start gap-2"><MdPhone className="mt-0.5" /> <span><strong>Phone</strong><br />9876543210</span></p>
            <p className="flex items-start gap-2"><MdPerson className="mt-0.5" /> <span><strong>Role</strong><br />Super Admin</span></p>
            <p className="flex items-start gap-2"><MdLockOutline className="mt-0.5" /> <span><strong>Permissions</strong><br />Full Access</span></p>
          </div>
          <button className="mt-3 h-10 w-full rounded-lg border border-[#f4caa8] text-sm font-semibold text-[#f07f00]">View Activity Logs</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className={`${sectionClass} xl:col-span-3`}>
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-[#f59e0b]"><MdCreditCard size={20} /></span>
            <h3 className="text-[24px] font-bold text-[#1d1b19]">Payment Settings</h3>
          </div>
          <div className="space-y-2 text-sm">
            <p>UPI ID</p><input defaultValue="ssmm@upi" className={fieldClass} />
            <p>Bank Account</p><input defaultValue="********1234" className={fieldClass} />
            <p>IFSC Code</p><input defaultValue="SBIN0001234" className={fieldClass} />
            <p>Razorpay Key ID</p><input defaultValue="rzp_live_xxxxxxxxxx" className={fieldClass} />
            <p>Razorpay Secret Key</p>
            <div className="relative"><input defaultValue="................." className={`${fieldClass} pr-9`} /><MdOutlineVisibilityOff className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7b8492]" /></div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-sm text-[#252b37]">Enable QR Payments</span>
              <Toggle checked />
            </div>
            <button className="mt-2 h-10 w-full rounded-lg bg-[#ff8b00] text-sm font-semibold text-white hover:bg-[#ef7f00]">Save Changes</button>
          </div>
        </div>

        <div className={`${sectionClass} xl:col-span-3`}>
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700"><MdTune size={20} /></span>
            <h3 className="text-[24px] font-bold text-[#1d1b19]">System Preferences</h3>
          </div>
          <div className="space-y-2 text-sm">
            <p>Theme Mode</p><SelectField value="Light" />
            <p>Language</p><SelectField value="English" />
            <p>Currency</p><SelectField value="INR (Rs)" />
            <p>Timezone</p><SelectField value="Asia/Kolkata (UTC +5:30)" />
            <p>Date Format</p><SelectField value="DD MMM YYYY" />
            <p>Time Format</p><SelectField value="12 Hour (AM/PM)" />
            <button className="mt-2 h-10 w-full rounded-lg bg-[#ff8b00] text-sm font-semibold text-white hover:bg-[#ef7f00]">Save Preferences</button>
          </div>
        </div>

        <div className={`${sectionClass} xl:col-span-3`}>
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-700"><MdSecurity size={20} /></span>
            <h3 className="text-[24px] font-bold text-[#1d1b19]">Security Settings</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Two Factor Authentication</span>
              <Toggle checked />
            </div>
            <p>Session Timeout</p><SelectField value="30 Minutes" />
            <div className="grid grid-cols-[1fr_120px] items-center gap-2">
              <span>Login Activity</span>
              <button className="h-10 rounded-lg border border-[#ece8e1] text-sm font-semibold text-[#374151]">View Logs</button>
            </div>
            <div className="grid grid-cols-[1fr_120px] items-center gap-2">
              <span>Device History</span>
              <button className="h-10 rounded-lg border border-[#ece8e1] text-sm font-semibold text-[#374151]">View Devices</button>
            </div>
            <p>Password Expiry</p><SelectField value="90 Days" />
            <p>Login Attempts Limit</p><SelectField value="5 Attempts" />
            <button className="mt-2 h-10 w-full rounded-lg bg-[#ff8b00] text-sm font-semibold text-white hover:bg-[#ef7f00]">Save Security Settings</button>
          </div>
        </div>

        <div className="space-y-4 xl:col-span-3">
          <div className={sectionClass}>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-700"><MdBackup size={20} /></span>
              <h3 className="text-[24px] font-bold text-[#1d1b19]">Backup & Restore</h3>
            </div>
            <div className="space-y-2 text-sm text-[#2b3240]">
              <div className="flex items-center justify-between"><span>Last Backup</span><span>20 May 2026, 11:45 PM</span></div>
              <div className="grid grid-cols-[1fr_130px] items-center gap-2">
                <span>Backup Frequency</span>
                <SelectField value="Daily" />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button className="h-10 rounded-lg bg-[#ff8b00] text-sm font-semibold text-white hover:bg-[#ef7f00]">Backup Now</button>
                <button className="h-10 rounded-lg border border-[#d6def2] bg-[#f4f8ff] text-sm font-semibold text-blue-700">Export Database</button>
              </div>
              <button className="h-10 w-full rounded-lg border border-[#f3b5b5] text-sm font-semibold text-rose-600">Restore</button>
            </div>
          </div>

          <div className={sectionClass}>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700"><MdSupportAgent size={20} /></span>
              <h3 className="text-[24px] font-bold text-[#1d1b19]">Help & Support</h3>
            </div>
            <p className="text-sm text-[#5c6675]">If you face any issues, our support team is ready to help you.</p>
            <button className="mt-3 h-10 w-full rounded-lg border border-[#ece8e1] text-sm font-semibold text-[#374151]">Contact Support</button>
          </div>
        </div>
      </div>

      <div className="pb-2 text-sm text-gray-600 flex items-center justify-between">
        <span>(C) 2026 Sri Shanti Mahadev Mandir. All rights reserved.</span>
        <span className="text-amber-700 font-medium">Sacred Temple Management System</span>
      </div>
    </div>
  );
};

export default SettingsManagement;
