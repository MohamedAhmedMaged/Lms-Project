import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/common/ProtectedRoute";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import CoursesPage from "./pages/courses/CoursesPage";
import CourseDetailPage from "./pages/courses/CourseDetailPage";
import CartPage from "./pages/cart/CartPage";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import InstructorDashboard from "./pages/dashboard/InstructorDashboard";
import CourseFormPage from "./pages/instructor/CourseFormPage";
import CourseManagePage from "./pages/instructor/CourseManagePage";
import ProfilePage from "./pages/ProfilePage";
import PaymentSuccessPage from "./pages/payment/PaymentSuccessPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:slug" element={<CourseDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />

        {/* Student routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute roles={["student"]}>
              <CartPage />
            </ProtectedRoute>
          }
        />

        {/* Instructor/Admin routes */}
        <Route
          path="/instructor/dashboard"
          element={
            <ProtectedRoute roles={["instructor", "admin"]}>
              <InstructorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/courses/new"
          element={
            <ProtectedRoute roles={["instructor", "admin"]}>
              <CourseFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/courses/:id/edit"
          element={
            <ProtectedRoute roles={["instructor", "admin"]}>
              <CourseFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/courses/:id/manage"
          element={
            <ProtectedRoute roles={["instructor", "admin"]}>
              <CourseManagePage />
            </ProtectedRoute>
          }
        />

        {/* Profile (any authenticated user) */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
