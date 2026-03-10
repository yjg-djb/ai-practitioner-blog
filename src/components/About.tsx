import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

const SKILLS = [
  {
    title: '大模型微调 (DeepSeek, Qwen, RLHF, DPO)',
    description: '具备从数据清洗、预训练到 SFT、RLHF、PPO 的全链路微调经验。曾在医疗领域对 DeepSeek-r1-7B 进行增量预训练与 SFT，显著提升诊疗建议准确率。'
  },
  {
    title: '智能体架构 (LangGraph, MCP, Multi-Agent)',
    description: '熟练使用 LangGraph、Dify 等平台进行智能体编排。拥有构建复杂 Multi-Agent 系统的经验，包括基于自然语言操控移动端和桌面端的自主智能体。'
  },
  {
    title: '推理与部署 (vLLM, SGLang, Docker/K8s)',
    description: '熟悉主流大模型的推理加速与部署方案，掌握 vLLM、SGLang 等框架，能够结合 Docker 和 K8s 实现模型的高效、稳定部署与动态扩缩容。'
  },
  {
    title: '全栈开发 (React, Electron, FastAPI)',
    description: '具备扎实的前端与桌面端开发能力，熟练使用 React 18、Tailwind CSS 构建现代 Web 应用，并能使用 Electron 开发跨平台桌面软件，结合 FastAPI 构建高性能后端服务。'
  }
];

export default function About() {
  const [expandedSkill, setExpandedSkill] = useState<number | null>(null);

  return (
    <section id="about" className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24">
        <div className="md:col-span-4">
          <motion.h2 
            className="text-xs font-mono tracking-[0.2em] text-black/50 dark:text-white/50 uppercase sticky top-32"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            01 / 个人概述
          </motion.h2>
        </div>
        
        <div className="md:col-span-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="prose prose-invert prose-lg max-w-none"
          >
            <p className="text-2xl md:text-4xl font-serif leading-snug text-black/90 dark:text-white/90 mb-12">
              逻辑清晰，善于钻研。我致力于将前沿的大模型技术转化为实际的生产力，在复杂业务场景中拥有丰富的 AI 赋能落地经验。
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-black/60 dark:text-white/60 font-light text-base md:text-lg">
              <div>
                <p className="mb-6">
                  熟悉大模型全链路微调（数据清洗、预训练、SFT、RLHF、PPO），熟练掌握 LangGraph, MCP 等智能体编排框架，并在 RAG 优化、推理部署（vLLM）方面有深入实践。
                </p>
                <p>
                  同时具备扎实的前端与桌面端开发经验（React, Electron），能够独立完成从模型训练、后端服务到全栈应用落地的完整闭环。
                </p>
              </div>
              
              <div>
                <h3 className="text-black/90 dark:text-white/90 font-medium mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                  核心技术栈
                  <span className="text-[10px] bg-black/5 dark:bg-white/10 text-black/60 dark:text-white/60 px-2 py-0.5 rounded-full normal-case tracking-normal">点击查看详情</span>
                </h3>
                <ul className="space-y-6">
                  {SKILLS.map((skill, idx) => (
                    <li key={idx} className="flex flex-col">
                      <button 
                        onClick={() => setExpandedSkill(expandedSkill === idx ? null : idx)}
                        className="flex items-center justify-between w-full text-left group"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-1.5 h-1.5 rounded-full transition-colors ${expandedSkill === idx ? 'bg-black dark:bg-white' : 'bg-black/30 dark:bg-white/50 group-hover:bg-black/60 dark:group-hover:bg-white/80'}`} />
                          <span className={`transition-colors ${expandedSkill === idx ? 'text-black dark:text-white' : 'text-black/70 dark:text-white/80 group-hover:text-black dark:group-hover:text-white'}`}>
                            {skill.title}
                          </span>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-black/40 dark:text-white/50 transition-transform ${expandedSkill === idx ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {expandedSkill === idx && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <p className="pt-4 pl-5 text-base text-black/60 dark:text-white/50 leading-relaxed border-l border-black/10 dark:border-white/10 ml-[3px] mt-2 mb-2">
                              {skill.description}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
