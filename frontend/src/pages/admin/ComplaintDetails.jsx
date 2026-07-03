import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout.jsx";
import api from "../../utils/api.js";
import { ArrowLeft, User, MapPin, Building2, CheckCircle, AlertCircle } from "lucide-react";

const STATUSES = ["Pending", "Under Review", "In Progress", "Resolved", "Rejected"];
const priorityColors = { Low: "bg-green-100 text-green-700", Medium: "bg-yellow-100 text-yellow-700", High: "bg-orange-100 text-orange-700", Urgent: "bg-red-100 text-red-700" };

// 🎯 FIXED: Port ko 5000 se badal kar 5001 kiya jo aapka active backend port h
const BACKEND_URL = "http://localhost:5001"; 

export default function ComplaintDetails() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ status: "", adminRemarks: "", assignedDepartment: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    Promise.all([api.get(`/admin/complaints/${id}`), api.get("/admin/departments")])
      .then(([c, d]) => {
        setComplaint(c.data.complaint);
        setDepartments(d.data.departments);
        setForm({ status: c.data.complaint.status, adminRemarks: c.data.complaint.adminRemarks || "", assignedDepartment: c.data.complaint.assignedDepartment?._id || "" });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const { data } = await api.put(`/admin/complaints/${id}`, form);
      setComplaint(data.complaint);
      setMsg({ type: "success", text: "Complaint updated successfully!" });
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.error || "Update failed" });
    } finally {
      setSaving(false);
    }
  };

  // 🎯 FIXED IMAGE FALLBACK PIPELINE
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    
    // Agar full absolute url safe save hua h database me
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://") || imagePath.startsWith("data:")) {
      return imagePath; 
    }
    
    // Agar cloud storage object relative key de raha ho
    if (imagePath.includes("civiceye/")) {
      return `https://res.cloudinary.com/civiceye/image/upload/${imagePath}`;
    }
    
    // Agar static backup locally physical store hua ho backend context me
    return `${BACKEND_URL}/${imagePath.replace(/^\//, "")}`;
  };

  if (loading) return <AdminLayout><div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div></AdminLayout>;
  if (!complaint) return <AdminLayout><div className="text-center py-20 text-gray-400">Complaint not found</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/admin/complaints" className="w-9 h-9 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-500 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Complaint Details</h1>
            <p className="text-gray-500 text-sm font-mono">{complaint.trackingId}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{complaint.title}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${priorityColors[complaint.priority]}`}>{complaint.priority}</span>
                    <span className="text-xs text-gray-400">{complaint.category}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-700 leading-relaxed">{complaint.description}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Citizen</p>
                    <p className="text-sm font-medium text-gray-800">{complaint.userId?.name} · {complaint.userId?.email}</p>
                    {complaint.userId?.phone && <p className="text-xs text-gray-500">{complaint.userId.phone}</p>}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Location</p>
                    <p className="text-sm text-gray-700">{complaint.address}</p>
                  </div>
                </div>
                {complaint.assignedDepartment && (
                  <div className="flex items-start gap-3">
                    <Building2 className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">Assigned Department</p>
                      <p className="text-sm font-medium text-gray-700">{complaint.assignedDepartment.name}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 🎯 VALIDATED IMAGE CONTAINER */}
              {complaint.image && (
                <div className="mt-6 border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-400 font-semibold mb-2 uppercase tracking-wider">Attached Proof</p>
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center p-2">
                    <img 
                      src={getImageUrl(complaint.image)} 
                      alt="complaint" 
                      className="rounded-xl max-h-80 object-contain w-full transition-transform hover:scale-105 duration-200" 
                      onError={(e) => {
                        console.log("Image target load broken. Trigger source context:", e.target.src);
                        e.target.alt = "Failed to load proof asset from destination server.";
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {complaint.timeline?.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Activity Timeline</h3>
                <div className="space-y-4">
                  {[...complaint.timeline].reverse().map((t, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{t.status}</p>
                        <p className="text-sm text-gray-500">{t.message}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{new Date(t.date).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
            <h3 className="font-bold text-gray-900 mb-5">Update Complaint</h3>

            {msg && (
              <div className={`flex items-center gap-3 rounded-xl p-4 mb-4 ${msg.type === "success" ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"}`}>
                {msg.type === "success" ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
                <p className={`text-sm ${msg.type === "success" ? "text-emerald-700" : "text-red-700"}`}>{msg.text}</p>
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-blue-500 text-sm">
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Assign Department</label>
                <select value={form.assignedDepartment} onChange={(e) => setForm({ ...form, assignedDepartment: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-blue-500 text-sm">
                  <option value="">Not assigned</option>
                  {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Admin Remarks</label>
                <textarea value={form.adminRemarks} onChange={(e) => setForm({ ...form, adminRemarks: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm resize-none" rows={4} placeholder="Add official remarks or instructions..." />
              </div>

              <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-60">
                {saving ? "Updating..." : "Update Complaint"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}