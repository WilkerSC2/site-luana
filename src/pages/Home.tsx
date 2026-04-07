import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Portfolio from '../components/Portfolio';
import MuseuEditSection from '../components/MuseuEditSection';
import About from '../components/About';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import { siteConfig, usePageSeo } from '../lib/seo';

export default function Home() {
  usePageSeo({
    title: 'Leque Produções',
    description:
      'Conheca o portfolio de Luana Leque com retratos, eventos, colecoes fotograficas e producao audiovisual em Sao Paulo.',
    path: '/',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      name: 'Leque Produções',
      image: siteConfig.defaultImage,
      url: `${siteConfig.siteUrl}/`,
      description:
        'Fotografia, retratos, eventos e producao audiovisual em Sao Paulo com Luana Leque.',
      telephone: '+55 11 96169-8314',
      email: 'lequeluana@gmail.com',
      areaServed: 'Sao Paulo',
      serviceType: ['Fotografia', 'Producao audiovisual', 'Retratos', 'Cobertura de eventos'],
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Sao Paulo',
        addressRegion: 'SP',
        addressCountry: 'BR',
      },
      sameAs: [
        'https://www.instagram.com/leque_producoes/',
        'https://www.tiktok.com/@luana.leque',
      ],
      founder: {
        '@type': 'Person',
        name: 'Luana Leque',
      },
    },
  });

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
