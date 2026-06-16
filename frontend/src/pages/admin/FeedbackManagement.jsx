import { useEffect, useState } from "react";
import { getSupportRequests, replySupportRequest } from "../../services/devoteeService";

const FeedbackManagement = () => {
  const [supportRequests, setSupportRequests] = useState([]);
  const [replyTexts, setReplyTexts] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getSupportRequests();
        setSupportRequests(res.requests || []);
      } catch (error) {
        console.warn("Unable to load feedback requests", error);
      }
    };
    load();
  }, []);

  const handleReplyChange = (id, value) => {
    setReplyTexts((prev) => ({ ...prev, [id]: value }));
  };

  const handleSendReply = async (id) => {
    const reply = (replyTexts[id] || "").trim();
    if (!reply) return;
    setSavingId(id);
    try {
      await replySupportRequest(id, { reply, status: "Closed" });
      const res = await getSupportRequests();
      setSupportRequests(res.requests || []);
      setReplyTexts((prev) => ({ ...prev, [id]: "" }));
      setStatusMessage("Reply sent successfully.");
    } catch (error) {
      console.warn("Unable to send reply", error);
      setStatusMessage("Unable to send reply. Please try again.");
    } finally {
      setSavingId(null);
      setTimeout(() => setStatusMessage(""), 4000);
    }
  };

  return (
    <div className="mt-5 space-y-4">
      <div className="rounded-2xl border border-[#ece8e1] bg-white p-5 shadow-sm">
        <h1 className="text-[42px] font-bold text-[#15141f]">Feedback & Complaints</h1>
        <p className="mt-1 text-[18px] text-[#5d6674]">Review devotee feedback submissions and reply to each request directly.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-[#ece8e1] bg-white p-5 shadow-sm">
          <h2 className="text-[30px] font-bold text-[#15141f]">Open Feedback Requests</h2>
          <div className="mt-5 space-y-4">
            {supportRequests.length > 0 ? (
              supportRequests.map((request) => (
                <div key={request._id} className="rounded-3xl border border-[#f0f0f0] bg-[#fafafa] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xl font-semibold text-[#111827]">{request.subject}</p>
                      <p className="text-sm text-[#6b7280]">{request.name} • {request.email}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-sm font-semibold ${request.status === "Closed" ? "bg-[#def5e5] text-[#166534]" : "bg-[#fef3c7] text-[#92400e]"}`}>
                      {request.status || "Open"}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-[#374151]">{request.message}</p>

                  {request.reply ? (
                    <div className="mt-4 rounded-3xl border border-[#e5e7eb] bg-white p-4 text-sm text-[#1f2937]">
                      <p className="font-semibold">Reply Sent</p>
                      <p className="mt-2">{request.reply}</p>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      <textarea
                        rows={4}
                        value={replyTexts[request._id] || ""}
                        onChange={(e) => handleReplyChange(request._id, e.target.value)}
                        placeholder="Write your reply here"
                        className="w-full rounded-3xl border border-[#d1d5db] bg-white px-4 py-3 text-sm outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleSendReply(request._id)}
                        disabled={savingId === request._id}
                        className="rounded-2xl bg-[#1b7f77] px-4 py-3 text-sm font-semibold text-white"
                      >
                        {savingId === request._id ? "Sending..." : "Send Reply"}
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-[#6b7280]">No feedback or complaints have been submitted yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-[#ece8e1] bg-white p-5 shadow-sm">
          <h2 className="text-[24px] font-bold text-[#15141f]">How this works</h2>
          <ul className="mt-4 space-y-3 text-sm text-[#4b5563]">
            <li className="rounded-2xl bg-[#f8fafc] p-4">Devotees submit feedback from their dashboard.</li>
            <li className="rounded-2xl bg-[#f8fafc] p-4">Admins can review requests, reply, and close them.</li>
            <li className="rounded-2xl bg-[#f8fafc] p-4">Replied feedback is visible in the request details.</li>
          </ul>
          {statusMessage && <p className="mt-4 rounded-2xl bg-[#ecfdf5] px-4 py-3 text-sm text-[#166534]">{statusMessage}</p>}
        </div>
      </div>
    </div>
  );
};

export default FeedbackManagement;
