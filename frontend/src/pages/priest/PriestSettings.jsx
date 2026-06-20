import { useState, useEffect } from "react";
import { getSettings, updateSettings } from "../../services/priestService";
import { FiSettings, FiBell, FiCalendar, FiBookOpen, FiSave } from "react-icons/fi";

const PriestSettings = () => {
  const [settings, setSettings] = useState({
    smsNotifications: true,
    dutyReminders: true,
    calendarWidget: true,
    agamaReferenceModule: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getSettings();
      if (data) {
        setSettings({
          smsNotifications: data.smsNotifications ?? true,
          dutyReminders: data.dutyReminders ?? true,
          calendarWidget: data.calendarWidget ?? true,
          agamaReferenceModule: data.agamaReferenceModule ?? false,
        });
      }
    } catch (err) {
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      await updateSettings(settings);
      setSuccess("Settings updated successfully");
    } catch (err) {
      setError("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Loading settings...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FiSettings className="text-slate-400" /> Settings & Preferences
        </h1>
        <p className="text-slate-500">Customize your dashboard and notification preferences.</p>
      </div>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">{error}</div>}
      {success && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Notifications Section */}
        <div className="rounded-[24px] border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2"><FiBell className="text-amber-500"/> Notifications</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">SMS Notifications</p>
                <p className="text-sm text-slate-500">Receive SMS alerts for new pooja assignments.</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle("smsNotifications")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.smsNotifications ? 'bg-amber-500' : 'bg-slate-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.smsNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between border-t border-slate-100 pt-6">
              <div>
                <p className="font-medium text-slate-900">Duty Reminders</p>
                <p className="text-sm text-slate-500">Get reminders 30 mins before special and festival duties.</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle("dutyReminders")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.dutyReminders ? 'bg-amber-500' : 'bg-slate-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.dutyReminders ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Section */}
        <div className="rounded-[24px] border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2"><FiCalendar className="text-amber-500"/> Dashboard Layout</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Show Calendar Widget</p>
                <p className="text-sm text-slate-500">Display the interactive calendar on your main dashboard.</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle("calendarWidget")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.calendarWidget ? 'bg-amber-500' : 'bg-slate-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.calendarWidget ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-6">
              <div>
                <p className="font-medium text-slate-900 flex items-center gap-2">Agama Reference Module <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">BETA</span></p>
                <p className="text-sm text-slate-500">Enable quick access to Agama Shastra references in the sidebar.</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle("agamaReferenceModule")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.agamaReferenceModule ? 'bg-amber-500' : 'bg-slate-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.agamaReferenceModule ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70"
          >
            <FiSave /> {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>

      </form>
    </div>
  );
};

export default PriestSettings;
