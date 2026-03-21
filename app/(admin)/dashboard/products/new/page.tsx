// app/(admin)/dashboard/products/new/page.tsx
import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/ProductForm";
export const metadata: Metadata = { title: "Add Product | Nyaree Admin" };
export default function NewProductPage() { return <ProductForm />; }
