import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { courseApi } from "../../api/courseApi";
import Loader from "../../components/common/Loader";
import { BookOpen, Plus, Users, Star, Eye, Edit3, List } from "lucide-react";

export default function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    courseApi
      .getInstructorCourses()
      .then((res) => setCourses(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const totalStudents = courses.reduce(
    (sum, c) => sum + (c.totalStudents || 0),
    0,
  );
  const totalReviews = courses.reduce(
    (sum, c) => sum + (c.totalReviews || 0),
    0,
  );
  const avgRating =
    courses.length > 0
      ? (
          courses.reduce((sum, c) => sum + (c.averageRating || 0), 0) /
          courses.length
        ).toFixed(1)
      : "0.0";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Instructor Dashboard
        </h1>
        <Link to="/instructor/courses/new" className="btn-primary gap-2">
          <Plus size={18} /> New Course
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <BookOpen size={20} className="text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {courses.length}
              </p>
              <p className="text-xs text-gray-500">Courses</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {totalStudents}
              </p>
              <p className="text-xs text-gray-500">Students</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{avgRating}</p>
              <p className="text-xs text-gray-500">Avg Rating</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Eye size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalReviews}</p>
              <p className="text-xs text-gray-500">Reviews</p>
            </div>
          </div>
        </div>
      </div>

      {/* Course List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">My Courses</h2>
        </div>
        {courses.length === 0 ? (
          <div className="p-8 text-center">
            <BookOpen size={36} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">
              You haven't created any courses yet.
            </p>
            <Link
              to="/instructor/courses/new"
              className="btn-primary mt-4 inline-flex gap-2"
            >
              <Plus size={16} /> Create Your First Course
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {courses.map((course) => (
              <Link
                key={course.id}
                to={`/instructor/courses/${course.id}/manage`}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
              >
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-16 h-12 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="w-16 h-12 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {course.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span
                      className={`px-1.5 py-0.5 rounded text-xs font-medium ${course.isPublished ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                    >
                      {course.isPublished ? "Published" : "Draft"}
                    </span>
                    <span>{course.totalStudents} students</span>
                    <span>{course.lessonsCount || 0} lessons</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(`/instructor/courses/${course.id}/edit`);
                  }}
                  className="btn-secondary text-sm gap-1"
                >
                  <Edit3 size={14} /> Edit
                </button>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
