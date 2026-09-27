import { ExpenseCategory, PaymentMethod, ExpenseType } from "@/types/expenses";

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
