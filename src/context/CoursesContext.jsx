/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

const CoursesContext = createContext(null);

// The signed-in user's saved courses: what the sidebar lists.
export function CoursesProvider({ children }) {
  const [courses, setCourses] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  useEffect(() => {
    let alive = true;
    api
      .get("/courses")
      .then((data) => {
        if (!alive) return;
        setCourses(data.courses);
        setStatus("ready");
      })
      .catch(() => alive && setStatus("error"));
    return () => {
      alive = false;
    };
  }, []);

  // a freshly generated course goes to the top of the list
  const add = useCallback(
    (course) =>
      setCourses((list) => [
        {
          id: course.id,
          title: course.title,
          level: course.level,
          duration: course.duration,
          stepCount: course.steps.length,
          progress: course.progress,
          createdAt: course.createdAt,
        },
        ...list.filter((c) => c.id !== course.id),
      ]),
    [],
  );

  const setProgress = useCallback(
    (id, progress) => setCourses((list) => list.map((c) => (c.id === id ? { ...c, progress } : c))),
    [],
  );

  const remove = useCallback(async (id) => {
    await api.delete(`/courses/${id}`);
    setCourses((list) => list.filter((c) => c.id !== id));
  }, []);

  const value = useMemo(
    () => ({ courses, status, add, setProgress, remove }),
    [courses, status, add, setProgress, remove],
  );

  return <CoursesContext.Provider value={value}>{children}</CoursesContext.Provider>;
}

export const useCourses = () => {
  const ctx = useContext(CoursesContext);
  if (!ctx) throw new Error("useCourses must be used inside <CoursesProvider>");
  return ctx;
};
