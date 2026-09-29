import { useParams } from "react-router-dom";
import { useGetCourseByIdQuery } from "../services/api";
import CourseView from "../components/CourseView";

export default function CoursePage() {

  const { courseId } = useParams();
  const { data, isLoading, error } = useGetCourseByIdQuery(courseId);

  const course = data?.data;

  if (isLoading) return <div className="p-6 text-sm text-zinc-400">Loading…</div>;
  if (error || !course) return <div className="p-6 text-sm text-zinc-400">Course not found.</div>;

  return (
    <div className="h-full overflow-y-auto p-6">
      <CourseView course={course} />
    </div>
  );
}
