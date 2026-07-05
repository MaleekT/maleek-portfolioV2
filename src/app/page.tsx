"use client";

import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/layout/SmoothScroll";
import Hero from "@/components/sections/Hero";
import SelectedWork from "@/components/sections/SelectedWork";
import Skills from "@/components/sections/Skills";
import Process from "@/components/sections/Process";
import HowIThink from "@/components/sections/HowIThink";
import Contact from "@/components/sections/Contact";
import Chatbot from "@/components/ui/Chatbot";
import MotionLayer from "@/components/ui/MotionLayer";
import IntroGate from "@/components/ui/IntroGate";

export default function Home() {
  return (
    <>
      <SmoothScroll>
        <Navigation />

        <Hero />

        <SelectedWork />

        <Skills />

        <Process />

        <HowIThink />

        <Contact />

        <Footer />
      </SmoothScroll>

      <Chatbot />
      <MotionLayer />
      <IntroGate />
    </>
  );
}
