import { useState, useEffect, useRef, useCallback } from 'react'

interface VisualExerciseProps {
  onBack: () => void
}

type Pattern = 'particles' | 'spiral' | 'waves' | 'mandala'

const patterns: { id: Pattern; name: string; emoji: string }[] = [
  { id: 'particles', name: 'Partículas', emoji: '✨' },
  { id: 'spiral', name: 'Espiral', emoji: '🌀' },
  { id: 'waves', name: 'Ondas', emoji: '🌊' },
  { id: 'mandala', name: 'Mandala', emoji: '🔮' },
]

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  hue: number
  life: number
  maxLife: number
}

export default function VisualExercise({ onBack }: VisualExerciseProps) {
  const [activePattern, setActivePattern] = useState<Pattern>('particles')
  const [isRunning, setIsRunning] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0, active: false })
  const timeRef = useRef(0)

  const initParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = []
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        hue: 230 + Math.random() * 60,
        life: Math.random() * 200,
        maxLife: 200 + Math.random() * 100,
      })
    }
    particlesRef.current = particles
  }, [])

  const drawParticles = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = 'rgba(2, 6, 23, 0.08)'
    ctx.fillRect(0, 0, width, height)

    const particles = particlesRef.current
    const mouse = mouseRef.current

    particles.forEach((p) => {
      // Mouse attraction
      if (mouse.active) {
        const dx = mouse.x - p.x
        const dy = mouse.y - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 150) {
          p.vx += dx * 0.0003
          p.vy += dy * 0.0003
        }
      }

      // Breathing movement
      p.vx += Math.sin(timeRef.current * 0.01 + p.y * 0.01) * 0.01
      p.vy += Math.cos(timeRef.current * 0.01 + p.x * 0.01) * 0.01

      // Damping
      p.vx *= 0.99
      p.vy *= 0.99

      p.x += p.vx
      p.y += p.vy
      p.life++

      // Wrap around
      if (p.x < 0) p.x = width
      if (p.x > width) p.x = 0
      if (p.y < 0) p.y = height
      if (p.y > height) p.y = 0

      // Pulsing opacity
      const lifeRatio = p.life / p.maxLife
      const pulse = Math.sin(timeRef.current * 0.02 + p.x * 0.01) * 0.3 + 0.7
      const alpha = p.opacity * pulse * (1 - lifeRatio * 0.3)

      // Draw
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * pulse, 0, Math.PI * 2)
      ctx.fillStyle = `hsla(${p.hue}, 70%, 70%, ${alpha})`
      ctx.fill()

      // Connections
      particles.forEach((p2) => {
        const dx = p.x - p2.x
        const dy = p.y - p2.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 80) {
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.strokeStyle = `hsla(${p.hue}, 50%, 60%, ${(1 - dist / 80) * 0.1})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      })

      // Reset dead particles
      if (p.life > p.maxLife) {
        p.life = 0
        p.x = Math.random() * width
        p.y = Math.random() * height
      }
    })
  }, [])

  const drawSpiral = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = 'rgba(2, 6, 23, 0.05)'
    ctx.fillRect(0, 0, width, height)

    const cx = width / 2
    const cy = height / 2
    const time = timeRef.current * 0.02

    for (let i = 0; i < 300; i++) {
      const angle = i * 0.1 + time
      const radius = i * 0.8 + Math.sin(time + i * 0.05) * 10
      const x = cx + Math.cos(angle) * radius
      const y = cy + Math.sin(angle) * radius
      const size = 2 + Math.sin(time + i * 0.1) * 1.5
      const hue = 230 + (i / 300) * 60

      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fillStyle = `hsla(${hue}, 60%, 65%, ${0.4 + Math.sin(time + i * 0.05) * 0.2})`
      ctx.fill()
    }
  }, [])

  const drawWaves = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = 'rgba(2, 6, 23, 0.06)'
    ctx.fillRect(0, 0, width, height)

    const time = timeRef.current * 0.015

    for (let wave = 0; wave < 5; wave++) {
      ctx.beginPath()
      const yOffset = height * 0.3 + wave * (height * 0.1)
      const hue = 230 + wave * 15

      for (let x = 0; x <= width; x += 2) {
        const y = yOffset +
          Math.sin(x * 0.01 + time + wave) * 30 +
          Math.sin(x * 0.02 + time * 1.5 + wave * 2) * 15 +
          Math.cos(x * 0.005 + time * 0.5) * 20

        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }

      ctx.strokeStyle = `hsla(${hue}, 50%, 60%, ${0.3 - wave * 0.04})`
      ctx.lineWidth = 2
      ctx.stroke()
    }
  }, [])

  const drawMandala = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = 'rgba(2, 6, 23, 0.04)'
    ctx.fillRect(0, 0, width, height)

    const cx = width / 2
    const cy = height / 2
    const time = timeRef.current * 0.01
    const segments = 12

    for (let s = 0; s < segments; s++) {
      const baseAngle = (s / segments) * Math.PI * 2 + time * 0.3

      for (let i = 0; i < 20; i++) {
        const angle = baseAngle + Math.sin(time + i * 0.3) * 0.2
        const radius = 30 + i * 12 + Math.sin(time * 2 + i * 0.5) * 8
        const x = cx + Math.cos(angle) * radius
        const y = cy + Math.sin(angle) * radius
        const size = 3 + Math.sin(time + i * 0.2 + s) * 2
        const hue = 250 + s * 10 + i * 2

        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${hue}, 60%, 65%, ${0.4 + Math.sin(time + i * 0.1) * 0.2})`
        ctx.fill()
      }
    }

    // Center circle
    const centerPulse = 15 + Math.sin(time * 2) * 5
    ctx.beginPath()
    ctx.arc(cx, cy, centerPulse, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(260, 50%, 60%, 0.3)`
    ctx.fill()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      if (particlesRef.current.length === 0) {
        initParticles(canvas.width, canvas.height)
      }
    }
    resize()
    window.addEventListener('resize', resize)

    const animate = () => {
      if (!isRunning) {
        animFrameRef.current = requestAnimationFrame(animate)
        return
      }

      timeRef.current++

      switch (activePattern) {
        case 'particles': drawParticles(ctx, canvas.width, canvas.height); break
        case 'spiral': drawSpiral(ctx, canvas.width, canvas.height); break
        case 'waves': drawWaves(ctx, canvas.width, canvas.height); break
        case 'mandala': drawMandala(ctx, canvas.width, canvas.height); break
      }

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [isRunning, activePattern, initParticles, drawParticles, drawSpiral, drawWaves, drawMandala])

  const handleTouch = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    mouseRef.current = {
      x: clientX - rect.left,
      y: clientY - rect.top,
      active: true,
    }
  }

  const handleTouchEnd = () => {
    mouseRef.current.active = false
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        onTouchMove={handleTouch}
        onTouchEnd={handleTouchEnd}
        onMouseMove={handleTouch}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
      />

      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-slate-800/50 backdrop-blur-sm flex items-center justify-center text-slate-400 active:bg-slate-700/50"
      >
        ←
      </button>

      {/* Pattern selector */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        {patterns.map((p) => (
          <button
            key={p.id}
            onClick={() => setActivePattern(p.id)}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm backdrop-blur-sm transition ${
              activePattern === p.id
                ? 'bg-indigo-500/30 border border-indigo-400/50'
                : 'bg-slate-800/50 border border-slate-700/30'
            }`}
          >
            {p.emoji}
          </button>
        ))}
      </div>

      {/* Center prompt */}
      {!isRunning && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center">
            <p className="text-slate-400 text-lg font-light mb-2">Toque para começar</p>
            <p className="text-slate-600 text-sm">Arraste para interagir</p>
          </div>
        </div>
      )}

      {/* Play button */}
      <div className="absolute bottom-12 left-0 right-0 flex justify-center z-20">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="px-8 py-4 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-light backdrop-blur-sm active:bg-indigo-500/30 transition text-lg"
        >
          {isRunning ? '⏸ Pausar' : '▶ Iniciar'}
        </button>
      </div>
    </div>
  )
}
