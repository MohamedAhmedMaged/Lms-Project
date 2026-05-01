import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { BookOpen, Eye, EyeOff } from "lucide-react";
import Alert from "../../components/common/Alert";
import { parseApiError } from "../../utils/errors";
import { validate, LoginSchema } from "../../utils/validation";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const v = validate(LoginSchema, form);
    if (!v.success) {
      setFieldErrors(v.fieldErrors);
      return;
    }

    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      const { message, fieldErrors: fe } = parseApiError(err);
      setError(message);
      setFieldErrors(fe);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <BookOpen className="mx-auto text-primary-600 mb-3" size={40} />
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-1">Sign in to continue learning</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
        >
          {error && (
            <Alert type="error" message={error} onClose={() => setError("")} />
          )}

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              required
              className={`input-field ${fieldErrors.email ? "border-red-500 focus:ring-red-500" : ""}`}
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {fieldErrors.email && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                className={`input-field pr-10 ${fieldErrors.password ? "border-red-500 focus:ring-red-500" : ""}`}
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
