// app/(store)/shop/page.tsx
import { redirect } from "next/navigation";
// Redirect /shop to /shop/all which handles both all products and category filtering
export default function ShopPage() {
  redirect("/shop/all");
}
