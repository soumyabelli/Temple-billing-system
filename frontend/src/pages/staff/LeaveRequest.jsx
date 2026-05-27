import "./LeaveRequest.css";

import { useState } from "react";

import axios from "axios";

const staff = JSON.parse(localStorage.getItem("user"));

const LeaveRequest = () => {

  const [form, setForm] = useState({
    leaveType: "General",
    reason: "",
    fromDate: "",
    toDate: "",
  });

  const handleSubmit = async (e) => {

    e.preventDefault();

    await axios.post(
      "http://localhost:5000/api/leaves/apply",
      {
        ...form,
        staffId: staff?.id || staff?._id,
        staffName: staff?.name || "Staff",
      }
    );

    alert("Leave Applied Successfully");
  };

  return (

    <div className="leave-container">

      <form onSubmit={handleSubmit}>

        <h2>Apply Leave</h2>

        <select
          value={form.leaveType}
          onChange={(e) =>
            setForm({
              ...form,
              leaveType: e.target.value,
            })
          }
        >
          <option value="General">General</option>
          <option value="Sick Leave">Sick Leave</option>
          <option value="Casual Leave">Casual Leave</option>
          <option value="Festival Leave">Festival Leave</option>
          <option value="Emergency Leave">Emergency Leave</option>
        </select>

        <input
          type="text"
          placeholder="Reason"
          onChange={(e) =>
            setForm({
              ...form,
              reason: e.target.value,
            })
          }
        />

        <input
          type="date"
          onChange={(e) =>
            setForm({
              ...form,
              fromDate: e.target.value,
            })
          }
        />

        <input
          type="date"
          onChange={(e) =>
            setForm({
              ...form,
              toDate: e.target.value,
            })
          }
        />

        <button>
          Submit Leave
        </button>

      </form>

    </div>
  );
};

export default LeaveRequest;
