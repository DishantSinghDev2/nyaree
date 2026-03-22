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
export async function generateBlogOutline(
  topic: string,
  keywords: string[],
  previousBlogs?: { title: string; url: string }[]
): Promise<string> {
  const prevContext = previousBlogs && previousBlogs.length > 0
    ? `\n\nCross-link to these existing Nyaree blog posts where relevant:\n${previousBlogs.map(b => `- "${b.title}" → ${b.url}`).join("\n")}`
    : "";

  const prompt = `Write a full, SEO-optimised blog post for Nyaree (Indian women's fashion brand) on the topic: "${topic}"

Keywords to include naturally: ${keywords.join(", ")}

Requirements:
- Write a compelling H1 title
- Introduction (~100 words)
- 4–5 main sections with H2 headers
- Bullet points where relevant
- Conclusion with CTA to shop at buynyaree.com
- Indian fashion context throughout
- Target: Indian women aged 20–40
- Format as HTML only (use <h1>, <h2>, <p>, <ul>, <li>, <strong>, <a href="...">)
- Aim for 600–900 words total
- Do not include any markdown, only HTML
- Avoid duplicating topics from existing posts below; instead reference them via links${prevContext}`;

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

// ─── 8. Product image generation via Imagen 4 ────────────────────────────────
// Uses ai.models.generateImages() — returns base64 imageBytes
export async function generateProductImage(prompt: string): Promise<string> {
  // Returns base64 PNG — caller uploads to DishIs and gets URL back
  const ai = getAI();
  const response = await (ai.models as any).generateImages({
    model: "imagen-4.0-generate-001",
    prompt: `Indian women's fashion product photo: ${prompt}. 
Style: clean white/neutral background, professional product photography, 
high quality, realistic fabric texture visible. Aspect ratio portrait 3:4.`,
    config: {
      numberOfImages: 1,
      aspectRatio: "3:4",
      safetyFilterLevel: "BLOCK_MEDIUM_AND_ABOVE",
      personGeneration: "DONT_ALLOW",
    },
  });
  // imageBytes is base64 encoded
  const imgBytes: string = response.generatedImages[0].image.imageBytes;
  return imgBytes; // base64 PNG
}

// ─── 9. Analyze uploaded product image → generate title/desc/price/tags ──────
// Accepts base64 image data, returns structured product info
export interface ProductAnalysis {
  name: string;
  shortDescription: string;
  description: string;
  category: "kurti" | "top" | "coord-set" | "dupatta" | "lehenga" | "other";
  fabric: string;
  pattern: string;
  color: string;
  occasion: string[];
  tags: string[];
  suggestedPrice: number;  // in paise (₹ × 100)
  suggestedCompareAtPrice: number;
  seo: { title: string; description: string; keywords: string[] };
}

export async function analyzeProductImage(
  imageBase64: string,
  mimeType: string = "image/jpeg"
): Promise<ProductAnalysis> {
  const ai = getAI();

  const prompt = `You are an expert Indian women's fashion buyer and e-commerce specialist for Nyaree (buynyaree.com).

Analyze this product image and provide complete product information in JSON format.

Return ONLY valid JSON (no markdown, no code blocks) with this exact structure:
{
  "name": "Attractive product name (max 60 chars, mention fabric/style/key feature)",
  "shortDescription": "1-2 sentence hook for the product card (max 120 chars)",
  "description": "Full HTML product description (3-4 paragraphs using <p> and <strong> tags, mention fabric feel, styling tips, occasions)",
  "category": "one of: kurti, top, coord-set, dupatta, lehenga, other",
  "fabric": "fabric type (Cotton/Rayon/Georgette/Silk/Chiffon/Linen/Crepe/Polyester/Other)",
  "pattern": "pattern type (Solid/Printed/Embroidered/Blocked/Floral/Abstract/Geometric/Paisley)",
  "color": "primary color name",
  "occasion": ["array of relevant occasions: Casual/Formal/Festive/Party/Wedding/Office/Daily Wear"],
  "tags": ["8-12 relevant search tags: lowercase, include fabric, style, occasion, trend keywords"],
  "suggestedPrice": 59900,
  "suggestedCompareAtPrice": 79900,
  "seo": {
    "title": "SEO title under 60 chars — include brand Nyaree",
    "description": "SEO meta description 150-160 chars with CTA",
    "keywords": ["6-8 SEO keywords"]
  }
}

Pricing guidelines (all in paise = rupees × 100):
- Budget quality (basic cotton): ₹299-499 → 29900-49900
- Mid-range (good fabric/design): ₹499-799 → 49900-79900  
- Premium (silk/embroidery): ₹799-1499 → 79900-149900
- compareAtPrice should be 20-30% higher than suggestedPrice

Context: This is for Indian women's fashion store. Target market: Indian women aged 20-40.`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        inlineData: {
          mimeType,
          data: imageBase64,
        },
      },
      { text: prompt },
    ],
    config: {
      responseMimeType: "application/json",
    },
  });

  const text = response.text ?? "{}";
  try {
    return JSON.parse(text) as ProductAnalysis;
  } catch {
    const stripped = text.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();
    return JSON.parse(stripped) as ProductAnalysis;
  }
}

// ─── 10. Estimate pricing from product details ─────────────────────────────────
export async function estimateProductPricing(product: {
  name: string;
  fabric: string;
  category: string;
  hasEmbroidery: boolean;
  description: string;
}): Promise<{ price: number; compareAtPrice: number; costPrice: number; margin: number }> {
  const prompt = `Estimate pricing for this Indian women's fashion product for an online store.

Product: ${product.name}
Category: ${product.category}
Fabric: ${product.fabric}
Has embroidery/embellishments: ${product.hasEmbroidery}
Description: ${product.description.slice(0, 200)}

Return ONLY valid JSON:
{
  "price": 59900,
  "compareAtPrice": 79900, 
  "costPrice": 30000,
  "margin": 50
}
All values in paise (rupees × 100). margin is percentage.
Typical margins for Indian fashion: 40-65%.`;

  return generateJSON<{ price: number; compareAtPrice: number; costPrice: number; margin: number }>(prompt);
}
