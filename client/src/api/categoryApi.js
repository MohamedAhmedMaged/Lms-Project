import API from "./axios";

export const categoryApi = {
  getAll: () => API.get("/categories"),
  getTree: () => API.get("/categories/tree"),
  getBySlug: (slug) => API.get(`/categories/slug/${slug}`),
  create: (data) => API.post("/categories", data),
};
