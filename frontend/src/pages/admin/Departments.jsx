import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout.jsx";
import api from "../../utils/api.js";
import { Building2, Plus, Edit2, Trash2, X, CheckCircle, AlertCircle } from "lucide-react";

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", head: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const fetchDepts = async () => {
    const { data } = await api.get("/admin/departments");
    setDepartments(data.departments);
    setLoading(false);
  };

  useEffect(() => { fetchDepts(); }, []);

  const openModal = (dept = null) => {
    setModal(dept ? "edit" : "add");
    setForm(dept ? { name: dept.name, description: dept.description || "", head: dept.head || "", _id: dept._id } : { name: "", description: "", head: "" });
    setMsg(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      if (modal === "edit") {
        await api.put(`/admin/departments/${form._id}`, { name: form.name, description: form.description, head: form.head });
      } else {
        await api.post("/admin/departments", form);
      }
      await fetchDepts();
      setModal(null);
      setMsg({ type: "success", text: `Department ${modal === "edit" ? "updated" : "added"} successfully!` });
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.error || "Operation failed" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this department?")) return;
    await api.delete(`/admin/departments/${id}`);
    setDepartments((prev) => prev.filter((d) => d._id !== id));
  };

  const defaultDepts = ["Roads", "Electricity", "Water Supply", "Sanitation", "Police"];

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Department Management</h1>
            <p className="text-gray-500 mt-1">Manage government departments for complaint routing</p>
          </div>
          <button onClick={() => openModal()} className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Department
          </button>
        </div>

        {msg && !modal && (
          <div className={`flex items-center gap-3 rounded-xl p-4 ${msg.type === "success" ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"}`}>
            {msg.type === "success" ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
            <p className={`text-sm ${msg.type === "success" ? "text-emerald-700" : "text-red-700"}`}>{msg.text}</p>
          </div>
        )}

        {departments.length === 0 && !loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <p className="text-blue-800 font-semibold mb-2">No departments yet</p>
            <p className="text-blue-600 text-sm mb-4">Add these common departments to get started:</p>
            <div className="flex flex-wrap gap-2">
              {defaultDepts.map((d) => (
                <button key={d} onClick={() => { setForm({ name: d, description: "", head: "" }); setModal("add"); }}
                  className="text-sm bg-white border border-blue-200 hover:bg-blue-600 hover:text-white text-blue-700 px-3 py-1.5 rounded-lg transition-colors font-medium">
                  + {d}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {departments.map((d) => (
              <div key={d._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openModal(d)} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(d._id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{d.name}</h3>
                {d.head && <p className="text-xs text-gray-500 mb-1">Head: {d.head}</p>}
                {d.description && <p className="text-sm text-gray-500 line-clamp-2">{d.description}</p>}
              </div>
            ))}
          </div>
        )}

        {modal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">{modal === "edit" ? "Edit Department" : "Add Department"}</h3>
                <button onClick={() => setModal(null)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {msg && (
                <div className={`mx-6 mt-4 flex items-center gap-3 rounded-xl p-3 ${msg.type === "success" ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"}`}>
                  <p className={`text-sm ${msg.type === "success" ? "text-emerald-700" : "text-red-700"}`}>{msg.text}</p>
                </div>
              )}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Department Name *</label>
                  <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Department Head</label>
                  <input type="text" value={form.head} onChange={(e) => setForm({ ...form, head: e.target.value })} className="input-field" placeholder="Name of the head officer" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field resize-none" rows={3} placeholder="Brief description..." />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving} className="flex-1 btn-primary py-2.5 disabled:opacity-60">
                    {saving ? "Saving..." : modal === "edit" ? "Update" : "Add Department"}
                  </button>
                  <button type="button" onClick={() => setModal(null)} className="btn-secondary px-6">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
