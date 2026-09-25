import { useEffect, useRef, useState } from 'react'
import { peekPendingPrompt, takePendingPrompt } from '../lib/pendingPrompt'

const MAX_HEIGHT = 200

const newMessage = (text) => ({ id: crypto.randomUUID(), role: "user", text })

export default function ChatUI() {
  const [prompt, setPrompt] = useState("");
  // A prompt typed on the landing page before signing in is processed on arrival.
  const [messages, setMessages] = useState(() => {
    const pending = peekPendingPrompt();
    return pending ? [newMessage(pending)] : [];
  });
  const textareaRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  }, [prompt]);

  const canSend = prompt.trim().length > 0;

  // Single entry point for every prompt, typed here or carried over from the landing page.
  const processPrompt = (text) => {
    const clean = text.trim();
    if (!clean) {
      return;
    }
    // TODO: call the generation API here
    setMessages((m) => [...m, newMessage(clean)]);
  };

  // Clear it only after it has been shown, so it is never processed twice.
  useEffect(() => {
    takePendingPrompt();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const handleSubmit = () => {
    if (!canSend) {
      return;
    }
    processPrompt(prompt);
    setPrompt("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative h-full">
      <div className="h-full overflow-y-auto px-4 pt-6 pb-36">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          {messages.map((m) => (
            <div key={m.id} className="flex justify-end">
              <p className="max-w-[85%] rounded-3xl rounded-br-lg bg-zinc-900 px-4 py-2.5 text-[15px] leading-6 whitespace-pre-wrap text-white">
                {m.text}
              </p>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 px-4 pb-4">
        <div className="mx-auto w-full max-w-3xl">
          <div className="flex items-end gap-2 rounded-3xl border border-zinc-200 bg-white px-4 py-2.5 shadow-lg transition focus-within:border-zinc-300 focus-within:shadow-xl">
            <textarea
              ref={textareaRef}
              rows={1}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message..."
              className="max-h-50 flex-1 resize-none bg-transparent py-1.5 text-base leading-6 text-zinc-900 outline-none placeholder:text-zinc-400"
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSend}
              aria-label="Send message"
              className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
