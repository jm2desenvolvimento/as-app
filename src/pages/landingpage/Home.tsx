import React from 'react';
import Header from '../../components/site/sections/Header';
import HeroSection from '../../components/site/sections/HeroSection';
import BenefitsSection from '../../components/site/sections/BenefitsSection';
import HowItWorksSection from '../../components/site/sections/HowItWorksSection';
import TestimonialsSection from '../../components/site/sections/TestimonialsSection';
import Footer from '../../components/site/sections/Footer';

const Home: React.FC = () => {
  return (
    <div>
      <Header />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <BenefitsSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
