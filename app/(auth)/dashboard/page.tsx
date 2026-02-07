"use client";

import Header from "./_components/Header";
import HeroSection from "./_components/HeroSection";
import CategorySection from "./_components/CategorySection";
import ProductSection from "./_components/ProductSection";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1">
        <HeroSection />
        <CategorySection />
        <ProductSection />
      </main>

      {/* Simple Footer */}
      <footer className="bg-gray-100 py-8 text-center text-gray-500 text-sm">
        <p>© 2026 Mero Baazar. All rights reserved.</p>
      </footer>
    </div>
  );
}