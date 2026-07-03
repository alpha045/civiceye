import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchComplaints } from "../../store/slices/complaintSlice.js";
import UserLayout from "../../layouts/UserLayout.jsx";
import { FileText, Search, Filter } from "lucide-react";

const statusBadge = (status) => {
  const map = { "Pending": "badge-pending", "Under Review": "badge-underreview", "In Progress": "badge-inprogress", "Resolved": "badge-resolved", "Rejected": "badge-rejected" };
  return <span className={map[status] || "badge-pending"}>{status}</span>;
};

const priorityColors = { Low: "bg-green-100 text-green-700", Medium: "bg-yellow-100 text-yellow-700", High: "bg-orange-100 text-orange-700", Urgent: "bg-red-100 text-red-700" };

export default function MyComplaints() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((s) => s.complaints);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => { dispatch(fetchComplaints()); }, [dispatch]);

  const filtered = list.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.trackingId?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus ? c.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  return (
    <UserLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Complaints</h1>
          <p className="text-gray-500 mt-1">Track and manage all your submitted complaints</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10" placeholder="Search by title or tracking ID..." />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field w-48">
              <option value="">All statuses</option>
              {["Pending", "Under Review", "In Progress", "Resolved", "Rejected"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <FileText className="w-14 h-14 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-medium">No complaints found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {["Tracking ID", "Title", "Category", "Priority", "Status", "Date", "Department"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-blue-600 font-medium">{c.trackingId}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 max-w-[160px] truncate">{c.title}</div>
                        <div className="text-xs text-gray-400 max-w-[160px] truncate">{c.description}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{c.category}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${priorityColors[c.priority]}`}>{c.priority}</span>
                      </td>
                      <td className="px-6 py-4">{statusBadge(c.status)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{c.assignedDepartment?.name || "—"}</td>
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
