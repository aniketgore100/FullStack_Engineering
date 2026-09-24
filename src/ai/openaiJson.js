import { openai } from "../lib/openai.js";

// One chat call that must answer in a strict JSON schema.
// Returns { data, usage } or { refused: true } if the model declined.
export async function callJson({ model, system, user, name, schema, maxTokens, userKey }) {
  const res = await openai().chat.completions.create({
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    response_format: { type: "json_schema", json_schema: { name, strict: true, schema } },
    max_completion_tokens: maxTokens,
    safety_identifier: userKey, // lets OpenAI tie abuse to one user, not the whole app
  });

  const usage = {
    prompt: res.usage?.prompt_tokens ?? 0,
    completion: res.usage?.completion_tokens ?? 0,
  };
  const choice = res.choices?.[0];
  if (choice?.message?.refusal) return { refused: true, usage };
  if (!choice || choice.finish_reason === "length") {
    throw new Error("Model output was cut off.");
  }
  return { data: JSON.parse(choice.message.content), usage };
}
