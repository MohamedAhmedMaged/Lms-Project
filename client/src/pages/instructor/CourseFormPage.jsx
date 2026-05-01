import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { courseApi } from "../../api/courseApi";
import { categoryApi } from "../../api/categoryApi";
import Loader from "../../components/common/Loader";
import Alert from "../../components/common/Alert";
import { Save, Plus, X } from "lucide-react";
import { parseApiError } from "../../utils/errors";
import { validate, CreateCourseSchema } from "../../utils/validation";

export default function CourseFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [newCatName, setNewCatName] = useState("");
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatLoading, setNewCatLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    thumbnail: "",
    category: "",
    price: 0,
    discountPrice: "",
    level: "beginner",
    duration: 0,
    tags: [],
    requirements: [],
    whatYouWillLearn: [],
  });

  const [tagInput, setTagInput] = useState("");
  const [reqInput, setReqInput] = useState("");
  const [learnInput, setLearnInput] = useState("");

  useEffect(() => {
    categoryApi
      .getAll()
      .then((res) => setCategories(res.data.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isEdit) {
      courseApi
        .getById(id)
        .then((res) => {
          const c = res.data.data;
          setForm({
            title: c.title || "",
            description: c.description || "",
            thumbnail: c.thumbnail || "",
            category: c.category?.id || c.category || "",
            price: c.price || 0,
            discountPrice: c.discountPrice ?? "",
            level: c.level || "beginner",
            duration: c.duration || 0,
            tags: c.tags || [],
            requirements: c.requirements || [],
            whatYouWillLearn: c.whatYouWillLearn || [],
          });
        })
        .catch(() => navigate("/instructor/dashboard"))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, navigate]);

  const update = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      update("tags", [...form.tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag) =>
    update(
      "tags",
      form.tags.filter((t) => t !== tag),
    );

  const addRequirement = () => {
    if (reqInput.trim()) {
      update("requirements", [...form.requirements, reqInput.trim()]);
      setReqInput("");
    }
  };

  const addLearn = () => {
    if (learnInput.trim()) {
      update("whatYouWillLearn", [...form.whatYouWillLearn, learnInput.trim()]);
      setLearnInput("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const payload = {
      ...form,
      price: Number(form.price),
      discountPrice:
        form.discountPrice === "" ? null : Number(form.discountPrice),
      duration: Number(form.duration),
    };

    const v = validate(CreateCourseSchema, payload);
    if (!v.success) {
      setFieldErrors(v.fieldErrors);
      return;
    }

    setSaving(true);

    try {
      if (isEdit) {
        await courseApi.update(id, payload);
      } else {
        await courseApi.create(payload);
      }
      navigate("/instructor/dashboard");
    } catch (err) {
      const { message, fieldErrors: fe } = parseApiError(err);
      setError(message);
      setFieldErrors(fe);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? "Edit Course" : "Create New Course"}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-5"
      >
        {error && (
          <Alert type="error" message={error} onClose={() => setError("")} />
        )}

        <div>
          <label className="label">Title</label>
          <input
            type="text"
            required
            minLength={3}
            maxLength={100}
            className={`input-field ${fieldErrors.title ? "border-red-500 focus:ring-red-500" : ""}`}
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
          />
          {fieldErrors.title && (
            <p className="text-red-500 text-xs mt-1">{fieldErrors.title}</p>
          )}
        </div>

        <div>
          <label className="label">Thumbnail URL</label>
          <input
            type="url"
            className="input-field"
            placeholder="https://example.com/image.jpg"
            value={form.thumbnail}
            onChange={(e) => update("thumbnail", e.target.value)}
          />
          {form.thumbnail && (
            <img
              src={form.thumbnail}
              alt="Preview"
              className="mt-2 h-32 w-auto rounded-lg object-cover"
              onError={(e) => (e.target.style.display = "none")}
            />
          )}
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            required
            minLength={10}
            maxLength={2000}
            rows={4}
            className={`input-field resize-none ${fieldErrors.description ? "border-red-500 focus:ring-red-500" : ""}`}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
          {fieldErrors.description && (
            <p className="text-red-500 text-xs mt-1">
              {fieldErrors.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Category</label>
            <select
              required
              className={`input-field ${fieldErrors.category ? "border-red-500 focus:ring-red-500" : ""}`}
              value={form.category}
              onChange={(e) => {
                if (e.target.value === "__new__") {
                  setShowNewCat(true);
                } else {
                  update("category", e.target.value);
                  setShowNewCat(false);
                }
              }}
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
              <option value="__new__">+ Create new category</option>
            </select>
            {showNewCat && (
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  className="input-field flex-1"
                  placeholder="Category name"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                />
                <button
                  type="button"
                  disabled={newCatLoading || !newCatName.trim()}
                  onClick={async () => {
                    setNewCatLoading(true);
                    try {
                      const res = await categoryApi.create({
                        name: newCatName.trim(),
                      });
                      const newCat = res.data.data;
                      setCategories((prev) => [...prev, newCat]);
                      update("category", newCat.id);
                      setNewCatName("");
                      setShowNewCat(false);
                    } catch (err) {
                      const { message } = parseApiError(err);
                      setError(message);
                    } finally {
                      setNewCatLoading(false);
                    }
                  }}
                  className="btn-primary text-sm shrink-0"
                >
                  {newCatLoading ? "Adding..." : "Add"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewCat(false);
                    setNewCatName("");
                  }}
                  className="btn-secondary text-sm shrink-0"
                >
                  Cancel
                </button>
              </div>
            )}
            {fieldErrors.category && (
              <p className="text-red-500 text-xs mt-1">
                {fieldErrors.category}
              </p>
            )}
          </div>
          <div>
            <label className="label">Level</label>
            <select
              className="input-field"
              value={form.level}
              onChange={(e) => update("level", e.target.value)}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Price ($)</label>
            <input
              type="number"
              required
              min={0}
              step="0.01"
              className={`input-field ${fieldErrors.price ? "border-red-500 focus:ring-red-500" : ""}`}
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
            />
            {fieldErrors.price && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.price}</p>
            )}
          </div>
          <div>
            <label className="label">Discount Price ($)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              className="input-field"
              placeholder="Optional"
              value={form.discountPrice}
              onChange={(e) => update("discountPrice", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Duration (hours)</label>
            <input
              type="number"
              min={0}
              className="input-field"
              value={form.duration}
              onChange={(e) => update("duration", e.target.value)}
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="label">Tags</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              className="input-field flex-1"
              placeholder="Add tag"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), addTag())
              }
            />
            <button
              type="button"
              onClick={addTag}
              className="btn-secondary text-sm gap-1"
            >
              <Plus size={14} /> Add
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {form.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
              >
                {tag}
                <button type="button" onClick={() => removeTag(tag)}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Requirements */}
        <div>
          <label className="label">Requirements</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              className="input-field flex-1"
              placeholder="Add requirement"
              value={reqInput}
              onChange={(e) => setReqInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), addRequirement())
              }
            />
            <button
              type="button"
              onClick={addRequirement}
              className="btn-secondary text-sm gap-1"
            >
              <Plus size={14} /> Add
            </button>
          </div>
          <ul className="space-y-1">
            {form.requirements.map((r, i) => (
              <li
                key={i}
                className="flex items-center justify-between text-sm bg-gray-50 px-3 py-1.5 rounded"
              >
                {r}
                <button
                  type="button"
                  onClick={() =>
                    update(
                      "requirements",
                      form.requirements.filter((_, idx) => idx !== i),
                    )
                  }
                >
                  <X size={14} className="text-gray-400 hover:text-red-500" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* What You'll Learn */}
        <div>
          <label className="label">What You'll Learn</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              className="input-field flex-1"
              placeholder="Add learning outcome"
              value={learnInput}
              onChange={(e) => setLearnInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), addLearn())
              }
            />
            <button
              type="button"
              onClick={addLearn}
              className="btn-secondary text-sm gap-1"
            >
              <Plus size={14} /> Add
            </button>
          </div>
          <ul className="space-y-1">
            {form.whatYouWillLearn.map((item, i) => (
              <li
                key={i}
                className="flex items-center justify-between text-sm bg-gray-50 px-3 py-1.5 rounded"
              >
                {item}
                <button
                  type="button"
                  onClick={() =>
                    update(
                      "whatYouWillLearn",
                      form.whatYouWillLearn.filter((_, idx) => idx !== i),
                    )
                  }
                >
                  <X size={14} className="text-gray-400 hover:text-red-500" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <button type="submit" disabled={saving} className="btn-primary gap-2">
            <Save size={18} />{" "}
            {saving ? "Saving..." : isEdit ? "Update Course" : "Create Course"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/instructor/dashboard")}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
