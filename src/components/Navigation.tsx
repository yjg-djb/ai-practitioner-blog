import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

const SECTIONS = [
  { id: 'hero', label: '首页' },
  { id: 'about', label: '个人概述' },
  { id: 'projects', label: '工作与项目' },
  { id: 'education', label: '教育与荣誉' }
];

export default function Navigation() {
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-50% 0px -50% 0px'
      }
    );

    SECTIONS.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-6">
      {SECTIONS.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => scrollToSection(id)}
          className="group flex items-center gap-4 relative"
        >
          <div className="flex items-center justify-center w-6 h-6">
            <div 
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                activeSection === id 
                  ? 'bg-black dark:bg-white scale-150' 
                  : 'bg-black/30 dark:bg-white/30 group-hover:bg-black/70 dark:group-hover:bg-white/70 group-hover:scale-125'
              }`} 
            />
          </div>
          <span 
            className={`absolute left-8 text-sm font-mono tracking-widest whitespace-nowrap transition-all duration-300 ${
              activeSection === id 
                ? 'text-black dark:text-white opacity-100 translate-x-0' 
                : 'text-black/40 dark:text-white/40 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
            }`}
          >
            {label}
          </span>
        </button>
      ))}
    </div>
  );
}
