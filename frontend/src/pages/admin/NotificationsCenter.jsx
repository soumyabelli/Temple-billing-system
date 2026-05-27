import { useEffect, useState } from "react";
import { getDevoteeNotifications, getSupportRequests } from "../../services/devoteeService";

const NotificationsCenter = ({ darkMode }) => {
  const [notifications, setNotifications] = useState([]);
  const [supportRequests, setSupportRequests] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [nRes, sRes] = await Promise.all([getDevoteeNotifications(), getSupportRequests()]);
        setNotifications(nRes.notifications || []);
        setSupportRequests(sRes.requests || []);
      } catch (error) {
        console.warn("Unable to load notifications center", error);
      }
    };
    load();
  }, []);

  return (
    <div className="mt-5 space-y-4">
      <div className={`rounded-2xl border p-5 ${darkMode ? "bg-[#1f2937] border-[#334155]" : "bg-white border-[#ece8e1]"}`}>
        <h2 className={`text-2xl font-bold ${darkMode ? "text-slate-100" : "text-[#1d1b19]"}`}>Support Requests From Devotees</h2>
        <div className="mt-4 space-y-3">
          {supportRequests.length ? supportRequests.map((item) => (
            <div key={item._id} className={`rounded-xl border p-4 ${darkMode ? "border-[#334155] bg-[#0f172a]" : "border-[#eee] bg-[#fbfbfb]"}`}>
              <p className="font-semibold">{item.subject}</p>
              <p className="text-sm opacity-80">{item.name} ({item.email})</p>
              <p className="mt-2 text-sm">{item.message}</p>
            </div>
          )) : <p className="text-sm opacity-80">No support requests yet.</p>}
        </div>
      </div>

      <div className={`rounded-2xl border p-5 ${darkMode ? "bg-[#1f2937] border-[#334155]" : "bg-white border-[#ece8e1]"}`}>
        <h2 className={`text-2xl font-bold ${darkMode ? "text-slate-100" : "text-[#1d1b19]"}`}>System Notifications</h2>
        <div className="mt-4 space-y-3">
          {notifications.length ? notifications.map((item) => (
            <div key={item._id} className={`rounded-xl border p-4 ${darkMode ? "border-[#334155] bg-[#0f172a]" : "border-[#eee] bg-[#fbfbfb]"}`}>
              <p className="font-semibold">{item.title}</p>
              <p className="text-sm opacity-80">{new Date(item.date || item.createdAt).toLocaleString()}</p>
              <p className="mt-2 text-sm">{item.message}</p>
            </div>
          )) : <p className="text-sm opacity-80">No notifications available.</p>}
        </div>
      </div>
    </div>
  );
};

export default NotificationsCenter;
