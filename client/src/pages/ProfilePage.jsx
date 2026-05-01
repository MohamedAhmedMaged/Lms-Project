import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/authApi";
import Alert from "../components/common/Alert";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { validate, ChangePasswordSchema } from "../utils/validation";
import { parseApiError } from "../utils/errors";

export default function ProfilePage() {
  const { user } = useAuth();

  const [tab, setTab] = useState("profile");
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState({ type: "", text: "" });
  const [pwFieldErrors, setPwFieldErrors] = useState({});

  const changePassword = async (e) => {
    e.preventDefault();
    setPwMsg({ type: "", text: "" });
    setPwFieldErrors({});

    const v = validate(ChangePasswordSchema, pwForm);
    if (!v.success) {
      setPwFieldErrors(v.fieldErrors);
      return;
    }

    setPwLoading(true);
    try {
      await authApi.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
        confirmPassword: pwForm.confirmPassword,
      });
      setPwMsg({ type: "success", text: "Password changed successfully" });
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      const { message, fieldErrors: fe } = parseApiError(err);
      setPwMsg({ type: "error", text: message });
      setPwFieldErrors(fe);
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("profile")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "profile" ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          <User size={16} className="inline mr-1" /> Profile
        </button>
        <button
          onClick={() => setTab("password")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "password" ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          <Lock size={16} className="inline mr-1" /> Password
        </button>
      </div>

      {tab === "profile" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-2xl font-bold">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className="inline-block mt-1 text-xs font-medium bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full capitalize">
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      )}

      {tab === "password" && (
        <form
          onSubmit={changePassword}
          className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
        >
          {pwMsg.text && (
            <Alert
              type={pwMsg.type}
              message={pwMsg.text}
              onClose={() => setPwMsg({ type: "", text: "" })}
            />
          )}

          <div>
            <label className="label">Current Password</label>
            <input
              type="password"
              required
              className={`input-field ${pwFieldErrors.currentPassword ? "border-red-500 focus:ring-red-500" : ""}`}
              value={pwForm.currentPassword}
              onChange={(e) =>
                setPwForm({ ...pwForm, currentPassword: e.target.value })
              }
            />
            {pwFieldErrors.currentPassword && (
              <p className="text-red-500 text-xs mt-1">
                {pwFieldErrors.currentPassword}
              </p>
            )}
          </div>
          <div>
            <label className="label">New Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                required
                minLength={8}
                className={`input-field pr-10 ${pwFieldErrors.newPassword ? "border-red-500 focus:ring-red-500" : ""}`}
                value={pwForm.newPassword}
                onChange={(e) =>
                  setPwForm({ ...pwForm, newPassword: e.target.value })
                }
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                onClick={() => setShowPw(!showPw)}
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {pwFieldErrors.newPassword && (
              <p className="text-red-500 text-xs mt-1">
                {pwFieldErrors.newPassword}
              </p>
            )}
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input
              type="password"
              required
              className={`input-field ${pwFieldErrors.confirmPassword ? "border-red-500 focus:ring-red-500" : ""}`}
              value={pwForm.confirmPassword}
              onChange={(e) =>
                setPwForm({ ...pwForm, confirmPassword: e.target.value })
              }
            />
            {pwFieldErrors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {pwFieldErrors.confirmPassword}
              </p>
            )}
          </div>
          <button type="submit" disabled={pwLoading} className="btn-primary">
            {pwLoading ? "Changing..." : "Change Password"}
          </button>
        </form>
      )}
    </div>
  );
}
