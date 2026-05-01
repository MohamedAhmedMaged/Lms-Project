import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { courseApi } from "../../api/courseApi";
import { cartApi } from "../../api/cartApi";
import ReviewCard from "../../components/courses/ReviewCard";
import StarRating from "../../components/common/StarRating";
import Loader from "../../components/common/Loader";
import Alert from "../../components/common/Alert";
import Modal from "../../components/common/Modal";
import {
  ShoppingCart,
  Star,
  Users,
  Clock,
  BarChart3,
  CheckCircle,
  Play,
  Lock,
  Edit3,
} from "lucide-react";

export default function CourseDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isStudent, isInstructor, user } = useAuth();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartMsg, setCartMsg] = useState({ type: "", text: "" });
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 0, content: "" });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [activeLesson, setActiveLesson] = useState(null);
  const [reviewMsg, setReviewMsg] = useState({ type: "", text: "" });
  const [completedLessonIds, setCompletedLessonIds] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await courseApi.getBySlug(slug);
        const c = res.data.data;
        setCourse(c);

        const [lessonsRes, reviewsRes] = await Promise.all([
          courseApi.getLessons(c.id).catch(() => ({ data: { data: [] } })),
          courseApi.getReviews(c.id).catch(() => ({ data: { data: [] } })),
        ]);
        setLessons(lessonsRes.data.data || []);
        setReviews(reviewsRes.data.data || []);

        if (isAuthenticated && isStudent) {
          try {
            const progressRes = await courseApi.getProgress(c.id);
            setIsEnrolled(true);
            const completedIds = (
              progressRes.data.data.completedLessons || []
            ).map((cl) => cl.lesson?.id || cl.lesson?.toString() || cl.lesson);
            setCompletedLessonIds(completedIds);
          } catch {
            setIsEnrolled(false);
          }
        } else if (c.isEnrolled) {
          setIsEnrolled(true);
        }
      } catch {
        navigate("/courses");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [slug, navigate]);

  const addToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      await cartApi.addItem(course.id);
      setCartMsg({ type: "success", text: "Added to cart!" });
      setTimeout(() => setCartMsg({ type: "", text: "" }), 3000);
    } catch (err) {
      setCartMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to add to cart",
      });
    }
  };

  const submitReview = async () => {
    if (reviewForm.rating === 0) return;
    setReviewLoading(true);
    try {
      await courseApi.createReview(course.id, reviewForm);
      const reviewsRes = await courseApi.getReviews(course.id);
      setReviews(reviewsRes.data.data || []);
      setReviewModal(false);
      setReviewForm({ rating: 0, content: "" });
      setCartMsg({ type: "success", text: "Review submitted successfully!" });
      setTimeout(() => setCartMsg({ type: "", text: "" }), 3000);
    } catch (err) {
      setReviewMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to submit review",
      });
    } finally {
      setReviewLoading(false);
    }
  };

  const isInstructorOfCourse =
    isInstructor &&
    course?.instructors?.some(
      (inst) =>
        inst.id === user?.id || inst._id === user?.id || inst === user?.id,
    );

  const markLessonComplete = async () => {
    if (!activeLesson || !course) return;
    setMarkingComplete(true);
    try {
      await courseApi.markLessonComplete(course.id, activeLesson.id);
      setCompletedLessonIds((prev) =>
        prev.includes(activeLesson.id) ? prev : [...prev, activeLesson.id],
      );
    } catch (err) {
      setCartMsg({
        type: "error",
        text:
          err.response?.data?.message || "Failed to mark lesson as complete",
      });
      setTimeout(() => setCartMsg({ type: "", text: "" }), 3000);
    } finally {
      setMarkingComplete(false);
    }
  };

  const handleLessonClick = (lesson) => {
    if (lesson.isPreview || isInstructorOfCourse || isEnrolled) {
      setActiveLesson(lesson);
    } else if (!isAuthenticated) {
      navigate("/login");
    } else {
      setCartMsg({
        type: "info",
        text: "Enroll in this course to access this lesson",
      });
      setTimeout(() => setCartMsg({ type: "", text: "" }), 3000);
    }
  };

  if (loading) return <Loader />;
  if (!course) return null;

  const displayPrice =
    course.discountPrice != null ? course.discountPrice : course.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-8 mb-8 text-white flex flex-col lg:flex-row gap-6">
        {course.thumbnail && (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full lg:w-80 h-48 rounded-xl object-cover shrink-0"
          />
        )}
        <div className="max-w-3xl flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full capitalize">
              {course.level}
            </span>
            {course.category?.name && (
              <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full">
                {course.category.name}
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            {course.title}
          </h1>
          <p className="text-primary-100 mb-4">{course.description}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-primary-100">
            <span className="flex items-center gap-1">
              <Star size={16} className="text-yellow-300 fill-yellow-300" />{" "}
              {course.averageRating?.toFixed(1) || "0.0"} ({course.totalReviews}{" "}
              reviews)
            </span>
            <span className="flex items-center gap-1">
              <Users size={16} /> {course.totalStudents} students
            </span>
            {course.duration > 0 && (
              <span className="flex items-center gap-1">
                <Clock size={16} /> {course.duration} hours
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* What You'll Learn */}
          {course.whatYouWillLearn?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                What You'll Learn
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {course.whatYouWillLearn.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <CheckCircle
                      size={16}
                      className="text-green-500 mt-0.5 shrink-0"
                    />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Requirements */}
          {course.requirements?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Requirements
              </h2>
              <ul className="space-y-2">
                {course.requirements.map((req, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Lessons */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Course Content ({lessons.length} lessons)
            </h2>
            {lessons.length === 0 ? (
              <p className="text-gray-500 text-sm">No lessons available yet.</p>
            ) : (
              <div className="space-y-2">
                {lessons.map((lesson, i) => {
                  const canAccess =
                    lesson.isPreview ||
                    isInstructorOfCourse ||
                    (isEnrolled && !isInstructorOfCourse);
                  const isCompleted = completedLessonIds.includes(lesson.id);
                  return (
                    <div
                      key={lesson.id}
                      onClick={() => handleLessonClick(lesson)}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${canAccess ? "hover:bg-primary-50 cursor-pointer" : "hover:bg-gray-50 cursor-pointer"}`}
                    >
                      <span className="text-sm text-gray-400 font-mono w-6">
                        {i + 1}
                      </span>
                      {isCompleted ? (
                        <CheckCircle
                          size={18}
                          className="text-green-500 shrink-0"
                        />
                      ) : canAccess ? (
                        <Play size={18} className="text-primary-600 shrink-0" />
                      ) : (
                        <Lock size={18} className="text-gray-400 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium truncate ${isCompleted ? "text-green-700" : "text-gray-900"}`}
                        >
                          {lesson.title}
                        </p>
                        {lesson.duration > 0 && (
                          <p className="text-xs text-gray-400">
                            {lesson.duration} min
                          </p>
                        )}
                      </div>
                      {isCompleted && !isInstructorOfCourse && (
                        <span className="text-xs text-green-600 font-medium">
                          Completed
                        </span>
                      )}
                      {lesson.isPreview &&
                        !isInstructorOfCourse &&
                        !isCompleted && (
                          <span className="text-xs text-primary-600 font-medium">
                            Preview
                          </span>
                        )}
                      {isInstructorOfCourse && !lesson.isPublished && (
                        <span className="text-xs text-yellow-600 font-medium">
                          Draft
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                Reviews ({course.totalReviews})
              </h2>
              {isAuthenticated && isStudent && !isInstructorOfCourse && (
                <button
                  onClick={() => setReviewModal(true)}
                  className="btn-primary text-sm"
                >
                  Write a Review
                </button>
              )}
            </div>
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No reviews yet. Be the first to review!
              </p>
            ) : (
              <div className="space-y-3">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-20">
            <div className="mb-4">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-bold text-gray-900">
                  ${displayPrice}
                </span>
                {course.discountPrice != null &&
                  course.discountPrice < course.price && (
                    <span className="text-lg text-gray-400 line-through">
                      ${course.price}
                    </span>
                  )}
              </div>
              {course.price === 0 && displayPrice === 0 && (
                <span className="text-green-600 font-semibold">
                  Free Course
                </span>
              )}
            </div>

            {cartMsg.text && (
              <Alert type={cartMsg.type} message={cartMsg.text} />
            )}

            {!isInstructorOfCourse && !isEnrolled && (
              <button
                onClick={addToCart}
                className="btn-primary w-full mb-3 gap-2"
              >
                <ShoppingCart size={18} /> Add to Cart
              </button>
            )}
            {isEnrolled && !isInstructorOfCourse && (
              <Link to="/dashboard" className="btn-secondary w-full mb-3 gap-2">
                <Play size={18} /> Continue Learning
              </Link>
            )}
            {isInstructorOfCourse && (
              <Link
                to={`/instructor/courses/${course.id}/manage`}
                className="btn-secondary w-full mb-3 gap-2"
              >
                <Edit3 size={18} /> Manage Course
              </Link>
            )}

            <div className="space-y-3 pt-4 border-t border-gray-200 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 flex items-center gap-2">
                  <BarChart3 size={14} /> Level
                </span>
                <span className="font-medium capitalize">{course.level}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 flex items-center gap-2">
                  <Clock size={14} /> Duration
                </span>
                <span className="font-medium">
                  {course.duration > 0
                    ? `${course.duration} hours`
                    : lessons.length > 0
                      ? `${Math.ceil(lessons.reduce((s, l) => s + (l.duration || 0), 0) / 60)} hours`
                      : "Self-paced"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 flex items-center gap-2">
                  <Play size={14} /> Lessons
                </span>
                <span className="font-medium">
                  {course.lessonsCount || lessons.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 flex items-center gap-2">
                  <Users size={14} /> Students
                </span>
                <span className="font-medium">{course.totalStudents}</span>
              </div>
            </div>

            {course.tags?.length > 0 && (
              <div className="pt-4 border-t border-gray-200 mt-4">
                <p className="text-xs text-gray-500 mb-2">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {course.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={reviewModal}
        onClose={() => {
          setReviewModal(false);
          setReviewMsg({ type: "", text: "" });
        }}
        title="Write a Review"
      >
        <div className="space-y-4">
          {reviewMsg.text && (
            <Alert type={reviewMsg.type} message={reviewMsg.text} />
          )}
          <div>
            <label className="label">Rating</label>
            <StarRating
              rating={reviewForm.rating}
              onChange={(r) => setReviewForm({ ...reviewForm, rating: r })}
              interactive
              size={24}
            />
          </div>
          <div>
            <label className="label">Your Review (optional)</label>
            <textarea
              className="input-field h-24 resize-none"
              placeholder="Share your experience..."
              value={reviewForm.content}
              onChange={(e) =>
                setReviewForm({ ...reviewForm, content: e.target.value })
              }
            />
          </div>
          <button
            onClick={submitReview}
            disabled={reviewLoading || reviewForm.rating === 0}
            className="btn-primary w-full"
          >
            {reviewLoading ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </Modal>

      {/* Lesson Video Player Modal */}
      <Modal
        isOpen={!!activeLesson}
        onClose={() => setActiveLesson(null)}
        title={activeLesson?.title || "Lesson"}
        size="lg"
      >
        {activeLesson && (
          <div className="space-y-4">
            {activeLesson.videoUrl ? (
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src={(() => {
                    const url = activeLesson.videoUrl;
                    const ytMatch = url.match(
                      /(?:youtube\.com\/(?:watch\?v=|live\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
                    );
                    if (ytMatch)
                      return `https://www.youtube.com/embed/${ytMatch[1]}`;
                    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
                    if (vimeoMatch)
                      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
                    return url;
                  })()}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  title={activeLesson.title}
                />
              </div>
            ) : (
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Play size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">
                    No video available for this lesson
                  </p>
                </div>
              </div>
            )}
            {activeLesson.content && (
              <div className="prose prose-sm max-w-none text-gray-700">
                <p>{activeLesson.content}</p>
              </div>
            )}
            {isEnrolled && !isInstructorOfCourse && (
              <div className="pt-2 border-t">
                {completedLessonIds.includes(activeLesson.id) ? (
                  <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
                    <CheckCircle size={18} /> Lesson Completed
                  </div>
                ) : (
                  <button
                    onClick={markLessonComplete}
                    disabled={markingComplete}
                    className="btn-primary w-full gap-2"
                  >
                    <CheckCircle size={18} />
                    {markingComplete ? "Marking..." : "Mark as Complete"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
