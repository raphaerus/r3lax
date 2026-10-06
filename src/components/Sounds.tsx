import { useState, useRef, useCallback, useEffect } from 'react'

interface SoundsProps {
  onBack: () => void
}

type SoundType = 'brown-noise' | 'rain-light' | 'rain-heavy' | 'water' | 'waves' | 'freq-432' | 'freq-528' | 'binaural-theta'

interface SoundConfig {
  id: SoundType
  name: string
  emoji: string
  description: string
}

const sounds: SoundConfig[] = [
  { id: 'brown-noise', name: 'Ruído Marrom', emoji: '🟤', description: 'Suave e envolvente' },
  { id: 'rain-light', name: 'Chuva Leve', emoji: '🌧️', description: 'Gotas suaves' },
  { id: 'rain-heavy', name: 'Chuva Forte', emoji: '⛈️', description: 'Tempestade' },
  { id: 'water', name: 'Água Correndo', emoji: '💧', description: 'Riacho suave' },
  { id: 'waves', name: 'Ondas do Mar', emoji: '🌊', description: 'Mar calmo' },
  { id: 'freq-432', name: '432 Hz', emoji: '🎵', description: 'Relaxamento natural' },
  { id: 'freq-528', name: '528 Hz', emoji: '🎶', description: 'Cura e transformação' },
  { id: 'binaural-theta', name: 'Binaural Theta', emoji: '🧠', description: 'Meditação profunda' },
]

export default function Sounds({ onBack }: SoundsProps) {
  const [activeSounds, setActiveSounds] = useState<Map<SoundType, number>>(new Map())
  const [masterVolume, setMasterVolume] = useState(0.7)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const nodesRef = useRef<Map<SoundType, { sources: AudioNode[]; gain: GainNode }>>(new Map())

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }
    return audioCtxRef.current
  }, [])

  const createBrownNoise = useCallback((ctx: AudioContext, destination: AudioNode) => {
    const bufferSize = 2 * ctx.sampleRate
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let lastOut = 0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      data[i] = (lastOut + 0.02 * white) / 1.02
      lastOut = data[i]
      data[i] *= 3.5
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 400

    source.connect(filter)
    filter.connect(destination)
    source.start()

    return [source, filter]
  }, [])

  const createRain = useCallback((ctx: AudioContext, destination: AudioNode, intensity: 'light' | 'heavy') => {
    const bufferSize = 2 * ctx.sampleRate
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const highpass = ctx.createBiquadFilter()
    highpass.type = 'highpass'
    highpass.frequency.value = intensity === 'light' ? 2000 : 1000

    const lowpass = ctx.createBiquadFilter()
    lowpass.type = 'lowpass'
    lowpass.frequency.value = intensity === 'light' ? 8000 : 10000

    // Modulation for rain drops effect
    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()
    lfo.frequency.value = intensity === 'light' ? 0.5 : 2
    lfoGain.gain.value = intensity === 'light' ? 0.3 : 0.5
    lfo.connect(lfoGain)
    lfoGain.connect((destination as GainNode).gain)
    lfo.start()

    source.connect(highpass)
    highpass.connect(lowpass)
    lowpass.connect(destination)
    source.start()

    return [source, highpass, lowpass, lfo, lfoGain]
  }, [])

  const createWater = useCallback((ctx: AudioContext, destination: AudioNode) => {
    const bufferSize = 2 * ctx.sampleRate
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const bandpass = ctx.createBiquadFilter()
    bandpass.type = 'bandpass'
    bandpass.frequency.value = 800
    bandpass.Q.value = 0.5

    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()
    lfo.frequency.value = 0.2
    lfoGain.gain.value = 200
    lfo.connect(lfoGain)
    lfoGain.connect(bandpass.frequency)
    lfo.start()

    source.connect(bandpass)
    bandpass.connect(destination)
    source.start()

    return [source, bandpass, lfo, lfoGain]
  }, [])

  const createWaves = useCallback((ctx: AudioContext, destination: AudioNode) => {
    const bufferSize = 2 * ctx.sampleRate
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const lowpass = ctx.createBiquadFilter()
    lowpass.type = 'lowpass'
    lowpass.frequency.value = 500

    // Wave rhythm
    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()
    lfo.frequency.value = 0.1 // slow wave
    lfoGain.gain.value = 0.4
    lfo.connect(lfoGain)
    lfoGain.connect((destination as GainNode).gain)
    lfo.start()

    source.connect(lowpass)
    lowpass.connect(destination)
    source.start()

    return [source, lowpass, lfo, lfoGain]
  }, [])

  const createFrequency = useCallback((ctx: AudioContext, destination: AudioNode, freq: number) => {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq

    // Soft fade in
    const softGain = ctx.createGain()
    softGain.gain.value = 0.8

    osc.connect(softGain)
    softGain.connect(destination)
    osc.start()

    return [osc, softGain]
  }, [])

  const createBinaural = useCallback((ctx: AudioContext, destination: AudioNode) => {
    // Theta binaural: 200Hz left, 206Hz right = 6Hz theta
    const oscLeft = ctx.createOscillator()
    oscLeft.type = 'sine'
    oscLeft.frequency.value = 200

    const oscRight = ctx.createOscillator()
    oscRight.type = 'sine'
    oscRight.frequency.value = 206

    const merger = ctx.createChannelMerger(2)
    const gainL = ctx.createGain()
    const gainR = ctx.createGain()
    gainL.gain.value = 0.5
    gainR.gain.value = 0.5

    oscLeft.connect(gainL)
    oscRight.connect(gainR)
    gainL.connect(merger, 0, 0)
    gainR.connect(merger, 0, 1)
    merger.connect(destination)

    oscLeft.start()
    oscRight.start()

    return [oscLeft, oscRight, merger, gainL, gainR]
  }, [])

  const startSound = useCallback((soundId: SoundType) => {
    const ctx = getAudioContext()
    const masterGain = ctx.createGain()
    masterGain.gain.value = masterVolume
    masterGain.connect(ctx.destination)

    let sources: AudioNode[] = []

    switch (soundId) {
      case 'brown-noise':
        sources = createBrownNoise(ctx, masterGain)
        break
      case 'rain-light':
        sources = createRain(ctx, masterGain, 'light')
        break
      case 'rain-heavy':
        sources = createRain(ctx, masterGain, 'heavy')
        break
      case 'water':
        sources = createWater(ctx, masterGain)
        break
      case 'waves':
        sources = createWaves(ctx, masterGain)
        break
      case 'freq-432':
        sources = createFrequency(ctx, masterGain, 432)
        break
      case 'freq-528':
        sources = createFrequency(ctx, masterGain, 528)
        break
      case 'binaural-theta':
        sources = createBinaural(ctx, masterGain)
        break
    }

    nodesRef.current.set(soundId, { sources, gain: masterGain })
  }, [getAudioContext, masterVolume, createBrownNoise, createRain, createWater, createWaves, createFrequency, createBinaural])

  const stopSound = useCallback((soundId: SoundType) => {
    const node = nodesRef.current.get(soundId)
    if (node) {
      node.gain.gain.linearRampToValueAtTime(0, (audioCtxRef.current?.currentTime || 0) + 0.5)
      setTimeout(() => {
        node.sources.forEach(s => {
          try { (s as OscillatorNode | AudioBufferSourceNode).stop?.() } catch {}
          try { s.disconnect() } catch {}
        })
        node.gain.disconnect()
      }, 600)
      nodesRef.current.delete(soundId)
    }
  }, [])

  const toggleSound = useCallback((soundId: SoundType) => {
    setActiveSounds(prev => {
      const next = new Map(prev)
      if (next.has(soundId)) {
        next.delete(soundId)
        stopSound(soundId)
      } else {
        next.set(soundId, masterVolume)
        startSound(soundId)
      }
      return next
    })
  }, [masterVolume, startSound, stopSound])

  // Update volume when master changes
  useEffect(() => {
    nodesRef.current.forEach((node) => {
      if (audioCtxRef.current) {
        node.gain.gain.linearRampToValueAtTime(masterVolume, audioCtxRef.current.currentTime + 0.1)
      }
    })
  }, [masterVolume])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      nodesRef.current.forEach((node) => {
        node.sources.forEach(s => {
          try { (s as OscillatorNode | AudioBufferSourceNode).stop?.() } catch {}
        })
      })
      audioCtxRef.current?.close()
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col px-6 py-6">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-400 active:bg-slate-700/50"
        >
          ←
        </button>
        <h2 className="ml-4 text-lg font-light text-slate-300">Sons & Frequências</h2>
      </div>

      {/* Master volume */}
      <div className="mb-8 px-2">
        <div className="flex items-center gap-4">
          <span className="text-slate-500 text-sm">🔈</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={masterVolume}
            onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
            className="flex-1 h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-400"
          />
          <span className="text-slate-500 text-sm">🔊</span>
        </div>
        <p className="text-xs text-slate-600 mt-2 text-center">Volume geral</p>
      </div>

      {/* Sound grid */}
      <div className="flex-1 grid grid-cols-2 gap-3 content-start">
        {sounds.map((sound) => {
          const isActive = activeSounds.has(sound.id)
          return (
            <button
              key={sound.id}
              onClick={() => toggleSound(sound.id)}
              className={`p-4 rounded-2xl border text-left transition-all duration-300 active:scale-[0.97] ${
                isActive
                  ? 'bg-indigo-500/15 border-indigo-500/40 shadow-lg shadow-indigo-500/5'
                  : 'bg-slate-800/20 border-slate-700/30 active:bg-slate-800/40'
              }`}
            >
              <div className="text-2xl mb-2">{sound.emoji}</div>
              <p className={`text-sm font-light ${isActive ? 'text-indigo-300' : 'text-slate-300'}`}>
                {sound.name}
              </p>
              <p className="text-xs text-slate-600 mt-1">{sound.description}</p>
              {isActive && (
                <div className="mt-3 flex items-center gap-1">
                  <div className="w-1 h-3 bg-indigo-400 rounded-full animate-pulse" />
                  <div className="w-1 h-4 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="w-1 h-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                  <div className="w-1 h-5 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                  <div className="w-1 h-3 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Mix hint */}
      <div className="mt-6 p-4 rounded-xl bg-slate-800/20 border border-slate-700/20 text-center">
        <p className="text-xs text-slate-500">
          💡 Combine sons para criar sua mixagem perfeita
        </p>
      </div>

      {/* Stop all */}
      {activeSounds.size > 0 && (
        <button
          onClick={() => {
            activeSounds.forEach((_, id) => stopSound(id))
            setActiveSounds(new Map())
          }}
          className="mt-4 mb-6 w-full py-3 rounded-xl bg-slate-800/30 border border-slate-700/30 text-slate-400 text-sm active:bg-slate-800/50 transition"
        >
          ⏹ Parar todos
        </button>
      )}
    </div>
  )
}
