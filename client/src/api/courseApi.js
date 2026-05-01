import API from "./axios";

export const courseApi = {
  getAll: (params) => API.get("/courses", { params }),
  search: (params) => API.get("/courses/search", { params }),
  getBySlug: (slug) => API.get(`/courses/slug/${slug}`),
  getById: (id) => API.get(`/courses/${id}`),
  getInstructorCourses: () => API.get("/courses/instructor/my-courses"),
  getStudentCourses: () => API.get("/courses/student/my-courses"),
  create: (data) => API.post("/courses", data),
  update: (id, data) => API.patch(`/courses/${id}`, data),
  delete: (id) => API.delete(`/courses/${id}`),
  publish: (id) => API.patch(`/courses/${id}/publish`),
  unpublish: (id) => API.patch(`/courses/${id}/unpublish`),
  getLessons: (courseId) => API.get(`/courses/${courseId}/lessons`),
  createLesson: (courseId, data) =>
    API.post(`/courses/${courseId}/lessons`, data),
  updateLesson: (courseId, lessonId, data) =>
    API.patch(`/courses/${courseId}/lessons/${lessonId}`, data),
  deleteLesson: (courseId, lessonId) =>
    API.delete(`/courses/${courseId}/lessons/${lessonId}`),
  getLesson: (courseId, lessonId) =>
    API.get(`/courses/${courseId}/lessons/${lessonId}`),
  reorderLessons: (courseId, data) =>
    API.patch(`/courses/${courseId}/lessons/reorder`, data),
  markLessonComplete: (courseId, lessonId) =>
    API.post(`/courses/${courseId}/lessons/${lessonId}/complete`),
  getProgress: (courseId) => API.get(`/courses/${courseId}/progress`),
  getReviews: (courseId) => API.get(`/courses/${courseId}/reviews`),
  createReview: (courseId, data) =>
    API.post(`/courses/${courseId}/reviews`, data),
  updateReview: (courseId, reviewId, data) =>
    API.put(`/courses/${courseId}/reviews/${reviewId}`, data),
  deleteReview: (courseId, reviewId) =>
    API.delete(`/courses/${courseId}/reviews/${reviewId}`),
};
