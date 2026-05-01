import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  BookOpen,
  ShoppingCart,
  Menu,
  X,
  LogOut,
  User,
  LayoutDashboard,
} from "lucide-react";

export default function Navbar() {
  const { isAuthenticated, user, logout, isStudent, isInstructor } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const dashboardLink = isInstructor ? "/instructor/dashboard" : "/dashboard";

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="text-primary-600" size={28} />
            <span className="text-xl font-bold text-gray-900">
              Lumina Learn
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/courses"
              className="text-gray-600 hover:text-primary-600 font-medium transition-colors"
            >
              Courses
            </Link>
            {isAuthenticated ? (
              <>
                {isStudent && (
                  <Link
                    to="/cart"
                    className="text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    <ShoppingCart size={20} />
                  </Link>
                )}
                <Link
                  to={dashboardLink}
                  className="text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <LayoutDashboard size={20} />
                </Link>
                <div className="relative group">
                  <button className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors">
                    <User size={20} />
                    <span className="font-medium text-sm">
                      {user?.firstName}
                    </span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Profile
                    </Link>
                    {isInstructor && (
                      <Link
                        to="/instructor/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Instructor Panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="btn-secondary text-sm">
                  Log In
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-3">
            <Link
              to="/courses"
              className="block py-2 text-gray-600 font-medium"
              onClick={() => setMobileOpen(false)}
            >
              Courses
            </Link>
            {isAuthenticated ? (
              <>
                {isStudent && (
                  <Link
                    to="/cart"
                    className="block py-2 text-gray-600 font-medium"
                    onClick={() => setMobileOpen(false)}
                  >
                    Cart
                  </Link>
                )}
                <Link
                  to={dashboardLink}
                  className="block py-2 text-gray-600 font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="block py-2 text-red-600 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block py-2 text-gray-600 font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="block py-2 text-primary-600 font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
