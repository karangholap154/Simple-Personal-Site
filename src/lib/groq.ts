import { ExpenseCategory, PaymentMethod, ExpenseType } from "@/types/expenses";
import { ParsedDailyDiaryAI, Mood, EnergyLevel, ConfidenceLevel } from "@/types/diary";

export interface ParsedExpenseAI {
  amount: number;
  category: ExpenseCategory;
  payment_method: PaymentMethod;
  expense_type: ExpenseType;
  notes: string;
  date: string; // YYYY-MM-DD
}

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
// Strictly using only available models from user account:
const PRIMARY_MODEL = "qwen/qwen3.8-27b";
const FALLBACK_MODEL = "openai/gpt-oss-20b";

const VALID_CATEGORIES: ExpenseCategory[] = [
  "Food & Dining",
  "Transport & Travel",
  "Tech & Hosting",
  "Bills & Utilities",
  "Shopping",
  "Entertainment",
  "Education & Books",
  "Health & Fitness",
  "Other",
];

const VALID_PAYMENT_METHODS: PaymentMethod[] = [
  "UPI",
  "Credit Card",
  "Debit Card",
  "Cash",
  "NetBanking",
];

const VALID_EXPENSE_TYPES: ExpenseType[] = ["need", "want", "investment"];

/**
 * Fast natural language and SMS expense parser powered by Groq Llama 3.1 8B Instant.
 * Average response time: ~150-250ms with 0 token exhaustion risk.
 */
export async function parseExpenseWithGroq(inputText: string): Promise<ParsedExpenseAI> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey || apiKey === "your-groq-api-key") {
    throw new Error("Groq API key is missing. Please set VITE_GROQ_API_KEY in your .env file.");
  }

  const trimmed = inputText.trim();
  if (!trimmed) {
    throw new Error("Please enter an expense description or paste a transaction SMS.");
  }

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD
  const dayName = today.toLocaleDateString("en-US", { weekday: "long" });

  const systemPrompt = `You are a high-speed, accurate personal expense parser.
The user will provide an expense record written in plain English, Hinglish, informal shorthand, or a bank/UPI transaction SMS alert (e.g. HDFC, SBI, ICICI, Axis, Paytm, PhonePe, GPay).

Extract the expense data and return ONLY a valid JSON object matching this schema:
{
  "amount": number (positive decimal or integer, no currency symbols),
  "category": string (MUST BE EXACTLY ONE OF: "Food & Dining", "Transport & Travel", "Tech & Hosting", "Bills & Utilities", "Shopping", "Entertainment", "Education & Books", "Health & Fitness", "Other"),
  "payment_method": string (MUST BE EXACTLY ONE OF: "UPI", "Credit Card", "Debit Card", "Cash", "NetBanking"),
  "expense_type": string (MUST BE EXACTLY ONE OF: "need", "want", "investment"),
  "notes": string (concise description of what was purchased or merchant name),
  "date": string (ISO date format YYYY-MM-DD)
}

Context for date calculations:
- Today's date is: ${todayStr} (${dayName}).
- If user mentions "yesterday", compute the previous day's date in YYYY-MM-DD.
- If user mentions a specific day or date, calculate accordingly. If no date is mentioned, use "${todayStr}".

Classification rules:
- "need": Essential expenses (Groceries, daily commute, transit, rent, wifi/electricity bills, medicines, work lunch).
- "want": Discretionary spending (Restaurants, food delivery / Swiggy / Zomato, movies, shopping for clothes/gadgets, games, cafe outings).
- "investment": Growth & self-improvement (Tech tools, hosting/domains, books, educational courses, gym membership).

Payment Method rules:
- If UPI, GPay, PhonePe, Paytm, BHIM, QR code, or "@ok..." is mentioned -> "UPI".
- If card or credit card or CC is mentioned -> "Credit Card".
- If debit card or ATM -> "Debit Card".
- If cash -> "Cash".
- Default to "UPI" for Indian digital payments or if ambiguous, unless "cash" is explicitly specified.

If bank SMS:
- Clean out reference numbers, OTPs, and account numbers from notes.
- Keep the clean vendor name and purpose in "notes".`;

  async function callModel(modelName: string) {
    return await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: trimmed },
        ],
      }),
    });
  }

  let response = await callModel(PRIMARY_MODEL);

  // If primary model fails, fallback to secondary available model
  if (!response.ok) {
    console.warn(`Primary model ${PRIMARY_MODEL} returned ${response.status}. Attempting fallback to ${FALLBACK_MODEL}...`);
    response = await callModel(FALLBACK_MODEL);
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMsg = errorData?.error?.message || `Groq API responded with status ${response.status}`;
    throw new Error(errorMsg);
  }

  const result = await response.json();
  const rawContent = result.choices?.[0]?.message?.content;

  if (!rawContent) {
    throw new Error("No response received from AI model.");
  }

  let parsed: any;
  try {
    // Attempt standard parse first
    parsed = JSON.parse(rawContent);
  } catch {
    // Fallback: extract JSON substring if wrapped in markdown
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch {
        throw new Error("Failed to parse AI response. Please try rephrasing your expense.");
      }
    } else {
      throw new Error("Failed to parse AI response. Please try rephrasing your expense.");
    }
  }

  // Validate and sanitize amount
  const amount = Number(parsed.amount);
  if (isNaN(amount) || amount <= 0) {
    throw new Error("Could not detect a valid amount. Please specify how much was spent (e.g. '150 on coffee').");
  }

  // Sanitize category
  const category: ExpenseCategory = VALID_CATEGORIES.includes(parsed.category)
    ? parsed.category
    : "Food & Dining";

  // Sanitize payment method
  const payment_method: PaymentMethod = VALID_PAYMENT_METHODS.includes(parsed.payment_method)
    ? parsed.payment_method
    : "UPI";

  // Sanitize expense type
  const expense_type: ExpenseType = VALID_EXPENSE_TYPES.includes(parsed.expense_type)
    ? parsed.expense_type
    : "need";

  // Sanitize date
  let date = parsed.date;
  if (!date || isNaN(Date.parse(date))) {
    date = todayStr;
  }

  // Clean notes
  const notes = parsed.notes ? String(parsed.notes).trim() : trimmed;

  return {
    amount,
    category,
    payment_method,
    expense_type,
    notes,
    date,
  };
}

const VALID_MOODS: Mood[] = [
  "ecstatic",
  "happy",
  "calm",
  "neutral",
  "tired",
  "anxious",
  "frustrated",
  "down",
];

const VALID_ENERGY: EnergyLevel[] = ["high", "medium", "low", "burned_out"];

/**
 * Parses a raw unstructured evening reflection using Groq AI.
 * Deeply supports English, Marathi, Hindi, Hinglish, slang, and typos.
 * Never modifies or judges the user's authentic words.
 */
export async function parseDiaryWithGroq(inputText: string, dateStr?: string): Promise<ParsedDailyDiaryAI> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey || apiKey === "your-groq-api-key") {
    throw new Error("Groq API key is missing. Please set VITE_GROQ_API_KEY in your .env file.");
  }

  const trimmed = inputText.trim();
  if (!trimmed) {
    throw new Error("Please write an entry before running AI analysis.");
  }

  const todayStr = dateStr || new Date().toISOString().split("T")[0];

  const systemPrompt = `You are an empathetic, objective, and culturally intelligent life journal analysis assistant and reflection coach.
The user provides an authentic, raw, unstructured evening reflection written in English, Marathi (मराठी, whether in Devanagari or Latin phonetic script like "aaj kaam khup changla jhala", "vel ghalavla"), Hindi, Hinglish, or informal shorthand with typos and slang.

Rules:
1. Deeply understand Marathi, Hindi, Hinglish, and Indian colloquial expressions.
2. NEVER modify, judge, or lecture the user.
3. Distinguish work/learning hours from rest/entertainment. Entertainment (watching a movie, spending time with family, gaming) is NOT automatically wasted time. Only classify hours under "unplanned_hours" if the user explicitly expressed procrastination, distraction, or regret (e.g. "wasted 2 hours scrolling reels", "timepass kela").
4. If hours are not explicitly stated, estimate reasonably or use 0 with confidence "low".
5. Return ONLY a valid JSON object matching this exact schema:
{
  "work_hours": number (estimated productive work/coding hours, default 0),
  "work_hours_confidence": "high" | "medium" | "low",
  "learning_hours": number (study, reading, or upskilling hours, default 0),
  "learning_hours_confidence": "high" | "medium" | "low",
  "unplanned_hours": number (procrastinated or regretted hours, default 0),
  "unplanned_hours_confidence": "high" | "medium" | "low",
  "wasted_reasons": string[] (specific distraction reasons if mentioned, e.g. ["Instagram Reels", "Doomscrolling"]),
  "mood": "ecstatic" | "happy" | "calm" | "neutral" | "tired" | "anxious" | "frustrated" | "down",
  "mood_score": number (1 to 10),
  "mood_confidence": "high" | "medium" | "low",
  "energy_level": "high" | "medium" | "low" | "burned_out",
  "energy_confidence": "high" | "medium" | "low",
  "wins_and_good_news": string[] (victories, accomplishments, good moments, gratitude),
  "struggles_and_bad_news": string[] (difficulties, bad news, bugs, emotional stress),
  "projects_mentioned": string[] (e.g. ["Portfolio", "Private Academy", "API"]),
  "people_mentioned": string[] (e.g. ["Family", "Friend", "Manager"]),
  "learnings_and_reflections": string (a concise 1-sentence realization or lesson from today),
  "tomorrow_priority": string or null (top priority for tomorrow if mentioned or inferred),
  "suggested_tags": string[] (e.g. ["coding", "family", "learning"]),
  "potential_memories": string[] (key milestone moments worth remembering in future years),
  "summary": string (a concise 2-sentence objective summary of the day),
  "ai_coach_feedback": string (2-3 sentences of empathetic, stoic, grounded reflection. No generic cheerleading.)
}`;

  async function callModel(modelName: string) {
    return await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Date of entry: ${todayStr}\n\nUser raw reflection:\n${trimmed}` },
        ],
      }),
    });
  }

  let response = await callModel(PRIMARY_MODEL);

  if (!response.ok) {
    console.warn(`Primary model ${PRIMARY_MODEL} returned ${response.status}. Attempting fallback to ${FALLBACK_MODEL}...`);
    response = await callModel(FALLBACK_MODEL);
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMsg = errorData?.error?.message || `Groq API responded with status ${response.status}`;
    throw new Error(errorMsg);
  }

  const result = await response.json();
  const rawContent = result.choices?.[0]?.message?.content;

  if (!rawContent) {
    throw new Error("No response received from AI model.");
  }

  let parsed: any;
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("Failed to parse AI reflection response.");
    }
  }

  // Sanitize values
  const mood: Mood = VALID_MOODS.includes(parsed.mood) ? parsed.mood : "neutral";
  const energy_level: EnergyLevel = VALID_ENERGY.includes(parsed.energy_level) ? parsed.energy_level : "medium";
  const mood_score = typeof parsed.mood_score === "number" ? Math.min(Math.max(parsed.mood_score, 1), 10) : 6;

  return {
    work_hours: typeof parsed.work_hours === "number" ? Math.max(parsed.work_hours, 0) : 0,
    work_hours_confidence: parsed.work_hours_confidence || "medium",
    learning_hours: typeof parsed.learning_hours === "number" ? Math.max(parsed.learning_hours, 0) : 0,
    learning_hours_confidence: parsed.learning_hours_confidence || "medium",
    unplanned_hours: typeof parsed.unplanned_hours === "number" ? Math.max(parsed.unplanned_hours, 0) : 0,
    unplanned_hours_confidence: parsed.unplanned_hours_confidence || "medium",
    wasted_reasons: Array.isArray(parsed.wasted_reasons) ? parsed.wasted_reasons : [],
    mood,
    mood_score,
    mood_confidence: parsed.mood_confidence || "medium",
    energy_level,
    energy_confidence: parsed.energy_confidence || "medium",
    wins_and_good_news: Array.isArray(parsed.wins_and_good_news) ? parsed.wins_and_good_news : [],
    struggles_and_bad_news: Array.isArray(parsed.struggles_and_bad_news) ? parsed.struggles_and_bad_news : [],
    projects_mentioned: Array.isArray(parsed.projects_mentioned) ? parsed.projects_mentioned : [],
    people_mentioned: Array.isArray(parsed.people_mentioned) ? parsed.people_mentioned : [],
    learnings_and_reflections: String(parsed.learnings_and_reflections || ""),
    tomorrow_priority: parsed.tomorrow_priority ? String(parsed.tomorrow_priority) : null,
    suggested_tags: Array.isArray(parsed.suggested_tags) ? parsed.suggested_tags : [],
    potential_memories: Array.isArray(parsed.potential_memories) ? parsed.potential_memories : [],
    summary: String(parsed.summary || ""),
    ai_coach_feedback: String(parsed.ai_coach_feedback || "Stay consistent and reflect honestly on your progress."),
  };
}

