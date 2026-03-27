import Link from 'next/link';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';
import RotatingModel from '@/components/RotatingModel';

const bodyFont = IBM_Plex_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const monoFont = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: '云经AI - 首页',
  description: 'AI API Gateway 首页',
};

const stream = [
  { method: 'GET', path: '/v1/models', status: '200', tag: 'Gateway' },
  { method: 'POST', path: '/v1/messages', status: '200', tag: 'Claude' },
  { method: 'POST', path: '/v1/responses', status: '200', tag: 'Codex' },
  { method: 'POST', path: '/v1beta/models', status: '200', tag: 'Gemini' },
];

const stats = [
  { value: '4+', label: '支持模型' },
  { value: '99.9%', label: '服务可用率' },
  { value: '50ms', label: '平均延迟' },
];

const models = [
  { name: 'Claude', color: 'from-orange-500 to-orange-300' },
  { name: 'GPT', color: 'from-emerald-500 to-lime-400' },
  { name: 'Gemini', color: 'from-blue-500 to-cyan-300' },
  { name: 'Codex', color: 'from-violet-500 to-purple-300' },
  { name: 'Sora', color: 'from-pink-500 to-rose-300' },
  { name: '更多', color: 'from-slate-500 to-slate-300' },
];

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/8 px-3 py-1 text-xs font-semibold text-emerald-200">
      {children}
    </span>
  );
}

export default function HomePage() {
  return (
    <main className={`${bodyFont.className} home-page relative min-h-screen overflow-hidden bg-[#030305] text-white`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(96,165,250,0.08),transparent_18%),radial-gradient(circle_at_82%_12%,rgba(245,158,11,0.07),transparent_18%),radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.06),transparent_26%),linear-gradient(180deg,#050507_0%,#07070b_44%,#020203_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0,transparent_70%,rgba(0,0,0,0.66)_100%)]" />

      <header className="relative z-10">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/home" className="inline-flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-500/20 bg-[#0a0b12] shadow-[0_0_14px_rgba(96,165,250,0.08)]">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[linear-gradient(135deg,rgba(96,165,250,0.18),rgba(245,158,11,0.12))] text-[10px] font-semibold text-slate-100">
                AI
              </span>
            </span>
            <span className="text-[16px] font-semibold tracking-tight text-white">云经AI</span>
          </Link>

          <nav className="flex items-center gap-3 sm:gap-5">
            <a
              href="#docs"
              className="rounded-full px-3 py-2 text-sm text-slate-400 transition hover:text-white sm:px-4"
            >
              文档
            </a>
            <a
              href="https://pincc.wufly.top/login"
              className="inline-flex items-center rounded-full bg-[linear-gradient(135deg,#1eeed2_0%,#15c9b8_100%)] px-5 py-3 text-sm font-semibold text-black shadow-[0_12px_28px_rgba(18,222,203,0.18)] transition hover:translate-y-[-1px]"
            >
              控制台
            </a>
          </nav>
        </div>
      </header>

      <section className="relative z-10 mx-auto flex max-w-[1400px] flex-col items-center px-4 pb-16 pt-16 text-center sm:px-6 lg:px-8 lg:pb-20 lg:pt-20">
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-sky-400/12 bg-sky-400/5 px-4 py-2 text-[12px] text-sky-100 shadow-[0_0_0_1px_rgba(96,165,250,0.02)_inset]">
          <span className="h-3 w-3 rounded-full bg-sky-300 shadow-[0_0_10px_rgba(96,165,250,0.55)]" />
          <span>一个密钥，畅用多个 AI 模型</span>
        </div>

        <h1 className="mt-2 text-[clamp(2.9rem,7.3vw,5.3rem)] font-black leading-[0.94] tracking-[-0.065em] text-transparent [text-shadow:0_0_22px_rgba(96,165,250,0.08)] bg-[linear-gradient(180deg,#c7d2fe_0%,#7dd3fc_40%,#f59e0b_100%)] bg-clip-text">
          云经AI
        </h1>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-[clamp(0.95rem,1.7vw,1.25rem)] font-semibold">
          <span className="text-slate-500">正在路由至</span>
          <RotatingModel />
        </div>

        <p className="mt-5 text-sm text-slate-400 sm:text-base">让 AI 接入更简单，使用更划算</p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            href="https://pincc.wufly.top/login"
            className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#1eeed2_0%,#1cdfa8_100%)] px-6 py-3 text-sm font-bold text-black shadow-[0_18px_42px_rgba(18,222,203,0.3)] transition hover:translate-y-[-1px]"
          >
            进入控制台
            <span className="ml-3">→</span>
          </a>
          <a
            href="#docs"
            className="inline-flex items-center justify-center rounded-full border border-slate-500/20 bg-slate-500/6 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-300/30 hover:bg-slate-300/10"
          >
            查看文档
          </a>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="marquee overflow-hidden rounded-[24px] border border-white/5 bg-white/[0.012] px-4 py-4">
          <div className="marquee-track flex min-w-max items-center gap-5 whitespace-nowrap">
            {[...stream, ...stream].map((item, index) => (
              <div
                key={`${item.path}-${index}`}
                className="inline-flex items-center gap-3 rounded-2xl border border-white/7 bg-[#080a12] px-4 py-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.012)]"
              >
                <span className="font-mono text-[12px] font-semibold text-violet-300">{item.method}</span>
                <span className="font-mono text-[12px] text-slate-400">{item.path}</span>
                <span className="font-mono text-[12px] font-semibold text-emerald-400">{item.status}</span>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-[10px] font-semibold text-emerald-300">
                  {item.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-5 md:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
            className="rounded-[28px] border border-slate-500/12 bg-[#08090f]/78 py-12 text-center shadow-[0_0_0_1px_rgba(148,163,184,0.02)_inset]"
          >
              <div className="text-4xl font-black tracking-tight text-white">{stat.value}</div>
              <div className="mt-3 text-xs text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-[1400px] px-4 pb-16 text-center sm:px-6 lg:px-8 lg:pb-24">
        <h2 className="text-xl font-black tracking-[-0.04em] text-white sm:text-2xl">已支持的 AI 模型</h2>
        <p className="mt-3 text-xs text-slate-500 sm:text-sm">一个 API，多种选择</p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {models.map((model, index) => (
            <div
              key={model.name}
              className={[
                'flex items-center justify-between rounded-[20px] border border-slate-500/10 bg-[#08090f] px-4 py-5 shadow-[0_0_0_1px_rgba(255,255,255,0.012)_inset]',
                index === models.length - 1 ? 'text-slate-400' : '',
              ].join(' ')}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-[14px] bg-gradient-to-br ${model.color} text-sm font-black text-white shadow-[0_10px_24px_rgba(0,0,0,0.22)]`}
                >
                  {model.name.slice(0, 1)}
                </span>
                <span className="text-base font-semibold text-slate-300">{model.name}</span>
              </div>
              {index === models.length - 1 ? (
                <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-xs font-medium text-slate-500">
                  即将推出
                </span>
              ) : (
                <Badge>已支持</Badge>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-[1400px] px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <div className="rounded-[34px] border border-slate-500/10 bg-[#07080d]/82 p-4 sm:p-5 lg:p-6">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="rounded-[26px] border border-slate-500/12 bg-[#05060a] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.012)_inset]">
              <div className="flex items-center gap-2 border-b border-white/8 pb-3">
                <span className="h-4 w-4 rounded-full bg-red-500" />
                <span className="h-4 w-4 rounded-full bg-yellow-400" />
                <span className="h-4 w-4 rounded-full bg-emerald-400" />
                <span className="ml-2 text-sm text-slate-500">terminal</span>
              </div>
              <div className={`${monoFont.className} mt-5 space-y-2.5 text-[13px] leading-6 sm:text-[14px]`}>
                <div className="text-cyan-300">$ curl -X POST https://aixj.vip/v1/messages</div>
                <div className="text-cyan-300">$ -H "Authorization: Bearer sk-..."</div>
                <div className="text-slate-500"># Routing to Claude upstream...</div>
                <div className="rounded-lg bg-emerald-400/10 px-3 py-2 text-emerald-300">
                  200 OK {'{ "content": "Hello from Claude!" }'}
                </div>
                <div className="text-cyan-300">$ curl -X POST https://aixj.vip/v1/responses</div>
                <div className="text-slate-500"># Routing to OpenAI upstream...</div>
                <div className="rounded-lg bg-emerald-400/10 px-3 py-2 text-emerald-300">
                  200 OK {'{ "output": "Hello from GPT!" }'}
                </div>
                <div className="text-cyan-300">$</div>
              </div>
            </div>

            <div className="px-2 text-left">
              <h3 className="text-2xl font-black tracking-[-0.05em] text-white sm:text-3xl">准备好开始了吗?</h3>
              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
                注册即可获得免费试用额度，体验一站式 AI 服务。
              </p>
              <div className="mt-8">
                <a
                  href="https://pincc.wufly.top/login"
                  className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#1eeed2_0%,#1cdfa8_100%)] px-6 py-3 text-sm font-bold text-black shadow-[0_14px_32px_rgba(18,222,203,0.2)] transition hover:translate-y-[-1px]"
                >
                  进入控制台
                  <span className="ml-3">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="docs" className="relative z-10 mx-auto max-w-[1400px] px-4 pb-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 border-t border-white/8 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-slate-400">云经AI · AI API Gateway</span>
          <span>统一接入 · 统一路由 · 统一计费</span>
        </div>
      </section>

      <style>{`
        .home-page::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(circle at 14% 20%, rgba(96, 165, 250, 0.08), transparent 2px),
            radial-gradient(circle at 52% 32%, rgba(245, 158, 11, 0.08), transparent 2px),
            radial-gradient(circle at 84% 18%, rgba(99, 102, 241, 0.07), transparent 2px),
            radial-gradient(circle at 22% 68%, rgba(148, 163, 184, 0.07), transparent 2px),
            radial-gradient(circle at 66% 74%, rgba(96, 165, 250, 0.08), transparent 2px),
            radial-gradient(circle at 92% 62%, rgba(245, 158, 11, 0.06), transparent 2px);
          opacity: 0.62;
        }

        .marquee-track {
          animation: marquee 28s linear infinite;
        }

        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .marquee-track {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}
