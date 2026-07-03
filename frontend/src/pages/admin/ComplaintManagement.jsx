import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout.jsx";
import api from "../../utils/api.js";
import { Search, Filter, Eye, ChevronLeft, ChevronRight } from "lucide-react";

const statusBadge = (status) => {
  const map = { "Pending": "badge-pending", "Under Review": "badge-underreview", "In Progress": "badge-inprogress", "Resolved": "badge-resolved", "Rejected": "badge-rejected" };
  return <span className={map[status] || "badge-pending"}>{status}</span>;
};
const priorityColors = { Low: "bg-green-100 text-green-700", Medium: "bg-yellow-100 text-yellow-700", High: "bg-orange-100 text-orange-700", Urgent: "bg-red-100 text-red-700" };

export default function ComplaintManagement() {
  const [complaints, setComplaints] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [page, setPage] = useState(1);
  const pages = Math.ceil(total / 20);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page });
      if (search) params.set("search", search);
      if (filterStatus) params.set("status", filterStatus);
      if (filterPriority) params.set("priority", filterPriority);
      if (filterCategory) params.set("category", filterCategory);
      const { data } = await api.get(`/admin/complaints?${params}`);
      setComplaints(data.complaints);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, [page, filterStatus, filterPriority, filterCategory]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchComplaints(); };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Complaint Management</h1>
          <p className="text-gray-500 mt-1">{total} total complaints</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-wrap gap-3">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-48">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="input-field pl-9" />
              </div>
              <button type="submit" className="btn-primary px-4 py-2 text-sm">Search</button>
            </form>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400 shrink-0" />
              <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} className="input-field w-40">
                <option value="">All Status</option>
                {["Pending", "Under Review", "In Progress", "Resolved", "Rejected"].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={filterPriority} onChange={(e) => { setFilterPriority(e.target.value); setPage(1); }} className="input-field w-36">
                <option value="">All Priority</option>
                {["Low", "Medium", "High", "Urgent"].map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }} className="input-field w-40">
                <option value="">All Category</option>
                {["Roads", "Electricity", "Water Supply", "Sanitation", "Police", "Others"].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-20 text-gray-400">No complaints found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {["Tracking ID", "Citizen", "Title", "Category", "Priority", "Status", "Date", "Action"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {complaints.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 text-sm font-mono text-blue-600 font-medium">{c.trackingId}</td>
                      <td className="px-5 py-4">
                        <div className="text-sm font-medium text-gray-900">{c.userId?.name}</div>
                        <div className="text-xs text-gray-400">{c.userId?.email}</div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 max-w-35 truncate">{c.title}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{c.category}</td>
                      <td className="px-5 py-4"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${priorityColors[c.priority]}`}>{c.priority}</span></td>
                      <td className="px-5 py-4">{statusBadge(c.status)}</td>
                      <td className="px-5 py-4 text-sm text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <Link to={`/admin/complaints/${c._id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                          <Eye className="w-3.5 h-3.5" /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {pages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <span className="text-sm text-gray-500">Page {page} of {pages}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary p-2 disabled:opacity-40">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="btn-secondary p-2 disabled:opacity-40">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
