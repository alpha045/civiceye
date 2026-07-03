import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout.jsx";
import api from "../../utils/api.js";
import { Link } from "react-router-dom";
import { FileText, Clock, CheckCircle, AlertTriangle, Users, ArrowRight } from "lucide-react";

const statusBadge = (status) => {
  const map = { "Pending": "badge-pending", "Under Review": "badge-underreview", "In Progress": "badge-inprogress", "Resolved": "badge-resolved", "Rejected": "badge-rejected" };
  return <span className={map[status] || "badge-pending"}>{status}</span>;
};

const priorityColors = { Low: "bg-green-100 text-green-700", Medium: "bg-yellow-100 text-yellow-700", High: "bg-orange-100 text-orange-700", Urgent: "bg-red-100 text-red-700" };

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/dashboard").then((r) => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </AdminLayout>
  );

  const stats = [
    { label: "Total Complaints", value: data?.total || 0, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Pending", value: data?.pending || 0, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Resolved", value: data?.resolved || 0, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "High Priority", value: data?.highPriority || 0, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50" },
    { label: "Total Users", value: data?.totalUsers || 0, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "In Progress", value: data?.inProgress || 0, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
  ];

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of all complaints and platform activity</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="stat-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
                <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {data?.byCategory?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-5">Complaints by Category</h2>
              <div className="space-y-3">
                {data.byCategory.map(({ _id, count }) => (
                  <div key={_id} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-28 shrink-0">{_id}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(100, (count / (data.total || 1)) * 100)}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 w-8 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900">Recent Complaints</h2>
              <Link to="/admin/complaints" className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {data?.recentComplaints?.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-8">No complaints yet</p>
              )}
              {data?.recentComplaints?.map((c) => (
                <Link key={c._id} to={`/admin/complaints/${c._id}`} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600">{c.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{c.userId?.name} · {new Date(c.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${priorityColors[c.priority]}`}>{c.priority}</span>
                    {statusBadge(c.status)}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
