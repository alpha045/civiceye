import {
  useState,
  useEffect,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import { logout } from "../store/slices/authSlice.js";

import api from "../utils/api.js";

import {
  LayoutDashboard,
  FilePlus,
  FileText,
  Search,
  Bell,
  User,
  LogOut,
  Menu,
  Eye,
  Shield,
} from "lucide-react";

const navItems = [
  {
    to: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
  },
  {
    to: "/register-complaint",
    icon: FilePlus,
    label: "Register Complaint",
  },
  {
    to: "/my-complaints",
    icon: FileText,
    label: "My Complaints",
  },
  {
    to: "/track-complaint",
    icon: Search,
    label: "Track Complaint",
  },
  {
    to: "/notifications",
    icon: Bell,
    label: "Notifications",
  },
  {
    to: "/profile",
    icon: User,
    label: "Profile",
  },
];

export default function UserLayout({
  children,
}) {

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const location = useLocation();

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const { user } = useSelector(
    (s) => s.auth
  );

  useEffect(() => {

    const fetchUnread =
      async () => {

        try {

          const { data } =
            await api.get(
              "/notifications/unread-count"
            );

          setUnreadCount(
            data.count
          );

        } catch (error) {

          console.log(error);

        }
      };

    fetchUnread();

    window.addEventListener(
      "new-notification",
      fetchUnread
    );

    return () => {

      window.removeEventListener(
        "new-notification",
        fetchUnread
      );

    };

  }, []);

  const handleLogout = () => {

    dispatch(logout());

    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50">

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 flex flex-col
        ${sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
          }`}
      >

        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">

          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
            <Eye className="w-5 h-5 text-white" />
          </div>

          <div>
            <div className="font-bold text-blue-700 text-lg leading-none">
              CivicEye
            </div>

            <div className="text-xs text-gray-400">
              Citizen Portal
            </div>
          </div>
        </div>

        <div className="px-4 py-4 border-b border-gray-100">

          <div className="flex items-center gap-3 px-2">

            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">

              <span className="text-blue-700 font-semibold text-sm">
                {user?.name?.[0]?.toUpperCase()}
              </span>

            </div>

            <div className="min-w-0">

              <div className="text-sm font-semibold text-gray-800 truncate">
                {user?.name}
              </div>

              <div className="text-xs text-gray-400 truncate">
                {user?.email}
              </div>

            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">

          {navItems.map(
            ({
              to,
              icon: Icon,
              label,
            }) => (

              <Link
                key={to}
                to={to}
                onClick={() =>
                  setSidebarOpen(false)
                }
                className={`sidebar-item ${location.pathname ===
                  to
                  ? "active"
                  : "text-gray-600"
                  }`}
              >

                <div className="relative">

                  <Icon className="w-4 h-4 shrink-0" />

                  {label ===
                    "Notifications" &&
                    unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 bg-red-500 rounded-full border-2 border-white text-[10px] text-white flex items-center justify-center font-semibold">
                        {unreadCount > 9
                          ? "9+"
                          : unreadCount}
                      </span>
                    )}

                </div>

                {label}

              </Link>
            )
          )}

        </nav>

        <div className="p-3 border-t border-gray-100">

          <button
            onClick={handleLogout}
            className="sidebar-item w-full text-red-500 hover:bg-red-50 hover:text-red-600"
          >

            <LogOut className="w-4 h-4 shrink-0" />

            Logout

          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">

        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">

          <button
            onClick={() =>
              setSidebarOpen(true)
            }
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >

            <Menu className="w-6 h-6" />

          </button>

          <div className="flex items-center gap-2">

            <Shield className="w-4 h-4 text-blue-500" />

            <span className="text-sm text-gray-500 font-medium">
              Citizen Portal
            </span>

          </div>

          <div className="flex items-center gap-2">

            <Link
              to="/notifications"
              className="relative w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500"
            >

              <Bell className="w-4 h-4" />

              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-semibold">
                  {unreadCount > 9
                    ? "9+"
                    : unreadCount}
                </span>
              )}

            </Link>

          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>

      </div>
    </div>
  );
}