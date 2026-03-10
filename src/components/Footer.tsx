import { motion } from 'motion/react';

export default function Footer() {
  return (
    <footer className="py-12 px-6 md:px-12 max-w-7xl mx-auto border-t border-black/10 dark:border-white/10 mt-20">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-black/40 dark:text-white/40 text-sm font-light"
        >
          © {new Date().getFullYear()} 杨金果 (Yang Jinguo). 保留所有权利。
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex items-center gap-8 text-sm font-medium text-black/60 dark:text-white/60"
        >
          <a href="https://github.com/yjg-djb" target="_blank" rel="noreferrer" className="hover:text-black dark:hover:text-white transition-colors interactive">GitHub</a>
          <a href="mailto:hsjdu9522@gmail.com" className="hover:text-black dark:hover:text-white transition-colors interactive">Email</a>
          <span className="text-black/40 dark:text-white/40">15523408645</span>
        </motion.div>
      </div>
    </footer>
  );
}
