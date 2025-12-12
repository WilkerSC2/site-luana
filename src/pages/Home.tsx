import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Portfolio from '../components/Portfolio';
import MuseuEditSection from '../components/MuseuEditSection';
import About from '../components/About';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <Portfolio />
      <MuseuEditSection />
      <About />
      <Contact />
      <Footer />
    </>
  );
}
