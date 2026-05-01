import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { courseApi } from "../api/courseApi";
import { categoryApi } from "../api/categoryApi";
import CourseCard from "../components/courses/CourseCard";
import Loader from "../components/common/Loader";
import { Search, BookOpen, GraduationCap, Users } from "lucide-react";

export default function HomePage() {
  const { isAuthenticated, isInstructor } = useAuth();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, categoriesRes] = await Promise.all([
          courseApi.getAll({ limit: 6 }),
          categoryApi.getAll(),
        ]);
        setCourses(coursesRes.data.data || []);
        setCategories(categoriesRes.data.data || []);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
              Unlock Your Potential with Online Learning
            </h1>
            <p className="text-lg text-primary-100 mb-8">
              Explore thousands of courses from expert instructors. Learn at
              your own pace, anytime, anywhere.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/courses"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary-700 font-semibold rounded-lg hover:bg-primary-50 transition-colors"
              >
                <Search size={18} /> Explore Courses
              </Link>
              {!isAuthenticated ? (
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg border border-primary-400 hover:bg-primary-400 transition-colors"
                >
                  Get Started Free
                </Link>
              ) : (
                <Link
                  to={isInstructor ? "/instructor/dashboard" : "/dashboard"}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg border border-primary-400 hover:bg-primary-400 transition-colors"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <BookOpen className="text-primary-600 mb-2" size={28} />
              <span className="text-3xl font-bold text-gray-900">100+</span>
              <span className="text-gray-500 text-sm">Courses</span>
            </div>
            <div className="flex flex-col items-center">
              <Users className="text-primary-600 mb-2" size={28} />
              <span className="text-3xl font-bold text-gray-900">10K+</span>
              <span className="text-gray-500 text-sm">Students</span>
            </div>
            <div className="flex flex-col items-center">
              <GraduationCap className="text-primary-600 mb-2" size={28} />
              <span className="text-3xl font-bold text-gray-900">50+</span>
              <span className="text-gray-500 text-sm">Instructors</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {categories.slice(0, 12).map((cat) => (
              <Link
                key={cat.id}
                to={`/courses?category=${cat.id}`}
                className="bg-white rounded-lg border border-gray-200 p-4 text-center hover:border-primary-300 hover:shadow-md transition-all"
              >
                <span className="text-2xl mb-1 block">{cat.icon || "📚"}</span>
                <span className="text-sm font-medium text-gray-700">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Courses */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Courses</h2>
          <Link
            to="/courses"
            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            View All →
          </Link>
        </div>
        {loading ? (
          <Loader />
        ) : courses.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No courses available yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
