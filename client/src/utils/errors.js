export function parseApiError(err) {
  const data = err.response?.data;
  const message = data?.message || "Something went wrong";
  const fieldErrors = {};

  if (data?.errors && Array.isArray(data.errors)) {
    for (const e of data.errors) {
      if (e.field && e.message) {
        fieldErrors[e.field] = e.message;
      }
    }
  }

  return { message, fieldErrors };
}
