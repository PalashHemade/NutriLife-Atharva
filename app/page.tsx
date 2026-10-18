import Link from "next/link";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Services from "@/components/Services";
import Nutritionists from "@/components/Nutritionists";
import Footer from "@/components/Footer";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", background: "#fff" }}>
      <Navbar />
      <Hero />
      <HowItWorks />
      <Services />
      <Nutritionists />

      {/* ─── Closing CTA ─── */}
      <section style={{ padding: "6rem 1.5rem", background: "#fff" }}>
        <div style={{ maxWidth: "64rem", margin: "0 auto" }}>
          <div style={{ background: "linear-gradient(135deg, #00C896, #0EA5A4)", borderRadius: "2rem", padding: "4rem 2.5rem", textAlign: "center", boxShadow: "0 30px 60px rgba(0,200,150,0.25)" }}>
            <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", marginBottom: "1rem" }}>
              Ready to eat with precision?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "1.0625rem", lineHeight: 1.6, maxWidth: "32rem", margin: "0 auto 2rem" }}>
              Build your health profile and get your first AI-generated nutrition plan in minutes — free to start.
            </p>
            <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "1rem 2.25rem", background: "#fff", color: "#00897B", fontWeight: 700, fontSize: "1rem", borderRadius: "1rem", textDecoration: "none", boxShadow: "0 10px 24px rgba(0,0,0,0.15)" }}>
              Create Your Free Account <ArrowRight style={{ width: "1.1rem", height: "1.1rem" }} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
