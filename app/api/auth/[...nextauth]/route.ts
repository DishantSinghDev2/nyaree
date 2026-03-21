// app/api/auth/[...nextauth]/route.ts
// NextAuth v5 beta — single route handler exports GET and POST
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;

