import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, clearError } from "../store/slices/authSlice.js";
import api from "../utils/api.js";
import {
  Eye,
  EyeOff,
  Shield,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPwd, setShowPwd] = useState(false);
  const [formError, setFormError] = useState("");

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, user } = useSelector((s) => s.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleSendOTP = async () => {
    try {
      if (!form.email) {
        return alert("Please enter email first");
      }

      setOtpLoading(true);

      await api.post("/auth/send-otp", {
        email: form.email,
      });

      setOtpSent(true);

      alert("OTP sent to your email");
    } catch (error) {
      alert(error.response?.data?.error || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      await api.post("/auth/verify-otp", {
        email: form.email,
        otp,
      });

      setVerified(true);

      alert("Email verified successfully");
    } catch (error) {
      alert(error.response?.data?.error || "Invalid OTP");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setFormError("");

    if (!verified) {
      return setFormError("Please verify your email");
    }

    if (form.password !== form.confirmPassword) {
      return setFormError("Passwords do not match");
    }

    if (form.password.length < 6) {
      return setFormError("Password must be at least 6 characters");
    }

    dispatch(
      registerUser({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      })
    );
  };

  const requirements = [
    {
      met: form.name.length >= 2,
      label: "Full name (2+ characters)",
    },
    {
      met: /\S+@\S+\.\S+/.test(form.email),
      label: "Valid email address",
    },
    {
      met: verified,
      label: "Email verified",
    },
    {
      met: form.password.length >= 6,
      label: "Password (6+ characters)",
    },
    {
      met:
        form.password === form.confirmPassword &&
        form.confirmPassword.length > 0,
      label: "Passwords match",
    },
  ];

  return (
    <div className="min-h-screen gradient-blue flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white mb-6"
          >
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>

            <span className="text-2xl font-bold">
              CivicEye
            </span>
          </Link>

          <h1 className="text-3xl font-bold text-white mb-2">
            Create Account
          </h1>

          <p className="text-blue-100">
            Join thousands of active citizens
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {(error || formError) && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />

              <p className="text-red-700 text-sm">
                {error || formError}
              </p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>

              <input
                type="text"
                required
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                className="input-field"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>

              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                  className="input-field"
                  placeholder="john@example.com"
                  disabled={verified}
                />

                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={
                    otpLoading ||
                    verified ||
                    !form.email
                  }
                  className="px-4 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {verified
                    ? "Verified"
                    : otpLoading
                    ? "Sending..."
                    : "Send OTP"}
                </button>
              </div>

              {otpSent && !verified && (
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value)
                    }
                    placeholder="Enter OTP"
                    className="input-field"
                  />

                  <button
                    type="button"
                    onClick={handleVerifyOTP}
                    className="px-4 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
                  >
                    Verify
                  </button>
                </div>
              )}

              {verified && (
                <p className="text-emerald-600 text-sm mt-2 font-medium">
                  Email verified successfully
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
              </label>

              <input
                type="tel"
                value={form.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone: e.target.value,
                  })
                }
                className="input-field"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password: e.target.value,
                    })
                  }
                  className="input-field pr-12"
                  placeholder="Min. 6 characters"
                />

                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPwd ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>

              <input
                type="password"
                required
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({
                    ...form,
                    confirmPassword:
                      e.target.value,
                  })
                }
                className="input-field"
                placeholder="Repeat password"
              />
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              {requirements.map(({ met, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 text-xs"
                >
                  <CheckCircle
                    className={`w-4 h-4 ${
                      met
                        ? "text-emerald-500"
                        : "text-gray-300"
                    }`}
                  />

                  <span
                    className={
                      met
                        ? "text-emerald-700"
                        : "text-gray-400"
                    }
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || !verified}
              className="w-full btn-primary py-3 text-center disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading
                ? "Creating account..."
                : "Create Account"}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-blue-100 text-sm mt-6">
          <Link
            to="/"
            className="hover:text-white transition-colors"
          >
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}