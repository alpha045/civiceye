import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile } from "../../store/slices/authSlice.js";
import UserLayout from "../../layouts/UserLayout.jsx";
import api from "../../utils/api.js";
import { User, Lock, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function UserProfile() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const [profileForm, setProfileForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [pwdForm, setPwdForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);
  const [pwdMsg, setPwdMsg] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      await dispatch(updateProfile(profileForm)).unwrap();
      setProfileMsg({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      setProfileMsg({ type: "error", text: err });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePwdSubmit = async (e) => {
    e.preventDefault();
    setPwdMsg(null);
    if (pwdForm.newPassword !== pwdForm.confirmPassword) return setPwdMsg({ type: "error", text: "Passwords don't match" });
    if (pwdForm.newPassword.length < 6) return setPwdMsg({ type: "error", text: "Password must be at least 6 characters" });
    setPwdLoading(true);
    try {
      await api.put("/auth/password", { currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword });
      setPwdMsg({ type: "success", text: "Password changed successfully!" });
      setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPwdMsg({ type: "error", text: err.response?.data?.error || "Failed to change password" });
    } finally {
      setPwdLoading(false);
    }
  };

  const Alert = ({ msg }) => msg ? (
    <div className={`flex items-center gap-3 rounded-xl p-4 mb-4 ${msg.type === "success" ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"}`}>
      {msg.type === "success" ? <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />}
      <p className={`text-sm ${msg.type === "success" ? "text-emerald-700" : "text-red-700"}`}>{msg.text}</p>
    </div>
  ) : null;

  return (
    <UserLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">Manage your account information</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center">
              <span className="text-blue-700 text-2xl font-bold">{user?.name?.[0]?.toUpperCase()}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 mt-1 capitalize">{user?.role}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-gray-900">Update Profile</h3>
          </div>
          <Alert msg={profileMsg} />
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input type="text" required value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input type="email" disabled value={user?.email}
                className="input-field bg-gray-50 text-gray-400 cursor-not-allowed" />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
              <input type="tel" value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="input-field" placeholder="+91 98765 43210" />
            </div>
            <button type="submit" disabled={profileLoading} className="btn-primary py-2.5 disabled:opacity-60">
              {profileLoading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-gray-900">Change Password</h3>
          </div>
          <Alert msg={pwdMsg} />
          <form onSubmit={handlePwdSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
              <div className="relative">
                <input type={showPwd ? "text" : "password"} required value={pwdForm.currentPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                  className="input-field pr-12" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
              <input type="password" required value={pwdForm.newPassword}
                onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                className="input-field" placeholder="Min. 6 characters" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
              <input type="password" required value={pwdForm.confirmPassword}
                onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                className="input-field" />
            </div>
            <button type="submit" disabled={pwdLoading} className="btn-primary py-2.5 disabled:opacity-60">
              {pwdLoading ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </UserLayout>
  );
}
