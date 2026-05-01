import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { courseApi } from "../../api/courseApi";
import Loader from "../../components/common/Loader";
import { BookOpen, Clock, Award, TrendingUp } from "lucide-react";

export default function StudentDashboard() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    courseApi
      .getStudentCourses()
      .then((res) => setEnrolledCourses(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Learning</h1>

      {enrolledCourses.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600">
            No enrolled courses yet
          </h3>
          <p className="text-gray-400 text-sm mt-1 mb-4">
            Start learning by enrolling in a course
          </p>
          <Link to="/courses" className="btn-primary">
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map((enrollment, index) => {
            const course = enrollment.course || enrollment;
            const durationHours = course.totalDuration
              ? `${Math.round((course.totalDuration / 60) * 10) / 10}h`
              : course.duration
                ? `${course.duration}h`
                : "0h";
            const progress = enrollment.progress || 0;
            const completedCount = enrollment.completedLessonsCount || 0;
            const totalLessons =
              course.lessonsCount || enrollment.totalLessons || 0;
            return (
              <div
                key={enrollment.id || course.id || index}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="aspect-video w-full object-cover"
                  />
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-primary-400 to-primary-600" />
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {course.title}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> {durationHours}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen size={14} /> {totalLessons} lessons
                    </span>
                  </div>
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500">
                        {completedCount}/{totalLessons} lessons
                      </span>
                      <span className="font-medium text-primary-600">
                        {progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <Link
                    to={`/courses/${course.slug || course.id}`}
                    className="btn-primary w-full text-sm mt-2"
                  >
                    Continue Learning
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
