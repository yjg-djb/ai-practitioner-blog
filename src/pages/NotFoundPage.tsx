import { ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="px-6 pb-20 pt-16 md:px-12 md:pb-28">
      <div className="mx-auto max-w-3xl rounded-[36px] border border-black/10 bg-white/72 p-8 text-center dark:border-white/10 dark:bg-white/[0.05] md:p-12">
        <div className="text-xs uppercase tracking-[0.24em] text-[#8a5d1f] dark:text-[#d9ba78]">
          404
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-black dark:text-white">
          你访问的页面不存在
        </h1>
        <p className="mt-4 text-base leading-relaxed text-black/62 dark:text-white/62">
          可以返回首页继续查看精选案例、实践笔记和联系方式。
        </p>
        <a
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-medium text-white dark:bg-white dark:text-black"
        >
          <ArrowLeft className="h-4 w-4" />
          返回首页
        </a>
      </div>
    </div>
  );
}
