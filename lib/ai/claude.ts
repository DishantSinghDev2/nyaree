// lib/ai/claude.ts
import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getAI(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

const MODEL = "claude-sonnet-4-20250514";

// ─── Product Description Generator ───────────────────────────────────────────
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
  const ai = getAI();
  const msg = await ai.messages.create({
    model: MODEL,
    max_tokens: 800,
    messages: [
      {
        role: "user",
        content: `You are a luxury Indian fashion copywriter for Nyaree, a premium women's clothing brand based in Bahadurgarh, Haryana. Write an evocative, SEO-optimized product description.

Product Details:
- Name: ${product.name}
- Category: ${product.category}
- Fabric: ${product.fabric}
- Color: ${product.color}
- Pattern: ${product.pattern}
- Occasions: ${product.occasion.join(", ")}
- Fit: ${product.fit}
- Price: ₹${product.price / 100}

Guidelines:
- Write 3-4 paragraphs, 300-400 words total
- Be poetic yet informative about fabric feel and drape
- Include styling tips (what to pair with)
- Mention the craftsmanship and Indian heritage
- Target: confident Indian women aged 22-40
- Do NOT use generic phrases like "this stunning piece" or "must-have"
- Use rich HTML with <p> and <strong> tags only
- End with care instructions naturally woven in

Output only the HTML, nothing else.`,
      },
    ],
  });

  const text = msg.content[0];
  return text.type === "text" ? text.text : "";
}

// ─── SEO Generator ────────────────────────────────────────────────────────────
export async function generateSEO(product: {
  name: string;
  category: string;
  price: number;
  description: string;
}): Promise<{ title: string; description: string; keywords: string[] }> {
  const ai = getAI();
  const msg = await ai.messages.create({
    model: MODEL,
    max_tokens: 400,
    messages: [
      {
        role: "user",
        content: `Generate SEO metadata for this Nyaree product. Respond ONLY with valid JSON, no markdown.

Product: ${product.name}
Category: ${product.category}  
Price: ₹${product.price / 100}
Description snippet: ${product.description.slice(0, 200)}

Return JSON:
{
  "title": "SEO title under 60 chars including brand name Nyaree",
  "description": "Meta description 140-160 chars with price and CTA",
  "keywords": ["8-12 relevant keywords as array"]
}`,
      },
    ],
  });

  const text = msg.content[0].type === "text" ? msg.content[0].text : "{}";
  try {
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    return { title: product.name, description: "", keywords: [] };
  }
}

// ─── Tag Suggester ────────────────────────────────────────────────────────────
export async function suggestTags(product: {
  name: string;
  description: string;
  category: string;
}): Promise<string[]> {
  const ai = getAI();
  const msg = await ai.messages.create({
    model: MODEL,
    max_tokens: 200,
    messages: [
      {
        role: "user",
        content: `Suggest 10-12 relevant product tags for this item on Nyaree (Indian women's fashion store).
Product: ${product.name}
Category: ${product.category}
Description: ${product.description.slice(0, 300)}

Return ONLY a JSON array of lowercase strings: ["tag1", "tag2", ...]
Include: style, occasion, fabric type, price range (if clear), trending keywords, Indian fashion terms.`,
      },
    ],
  });

  const text = msg.content[0].type === "text" ? msg.content[0].text : "[]";
  try {
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    return [];
  }
}

// ─── AI Chatbot for Product Enquiries ────────────────────────────────────────
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
  const ai = getAI();

  const systemPrompt = `You are a helpful, warm, and knowledgeable customer service assistant for Nyaree — a premium Indian women's fashion brand founded by Rishika Singh, based in Bahadurgarh, Haryana.

${context.productName ? `Current product being asked about: ${context.productName}` : ""}
${context.productDescription ? `Product details: ${context.productDescription.slice(0, 500)}` : ""}
${context.productFabric ? `Fabric: ${context.productFabric}` : ""}
${context.productPrice ? `Price: ₹${context.productPrice / 100}` : ""}
${context.availableSizes?.length ? `Available sizes: ${context.availableSizes.join(", ")}` : ""}
${context.allowCustomization ? "This product supports customization." : ""}

Store details:
- Phone/WhatsApp: ${context.storePhone || "+91 8368989758"}
- Founder: Rishika Singh
- Address: Parnala Extended Industrial Area, Bahadurgarh, Haryana 124507
- Returns: 7-day easy returns on all products
- Shipping: Free above ₹499, standard 5-7 days, express 2-3 days

Guidelines:
- Be warm, friendly, and conversational (like a trusted friend who knows fashion)
- Answer questions about sizing, fabric, care, customization, delivery, returns
- If asked about something you cannot answer confidently (e.g., exact stock of a specific variant, order status), suggest they contact Rishika directly
- NEVER make up information
- Keep replies concise and helpful (2-4 sentences unless explanation requires more)
- Use simple, clear language — not too formal
- If the customer seems frustrated, unhappy, or explicitly asks for a human, indicate they need to be escalated

At the end of your response, add on a new line: "ESCALATE:true" if the customer needs human help, or "ESCALATE:false" if you handled it well.`;

  const response = await ai.messages.create({
    model: MODEL,
    max_tokens: 500,
    system: systemPrompt,
    messages,
  });

  const fullReply = response.content[0].type === "text" ? response.content[0].text : "";
  const shouldEscalate = fullReply.includes("ESCALATE:true");
  const reply = fullReply.replace(/ESCALATE:(true|false)/g, "").trim();

  return { reply, shouldEscalate };
}

// ─── Blog Content Assistant ───────────────────────────────────────────────────
export async function generateBlogOutline(topic: string, keywords: string[]): Promise<string> {
  const ai = getAI();
  const msg = await ai.messages.create({
    model: MODEL,
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content: `Create a detailed blog post outline for Nyaree (Indian women's fashion brand) on the topic: "${topic}"
Keywords to include: ${keywords.join(", ")}

Write a full SEO-optimized blog post with:
- Compelling H1 title
- Introduction (100 words)
- 4-5 main sections with H2 headers
- Bullet points where relevant  
- Conclusion with CTA to shop at nyaree.in
- Indian fashion context throughout

Format as HTML. Keep it engaging for Indian women aged 20-40.`,
      },
    ],
  });

  const text = msg.content[0];
  return text.type === "text" ? text.text : "";
}

// ─── Admin Dashboard AI Assistant ────────────────────────────────────────────
export async function adminAssistant(
  question: string,
  context: Record<string, unknown>
): Promise<string> {
  const ai = getAI();
  const msg = await ai.messages.create({
    model: MODEL,
    max_tokens: 500,
    system: `You are a helpful business assistant for Rishika Singh, founder of Nyaree. 
You help with the admin dashboard — analyzing data, suggesting actions, explaining metrics.
Current context: ${JSON.stringify(context)}
Be concise, helpful, and speak directly to Rishika. Keep it simple — she's a fashion entrepreneur, not a tech person.`,
    messages: [{ role: "user", content: question }],
  });

  const text = msg.content[0];
  return text.type === "text" ? text.text : "I couldn't process that. Please try again.";
}
