// Renders lesson text from the backend. The text is plain: paragraphs split by
// blank lines, "- " list lines, ``` fenced code, and `inline code`. It's all
// rendered as React text, never as HTML, so nothing in it can run.

const FENCE = /```(\w*)\n([\s\S]*?)```/g;

function toBlocks(body) {
  const blocks = [];

  const pushText = (text) => {
    for (const chunk of text.split(/\n{2,}/)) {
      const t = chunk.trim();
      if (!t) continue;
      const lines = t.split("\n");
      if (lines.every((l) => /^[-*]\s+/.test(l))) {
        blocks.push({ type: "list", items: lines.map((l) => l.replace(/^[-*]\s+/, "")) });
      } else {
        blocks.push({ type: "p", text: t });
      }
    }
  };

  let last = 0;
  for (const m of body.matchAll(FENCE)) {
    pushText(body.slice(last, m.index));
    blocks.push({ type: "code", lang: m[1], text: m[2].replace(/\n$/, "") });
    last = m.index + m[0].length;
  }
  pushText(body.slice(last));
  return blocks;
}

function Inline({ text }) {
  return text.split(/(`[^`]+`)/).map((part, i) =>
    part.startsWith("`") && part.endsWith("`") && part.length > 2 ? (
      <code key={i} className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[12.5px] text-zinc-800">
        {part.slice(1, -1)}
      </code>
    ) : (
      part
    ),
  );
}

export default function LessonContent({ body }) {
  return (
    <div className="space-y-3">
      {toBlocks(body).map((b, i) => {
        if (b.type === "code") {
          return (
            <div key={i} className="overflow-hidden rounded-lg bg-zinc-900">
              {b.lang && (
                <div className="border-b border-white/10 px-3 py-1 text-[11px] text-zinc-400">
                  {b.lang}
                </div>
              )}
              <pre className="overflow-x-auto p-3 font-mono text-[12.5px] leading-5 text-zinc-100">
                {b.text}
              </pre>
            </div>
          );
        }
        if (b.type === "list") {
          return (
            <ul key={i} className="list-disc space-y-1 pl-5 text-[14px] leading-6 text-zinc-600">
              {b.items.map((item, j) => (
                <li key={j}>
                  <Inline text={item} />
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="text-[14px] leading-6 text-zinc-600">
            <Inline text={b.text} />
          </p>
        );
      })}
    </div>
  );
}
