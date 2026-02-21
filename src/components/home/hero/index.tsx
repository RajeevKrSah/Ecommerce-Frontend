import ProductCard from "@/components/common/ProductCard";
import Image from "next/image";

export default function HeroBanner() {
  return (
    <section className="relative h-[75vh] min-h-[520px] w-full bg-white">

      {/* Background Image */}
      <Image
        src="/images/hero_banner.jpg" // replace with your image
        alt="Fashion Banner"
        fill
        priority
        className="object-cover"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto h-full px-6 flex items-center">
        <div className="max-w-xl text-white">

          {/* Offer Badge */}
          <span className="inline-block mb-5 bg-yellow-500 text-black px-5 py-2 rounded-full text-sm font-semibold">
            🔥 Up to 30% Off
          </span>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Elevate Your<br />Everyday Style
          </h1>

          {/* Description */}
          <p className="mt-6 text-gray-200">
            Discover premium fashion made for comfort, confidence,
            and modern living.
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-wrap gap-4">
            <button className="bg-yellow-500 text-black px-8 py-4 rounded-full font-medium hover:bg-yellow-400 transition">
              Shop Now
            </button>
            <button className="border border-white/60 px-8 py-4 rounded-full font-medium hover:bg-white hover:text-black transition">
              View Collection
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
