// lib/ai/gemini.ts
// Google Gemini AI — using @google/genai (latest GA SDK, v1.45.0)
// Model: gemini-2.5-flash (best speed/quality for production)
// Docs: https://ai.google.dev/gemini-api/docs
import { GoogleGenAI } from "@google/genai";

// ─── Client singleton ─────────────────────────────────────────────────────────
let _ai: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!_ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY environment variable is not set");
    _ai = new GoogleGenAI({ apiKey });
  }
  return _ai;
}

// Fast model for all tasks — Gemini 2.5 Flash
const MODEL = "gemini-2.5-flash";

// ─── Helper: call Gemini and return text ──────────────────────────────────────
async function generate(prompt: string, systemInstruction?: string): Promise<string> {
  const ai = getAI();
  const config = systemInstruction
    ? { systemInstruction }
    : undefined;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    ...(config && { config }),
  });

  return response.text ?? "";
}

// ─── Helper: call Gemini and parse JSON response ───────────────────────────────
async function generateJSON<T>(prompt: string, systemInstruction?: string): Promise<T> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      ...(systemInstruction && { systemInstruction }),
    },
  });

  const text = response.text ?? "{}";
  try {
    return JSON.parse(text) as T;
  } catch {
    // Sometimes model wraps in ```json ... ``` — strip and retry
    const stripped = text.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();
    return JSON.parse(stripped) as T;
  }
}

// ─── 1. Product Description Generator ────────────────────────────────────────
export async function generateProductDescription(product: {
  name: string;
  category: string;
  fabric: string;
  color: string;
  pattern: string;
  occasion: string[];
  fit: string;
  price: number;
}): Promise<string> {
  const prompt = `You are a luxury Indian fashion copywriter for Nyaree, a premium women's clothing brand based in Bahadurgarh, Haryana, India.

Write an evocative, SEO-optimized product description for:
- Name: ${product.name}
- Category: ${product.category}
- Fabric: ${product.fabric}
- Colour: ${product.color}
- Pattern: ${product.pattern}
- Occasions: ${product.occasion.join(", ")}
- Fit: ${product.fit}
- Price: ₹${product.price / 100}

Guidelines:
- 3-4 paragraphs, 300–400 words total
- Be poetic yet informative — describe how the fabric feels, how it drapes
- Include styling tips (what to pair it with, accessories)
- Mention Indian craftsmanship and heritage naturally
- Target audience: confident Indian women aged 22–40
- DO NOT use clichéd phrases like "this stunning piece" or "must-have"
- Output only HTML using <p> and <strong> tags — no markdown, no extra text`;

  return generate(prompt);
}

// ─── 2. SEO Metadata Generator ────────────────────────────────────────────────
export async function generateSEO(product: {
  name: string;
  category: string;
  price: number;
  description: string;
}): Promise<{ title: string; description: string; keywords: string[] }> {
  const prompt = `Generate SEO metadata for a Nyaree product (Indian women's fashion store).

Product: ${product.name}
Category: ${product.category}
Price: ₹${product.price / 100}
Description snippet: ${product.description.slice(0, 200)}

Return a JSON object (no markdown, no code blocks):
{
  "title": "SEO page title — under 60 chars, include brand Nyaree",
  "description": "Meta description — 140–160 chars, mention price, clear CTA",
  "keywords": ["8 to 12 relevant search keywords as an array of strings"]
}`;

  return generateJSON<{ title: string; description: string; keywords: string[] }>(prompt);
}

// ─── 3. Tag Suggester ─────────────────────────────────────────────────────────
export async function suggestTags(product: {
  name: string;
  description: string;
  category: string;
}): Promise<string[]> {
  const prompt = `Suggest 10–12 product tags for this item on Nyaree (Indian women's fashion).

Product: ${product.name}
Category: ${product.category}
Description: ${product.description.slice(0, 300)}

Return a JSON array of lowercase strings only — no markdown, no code blocks.
Include: style keywords, occasion, fabric type, trending hashtag words, Indian fashion terms.

Example format: ["cotton kurti", "festive wear", "printed", "casual"]`;

  return generateJSON<string[]>(prompt);
}

// ─── 4. AI Chatbot for Product Enquiries ──────────────────────────────────────
export async function chatWithCustomer(
  messages: { role: "user" | "assistant"; content: string }[],
  context: {
    productName?: string;
    productDescription?: string;
    productFabric?: string;
    productPrice?: number;
    availableSizes?: string[];
    allowCustomization?: boolean;
    storePhone?: string;
  }
): Promise<{ reply: string; shouldEscalate: boolean }> {
  const systemInstruction = `You are a helpful, warm, and knowledgeable customer service assistant for Nyaree — a premium Indian women's fashion brand founded by Rishika Singh, based in Bahadurgarh, Haryana.

${context.productName ? `Current product being asked about: ${context.productName}` : ""}
${context.productDescription ? `Product details: ${context.productDescription.slice(0, 500)}` : ""}
${context.productFabric ? `Fabric: ${context.productFabric}` : ""}
${context.productPrice ? `Price: ₹${context.productPrice / 100}` : ""}
${context.availableSizes?.length ? `Available sizes: ${context.availableSizes.join(", ")}` : ""}
${context.allowCustomization ? "This product supports customization." : ""}

Store details:
- Phone / WhatsApp: ${context.storePhone || "+91 8368989758"}
- Founder: Rishika Singh
- Address: Parnala Extended Industrial Area, Bahadurgarh, Haryana 124507
- Returns: 7-day easy returns
- Shipping: Free above ₹499, standard 5–7 days, express 2–3 days

Guidelines:
- Be warm and conversational — like a trusted friend who knows fashion well
- Answer questions about sizing, fabric, care, customization, delivery, returns
- Keep replies concise (2–4 sentences) unless detail is needed
- Use simple, clear language
- If the customer is frustrated or explicitly asks for a human, set escalate to true
- NEVER make up information you don't have

At the end of your reply add on a new line (not visible to user): ESCALATE:true or ESCALATE:false`;

  // Build Gemini-format conversation history
  // Gemini uses "user" and "model" roles
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const ai = getAI();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents,
    config: { systemInstruction },
  });

  const fullReply = response.text ?? "";
  const shouldEscalate = fullReply.includes("ESCALATE:true");
  const reply = fullReply.replace(/ESCALATE:(true|false)/g, "").trim();

  return { reply, shouldEscalate };
}

// ─── 5. Blog Content Generator ────────────────────────────────────────────────
export async function generateBlogOutline(topic: string, keywords: string[]): Promise<string> {
  const prompt = `Write a full, SEO-optimised blog post for Nyaree (Indian women's fashion brand) on the topic: "${topic}"

Keywords to include naturally: ${keywords.join(", ")}

Requirements:
- Write a compelling H1 title
- Introduction (~100 words)
- 4–5 main sections with H2 headers
- Bullet points where relevant
- Conclusion with CTA to shop at nyaree.in
- Indian fashion context throughout
- Target: Indian women aged 20–40
- Format as HTML only (use <h1>, <h2>, <p>, <ul>, <li>, <strong>)
- Aim for 600–900 words total
- Do not include any markdown, only HTML`;

  return generate(prompt);
}

// ─── 6. Admin Dashboard AI Assistant ─────────────────────────────────────────
export async function adminAssistant(
  question: string,
  context: Record<string, unknown>
): Promise<string> {
  const prompt = `${question}

Current store data context:
${JSON.stringify(context, null, 2)}`;

  return generate(
    prompt,
    `You are a helpful business assistant for Rishika Singh, founder of Nyaree (Indian women's fashion brand based in Bahadurgarh, Haryana).
You help with the admin dashboard — analysing data, suggesting actions, explaining metrics.
Be concise, helpful, and speak directly to Rishika. Keep language simple — she is a fashion entrepreneur, not a tech person.
Keep replies under 150 words unless detail is truly needed.`
  );
}

// ─── 7. AI SEO generator for blog posts ──────────────────────────────────────
export async function generateBlogSEO(title: string, excerpt: string): Promise<{ title: string; description: string }> {
  const prompt = `Generate SEO metadata for a Nyaree blog post.

Blog title: ${title}
Excerpt: ${excerpt}

Return a JSON object (no markdown):
{
  "title": "SEO title under 60 chars — include Nyaree",
  "description": "Meta description 140–160 chars — engaging, includes primary keyword"
}`;

  return generateJSON<{ title: string; description: string }>(prompt);
}
