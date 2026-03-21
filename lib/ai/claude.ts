// lib/ai/claude.ts
// SHIM — re-exports everything from Gemini so all existing imports still work
// All AI is now powered by Google Gemini 2.5 Flash via @google/genai
export {
  generateProductDescription,
  generateSEO,
  suggestTags,
  chatWithCustomer,
  generateBlogOutline,
  generateBlogSEO,
  adminAssistant,
} from "./gemini";
