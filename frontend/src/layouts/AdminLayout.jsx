import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice.js";
import {
  LayoutDashboard, FileText, Building2, BarChart3, Bell, Settings, LogOut, Menu, Eye, Shield, Users
} from "lucide-react";

const adminNav = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/complaints", icon: FileText, label: "All Complaints" },
  { to: "/admin/departments", icon: Building2, label: "Departments" },
  { to: "/admin/reports", icon: BarChart3, label: "Reports" },
];

const superNav = [
  { to: "/superadmin/dashboard", icon: Users, label: "Platform Overview" },
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Admin Dashboard" },
  { to: "/admin/complaints", icon: FileText, label: "All Complaints" },
  { to: "/admin/departments", icon: Building2, label: "Departments" },
  { to: "/admin/reports", icon: BarChart3, label: "Reports" },
];

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  const navItems = user?.role === "superadmin" ? superNav : adminNav;

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-900 shadow-xl transform transition-transform duration-300 flex flex-col
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
          <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-white text-lg leading-none">CivicEye</div>
            <div className="text-xs text-slate-400">
              {user?.role === "superadmin" ? "Super Admin" : "Admin Panel"}
            </div>
          </div>
        </div>

        <div className="px-4 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center">
              <span className="text-blue-400 font-semibold text-sm">{user?.name?.[0]?.toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate">{user?.name}</div>
              <div className="text-xs text-slate-400 capitalize">{user?.role}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                ${location.pathname === to
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}>
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-700">
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium w-full text-red-400 hover:bg-red-500/10 transition-all duration-200">
            <LogOut className="w-4 h-4 shrink-0" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-500 font-medium capitalize">{user?.role} Panel</span>
          </div>
          <div className="text-sm text-gray-500">{user?.email}</div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
