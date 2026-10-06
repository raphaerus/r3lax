import { useState } from 'react'

function App() {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white overflow-x-hidden">
      {/* Hero / Header */}
      <header className="relative px-6 pt-16 pb-12 text-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="relative z-10">
          <h1 className="text-6xl md:text-8xl font-thin tracking-wider mb-4">
            <span className="text-indigo-300">r</span>
            <span className="text-purple-300">3</span>
            <span className="text-indigo-300">l</span>
            <span className="text-purple-300">a</span>
            <span className="text-indigo-300">x</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 font-light tracking-wide mb-2">
            3 passos para se acalmar
          </p>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Brainstorm & Conceito Visual do App
          </p>
        </div>
      </header>

      {/* Os 3 Passos */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <h2 className="text-2xl font-light text-center text-slate-300 mb-12 tracking-wide">
          Os 3 Passos
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <StepCard
            number={1}
            title="Respirar"
            description="Guiar a respiração de volta ao ritmo natural. Exercícios visuais de respiração com animações suaves."
            color="indigo"
            icon="🫁"
          />
          <StepCard
            number={2}
            title="Focar"
            description="Exercícios visuais na tela para recuperar o controle. Padrões hipnóticos, mandalas, partículas que respondem ao toque."
            color="purple"
            icon="👁️"
          />
          <StepCard
            number={3}
            title="Mergulhar"
            description="Sons e frequências que acalmam. Ruído marrom, chuva, água, frequências binaurais. Pronto ou personalizado."
            color="violet"
            icon="🎧"
          />
        </div>
      </section>

      {/* Funcionalidades Detalhadas */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <h2 className="text-2xl font-light text-center text-slate-300 mb-4 tracking-wide">
          Funcionalidades
        </h2>
        <p className="text-center text-slate-500 mb-12 text-sm">Clique para explorar cada recurso</p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Respiração Guiada */}
          <FeatureCard
            title="Respiração Guiada"
            icon="🫁"
            onClick={() => setActiveSection(activeSection === 'breathing' ? null : 'breathing')}
            isActive={activeSection === 'breathing'}
          >
            <div className="space-y-3">
              <p className="text-slate-400 text-sm">Animação circular que guia o ritmo:</p>
              <div className="flex items-center justify-center py-6">
                <BreathingCircle phase={breathPhase} />
              </div>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setBreathPhase('inhale')}
                  className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs hover:bg-indigo-500/30 transition"
                >
                  Inspira (4s)
                </button>
                <button
                  onClick={() => setBreathPhase('hold')}
                  className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs hover:bg-purple-500/30 transition"
                >
                  Segura (4s)
                </button>
                <button
                  onClick={() => setBreathPhase('exhale')}
                  className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs hover:bg-violet-500/30 transition"
                >
                  Expira (6s)
                </button>
              </div>
              <div className="mt-4 space-y-2">
                <h4 className="text-xs text-slate-500 uppercase tracking-wider">Técnicas:</h4>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>• 4-4-6 (padrão relaxamento)</li>
                  <li>• 4-7-8 (Dr. Andrew Weil)</li>
                  <li>• Box Breathing (4-4-4-4)</li>
                  <li>• Respiração livre (sem timer)</li>
                </ul>
              </div>
            </div>
          </FeatureCard>

          {/* Exercício Visual */}
          <FeatureCard
            title="Exercício Visual"
            icon="👁️"
            onClick={() => setActiveSection(activeSection === 'visual' ? null : 'visual')}
            isActive={activeSection === 'visual'}
          >
            <div className="space-y-3">
              <p className="text-slate-400 text-sm">Padrões visuais para recuperar foco e calma:</p>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700/50">
                  <div className="text-2xl mb-2">🌀</div>
                  <p className="text-xs text-slate-400">Espiral Hipnótica</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700/50">
                  <div className="text-2xl mb-2">🔮</div>
                  <p className="text-xs text-slate-400">Mandala Animada</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700/50">
                  <div className="text-2xl mb-2">✨</div>
                  <p className="text-xs text-slate-400">Partículas Flutuantes</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700/50">
                  <div className="text-2xl mb-2">🌊</div>
                  <p className="text-xs text-slate-400">Ondas Suaves</p>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="text-xs text-slate-500 uppercase tracking-wider">Interação:</h4>
                <p className="text-sm text-slate-400 mt-1">
                  O usuário pode tocar/arrastar para interagir com os padrões. A velocidade e intensidade respondem ao toque, ajudando a canalizar a ansiedade.
                </p>
              </div>
            </div>
          </FeatureCard>

          {/* Sons Relaxantes */}
          <FeatureCard
            title="Sons & Frequências"
            icon="🎧"
            onClick={() => setActiveSection(activeSection === 'sounds' ? null : 'sounds')}
            isActive={activeSection === 'sounds'}
          >
            <div className="space-y-3">
              <p className="text-slate-400 text-sm">Biblioteca de sons para relaxamento:</p>
              <div className="space-y-2 mt-4">
                <SoundItem name="Ruído Marrom" emoji="🟤" desc="Mais suave que ruído branco, ótimo para foco e calma" />
                <SoundItem name="Chuva Leve" emoji="🌧️" desc="Gotas suaves em superfície calma" />
                <SoundItem name="Chuva Forte" emoji="⛈️" desc="Tempestade envolvente" />
                <SoundItem name="Água Correndo" emoji="💧" desc="Riacho ou cachoeira distante" />
                <SoundItem name="Ondas do Mar" emoji="🌊" desc="Mar calmo batendo na areia" />
                <SoundItem name="Frequência 432Hz" emoji="🎵" desc="Frequência de relaxamento natural" />
                <SoundItem name="Frequência 528Hz" emoji="🎶" desc="Frequência de cura e transformação" />
                <SoundItem name="Binaural Theta" emoji="🧠" desc="Ondas cerebrais theta (meditação profunda)" />
              </div>
              <div className="mt-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <p className="text-xs text-slate-500">💡 Ideia: Permitir mixar sons — ex: chuva + ruído marrom + 432Hz</p>
              </div>
            </div>
          </FeatureCard>

          {/* Meditações */}
          <FeatureCard
            title="Meditações Guiadas"
            icon="🧘"
            onClick={() => setActiveSection(activeSection === 'meditation' ? null : 'meditation')}
            isActive={activeSection === 'meditation'}
          >
            <div className="space-y-3">
              <p className="text-slate-400 text-sm">Sessões curtas e diretas:</p>
              <div className="space-y-2 mt-4">
                <h4 className="text-xs text-slate-500 uppercase tracking-wider">Prontas:</h4>
                <div className="grid grid-cols-2 gap-2">
                  <MeditationCard duration="2 min" title="Reset Rápido" />
                  <MeditationCard duration="3 min" title="Volta ao Corpo" />
                  <MeditationCard duration="5 min" title="Escaneamento" />
                  <MeditationCard duration="5 min" title="Gratidão" />
                  <MeditationCard duration="7 min" title="Ansiedade SOS" />
                  <MeditationCard duration="10 min" title="Sono Profundo" />
                </div>
              </div>
              <div className="mt-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-2">✨ Personalizada:</h4>
                <p className="text-sm text-slate-400">
                  O usuário monta sua própria sessão escolhendo:
                </p>
                <ul className="text-sm text-slate-400 mt-2 space-y-1">
                  <li>• Duração (1-15 min)</li>
                  <li>• Técnica de respiração</li>
                  <li>• Som de fundo</li>
                  <li>• Exercício visual (opcional)</li>
                  <li>• Voz guia (opcional)</li>
                </ul>
              </div>
            </div>
          </FeatureCard>
        </div>
      </section>

      {/* Fluxo do Usuário */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-light text-center text-slate-300 mb-12 tracking-wide">
          Fluxo do Usuário
        </h2>
        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/50 via-purple-500/50 to-violet-500/50" />
          <div className="space-y-12">
            <FlowStep
              side="left"
              title="Abre o app"
              description="Interface minimalista. Sem distrações. Talvez uma pergunta: 'Como você está agora?' com opções de emoção."
            />
            <FlowStep
              side="right"
              title="Escolhe o caminho"
              description="Ou vai direto pro SOS rápido (respiração 1 min), ou escolhe entre os 3 passos, ou monta sua sessão."
            />
            <FlowStep
              side="left"
              title="Faz a sessão"
              description="Tela cheia com o exercício. Timer discreto. Botão de parar sempre visível. Sem notificações."
            />
            <FlowStep
              side="right"
              title="Finaliza"
              description="Mensagem gentil de encerramento. 'Como você está agora?' — para criar consciência do antes/depois."
            />
          </div>
        </div>
      </section>

      {/* Princípios de Design */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-light text-center text-slate-300 mb-12 tracking-wide">
          Princípios de Design
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <PrincipleCard
            icon="🌑"
            title="Escuro por padrão"
            description="Tema dark como padrão. Cores suaves, sem brilho excessivo. Pensado para uso noturno e momentos de crise."
          />
          <PrincipleCard
            icon="⚡"
            title="Sem fricção"
            description="Máximo 2 toques para começar uma sessão. Botão de SOS na home. Sem login obrigatório."
          />
          <PrincipleCard
            icon="🔇"
            title="Silencioso por natureza"
            description="Sem notificações push. Sem gamificação. Sem streaks. O app não te cobra — te acolhe."
          />
          <PrincipleCard
            icon="🎨"
            title="Visual que acalma"
            description="Animações lentas e orgânicas. Gradientes suaves. Transições que respiram. Nada de movimento brusco."
          />
        </div>
      </section>

      {/* Ideias Futuras */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-light text-center text-slate-300 mb-12 tracking-wide">
          💭 Ideias para Explorar
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <IdeaCard text="Widget na home do celular com respiração rápida" />
          <IdeaCard text="Modo 'pânico' — sessão de 60 segundos ultra-rápida" />
          <IdeaCard text="Histórico de humor (sem pressão)" />
          <IdeaCard text="Integração com Apple Watch / Wear OS para detectar estresse" />
          <IdeaCard text="Compartilhar sessão com alguém ('tô aqui com você')" />
          <IdeaCard text="Offline-first — tudo funciona sem internet" />
          <IdeaCard text="Timer de sono com fade out gradual" />
          <IdeaCard text="Sons da natureza gravados em campo (não samples)" />
          <IdeaCard text="Comunidade de sons personalizados" />
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 text-center border-t border-slate-800/50">
        <p className="text-slate-600 text-sm">
          r3lax — brainstorm concept
        </p>
        <p className="text-slate-700 text-xs mt-2">
          Pronto para construir?
        </p>
      </footer>
    </div>
  )
}

// Components

function StepCard({ number, title, description, color, icon }: {
  number: number; title: string; description: string; color: string; icon: string
}) {
  const colors = {
    indigo: 'from-indigo-500/20 to-indigo-500/5 border-indigo-500/20',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/20',
    violet: 'from-violet-500/20 to-violet-500/5 border-violet-500/20',
  }
  return (
    <div className={`relative p-8 rounded-2xl bg-gradient-to-b ${colors[color as keyof typeof colors]} border backdrop-blur-sm`}>
      <div className="absolute top-4 right-4 text-4xl opacity-30">{icon}</div>
      <div className="text-5xl font-thin text-slate-600 mb-4">{number}</div>
      <h3 className="text-xl font-light mb-3 text-slate-200">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
    </div>
  )
}

function FeatureCard({ title, icon, children, onClick, isActive }: {
  title: string; icon: string; children: React.ReactNode; onClick: () => void; isActive: boolean
}) {
  return (
    <div
      className={`rounded-2xl border transition-all duration-300 cursor-pointer ${
        isActive
          ? 'bg-slate-800/60 border-indigo-500/30 shadow-lg shadow-indigo-500/5'
          : 'bg-slate-800/20 border-slate-700/30 hover:bg-slate-800/40 hover:border-slate-600/50'
      }`}
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <h3 className="text-lg font-light text-slate-200">{title}</h3>
          <span className={`ml-auto text-slate-500 transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`}>
            ▾
          </span>
        </div>
        {isActive && (
          <div className="mt-6 pt-4 border-t border-slate-700/30">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}

function BreathingCircle({ phase }: { phase: 'inhale' | 'hold' | 'exhale' }) {
  const sizes = { inhale: 'w-24 h-24', hold: 'w-28 h-28', exhale: 'w-16 h-16' }
  const labels = { inhale: 'Inspire...', hold: 'Segure...', exhale: 'Expire...' }
  const colors = {
    inhale: 'bg-indigo-400/30 border-indigo-400/50',
    hold: 'bg-purple-400/30 border-purple-400/50',
    exhale: 'bg-violet-400/30 border-violet-400/50',
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={`rounded-full border-2 ${sizes[phase]} ${colors[phase]} transition-all duration-[4000ms] ease-in-out flex items-center justify-center`}
      >
        <div className="text-xs text-slate-300 font-light">{labels[phase]}</div>
      </div>
    </div>
  )
}

function SoundItem({ name, emoji, desc }: { name: string; emoji: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition">
      <span className="text-lg">{emoji}</span>
      <div>
        <p className="text-sm text-slate-300">{name}</p>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
    </div>
  )
}

function MeditationCard({ duration, title }: { duration: string; title: string }) {
  return (
    <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30 hover:border-indigo-500/30 transition">
      <p className="text-xs text-indigo-400">{duration}</p>
      <p className="text-sm text-slate-300 mt-1">{title}</p>
    </div>
  )
}

function FlowStep({ side, title, description }: { side: 'left' | 'right'; title: string; description: string }) {
  return (
    <div className={`flex ${side === 'left' ? 'justify-start' : 'justify-end'}`}>
      <div className={`w-5/12 p-5 rounded-xl bg-slate-800/30 border border-slate-700/30`}>
        <h4 className="text-sm font-medium text-slate-200 mb-2">{title}</h4>
        <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

function PrincipleCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="p-6 rounded-xl bg-slate-800/20 border border-slate-700/30">
      <span className="text-2xl mb-3 block">{icon}</span>
      <h4 className="text-sm font-medium text-slate-200 mb-2">{title}</h4>
      <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
    </div>
  )
}

function IdeaCard({ text }: { text: string }) {
  return (
    <div className="p-4 rounded-xl bg-slate-800/20 border border-slate-700/20 hover:border-purple-500/30 transition">
      <p className="text-sm text-slate-400">{text}</p>
    </div>
  )
}

export default App
