import type { ParsedDump } from "../types";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";
const MODEL = "llama-3.3-70b-versatile";

async function groqRequest(prompt: string): Promise<string> {
  if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is not set in .env");

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error: ${res.status} - ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

export async function parseBrainDump(rawText: string): Promise<ParsedDump> {
  const prompt = `You are a productivity assistant. Parse the following brain dump into structured categories.

Return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  "tasks": ["actionable items to do now"],
  "goals": ["long-term objectives"],
  "ideas": ["future possibilities, random thoughts"]
}

Rules:
- "tasks" = concrete actionable items (things you can do today or this week)
- "goals" = broader objectives or targets (things that take weeks/months)
- "ideas" = suggestions, random thoughts, things to explore someday
- Each item should be a concise string (1 sentence max)
- If something doesn't fit a category, put it in the most fitting one
- Keep original language (Russian stays Russian, English stays English)

Brain dump:
"""${rawText}"""`;

  const response = await groqRequest(prompt);

  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse AI response");

  return JSON.parse(jsonMatch[0]);
}

export async function getMentorMessage(
  currentTask: string,
  completedCount: number,
  totalTasks: number
): Promise<string> {
  const prompt = `You are a tough-love productivity mentor. Give a short, direct motivational message (2-3 sentences max) about the current task.

Context:
- Current task: "${currentTask}"
- Tasks completed today: ${completedCount}
- Total tasks in backlog: ${totalTasks}

Rules:
- Be direct, no fluff
- If they've been procrastinating, call it out
- If they're making progress, acknowledge it briefly
- Write in the SAME language as the task
- Max 2-3 sentences, punchy`;

  return groqRequest(prompt);
}
