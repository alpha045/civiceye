import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout.jsx";
import api from "../../utils/api.js";
import { Users, Shield, FileText, CheckCircle, UserPlus, ToggleLeft, Trash2, X, AlertCircle } from "lucide-react";

export default function SuperAdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");
  const [showModal, setShowModal] = useState(false);
  const [adminForm, setAdminForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [formMsg, setFormMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [analyticsRes, usersRes, adminsRes] = await Promise.all([
        api.get("/superadmin/analytics"),
        api.get("/superadmin/users"),
        api.get("/superadmin/admins"),
      ]);
      setAnalytics(analyticsRes.data);
      setUsers(usersRes.data.users);
      setAdmins(adminsRes.data.admins);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleToggle = async (id) => {
    await api.put(`/superadmin/users/${id}/toggle`);
    setUsers((prev) => prev.map((u) => u._id === id ? { ...u, isActive: !u.isActive } : u));
  };

  const handleDeleteUser = async (id) => {
    if (!confirm("Delete this user permanently?")) return;
    await api.delete(`/superadmin/users/${id}`);
    setUsers((prev) => prev.filter((u) => u._id !== id));
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormMsg(null);
    try {
      const { data } = await api.post("/superadmin/admins", adminForm);
      setAdmins((prev) => [data.admin, ...prev]);
      setShowModal(false);
      setAdminForm({ name: "", email: "", phone: "", password: "" });
    } catch (err) {
      setFormMsg(err.response?.data?.error || "Failed to create admin");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminLayout><div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div></AdminLayout>;

  const statCards = [
    { label: "Total Users", value: analytics?.totalUsers || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Admins", value: analytics?.totalAdmins || 0, icon: Shield, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Total Complaints", value: analytics?.totalComplaints || 0, icon: FileText, color: "text-gray-700", bg: "bg-gray-50" },
    { label: "Resolved", value: analytics?.resolved || 0, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Resolution Rate", value: `${analytics?.resolutionRate || 0}%`, icon: CheckCircle, color: "text-cyan-600", bg: "bg-cyan-50" },
    { label: "Pending", value: analytics?.pending || 0, icon: FileText, color: "text-yellow-600", bg: "bg-yellow-50" },
  ];

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Full platform overview and management</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary inline-flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Add Admin
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            {["overview", "users", "admins"].map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-6 py-4 text-sm font-semibold transition-colors capitalize ${tab === t ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50" : "text-gray-500 hover:text-gray-700"}`}>
                {t === "overview" ? "Platform Overview" : t === "users" ? `Users (${users.length})` : `Admins (${admins.length})`}
              </button>
            ))}
          </div>

          <div className="p-6">
            {tab === "overview" && (
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900">Recent Users</h3>
                <div className="divide-y divide-gray-100">
                  {analytics?.recentUsers?.map((u) => (
                    <div key={u._id} className="flex items-center gap-4 py-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-700 font-semibold text-sm">{u.name?.[0]?.toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                      <span className="text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "users" && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Name", "Email", "Phone", "Joined", "Status", "Actions"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs">
                              {u.name?.[0]?.toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-gray-900">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{u.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{u.phone || "—"}</td>
                        <td className="px-4 py-3 text-sm text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                            {u.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => handleToggle(u._id)} className="text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors">
                              <ToggleLeft className="w-3.5 h-3.5" />
                              {u.isActive ? "Deactivate" : "Activate"}
                            </button>
                            <button onClick={() => handleDeleteUser(u._id)} className="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && <p className="text-center py-10 text-gray-400">No users found</p>}
              </div>
            )}

            {tab === "admins" && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Name", "Email", "Phone", "Joined", "Status"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {admins.map((a) => (
                      <tr key={a._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold text-xs">
                              {a.name?.[0]?.toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-gray-900">{a.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{a.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{a.phone || "—"}</td>
                        <td className="px-4 py-3 text-sm text-gray-400">{new Date(a.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">Admin</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {admins.length === 0 && <p className="text-center py-10 text-gray-400">No admins yet</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Create Admin Account</h3>
              <button onClick={() => { setShowModal(false); setFormMsg(null); }} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            {formMsg && (
              <div className="mx-6 mt-4 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-700">{formMsg}</p>
              </div>
            )}
            <form onSubmit={handleCreateAdmin} className="p-6 space-y-4">
              {[
                { label: "Full Name", field: "name", type: "text", placeholder: "Admin Name" },
                { label: "Email", field: "email", type: "email", placeholder: "admin@example.com" },
                { label: "Phone", field: "phone", type: "tel", placeholder: "+91 98765 43210" },
                { label: "Password", field: "password", type: "password", placeholder: "Min. 6 characters" },
              ].map(({ label, field, type, placeholder }) => (
                <div key={field}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
                  <input type={type} value={adminForm[field]}
                    onChange={(e) => setAdminForm({ ...adminForm, [field]: e.target.value })}
                    className="input-field" placeholder={placeholder} required={field !== "phone"} />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 btn-primary py-2.5 disabled:opacity-60">
                  {saving ? "Creating..." : "Create Admin"}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary px-6">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
