import { useEffect, useState } from "react";
import axios from "axios";
import { FiSave } from "react-icons/fi";
import SectionCard from "../../../components/admin/employee/SectionCard";

const AttendanceSettings = () => {
  const [settings, setSettings] = useState({
    templeLatitude: 0,
    templeLongitude: 0,
    allowedRadius: 50,
    lateThreshold: 15,
    earlyCheckInWindow: 30,
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/attendance/settings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success && res.data.settings) {
        setSettings(res.data.settings);
      }
    } catch (error) {
      console.error(error);
      setMessage("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: Number(e.target.value) });
  };

  const handleSave = async () => {
    setMessage("Saving...");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/api/attendance/settings", settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setMessage("Settings saved successfully.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Failed to save settings.");
    }
  };

  if (loading) return <div>Loading settings...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Attendance Settings</h1>
        <button onClick={handleSave} className="flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800">
          <FiSave /> Save Settings
        </button>
      </div>
      {message && <p className="font-semibold text-slate-700">{message}</p>}

      <SectionCard title="Temple Location" subtitle="Configure temple GPS coordinates for location-based attendance.">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Temple Latitude</label>
            <input type="number" name="templeLatitude" value={settings.templeLatitude} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-400 focus:bg-white" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Temple Longitude</label>
            <input type="number" name="templeLongitude" value={settings.templeLongitude} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-400 focus:bg-white" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Allowed Radius (meters)</label>
            <input type="number" name="allowedRadius" value={settings.allowedRadius} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-400 focus:bg-white" />
            <p className="mt-1 text-xs text-slate-500">Maximum distance allowed to mark attendance.</p>
          </div>
        </div>
      </SectionCard>
      
      <SectionCard title="Time Thresholds" subtitle="Configure late arrival and early check-in windows.">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Late Threshold (minutes)</label>
            <input type="number" name="lateThreshold" value={settings.lateThreshold} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-400 focus:bg-white" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Early Check-in Window (minutes)</label>
            <input type="number" name="earlyCheckInWindow" value={settings.earlyCheckInWindow} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-400 focus:bg-white" />
          </div>
        </div>
      </SectionCard>
    </div>
  );
};

export default AttendanceSettings;
