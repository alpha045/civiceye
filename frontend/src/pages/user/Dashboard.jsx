import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchComplaints } from "../../store/slices/complaintSlice.js";
import UserLayout from "../../layouts/UserLayout.jsx";
import { FileText, Clock, CheckCircle, Loader, FilePlus, ArrowRight } from "lucide-react";

const statusBadge = (status) => {
  const map = {
    "Pending": "badge-pending",
    "Under Review": "badge-underreview",
    "In Progress": "badge-inprogress",
    "Resolved": "badge-resolved",
    "Rejected": "badge-rejected",
  };
  return <span className={map[status] || "badge-pending"}>{status}</span>;
};

const priorityColors = { Low: "text-green-600", Medium: "text-yellow-600", High: "text-orange-500", Urgent: "text-red-600" };

export default function UserDashboard() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((s) => s.complaints);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => { dispatch(fetchComplaints()); }, [dispatch]);

  const total = list.length;
  const pending = list.filter((c) => c.status === "Pending").length;
  const resolved = list.filter((c) => c.status === "Resolved").length;
  const inProgress = list.filter((c) => ["In Progress", "Under Review"].includes(c.status)).length;

  const stats = [
    { label: "Total Complaints", value: total, icon: FileText, color: "bg-blue-500", bg: "bg-blue-50" },
    { label: "Pending", value: pending, icon: Clock, color: "bg-yellow-500", bg: "bg-yellow-50" },
    { label: "Resolved", value: resolved, icon: CheckCircle, color: "bg-emerald-500", bg: "bg-emerald-50" },
    { label: "In Progress", value: inProgress, icon: Loader, color: "bg-purple-500", bg: "bg-purple-50" },
  ];

  return (
    <UserLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name} 👋</h1>
            <p className="text-gray-500 mt-1">Here's an overview of your civic activity</p>
          </div>
          <Link to="/register-complaint" className="btn-primary inline-flex items-center gap-2 self-start">
            <FilePlus className="w-4 h-4" />
            New Complaint
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="stat-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
                <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${color.replace("bg-", "text-")}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Recent Complaints</h2>
            <Link to="/my-complaints" className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : list.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No complaints yet</p>
              <Link to="/register-complaint" className="text-blue-600 text-sm hover:underline mt-1 inline-block">
                Register your first complaint
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {["Tracking ID", "Title", "Category", "Priority", "Status", "Date"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {list.slice(0, 8).map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-blue-600 font-medium">{c.trackingId}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-50 truncate">{c.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{c.category}</td>
                      <td className="px-6 py-4 text-sm font-medium" style={{ color: priorityColors[c.priority] }}>{c.priority}</td>
                      <td className="px-6 py-4">{statusBadge(c.status)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
