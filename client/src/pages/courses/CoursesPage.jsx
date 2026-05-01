import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { courseApi } from "../../api/courseApi";
import { categoryApi } from "../../api/categoryApi";
import CourseCard from "../../components/courses/CourseCard";
import Loader from "../../components/common/Loader";
import { Search, SlidersHorizontal } from "lucide-react";

export default function CoursesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    q: searchParams.get("q") || "",
    category: searchParams.get("category") || "",
    level: searchParams.get("level") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
  });

  useEffect(() => {
    categoryApi
      .getAll()
      .then((res) => setCategories(res.data.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [searchParams]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = {};
      const q = searchParams.get("q");
      const category = searchParams.get("category");
      const level = searchParams.get("level");
      const minPrice = searchParams.get("minPrice");
      const maxPrice = searchParams.get("maxPrice");

      if (q) {
        params.q = q;
        if (category) params.category = category;
        if (level) params.level = level;
        if (minPrice) params.minPrice = Number(minPrice);
        if (maxPrice) params.maxPrice = Number(maxPrice);
        const res = await courseApi.search(params);
        setCourses(res.data.data || []);
      } else {
        const res = await courseApi.getAll({
          category: category || undefined,
          limit: 50,
        });
        setCourses(res.data.data || []);
      }
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (e) => {
    e.preventDefault();
    const params = {};
    if (filters.q) params.q = filters.q;
    if (filters.category) params.category = filters.category;
    if (filters.level) params.level = filters.level;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({ q: "", category: "", level: "", minPrice: "", maxPrice: "" });
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Courses</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary text-sm gap-2"
        >
          <SlidersHorizontal size={16} /> Filters
        </button>
      </div>

      {showFilters && (
        <form
          onSubmit={applyFilters}
          className="bg-white rounded-xl border border-gray-200 p-4 mb-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="lg:col-span-2">
              <label className="label">Search</label>
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  className="input-field pl-9"
                  placeholder="Search courses..."
                  value={filters.q}
                  onChange={(e) =>
                    setFilters({ ...filters, q: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label className="label">Category</label>
              <select
                className="input-field"
                value={filters.category}
                onChange={(e) =>
                  setFilters({ ...filters, category: e.target.value })
                }
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Level</label>
              <select
                className="input-field"
                value={filters.level}
                onChange={(e) =>
                  setFilters({ ...filters, level: e.target.value })
                }
              >
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" className="btn-primary text-sm flex-1">
                Apply
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="btn-secondary text-sm"
              >
                Clear
              </button>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <Loader />
      ) : courses.length === 0 ? (
        <div className="text-center py-16">
          <Search size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600">
            No courses found
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Try adjusting your search or filters
          </p>
          <p className="text-gray-400 text-xs mt-2">
            Only published courses appear here. Drafts are visible in your
            instructor dashboard.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
