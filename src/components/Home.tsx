type Screen = 'home' | 'breathing' | 'visual' | 'sounds'

interface HomeProps {
  onNavigate: (screen: Screen) => void
}

export default function Home({ onNavigate }: HomeProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative">
      {/* Background ambient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Logo */}
      <div className="relative z-10 text-center mb-16">
        <h1 className="text-5xl md:text-7xl font-thin tracking-wider mb-3">
          <span className="text-indigo-300">r</span>
          <span className="text-purple-300">3</span>
          <span className="text-indigo-300">l</span>
          <span className="text-purple-300">a</span>
          <span className="text-indigo-300">x</span>
        </h1>
        <p className="text-sm text-slate-500 font-light">respira. foca. mergulha.</p>
      </div>

      {/* 3 Steps */}
      <div className="relative z-10 w-full max-w-sm space-y-4">
        <button
          onClick={() => onNavigate('breathing')}
          className="w-full p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-indigo-500/5 border border-indigo-500/20 active:scale-[0.98] transition-all duration-200 group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-xl group-active:bg-indigo-500/30 transition">
              🫁
            </div>
            <div className="text-left">
              <p className="text-slate-200 font-light">Respirar</p>
              <p className="text-xs text-slate-500">Guie sua respiração</p>
            </div>
            <span className="ml-auto text-slate-600 group-active:text-slate-400">→</span>
          </div>
        </button>

        <button
          onClick={() => onNavigate('visual')}
          className="w-full p-5 rounded-2xl bg-gradient-to-r from-purple-500/10 to-purple-500/5 border border-purple-500/20 active:scale-[0.98] transition-all duration-200 group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-xl group-active:bg-purple-500/30 transition">
              👁️
            </div>
            <div className="text-left">
              <p className="text-slate-200 font-light">Focar</p>
              <p className="text-xs text-slate-500">Exercício visual</p>
            </div>
            <span className="ml-auto text-slate-600 group-active:text-slate-400">→</span>
          </div>
        </button>

        <button
          onClick={() => onNavigate('sounds')}
          className="w-full p-5 rounded-2xl bg-gradient-to-r from-violet-500/10 to-violet-500/5 border border-violet-500/20 active:scale-[0.98] transition-all duration-200 group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center text-xl group-active:bg-violet-500/30 transition">
              🎧
            </div>
            <div className="text-left">
              <p className="text-slate-200 font-light">Mergulhar</p>
              <p className="text-xs text-slate-500">Sons & frequências</p>
            </div>
            <span className="ml-auto text-slate-600 group-active:text-slate-400">→</span>
          </div>
        </button>
      </div>

      {/* SOS Button */}
      <button
        onClick={() => onNavigate('breathing')}
        className="relative z-10 mt-12 px-8 py-3 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm active:bg-indigo-500/30 transition"
      >
        ⚡ SOS — Respiração rápida (1 min)
      </button>
    </div>
  )
}
