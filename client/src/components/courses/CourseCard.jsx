import { Link } from 'react-router-dom';
import { Star, Users, Clock, BarChart3 } from 'lucide-react';

const levelColors = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-blue-100 text-blue-700',
  advanced: 'bg-purple-100 text-purple-700',
};

export default function CourseCard({ course }) {
  const displayPrice = course.discountPrice != null ? course.discountPrice : course.price;

  return (
    <Link
      to={`/courses/${course.slug || course.id}`}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      <div className="aspect-video bg-gradient-to-br from-primary-400 to-primary-600 relative overflow-hidden">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/80">
            <BarChart3 size={48} />
          </div>
        )}
        {course.discountPrice != null && course.discountPrice < course.price && (
          <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            SALE
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${levelColors[course.level] || levelColors.beginner}`}>
            {course.level || 'beginner'}
          </span>
        </div>
        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">
          {course.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{course.description}</p>
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Star size={14} className="text-yellow-400 fill-yellow-400" />
            {course.averageRating?.toFixed(1) || '0.0'} ({course.totalReviews || 0})
          </span>
          <span className="flex items-center gap-1">
            <Users size={14} /> {course.totalStudents || 0}
          </span>
          {course.duration > 0 && (
            <span className="flex items-center gap-1">
              <Clock size={14} /> {course.duration}h
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">${displayPrice}</span>
            {course.discountPrice != null && course.discountPrice < course.price && (
              <span className="text-sm text-gray-400 line-through">${course.price}</span>
            )}
          </div>
          {course.price === 0 && displayPrice === 0 && (
            <span className="text-sm font-semibold text-green-600">Free</span>
          )}
        </div>
      </div>
    </Link>
  );
}
