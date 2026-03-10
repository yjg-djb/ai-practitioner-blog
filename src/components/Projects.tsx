import { motion, useMotionTemplate, useMotionValue, AnimatePresence } from 'motion/react';
import { ArrowUpRight, X, ChevronRight } from 'lucide-react';
import React, { MouseEvent, useState, useEffect } from 'react';

const projects = [
  {
    title: "中科聚信科技 - 大模型研发",
    category: "工作经历",
    description: "结合 GraphRAG 提升制度查询准确率 15%；使用 LangGraph 与 MCP 构建智能对话系统，人力成本降低 60%；微调 Qwen3-8b 提升营销回答准确率 20%。",
    year: "2025.03 - 至今",
    details: {
      background: "落地 AI 应用，针对银行 1.2 万员工做银行内部提效，主要方向是新员工培训，流程审批、报表生成，报告生成，制度业务类资料查询。",
      content: [
        "处理非结构化复杂数据，引入视觉版式解决 PDF 双栏排版问题达到 90%，对表格进行重构，降低向量模型对行列交叉关系的感知脆弱问题提升财报类咨询准确率 25%，结合 GraphRAG 提升对制度条理类知识提高 15%准确率。",
        "融合传统 Pipeline 架构的稳定与 LLM 驱动，使用 LangGraph, Flow 定义和对话栈等结合 MCP 工具对接数据库等构建出可供业务人员自助创建自动化任务的智能对话系统，人力成本降低 60%。",
        "结合 TTS, QA 对，上下文工程等构建场景陪练，生成培训课程，知识点，问题等。",
        "收集业务 case 针对制度解释错误，业务营销技巧过去总结等问题进行 Qwen3-8B 模型微调对齐提升制度，营销技巧回答准确率百分之 20%。"
      ],
      techStack: ["Python", "LangGraph", "MCP", "GraphRAG", "Qwen3-8B", "TTS"]
    }
  },
  {
    title: "科大讯飞 - 大模型研发",
    category: "实习经历",
    description: "基于 DeepSeek-r1-7B 进行医疗领域增量预训练与 SFT，诊疗建议准确率提升至 88%。实现 PPO 强化学习与对齐策略，胜率提高 62%。",
    year: "2024.10 - 2025.02",
    details: {
      background: "技术调研，清洗数据，数据抽样，训练垂直领域大模型，支持诊断建议、病历生成与患者问答。",
      content: [
        "增量预训练：基于 DeepSeek-r1-7B，在 20G 中文医学文献上继续训练，使用 Deepspeed ZeRO-3 + FlashAttention，训练效率提升 40%。",
        "有监督微调 (SFT)：构建 20 万条医患对话数据集，设计多任务 Prompt 模板（分类/生成/摘要），微调后诊疗建议准确率提升至 88%。",
        "RLHF & DPO 优化：奖励模型基于 Pairwise Ranking Loss 训练，结合安全性和有用性。",
        "接入 RAG：减少模型幻觉和知识更新滞后问题，目前做到几乎无幻觉。",
        "实现 PPO 强化学习与 PPO 对齐策略：人工评估胜率较基线模型提高 62%。"
      ],
      techStack: ["DeepSeek-r1-7B", "Deepspeed ZeRO-3", "FlashAttention", "SFT", "RLHF", "DPO", "RAG", "PPO"]
    }
  },
  {
    title: "移动端自主智能体",
    category: "项目",
    description: "基于 Open-AutoGLM 架构，引入 PagedAttention 解决显存碎片，设计动态 Batching 实现吞吐量 3 倍提升。构建双重校验记忆机制，Token 消耗降低 60%。",
    year: "2024",
    details: {
      background: "基于 Open-AutoGLM 架构，构建通过自然语言指令自主操控 Android 手机的智能体系统，完成推理引擎重构、记忆系统设计等核心模块开发。",
      content: [
        "推理引擎重构: 将 HuggingFace 管道迁移至 vLLM 异步架构，引入 PagedAttention 解决显存碎片，端到端延迟从 8s 降至 2.5s/step。",
        "吞吐优化: 设计动态 Batching 与请求批处理队列，实现单卡并发吞吐量 3 倍提升。",
        "记忆增强架构 (MobileRAG): 设计双重校验机制，记忆命中时直接复用历史动作序列，Token 消耗降低 60%。",
        "轨迹记忆系统: 定义 Trajectory Schema，基于 ChromaDB 构建向量索引，支持相似任务检索。",
        "系统稳定性设计: 基于感知哈希实现死循环检测，通过 ROI 汉明距离识别界面停滞，实现分级自愈机制，长程任务完成率提升 40%。"
      ],
      techStack: ["Python", "PyTorch", "GLM-4V-9B", "vLLM", "ADB", "LangChain", "ChromaDB", "Docker"]
    }
  },
  {
    title: "桌面智能体系统深度研究",
    category: "项目",
    description: "基于 openclaw，深入研究 Electron 严格进程隔离与安全沙箱机制。实现基于 SQLite 的记忆去重管理，支持多平台 IM 网关集成与自然语言定时任务。",
    year: "2024",
    details: {
      background: "解决 openclaw 权限不可控问题，解决布在服务器不能访问本地文件的问题，增加必要 skill，支持自我进化等技能，支持多平台（飞书）接入。",
      content: [
        "架构深度分析: 研究龙虾（openclaw）的 Electron 严格进程隔离架构，分析 40+ IPC 通道设计、Context Isolation 安全策略及主进程/渲染进程通信机制。",
        "安全机制验证: 深入沙箱执行系统，基于 QEMU+Alpine Linux 实现虚拟机隔离，验证环境变量限制、工作区边界、权限门控等 5 层安全防护体系。",
        "技能系统研究: 分析 16+内置技能（文档处理、Web 自动化、视频生成等）的热插拔架构，研究基于 XML 的自动路由和依赖管理策略。",
        "数据与记忆系统: 研究 SQLite 7 表存储架构，实现基于 SHA1 指纹的记忆去重和三级置信度管理，支持 12 条记忆/会话的智能注入。",
        "多平台集成: 分析钉钉、飞书等 6 种 IM 网关集成，验证手机远程触发→Cowork 执行的完整控制链路，支持自然语言定时任务创建。"
      ],
      techStack: ["TypeScript", "React 18", "Electron 40", "Claude Agent SDK", "SQLite", "QEMU"]
    }
  }
];

function ProjectCard({ project, index, onClick }: { project: any, index: number, onClick: () => void, key?: React.Key }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      className="group relative p-8 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] overflow-hidden interactive cursor-pointer h-full flex flex-col"
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              var(--hover-glow),
              transparent 80%
            )
          `,
        }}
      />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-12">
          <span className="text-xs font-mono text-black/40 dark:text-white/40">{project.year}</span>
          <span className="text-xs font-medium px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/70 border border-black/10 dark:border-white/10">
            {project.category}
          </span>
        </div>
        
        <div className="mt-auto">
          <h3 className="text-2xl font-serif text-black/90 dark:text-white/90 mb-3 group-hover:text-black dark:group-hover:text-white transition-colors flex items-center gap-3">
            {project.title}
            <ArrowUpRight className="w-5 h-5 opacity-0 -translate-x-2 translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300" />
          </h3>
          <p className="text-black/60 dark:text-white/50 font-light leading-relaxed">
            {project.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedProject]);

  return (
    <section id="projects" className="py-32 px-6 md:px-12 max-w-7xl mx-auto relative">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24">
        <div className="md:col-span-4">
          <motion.h2 
            className="text-xs font-mono tracking-[0.2em] text-black/50 dark:text-white/50 uppercase sticky top-32"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            02 / 工作与项目
          </motion.h2>
        </div>
        
        <div className="md:col-span-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {projects.map((project, index) => (
              <ProjectCard 
                key={index} 
                project={project} 
                index={index} 
                onClick={() => setSelectedProject(project)} 
              />
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 right-0 p-6 flex justify-end z-10 bg-gradient-to-b from-white dark:from-[#0a0a0a] to-transparent pointer-events-none">
                <button 
                  onClick={() => setSelectedProject(null)}
                  className="p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-black dark:text-white transition-colors pointer-events-auto interactive"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="px-8 pb-12 sm:px-12 sm:pb-16 -mt-8">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-sm font-mono text-black/50 dark:text-white/40">{selectedProject.year}</span>
                  <span className="w-1 h-1 rounded-full bg-black/20 dark:bg-white/20" />
                  <span className="text-sm font-medium px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/70 border border-black/10 dark:border-white/10">
                    {selectedProject.category}
                  </span>
                </div>
                
                <h2 className="text-3xl md:text-5xl font-serif text-black/90 dark:text-white mb-8 leading-tight">
                  {selectedProject.title}
                </h2>

                <div className="space-y-10">
                  {selectedProject.details.background && (
                    <section>
                      <h3 className="text-sm font-mono tracking-widest text-black/50 dark:text-white/40 uppercase mb-4">背景与目标</h3>
                      <p className="text-black/80 dark:text-white/80 leading-relaxed text-lg font-light">
                        {selectedProject.details.background}
                      </p>
                    </section>
                  )}

                  {selectedProject.details.content && (
                    <section>
                      <h3 className="text-sm font-mono tracking-widest text-black/50 dark:text-white/40 uppercase mb-4">核心工作内容</h3>
                      <ul className="space-y-4">
                        {selectedProject.details.content.map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-4 text-black/80 dark:text-white/80 leading-relaxed font-light">
                            <ChevronRight className="w-5 h-5 text-black/30 dark:text-white/30 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {selectedProject.details.techStack && (
                    <section>
                      <h3 className="text-sm font-mono tracking-widest text-black/50 dark:text-white/40 uppercase mb-4">技术栈</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.details.techStack.map((tech: string, i: number) => (
                          <span key={i} className="px-4 py-2 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 text-sm">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
