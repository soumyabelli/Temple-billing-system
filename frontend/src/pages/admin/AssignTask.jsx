import { useMemo, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

const AssignTask = () => {
  const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");

  const assignedByDefault = useMemo(() => {
    const role = String(loggedInUser?.role || "").trim();
    const roleLabel = role ? role.charAt(0).toUpperCase() + role.slice(1) : "Admin";
    const name = loggedInUser?.name ? ` (${loggedInUser.name})` : "";
    return `${roleLabel}${name}`;
  }, [loggedInUser?.name, loggedInUser?.role]);

  const [form, setForm] = useState({
    staffId: "",
    staffName: "",
    duty: "",
    area: "",
    time: "",
    assignedBy: assignedByDefault,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.staffId || !form.staffName || !form.duty || !form.area || !form.time || !form.assignedBy) {
      alert("Please fill all fields");
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.post(`${API_BASE}/staff/assign-task`, form);
      alert("Task assigned successfully");
      setForm((prev) => ({
        ...prev,
        staffId: "",
        staffName: "",
        duty: "",
        area: "",
        time: "",
      }));
    } catch (error) {
      alert(error.response?.data?.message || "Failed to assign task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "30px", maxWidth: "560px" }}>
      <h1 style={{ marginBottom: "20px" }}>Assign Task</h1>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "16px",
          padding: "18px",
        }}
      >
        <input
          placeholder="Staff ID"
          value={form.staffId}
          onChange={(e) => setForm({ ...form, staffId: e.target.value })}
        />

        <input
          placeholder="Staff Name"
          value={form.staffName}
          onChange={(e) => setForm({ ...form, staffName: e.target.value })}
        />

        <input
          placeholder="Duty (e.g. Clean Main Hall)"
          value={form.duty}
          onChange={(e) => setForm({ ...form, duty: e.target.value })}
        />

        <input
          placeholder="Area (e.g. Temple Hall)"
          value={form.area}
          onChange={(e) => setForm({ ...form, area: e.target.value })}
        />

        <input
          placeholder="Time (e.g. 6:00 AM)"
          value={form.time}
          onChange={(e) => setForm({ ...form, time: e.target.value })}
        />

        <input
          placeholder="Assigned By"
          value={form.assignedBy}
          onChange={(e) => setForm({ ...form, assignedBy: e.target.value })}
        />

        <button disabled={isSubmitting} style={{ padding: "12px", cursor: "pointer" }}>
          {isSubmitting ? "Assigning..." : "Assign Task"}
        </button>
      </form>
    </div>
  );
};

export default AssignTask;
