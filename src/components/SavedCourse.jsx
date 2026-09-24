import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useCourses } from "../context/CoursesContext";
import { api } from "../lib/api";
import CourseNotice from "./CourseNotice";
import { CoursePreview, CourseSkeleton } from "./CoursePreview";

// Opens a saved course from the backend and saves progress as you go.
export default function SavedCourse({ id }) {
  const { setProgress } = useCourses();
  const [state, setState] = useState({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    api
      .get(`/courses/${id}`)
      .then((data) => alive && setState({ status: "ready", course: data.course }))
      .catch((err) => alive && setState({ status: err.status === 404 ? "missing" : "error" }));
    return () => {
      alive = false;
    };
  }, [id, attempt]);

  const saveProgress = (completed) => {
    setProgress(id, completed);
    api.patch(`/courses/${id}/progress`, { completed }).catch(() => {});
  };

  if (state.status === "loading") return <CourseSkeleton />;
  if (state.status === "missing") return <Navigate to="/" replace />;
  if (state.status === "error") {
    return (
      <CourseNotice
        kind="error"
        message="We couldn't open this course. Check your connection and try again."
        onRetry={() => {
          setState({ status: "loading" });
          setAttempt((n) => n + 1);
        }}
      />
    );
  }
  return <CoursePreview course={state.course} onProgress={saveProgress} />;
}
