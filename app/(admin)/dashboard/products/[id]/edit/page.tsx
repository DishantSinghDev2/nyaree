// app/(admin)/dashboard/products/[id]/edit/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db/mongoose";
import { ProductModel } from "@/lib/db/models/Product";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "Edit Product | Nyaree Admin" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDB();
  const product = await ProductModel.findById(id).lean() as any;
  if (!product) notFound();

  const serialized = {
    ...product,
    _id: product._id.toString(),
    collections: product.collections?.map((c: any) => c.toString()) ?? [],
    upsellProducts: product.upsellProducts?.map((u: any) => u.toString()) ?? [],
    crossSellProducts: product.crossSellProducts?.map((u: any) => u.toString()) ?? [],
    createdAt: product.createdAt?.toISOString(),
    updatedAt: product.updatedAt?.toISOString(),
  };

  return <ProductForm initial={serialized} />;
}
