import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import About from "@/components/About";
import WhyDifferent from "@/components/WhyDifferent";
import IntakeForm from "@/components/IntakeForm";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function IntakePage() {
  return (
    <>
      <Nav />
      <main className="flex-1 bg-background">
        <div id="home" className="scroll-mt-24">
          <Hero />
        </div>
        <Services />
        <About />
        <WhyDifferent />
        <IntakeForm />
        <Footer />
      </main>
      <WhatsAppButton />
    </>
  );
}
