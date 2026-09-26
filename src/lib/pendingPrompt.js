// Carries a prompt typed on the landing page across the Google login redirect.
const KEY = "pending-prompt";
const MAX_LENGTH = 2000;

export function savePendingPrompt(text) {
  try {
    sessionStorage.setItem(KEY, text.trim().slice(0, MAX_LENGTH));
  } catch {
    /* storage unavailable: prompt is simply lost */
  }
}


// Read-and-clear, so a prompt is only ever processed once.
export function takePendingPrompt() {
  try {
    const text = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    return text || null;
  } catch {
    return null;
  }
}
