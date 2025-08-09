import { useState } from "react";
import ImageCarousel from "@/components/image-carousel";
import OrderForm from "@/components/order-form";
import logoPath from "@assets/point zero_1754750651077.png";

export default function Home() {
  return (
    <div className="min-h-screen bg-dark-bg text-text-primary">
      {/* Header */}
      <header className="bg-dark-surface border-b border-dark-accent">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center">
            <img src={logoPath} alt="PointZero Designs Logo" className="h-12 w-12 mr-4" />
            <div>
              <h1 className="text-2xl font-bold text-cyan-primary">PointZero Designs</h1>
              <p className="text-text-secondary text-sm">Custom 3D Printing Services</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Image Carousel */}
        <section className="mb-12">
          <div className="bg-dark-surface rounded-xl p-6 shadow-2xl">
            <h2 className="text-xl font-semibold mb-6 text-center">Our 3D Printing Capabilities</h2>
            <ImageCarousel />
          </div>
        </section>

        {/* Order Form */}
        <OrderForm />
      </main>

      {/* Footer */}
      <footer className="bg-dark-surface border-t border-dark-accent mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <img src={logoPath} alt="PointZero Designs Logo" className="h-8 w-8 mr-2" />
              <span className="text-cyan-primary font-semibold">PointZero Designs</span>
            </div>
            <p className="text-text-secondary">Professional 3D Printing Services - Est. 2025</p>
            <p className="text-text-secondary mt-2">Serving Forsgate Community, Monroe Township, NJ</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
