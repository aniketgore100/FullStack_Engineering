// The landing page saves what the visitor typed here before sending them to
// Google, and the app picks it up after sign-in so nothing is lost.
const KEY = "pendingPrompt";
const MAX = 500;

export const savePendingPrompt = (text) => {
  try {
    sessionStorage.setItem(KEY, text.slice(0, MAX));
  } catch {
    // storage blocked: they'll just type it again after signing in
  }
};

// returns the saved prompt once, then forgets it
export const takePendingPrompt = () => {
  try {
    const text = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    return text?.trim().slice(0, MAX) || null;
  } catch {
    return null;
  }
};
