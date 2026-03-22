// lib/ai/claude.ts
// SHIM — all AI powered by Google Gemini via @google/genai
export {
  generateProductDescription,
  generateSEO,
  suggestTags,
  chatWithCustomer,
  generateBlogOutline,
  generateBlogSEO,
  adminAssistant,
  generateProductImage,
  analyzeProductImage,
  estimateProductPricing,
} from "./gemini";
export type { ProductAnalysis } from "./gemini";
