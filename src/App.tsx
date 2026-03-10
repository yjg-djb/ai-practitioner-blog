/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, useScroll, useSpring } from 'motion/react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Education from './components/Education';
import Footer from './components/Footer';
import ChatAssistant from './components/ChatAssistant';
import ThemeToggle from './components/ThemeToggle';

export default function App() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="bg-[#f5f5f5] dark:bg-[#050505] min-h-screen text-[#1a1a1a] dark:text-white selection:bg-black/10 selection:text-black dark:selection:bg-white/20 dark:selection:text-white transition-colors duration-300">
      <ThemeToggle />
      <ChatAssistant />
      <Navigation />

      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-black/20 dark:bg-white/20 origin-left z-50"
        style={{ scaleX }}
      />

      {/* Noise overlay for texture */}
      <div 
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-50"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      />

      <main className="relative z-10">
        <Hero />
        <About />
        <Projects />
        <Education />
      </main>

      <Footer />
    </div>
  );
}
