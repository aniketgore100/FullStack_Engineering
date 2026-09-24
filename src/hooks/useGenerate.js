import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCourses } from "../context/CoursesContext";
import { api } from "../lib/api";

// Sends a prompt to the backend. On success the new course is already saved
// server-side, so we add it to the sidebar and open it at its own address.
// `routeId` is the course currently on screen (if any): a rejection message
// belongs to that screen and disappears once you navigate elsewhere.
export function useGenerate(routeId) {
  const navigate = useNavigate();
  const { add } = useCourses();
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  const generate = useCallback(
    async (prompt) => {
      setLoading(true);
      setNotice(null);
      try {
        const { course } = await api.post("/courses/preview", { prompt });
        add(course);
        navigate(`/courses/${course.id}`);
      } catch (err) {
        if (err.status === 401) return; // session is gone, the app sends you to login
        setNotice({
          // 422 = "that isn't a learning request"; anything else is a real failure
          kind: err.status === 422 ? "rejected" : "error",
          message: err.message,
          suggestions: err.data?.suggestions ?? [],
          prompt,
          forId: routeId ?? null,
        });
      } finally {
        setLoading(false);
      }
    },
    [add, navigate, routeId],
  );

  const current = notice && notice.forId === (routeId ?? null) ? notice : null;
  return { generate, loading, notice: current };
}
