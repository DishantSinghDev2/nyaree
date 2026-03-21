// app/(admin)/dashboard/settings/page.tsx
import type { Metadata } from "next";
import { SettingsForm } from "@/components/admin/SettingsForm";
export const metadata: Metadata = { title: "Settings | Nyaree Admin" };
export default function SettingsPage() { return <SettingsForm />; }
