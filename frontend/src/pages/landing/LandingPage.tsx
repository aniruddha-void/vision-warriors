import React from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { HeroSection } from '../../components/landing/HeroSection';
import { SolutionsSection } from '../../components/landing/SolutionsSection';
import { FeaturesBento } from '../../components/landing/FeaturesBento';
import { HowItWorksSection } from '../../components/landing/HowItWorksSection';
import { LiveInteractiveDemo } from '../../components/landing/LiveInteractiveDemo';
import { PricingSection } from '../../components/landing/PricingSection';
import { FaqSection } from '../../components/landing/FaqSection';
import { FinalCta } from '../../components/landing/FinalCta';
import { Footer } from '../../components/layout/Footer';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F6F6F7] flex flex-col justify-between">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <SolutionsSection />
        <FeaturesBento />
        <HowItWorksSection />
        <LiveInteractiveDemo />
        <PricingSection />
        <FaqSection />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
};
