import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { BookOpen, Eye, EyeOff } from "lucide-react";
import Alert from "../../components/common/Alert";
import { parseApiError } from "../../utils/errors";
import { validate, RegisterSchema } from "../../utils/validation";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const v = validate(RegisterSchema, form);
    if (!v.success) {
      setFieldErrors(v.fieldErrors);
      return;
    }

    setLoading(true);
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      const { message, fieldErrors: fe } = parseApiError(err);
      setError(message);
      setFieldErrors(fe);
    } finally {
      setLoading(false);
    }
  };

  const update = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <BookOpen className="mx-auto text-primary-600 mb-3" size={40} />
          <h1 className="text-2xl font-bold text-gray-900">
            Create your account
          </h1>
          <p className="text-gray-500 mt-1">
            Start your learning journey today
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
        >
          {error && (
            <Alert type="error" message={error} onClose={() => setError("")} />
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">First Name</label>
              <input
                type="text"
                required
                minLength={3}
                className={`input-field ${fieldErrors.firstName ? "border-red-500 focus:ring-red-500" : ""}`}
                placeholder="John"
                value={form.firstName}
                onChange={update("firstName")}
              />
              {fieldErrors.firstName && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.firstName}
                </p>
              )}
            </div>
            <div>
              <label className="label">Last Name</label>
              <input
                type="text"
                required
                minLength={3}
                className={`input-field ${fieldErrors.lastName ? "border-red-500 focus:ring-red-500" : ""}`}
                placeholder="Doe"
                value={form.lastName}
                onChange={update("lastName")}
              />
              {fieldErrors.lastName && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.lastName}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              required
              className={`input-field ${fieldErrors.email ? "border-red-500 focus:ring-red-500" : ""}`}
              placeholder="you@example.com"
              value={form.email}
              onChange={update("email")}
            />
            {fieldErrors.email && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="label">I want to</label>
            <div className="flex gap-3">
              <label
                className={`flex-1 text-center py-2 rounded-lg border cursor-pointer transition-colors text-sm font-medium ${form.role === "student" ? "bg-primary-50 border-primary-300 text-primary-700" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
              >
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={form.role === "student"}
                  onChange={update("role")}
                  className="sr-only"
                />
                Learn
              </label>
              <label
                className={`flex-1 text-center py-2 rounded-lg border cursor-pointer transition-colors text-sm font-medium ${form.role === "instructor" ? "bg-primary-50 border-primary-300 text-primary-700" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
              >
                <input
                  type="radio"
                  name="role"
                  value="instructor"
                  checked={form.role === "instructor"}
                  onChange={update("role")}
                  className="sr-only"
                />
                Teach
              </label>
            </div>
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                className={`input-field pr-10 ${fieldErrors.password ? "border-red-500 focus:ring-red-500" : ""}`}
                placeholder="Min 8 chars, upper, lower, number, special"
                value={form.password}
                onChange={update("password")}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-red-500 text-xs mt-1">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <div>
            <label className="label">Confirm Password</label>
            <input
              type="password"
              required
              className={`input-field ${fieldErrors.confirmPassword ? "border-red-500 focus:ring-red-500" : ""}`}
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={update("confirmPassword")}
            />
            {fieldErrors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
