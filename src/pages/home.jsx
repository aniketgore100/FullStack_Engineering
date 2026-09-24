import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { ChatUI } from "../components/ChatUI";
import CourseNotice from "../components/CourseNotice";
import { CourseSkeleton } from "../components/CoursePreview";
import SavedCourse from "../components/SavedCourse";
import { useGenerate } from "../hooks/useGenerate";
import AppLayout from "../layouts/AppLayout";
import { takePendingPrompt } from "../lib/pendingPrompt";

// "/" is a blank prompt screen; "/courses/:id" opens a saved course on the same screen.
export const Home = () => {
  const { id } = useParams();
  const { generate, loading, notice } = useGenerate(id);

  // a prompt typed on the landing page before signing in runs straight away
  const started = useRef(false); // effects run twice in dev; only take it once
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const pending = takePendingPrompt();
    if (pending) queueMicrotask(() => generate(pending));
  }, [generate]);

  return (
    <AppLayout>
      <ChatUI onSubmit={generate} loading={loading}>
        {loading ? (
          <CourseSkeleton />
        ) : notice ? (
          <CourseNotice
            kind={notice.kind}
            message={notice.message}
            suggestions={notice.suggestions}
            onPick={generate}
            onRetry={() => generate(notice.prompt)}
          />
        ) : id ? (
          <SavedCourse key={id} id={id} />
        ) : null}
      </ChatUI>
    </AppLayout>
  );
};
