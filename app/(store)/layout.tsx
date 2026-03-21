// app/(store)/layout.tsx
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { CartProvider } from "@/components/store/CartProvider";
import { MobileNav } from "@/components/store/MobileNav";
import { AnnouncementBar } from "@/components/store/AnnouncementBar";
import { ChatWidget } from "@/components/store/ChatWidget";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <AnnouncementBar />
      <Header />
      <main style={{ minHeight: "70vh", position: "relative", zIndex: 1 }}>
        {children}
      </main>
      <Footer />
      <MobileNav />
      <ChatWidget />
    </CartProvider>
  );
}
