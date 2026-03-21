// app/(admin)/dashboard/analytics/page.tsx
import type { Metadata } from "next";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
export const metadata: Metadata = { title: "Analytics | Nyaree Admin" };
export default function AnalyticsPage() { return <AnalyticsDashboard />; }
