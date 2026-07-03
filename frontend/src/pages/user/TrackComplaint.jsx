import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { trackComplaint, clearTracked, clearError } from "../../store/slices/complaintSlice.js";
import UserLayout from "../../layouts/UserLayout.jsx";
import { Search, CheckCircle, Clock, Loader, XCircle, Eye, MapPin, Building2, MessageSquare } from "lucide-react";

const steps = ["Pending", "Under Review", "In Progress", "Resolved"];
const statusIndex = { "Pending": 0, "Under Review": 1, "In Progress": 2, "Resolved": 3, "Rejected": -1 };

const priorityColors = { Low: "bg-green-100 text-green-700", Medium: "bg-yellow-100 text-yellow-700", High: "bg-orange-100 text-orange-700", Urgent: "bg-red-100 text-red-700" };

export default function TrackComplaint() {
  const [trackingId, setTrackingId] = useState("");
  const dispatch = useDispatch();
  const { tracked, loading, error } = useSelector((s) => s.complaints);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    dispatch(clearTracked());
    dispatch(clearError());
    dispatch(trackComplaint(trackingId.trim()));
  };

  const currentStep = tracked ? statusIndex[tracked.status] : -1;

  return (
    <UserLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Track Complaint</h1>
          <p className="text-gray-500 mt-1">Enter your tracking ID to check the status of your complaint</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" value={trackingId} onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
              className="input-field pl-10 uppercase font-mono text-lg py-3" placeholder="e.g. CIV-A3B2C1" />
          </div>
          <button type="submit" disabled={loading || !trackingId.trim()} className="btn-primary px-8 py-3 disabled:opacity-60">
            {loading ? "Searching..." : "Track"}
          </button>
        </form>

        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-5">
            <XCircle className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <p className="font-semibold text-red-800">Complaint not found</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {tracked && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-blue-600 font-bold text-lg">{tracked.trackingId}</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${priorityColors[tracked.priority]}`}>{tracked.priority}</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{tracked.title}</h2>
                </div>
                <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${
                  tracked.status === "Resolved" ? "bg-emerald-100 text-emerald-700" :
                  tracked.status === "Rejected" ? "bg-red-100 text-red-700" :
                  tracked.status === "In Progress" ? "bg-blue-100 text-blue-700" :
                  "bg-yellow-100 text-yellow-700"
                }`}>{tracked.status}</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start gap-3">
                  <Eye className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Category</p>
                    <p className="text-sm text-gray-700 font-medium">{tracked.category}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Location</p>
                    <p className="text-sm text-gray-700">{tracked.address}</p>
                  </div>
                </div>
                {tracked.assignedDepartment && (
                  <div className="flex items-start gap-3">
                    <Building2 className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Assigned Department</p>
                      <p className="text-sm text-gray-700 font-medium">{tracked.assignedDepartment.name}</p>
                    </div>
                  </div>
                )}
                {tracked.adminRemarks && (
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Admin Remarks</p>
                      <p className="text-sm text-gray-700">{tracked.adminRemarks}</p>
                    </div>
                  </div>
                )}
              </div>

              {tracked.description && (
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <p className="text-xs text-gray-400 font-medium mb-2">Description</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{tracked.description}</p>
                </div>
              )}

              {tracked.image && (
                <div className="mb-6">
                  <p className="text-xs text-gray-400 font-medium mb-2">Attached Image</p>
                  <img src={tracked.image} alt="complaint" className="rounded-xl max-h-48 object-cover border border-gray-200" />
                </div>
              )}

              {tracked.status !== "Rejected" ? (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-4">Progress Timeline</p>
                  <div className="flex items-center gap-0">
                    {steps.map((step, i) => (
                      <div key={step} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                            ${i <= currentStep ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-400"}`}>
                            {i < currentStep ? <CheckCircle className="w-4 h-4" /> : i === currentStep ? <Loader className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                          </div>
                          <p className={`text-xs mt-2 font-medium text-center w-16 leading-tight ${i <= currentStep ? "text-blue-700" : "text-gray-400"}`}>{step}</p>
                        </div>
                        {i < steps.length - 1 && (
                          <div className={`flex-1 h-1 mx-1 rounded ${i < currentStep ? "bg-blue-600" : "bg-gray-200"}`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                  <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <div>
                    <p className="font-semibold text-red-800">Complaint Rejected</p>
                    <p className="text-red-600 text-sm">{tracked.adminRemarks || "Your complaint has been rejected."}</p>
                  </div>
                </div>
              )}
            </div>

            {tracked.timeline?.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-5">Activity Timeline</h3>
                <div className="space-y-4">
                  {[...tracked.timeline].reverse().map((t, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-1 shrink-0" />
                        {i < tracked.timeline.length - 1 && <div className="w-0.5 bg-gray-200 flex-1 mt-1" />}
                      </div>
                      <div className="pb-4">
                        <p className="text-sm font-semibold text-gray-900">{t.status}</p>
                        <p className="text-sm text-gray-500">{t.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(t.date).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
