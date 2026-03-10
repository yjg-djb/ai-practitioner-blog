import { motion, AnimatePresence } from 'motion/react';
import { Award, X, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

const education = [
  {
    title: "重庆对外经贸学院 - 物联网工程 (本科)",
    date: "2023.09 - 2025.06",
    highlight: "专业前 10% | 国家奖学金",
    desc: "全国大学生数学建模竞赛国家二等奖、蓝桥杯省级二等奖、“互联网+”大学生创新创业大赛市级银奖",
    details: {
      ranking: "综合排名：9/120（专业前 10%）",
      roles: "班长、数学建模组学生组组长",
      awards: [
        "一次 2025 年优秀大学毕业生",
        "一次国家奖学金",
        "2024 年全国大学生数学建模竞赛国家二等奖",
        "2024 年蓝桥杯程序设计大赛省级二等奖",
        "2024 年“互联网+”大学生创新创业大赛市级银奖",
        "作孚奖学金",
        "重庆市创业创新赛事市级奖项若干（2024-2025）"
      ]
    }
  },
  {
    title: "重庆城市职业学院 - 大数据技术与应用 (专科)",
    date: "2020.09 - 2023.06",
    highlight: "专业前 1% | 两次国家奖学金",
    desc: "科大讯飞联培。全国大学生数学建模竞赛省级一等奖、高教社杯数学建模竞赛省级一等奖",
    details: {
      ranking: "综合排名: 3/259(专业前 1%)",
      roles: "学习委员",
      awards: [
        "一次 2023 年优秀大学毕业生",
        "两次国家奖学金",
        "两次校一等奖学金",
        "2022、2023 年全国大学生数学建模竞赛省级一等奖",
        "2022 高教社杯数学建模竞赛省级一等奖"
      ]
    }
  }
];

export default function Education() {
  const [selectedEdu, setSelectedEdu] = useState<any | null>(null);

  useEffect(() => {
    if (selectedEdu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedEdu]);

  return (
    <section id="education" className="py-32 px-6 md:px-12 max-w-7xl mx-auto relative">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24">
        <div className="md:col-span-4">
          <motion.h2 
            className="text-xs font-mono tracking-[0.2em] text-black/50 dark:text-white/50 uppercase sticky top-32"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            03 / 教育与荣誉
          </motion.h2>
        </div>
        
        <div className="md:col-span-8">
          <div className="flex flex-col">
            {education.map((item, index) => (
              <motion.div
                key={index}
                onClick={() => setSelectedEdu(item)}
                className="group py-8 border-b border-black/10 dark:border-white/10 flex flex-col gap-4 interactive cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-serif text-black/80 dark:text-white/80 group-hover:text-black dark:group-hover:text-white transition-colors mb-2 group-hover:translate-x-2 duration-300">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-4 text-xs font-mono text-black/50 dark:text-white/40 mb-4">
                      <span>{item.date}</span>
                      <span className="w-1 h-1 rounded-full bg-black/20 dark:bg-white/20" />
                      <span className="text-indigo-600 dark:text-indigo-300/80">{item.highlight}</span>
                    </div>
                    <p className="text-black/60 dark:text-white/50 font-light text-sm leading-relaxed flex items-start gap-2">
                      <Award className="w-4 h-4 mt-0.5 shrink-0 opacity-50" />
                      {item.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedEdu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedEdu(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 right-0 p-6 flex justify-end z-10 bg-gradient-to-b from-white dark:from-[#0a0a0a] to-transparent pointer-events-none">
                <button 
                  onClick={() => setSelectedEdu(null)}
                  className="p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-black dark:text-white transition-colors pointer-events-auto interactive"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="px-8 pb-12 sm:px-12 sm:pb-16 -mt-8">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-sm font-mono text-black/50 dark:text-white/40">{selectedEdu.date}</span>
                  <span className="w-1 h-1 rounded-full bg-black/20 dark:bg-white/20" />
                  <span className="text-sm font-medium px-3 py-1 rounded-full bg-indigo-50 dark:bg-white/5 text-indigo-600 dark:text-indigo-300/80 border border-indigo-100 dark:border-white/10">
                    {selectedEdu.highlight}
                  </span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-serif text-black/90 dark:text-white mb-8 leading-tight">
                  {selectedEdu.title}
                </h2>

                <div className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                      <h3 className="text-xs font-mono tracking-widest text-black/50 dark:text-white/40 uppercase mb-2">综合排名</h3>
                      <p className="text-black/90 dark:text-white/90 font-medium">{selectedEdu.details.ranking}</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                      <h3 className="text-xs font-mono tracking-widest text-black/50 dark:text-white/40 uppercase mb-2">担任职务</h3>
                      <p className="text-black/90 dark:text-white/90 font-medium">{selectedEdu.details.roles}</p>
                    </div>
                  </div>

                  <section>
                    <h3 className="text-sm font-mono tracking-widest text-black/50 dark:text-white/40 uppercase mb-4 flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      荣誉奖励
                    </h3>
                    <ul className="space-y-3">
                      {selectedEdu.details.awards.map((award: string, i: number) => (
                        <li key={i} className="flex items-start gap-4 text-black/80 dark:text-white/80 leading-relaxed font-light">
                          <ChevronRight className="w-5 h-5 text-black/30 dark:text-white/30 shrink-0 mt-0.5" />
                          <span>{award}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
