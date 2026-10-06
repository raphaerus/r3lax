import { useState, useEffect, useRef, useCallback } from 'react'

interface BreathingProps {
  onBack: () => void
}

type Technique = '4-4-6' | '4-7-8' | 'box' | 'free'
type Phase = 'inhale' | 'hold' | 'exhale' | 'rest'

const techniques: Record<Technique, { name: string; inhale: number; hold: number; exhale: number; rest: number; desc: string }> = {
  '4-4-6': { name: '4-4-6', inhale: 4, hold: 4, exhale: 6, rest: 0, desc: 'Relaxamento padrão' },
  '4-7-8': { name: '4-7-8', inhale: 4, hold: 7, exhale: 8, rest: 0, desc: 'Dr. Andrew Weil' },
  'box': { name: 'Box', inhale: 4, hold: 4, exhale: 4, rest: 4, desc: 'Respiração quadrada' },
  'free': { name: 'Livre', inhale: 4, hold: 0, exhale: 6, rest: 0, desc: 'Sem timer, no seu ritmo' },
}

export default function Breathing({ onBack }: BreathingProps) {
  const [technique, setTechnique] = useState<Technique>('4-4-6')
  const [isRunning, setIsRunning] = useState(false)
  const [phase, setPhase] = useState<Phase>('inhale')
  const [progress, setProgress] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [showTechniques, setShowTechniques] = useState(false)
  const intervalRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)

  const t = techniques[technique]

  const getPhaseForTime = useCallback((timeInCycle: number): { phase: Phase; phaseProgress: number; phaseDuration: number } => {
    const { inhale, hold, exhale, rest } = t
    const totalCycle = inhale + hold + exhale + rest

    if (timeInCycle < inhale) {
      return { phase: 'inhale', phaseProgress: timeInCycle / inhale, phaseDuration: inhale }
    } else if (timeInCycle < inhale + hold) {
      return { phase: 'hold', phaseProgress: (timeInCycle - inhale) / (hold || 1), phaseDuration: hold }
    } else if (timeInCycle < inhale + hold + exhale) {
      return { phase: 'exhale', phaseProgress: (timeInCycle - inhale - hold) / exhale, phaseDuration: exhale }
    } else {
      return { phase: 'rest', phaseProgress: (timeInCycle - inhale - hold - exhale) / (rest || 1), phaseDuration: rest }
    }
  }, [t])

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    startTimeRef.current = Date.now()
    const totalCycle = t.inhale + t.hold + t.exhale + t.rest

    intervalRef.current = window.setInterval(() => {
      const elapsedSec = (Date.now() - startTimeRef.current) / 1000
      setElapsed(elapsedSec)
      const timeInCycle = elapsedSec % totalCycle
      const { phase: currentPhase, phaseProgress } = getPhaseForTime(timeInCycle)
      setPhase(currentPhase)
      setProgress(phaseProgress)
    }, 50)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, t, getPhaseForTime])

  const getCircleSize = () => {
    if (!isRunning) return 0.5
    switch (phase) {
      case 'inhale': return 0.5 + progress * 0.5
      case 'hold': return 1
      case 'exhale': return 1 - progress * 0.5
      case 'rest': return 0.5
      default: return 0.5
    }
  }

  const getPhaseLabel = () => {
    if (!isRunning) return 'Toque para começar'
    switch (phase) {
      case 'inhale': return 'Inspire...'
      case 'hold': return 'Segure...'
      case 'exhale': return 'Expire...'
      case 'rest': return 'Descanse...'
    }
  }

  const getPhaseColor = () => {
    switch (phase) {
      case 'inhale': return 'rgba(129, 140, 248, 0.3)' // indigo
      case 'hold': return 'rgba(192, 132, 252, 0.3)' // purple
      case 'exhale': return 'rgba(139, 92, 246, 0.3)' // violet
      case 'rest': return 'rgba(100, 116, 139, 0.2)' // slate
    }
  }

  const circleSize = getCircleSize()
  const baseSize = Math.min(window.innerWidth * 0.6, 280)

  return (
    <div className="min-h-screen flex flex-col items-center relative">
      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-400 active:bg-slate-700/50"
      >
        ←
      </button>

      {/* Technique selector */}
      <button
        onClick={() => setShowTechniques(!showTechniques)}
        className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full bg-slate-800/50 text-xs text-slate-400 active:bg-slate-700/50"
      >
        {t.name} ▾
      </button>

      {/* Techniques dropdown */}
      {showTechniques && (
        <div className="absolute top-14 right-4 z-30 bg-slate-800 border border-slate-700 rounded-xl p-2 shadow-xl">
          {(Object.entries(techniques) as [Technique, typeof t][]).map(([key, tech]) => (
            <button
              key={key}
              onClick={() => { setTechnique(key); setShowTechniques(false); setIsRunning(false) }}
              className={`block w-full text-left px-4 py-2 rounded-lg text-sm transition ${
                key === technique ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 active:bg-slate-700/50'
              }`}
            >
              <span className="font-medium">{tech.name}</span>
              <span className="text-xs text-slate-500 ml-2">{tech.desc}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main breathing circle */}
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="relative flex items-center justify-center">
          {/* Outer glow */}
          <div
            className="absolute rounded-full transition-all ease-in-out"
            style={{
              width: circleSize * baseSize * 1.3,
              height: circleSize * baseSize * 1.3,
              background: `radial-gradient(circle, ${getPhaseColor()} 0%, transparent 70%)`,
              transitionDuration: phase === 'hold' || phase === 'rest' ? '300ms' : `${(phase === 'inhale' ? t.inhale : phase === 'exhale' ? t.exhale : t.rest) * 1000}ms`,
            }}
          />
          {/* Main circle */}
          <div
            className="rounded-full border-2 flex items-center justify-center transition-all ease-in-out"
            style={{
              width: circleSize * baseSize,
              height: circleSize * baseSize,
              borderColor: phase === 'inhale' ? 'rgba(129, 140, 248, 0.5)' :
                           phase === 'hold' ? 'rgba(192, 132, 252, 0.5)' :
                           phase === 'exhale' ? 'rgba(139, 92, 246, 0.5)' :
                           'rgba(100, 116, 139, 0.3)',
              background: getPhaseColor(),
              transitionDuration: phase === 'hold' || phase === 'rest' ? '300ms' : `${(phase === 'inhale' ? t.inhale : phase === 'exhale' ? t.exhale : t.rest) * 1000}ms`,
            }}
          >
            <span className="text-slate-200 font-light text-lg select-none">{getPhaseLabel()}</span>
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="pb-12 px-6 w-full max-w-sm">
        {/* Timer */}
        {isRunning && (
          <div className="text-center mb-6">
            <p className="text-2xl font-light text-slate-300">
              {Math.floor(elapsed / 60)}:{String(Math.floor(elapsed % 60)).padStart(2, '0')}
            </p>
          </div>
        )}

        {/* Play/Pause */}
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="w-full py-4 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-light active:bg-indigo-500/30 transition text-lg"
        >
          {isRunning ? '⏸ Pausar' : '▶ Começar'}
        </button>

        {/* Technique info */}
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-600">
            {t.inhale}s inspira
            {t.hold > 0 && ` · ${t.hold}s segura`}
            {` · ${t.exhale}s expira`}
            {t.rest > 0 && ` · ${t.rest}s descansa`}
          </p>
        </div>
      </div>
    </div>
  )
}
