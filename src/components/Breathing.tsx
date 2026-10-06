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

interface Particle {
  angle: number
  distance: number
  speed: number
  size: number
  opacity: number
  hue: number
}

export default function Breathing({ onBack }: BreathingProps) {
  const [technique, setTechnique] = useState<Technique>('4-4-6')
  const [isRunning, setIsRunning] = useState(false)
  const [phase, setPhase] = useState<Phase>('inhale')
  const [phaseProgress, setPhaseProgress] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [showTechniques, setShowTechniques] = useState(false)
  const intervalRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  const t = techniques[technique]

  // Init particles
  useEffect(() => {
    const particles: Particle[] = []
    for (let i = 0; i < 40; i++) {
      particles.push({
        angle: (Math.PI * 2 * i) / 40 + Math.random() * 0.5,
        distance: 0.6 + Math.random() * 0.8,
        speed: 0.002 + Math.random() * 0.003,
        size: 1 + Math.random() * 2.5,
        opacity: 0.2 + Math.random() * 0.4,
        hue: 230 + Math.random() * 50,
      })
    }
    particlesRef.current = particles
  }, [])

  const getPhaseForTime = useCallback((timeInCycle: number): { phase: Phase; progress: number } => {
    const { inhale, hold, exhale, rest } = t
    const totalCycle = inhale + hold + exhale + rest

    if (timeInCycle < inhale) {
      return { phase: 'inhale', progress: timeInCycle / inhale }
    } else if (timeInCycle < inhale + hold) {
      return { phase: 'hold', progress: (timeInCycle - inhale) / (hold || 1) }
    } else if (timeInCycle < inhale + hold + exhale) {
      return { phase: 'exhale', progress: (timeInCycle - inhale - hold) / exhale }
    } else {
      return { phase: 'rest', progress: (timeInCycle - inhale - hold - exhale) / (rest || 1) }
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
      const { phase: currentPhase, progress } = getPhaseForTime(timeInCycle)
      setPhase(currentPhase)
      setPhaseProgress(progress)
    }, 30)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, t, getPhaseForTime])

  // Canvas animation for particles
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize)

    let time = 0
    const animate = () => {
      time++
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      const cx = w / 2
      const cy = h / 2

      ctx.clearRect(0, 0, w, h)

      // Get circle size for particle positioning
      const circleScale = getCircleScale()
      const baseRadius = Math.min(w, h) * 0.28

      particlesRef.current.forEach((p) => {
        p.angle += p.speed * (isRunning ? 1 : 0.3)

        // Particles orbit around the breathing circle
        const orbitRadius = baseRadius * (circleScale + p.distance * 0.5)
        const x = cx + Math.cos(p.angle) * orbitRadius
        const y = cy + Math.sin(p.angle) * orbitRadius

        // Pulsing opacity based on phase
        let alpha = p.opacity
        if (isRunning) {
          if (phase === 'inhale') {
            alpha *= 0.5 + phaseProgress * 0.5
          } else if (phase === 'hold') {
            alpha *= 0.8 + Math.sin(time * 0.05) * 0.2
          } else if (phase === 'exhale') {
            alpha *= 1 - phaseProgress * 0.6
          }
        }

        // Draw particle
        ctx.beginPath()
        ctx.arc(x, y, p.size * (isRunning ? circleScale : 0.7), 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 60%, 70%, ${alpha})`
        ctx.fill()

        // Subtle glow
        ctx.beginPath()
        ctx.arc(x, y, p.size * 2.5, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 60%, 70%, ${alpha * 0.15})`
        ctx.fill()
      })

      animRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animRef.current)
    }
  }, [isRunning, phase, phaseProgress])

  // Easing functions
  const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
  const easeInCubic = (t: number) => t * t * t

  // Circle scale: 0.35 (min) to 1.0 (max)
  const getCircleScale = () => {
    if (!isRunning) return 0.5

    switch (phase) {
      case 'inhale':
        // Small → Big (growing)
        return 0.35 + easeInOutSine(phaseProgress) * 0.65
      case 'hold':
        // Stay at max with subtle pulse
        return 1.0 + Math.sin(phaseProgress * Math.PI * 2) * 0.015
      case 'exhale':
        // Big → Small (shrinking)
        return 1.0 - easeInOutSine(phaseProgress) * 0.65
      case 'rest':
        // Stay at min
        return 0.35
      default:
        return 0.5
    }
  }

  const getPhaseLabel = () => {
    if (!isRunning) return 'Toque para começar'
    switch (phase) {
      case 'inhale': return 'Inspire'
      case 'hold': return 'Segure'
      case 'exhale': return 'Expire'
      case 'rest': return 'Descanse'
    }
  }

  const getPhaseColor = () => {
    switch (phase) {
      case 'inhale': return { main: 'rgba(129, 140, 248,', accent: '#818cf8' } // indigo
      case 'hold': return { main: 'rgba(192, 132, 252,', accent: '#c084fc' } // purple
      case 'exhale': return { main: 'rgba(139, 92, 246,', accent: '#8b5cf6' } // violet
      case 'rest': return { main: 'rgba(100, 116, 139,', accent: '#64748b' } // slate
    }
  }

  const circleScale = getCircleScale()
  const color = getPhaseColor()
  const baseSize = Math.min(
    typeof window !== 'undefined' ? window.innerWidth * 0.65 : 280,
    typeof window !== 'undefined' ? window.innerHeight * 0.35 : 280,
    300
  )

  // Glow intensity based on phase
  const getGlowIntensity = () => {
    if (!isRunning) return 0.2
    switch (phase) {
      case 'inhale': return 0.3 + phaseProgress * 0.4
      case 'hold': return 0.7 + Math.sin(phaseProgress * Math.PI * 2) * 0.1
      case 'exhale': return 0.7 - phaseProgress * 0.4
      case 'rest': return 0.2
      default: return 0.2
    }
  }
  const glowIntensity = getGlowIntensity()

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

      {/* Main breathing area */}
      <div className="flex-1 flex items-center justify-center w-full relative">
        {/* Particle canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* Breathing circle container */}
        <div className="relative flex items-center justify-center">
          {/* Outer glow layers */}
          <div
            className="absolute rounded-full"
            style={{
              width: circleScale * baseSize * 1.8,
              height: circleScale * baseSize * 1.8,
              background: `radial-gradient(circle, ${color.main} ${glowIntensity * 0.3}) 0%, transparent 70%)`,
              transition: phase === 'hold' || phase === 'rest' ? 'all 0.8s ease-out' : 'none',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: circleScale * baseSize * 1.4,
              height: circleScale * baseSize * 1.4,
              background: `radial-gradient(circle, ${color.main} ${glowIntensity * 0.5}) 0%, transparent 60%)`,
              transition: phase === 'hold' || phase === 'rest' ? 'all 0.8s ease-out' : 'none',
            }}
          />

          {/* Main circle */}
          <div
            className="rounded-full flex items-center justify-center relative"
            style={{
              width: circleScale * baseSize,
              height: circleScale * baseSize,
              background: `radial-gradient(circle at 40% 35%, ${color.main} 0.4) 0%, ${color.main} 0.15) 50%, ${color.main} 0.05) 100%)`,
              border: `1.5px solid ${color.main} ${0.3 + glowIntensity * 0.3})`,
              boxShadow: `
                0 0 ${20 + glowIntensity * 40}px ${color.main} ${glowIntensity * 0.3}),
                0 0 ${60 + glowIntensity * 80}px ${color.main} ${glowIntensity * 0.15}),
                inset 0 0 ${30 + glowIntensity * 30}px ${color.main} ${glowIntensity * 0.1})
              `,
              transition: phase === 'hold' || phase === 'rest' ? 'all 0.8s ease-out' : 'none',
            }}
          >
            {/* Inner highlight */}
            <div
              className="absolute rounded-full"
              style={{
                width: '60%',
                height: '60%',
                top: '15%',
                left: '15%',
                background: `radial-gradient(circle at 40% 35%, rgba(255,255,255,${0.03 + glowIntensity * 0.04}) 0%, transparent 60%)`,
              }}
            />

            {/* Phase label */}
            <span
              className="text-slate-200 font-light select-none relative z-10"
              style={{ fontSize: `${14 + circleScale * 8}px` }}
            >
              {getPhaseLabel()}
            </span>
          </div>

          {/* Ring indicator (progress within current phase) */}
          {isRunning && phase !== 'hold' && phase !== 'rest' && (() => {
            const ringSize = circleScale * baseSize + 20
            const ringRadius = ringSize / 2 - 2
            const circumference = 2 * Math.PI * ringRadius
            return (
              <svg
                className="absolute pointer-events-none"
                width={ringSize}
                height={ringSize}
              >
                <circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={ringRadius}
                  fill="none"
                  stroke={color.accent}
                  strokeWidth="1.5"
                  strokeDasharray={`${phaseProgress * circumference} ${circumference}`}
                  strokeLinecap="round"
                  opacity="0.5"
                  transform={`rotate(-90, ${ringSize / 2}, ${ringSize / 2})`}
                />
              </svg>
            )
          })()}
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
