'use client';

import Hero from "@/components/home/hero";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer/page";

export default function Home() {
    return (
        <div className="bg-white">
            <Navbar/>
            <Hero />
            <Footer/>
        </div>
    );
}