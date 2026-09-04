import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearError } from "../store/slices/authSlice.js";
import { Eye, EyeOff, Shield, AlertCircle, KeyRound, ArrowLeft, ShieldCheck, Lock, Mail } from "lucide-react";
import api from "../utils/api.js";

export default function Login() {
  // --- Existing States ---
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((s) => s.auth);

  // --- 🎯 NEW FORGOT PASSWORD STATES ---
  const [showForgot, setShowForgot] = useState(false); // Toggle screen login vs forgot
  const [forgotStep, setForgotStep] = useState(1);     // Step 1: Email input, Step 2: OTP & Pass input
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");

  useEffect(() => {
    dispatch(clearError());
    // Jab bhee page load ho ya screen change ho, errors aur messages clean kar do
    setForgotError("");
    setForgotMessage("");
  }, [dispatch, showForgot]);

  useEffect(() => {
    if (user) {
      if (user.role === "superadmin") navigate("/superadmin/dashboard");
      else if (user.role === "admin") navigate("/admin/dashboard");
      else navigate("/dashboard");
    }
  }, [user, navigate]);

  // --- Normal Login Action ---
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(form));
  };

  // --- 🎯 ACTION 1: REQUEST OTP FORGOT PASSWORD ---
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError("");
    setForgotMessage("");
    try {
      const res = await api.post("/auth/forgot-password", { 
        email: forgotEmail 
      });
      setForgotMessage(res.data.message);
      setForgotStep(2); // Direct OTP screen open ho jayegi
    } catch (err) {
      setForgotError(err.response?.data?.error || "User not found or connection lost");
    } finally {
      setForgotLoading(false);
    }
  };

  // --- 🎯 ACTION 2: CONFIRM VERIFY & NEW PASSWORD LOCK ---
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError("");
    setForgotMessage("");
    try {
      const res = await api.post("/auth/reset-password", {
        email: forgotEmail,
        otp: forgotOtp,
        newPassword: forgotNewPassword,
      });
      setForgotMessage(res.data.message);
      
      // 3 second ka pause taaki user success message dekh sake, fir automatic login back load hoga
      setTimeout(() => {
        setForgotStep(1);
        setShowForgot(false); // Smoothly back to login form
        setForm({ email: forgotEmail, password: "" }); // Fill the email automatically
      }, 3000);
    } catch (err) {
      setForgotError(err.response?.data?.error || "Invalid OTP token validation match");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-blue flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-white mb-6">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">CivicEye</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">
            {showForgot ? "Reset Password" : "Welcome back"}
          </h1>
          <p className="text-blue-100">
            {showForgot 
              ? (forgotStep === 1 ? "Get secure OTP token in your inbox" : "Verify code and update credentials") 
              : "Sign in to your account"
            }
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          
          {/* ========================================================= */}
          {/* 🎯 CONDITION A: FORGOT PASSWORD INTERFACE ROUTE (STATE TOGGLE) */}
          {/* ========================================================= */}
          {showForgot ? (
            <div className="space-y-5">
              {forgotError && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <p className="text-red-700 text-sm">{forgotError}</p>
                </div>
              )}
              {forgotMessage && (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
                  <ShieldCheck className="w-5 h-5 text-green-500 shrink-0" />
                  <p className="text-green-700 text-sm">{forgotMessage}</p>
                </div>
              )}

              {forgotStep === 1 ? (
                <form onSubmit={handleRequestOtp} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Registered Email Address</label>
                    <input type="email" required value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="input-field" placeholder="you@example.com" />
                  </div>
                  <button type="submit" disabled={forgotLoading} className="w-full btn-primary py-3 text-center">
                    {forgotLoading ? "Sending OTP..." : "Request Reset OTP"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">6-Digit Verification OTP</label>
                    <input type="text" required maxLength={6} value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value)}
                      className="input-field tracking-widest font-mono text-center text-lg" placeholder="123456" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">New Secure Password</label>
                    <input type="password" required value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      className="input-field" placeholder="Minimum 6 characters" />
                  </div>
                  <button type="submit" disabled={forgotLoading} className="w-full btn-primary py-3 text-center bg-emerald-600 hover:bg-emerald-700">
                    {forgotLoading ? "Updating..." : "Lock New Password"}
                  </button>
                </form>
              )}

              <div className="text-center pt-2 border-t border-gray-100">
                <button type="button" onClick={() => { setShowForgot(false); setForgotStep(1); }}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700">
                  <ArrowLeft className="w-4 h-4" /> Back to Login view
                </button>
              </div>
            </div>
          ) : (
            // =========================================================
            // 🎯 CONDITION B: ORIGINAL SIGN-IN INTERFACE ROUTE
            // =========================================================
            <>
              {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <input type="email" required value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="input-field" placeholder="you@example.com" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-semibold text-gray-700">Password</label>
                    {/* 🎯 FORGOT PASSWORD TOGGLE LINK PLACE HERE */}
                    <button type="button" onClick={() => setShowForgot(true)}
                      className="text-xs font-bold text-blue-600 hover:underline">
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <input type={showPwd ? "text" : "password"} required value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="input-field pr-12" placeholder="Your password" />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full btn-primary py-3 text-center disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-500 text-sm">
                  Don't have an account?{" "}
                  <Link to="/register" className="text-blue-600 font-semibold hover:underline">Register here</Link>
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-xs text-center text-gray-400 mb-3 font-medium">Quick Demo Access</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { role: "User", email: "user@demo.com" },
                    { role: "Admin", email: "admin@demo.com" },
                    { role: "Super Admin", email: "super@demo.com" },
                  ].map(({ role, email }) => (
                    <button key={role} onClick={() => setForm({ email, password: "demo123" })}
                      className="text-xs bg-gray-50 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 rounded-lg py-2 px-2 transition-colors font-medium">
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

        </div>

        <p className="text-center text-blue-100 text-sm mt-6">
          <Link to="/" className="hover:text-white transition-colors">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}