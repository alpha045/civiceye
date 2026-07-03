import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout.jsx";
import api from "../../utils/api.js";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/reports").then((r) => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout><div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div></AdminLayout>;

  const statusData = data?.byStatus?.map((d) => ({ name: d._id, value: d.count })) || [];
  const categoryData = data?.byCategory?.map((d) => ({ name: d._id, value: d.count })) || [];
  const priorityData = data?.byPriority?.map((d) => ({ name: d._id, value: d.count })) || [];
  const monthlyData = (data?.monthly || []).map((d) => ({
    name: `${d._id.year}-${String(d._id.month).padStart(2, "0")}`,
    Complaints: d.count,
  })).reverse();

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 mt-1">Visual insights into complaint data and department performance</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {monthlyData.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-6">Monthly Complaints</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="Complaints" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {statusData.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-6">Complaints by Status</h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2} dataKey="value">
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {categoryData.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-6">Complaints by Category</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={90} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {priorityData.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-6">Complaints by Priority</h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={priorityData} cx="50%" cy="50%" outerRadius={90} paddingAngle={2} dataKey="value">
                    {priorityData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {statusData.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
            <p className="text-gray-400 font-medium">No data to display yet.</p>
            <p className="text-gray-300 text-sm mt-1">Reports will appear once complaints are submitted.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
