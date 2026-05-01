import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { courseApi } from "../../api/courseApi";
import Loader from "../../components/common/Loader";
import Alert from "../../components/common/Alert";
import Modal from "../../components/common/Modal";
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  Play,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

export default function CourseManagePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [lessonModal, setLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonForm, setLessonForm] = useState({
    title: "",
    content: "",
    videoUrl: "",
    duration: 0,
    isPreview: false,
  });
  const [lessonSaving, setLessonSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [courseRes, lessonsRes] = await Promise.all([
          courseApi.getById(id),
          courseApi.getLessons(id),
        ]);
        setCourse(courseRes.data.data);
        setLessons(lessonsRes.data.data || []);
      } catch {
        navigate("/instructor/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, navigate]);

  const togglePublish = async () => {
    try {
      const res = course.isPublished
        ? await courseApi.unpublish(id)
        : await courseApi.publish(id);
      setCourse(res.data.data);
      setMsg({
        type: "success",
        text: course.isPublished ? "Course unpublished" : "Course published!",
      });
      setTimeout(() => setMsg({ type: "", text: "" }), 3000);
    } catch (err) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to toggle publish",
      });
    }
  };

  const deleteCourse = async () => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      await courseApi.delete(id);
      navigate("/instructor/dashboard");
    } catch (err) {
      setMsg({ type: "error", text: "Failed to delete course" });
    }
  };

  const openLessonModal = (lesson = null) => {
    if (lesson) {
      setEditingLesson(lesson);
      setLessonForm({
        title: lesson.title,
        content: lesson.content || "",
        videoUrl: lesson.videoUrl || "",
        duration: lesson.duration || "",
        isPreview: lesson.isPreview || false,
        isPublished: lesson.isPublished || false,
      });
    } else {
      setEditingLesson(null);
      setLessonForm({
        title: "",
        content: "",
        videoUrl: "",
        duration: "",
        isPreview: false,
        isPublished: true,
      });
    }
    setLessonModal(true);
  };

  const saveLesson = async () => {
    if (!lessonForm.title.trim()) return;
    setLessonSaving(true);
    try {
      if (editingLesson) {
        const payload = {
          ...lessonForm,
          duration:
            lessonForm.duration === "" ? 0 : Number(lessonForm.duration),
        };
        await courseApi.updateLesson(id, editingLesson.id, payload);
      } else {
        const payload = {
          ...lessonForm,
          duration:
            lessonForm.duration === "" ? 0 : Number(lessonForm.duration),
          order: lessons.length,
        };
        await courseApi.createLesson(id, payload);
      }
      const lessonsRes = await courseApi.getLessons(id);
      setLessons(lessonsRes.data.data || []);
      setLessonModal(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save lesson");
    } finally {
      setLessonSaving(false);
    }
  };

  const deleteLesson = async (lessonId) => {
    if (!confirm("Delete this lesson?")) return;
    try {
      await courseApi.deleteLesson(id, lessonId);
      setLessons(lessons.filter((l) => l.id !== lessonId));
    } catch {
      alert("Failed to delete lesson");
    }
  };

  const toggleLessonPublish = async (lesson) => {
    try {
      await courseApi.updateLesson(id, lesson.id, {
        isPublished: !lesson.isPublished,
      });
      const lessonsRes = await courseApi.getLessons(id);
      setLessons(lessonsRes.data.data || []);
    } catch {
      alert("Failed to toggle lesson publish status");
    }
  };

  if (loading) return <Loader />;
  if (!course) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your course content
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/instructor/courses/${id}/edit`}
            className="btn-secondary text-sm gap-1"
          >
            <Edit3 size={14} /> Edit Details
          </Link>
          <button
            onClick={togglePublish}
            className={`text-sm gap-1 ${course.isPublished ? "btn-secondary" : "btn-primary"}`}
          >
            {course.isPublished ? (
              <>
                <EyeOff size={14} /> Unpublish
              </>
            ) : (
              <>
                <Eye size={14} /> Publish
              </>
            )}
          </button>
          <button onClick={deleteCourse} className="btn-danger text-sm gap-1">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      {msg.text && (
        <Alert
          type={msg.type}
          message={msg.text}
          onClose={() => setMsg({ type: "", text: "" })}
        />
      )}

      {/* Lessons */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">
            Lessons ({lessons.length})
          </h2>
          <button
            onClick={() => openLessonModal()}
            className="btn-primary text-sm gap-1"
          >
            <Plus size={14} /> Add Lesson
          </button>
        </div>

        {lessons.length === 0 ? (
          <div className="p-8 text-center">
            <Play size={36} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">
              No lessons yet. Add your first lesson!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {lessons.map((lesson, i) => (
              <div
                key={lesson.id}
                className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
              >
                <GripVertical size={16} className="text-gray-300" />
                <span className="text-sm text-gray-400 font-mono w-6">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {lesson.title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                    {lesson.duration > 0 && <span>{lesson.duration} min</span>}
                    {lesson.isPreview && (
                      <span className="text-green-600 font-medium">
                        Preview
                      </span>
                    )}
                    {lesson.isPublished ? (
                      <span className="text-green-600">Published</span>
                    ) : (
                      <span className="text-yellow-600">Draft</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => toggleLessonPublish(lesson)}
                  className="p-1.5 text-gray-400 hover:text-primary-600 transition-colors"
                  title={lesson.isPublished ? "Unpublish" : "Publish"}
                >
                  {lesson.isPublished ? (
                    <ToggleRight size={16} className="text-green-500" />
                  ) : (
                    <ToggleLeft size={16} />
                  )}
                </button>
                <button
                  onClick={() => openLessonModal(lesson)}
                  className="p-1.5 text-gray-400 hover:text-primary-600 transition-colors"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => deleteLesson(lesson.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lesson Modal */}
      <Modal
        isOpen={lessonModal}
        onClose={() => setLessonModal(false)}
        title={editingLesson ? "Edit Lesson" : "Add Lesson"}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input
              type="text"
              required
              className="input-field"
              value={lessonForm.title}
              onChange={(e) =>
                setLessonForm({ ...lessonForm, title: e.target.value })
              }
            />
          </div>
          <div>
            <label className="label">Content</label>
            <textarea
              rows={4}
              className="input-field resize-none"
              placeholder="Lesson content (optional)"
              value={lessonForm.content}
              onChange={(e) =>
                setLessonForm({ ...lessonForm, content: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Video URL</label>
              <input
                type="url"
                className="input-field"
                placeholder="https://..."
                value={lessonForm.videoUrl}
                onChange={(e) =>
                  setLessonForm({ ...lessonForm, videoUrl: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label">Duration (minutes)</label>
              <input
                type="number"
                min={0}
                className="input-field"
                placeholder="0"
                value={lessonForm.duration}
                onChange={(e) =>
                  setLessonForm({ ...lessonForm, duration: e.target.value })
                }
              />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={lessonForm.isPreview}
              onChange={(e) =>
                setLessonForm({ ...lessonForm, isPreview: e.target.checked })
              }
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">
              Free preview (visible to non-enrolled students)
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={lessonForm.isPublished}
              onChange={(e) =>
                setLessonForm({ ...lessonForm, isPublished: e.target.checked })
              }
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">
              Published (visible to students)
            </span>
          </label>
          <button
            onClick={saveLesson}
            disabled={lessonSaving}
            className="btn-primary w-full"
          >
            {lessonSaving
              ? "Saving..."
              : editingLesson
                ? "Update Lesson"
                : "Add Lesson"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
