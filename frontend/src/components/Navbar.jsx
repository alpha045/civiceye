import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice.js";
import { Eye, Menu, X, LogOut, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => { dispatch(logout()); navigate("/"); };

  const getDashboardPath = () => {
    if (!user) return "/login";
    if (user.role === "superadmin") return "/superadmin/dashboard";
    if (user.role === "admin") return "/admin/dashboard";
    return "/dashboard";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-blue-700 text-xl">CivicEye</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {["#features", "#about", "#contact"].map((href) => (
              <a key={href} href={href} className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors capitalize">
                {href.slice(1)}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to={getDashboardPath()} className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-500 transition-colors">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Login</Link>
                <Link to="/register" className="btn-primary text-sm">Register</Link>
              </>
            )}
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-500 p-2">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 pt-4 space-y-2">
            {["#features", "#about", "#contact"].map((href) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg capitalize">
                {href.slice(1)}
              </a>
            ))}
            <div className="border-t border-gray-100 pt-3 mt-3 space-y-2">
              {user ? (
                <>
                  <Link to={getDashboardPath()} onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg">
                    Dashboard
                  </Link>
                  <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                    className="block w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">Login</Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg">Register</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
