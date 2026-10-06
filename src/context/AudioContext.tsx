import { createContext, useContext, useRef, useState, useCallback, ReactNode } from 'react'

export type SoundType = 'brown-noise' | 'freq-432' | 'freq-528' | 'binaural-theta' | 'bells' | 'meditation-melody'

interface SoundNode {
  sources: AudioNode[]
  gain: GainNode
}

interface AudioContextType {
  activeSounds: Map<SoundType, number>
  toggleSound: (id: SoundType) => void
  stopAll: () => void
  masterVolume: number
  setMasterVolume: (v: number) => void
  isPlayerOpen: boolean
  setIsPlayerOpen: (v: boolean) => void
}

const AudioCtx = createContext<AudioContextType | null>(null)

export function useAudio() {
  const ctx = useContext(AudioCtx)
  if (!ctx) throw new Error('useAudio must be used within AudioProvider')
  return ctx
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const [activeSounds, setActiveSounds] = useState<Map<SoundType, number>>(new Map())
  const [masterVolume, setMasterVolume] = useState(0.7)
  const [isPlayerOpen, setIsPlayerOpen] = useState(false)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const nodesRef = useRef<Map<SoundType, SoundNode>>(new Map())

  const getCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }
    return audioCtxRef.current
  }, [])

  // --- Sound generators ---

  const createBrownNoise = useCallback((ctx: AudioContext, dest: AudioNode) => {
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
    filter.connect(dest)
    source.start()
    return [source, filter]
  }, [])

  const createFrequency = useCallback((ctx: AudioContext, dest: AudioNode, freq: number) => {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq
    const softGain = ctx.createGain()
    softGain.gain.value = 0.8
    osc.connect(softGain)
    softGain.connect(dest)
    osc.start()
    return [osc, softGain]
  }, [])

  const createBinaural = useCallback((ctx: AudioContext, dest: AudioNode) => {
    const oscL = ctx.createOscillator()
    oscL.type = 'sine'
    oscL.frequency.value = 200
    const oscR = ctx.createOscillator()
    oscR.type = 'sine'
    oscR.frequency.value = 206
    const merger = ctx.createChannelMerger(2)
    const gainL = ctx.createGain()
    const gainR = ctx.createGain()
    gainL.gain.value = 0.5
    gainR.gain.value = 0.5
    oscL.connect(gainL)
    oscR.connect(gainR)
    gainL.connect(merger, 0, 0)
    gainR.connect(merger, 0, 1)
    merger.connect(dest)
    oscL.start()
    oscR.start()
    return [oscL, oscR, merger, gainL, gainR]
  }, [])

  const createBells = useCallback((ctx: AudioContext, dest: AudioNode) => {
    // Singing bowl / meditation bell that rings periodically with long reverb
    const nodes: AudioNode[] = []

    // Convolver for reverb simulation
    const convolver = ctx.createConvolver()
    const reverbLength = 4 * ctx.sampleRate
    const reverbBuffer = ctx.createBuffer(2, reverbLength, ctx.sampleRate)
    for (let ch = 0; ch < 2; ch++) {
      const data = reverbBuffer.getChannelData(ch)
      for (let i = 0; i < reverbLength; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / reverbLength, 2.5)
      }
    }
    convolver.buffer = reverbBuffer
    convolver.connect(dest)

    const dryGain = ctx.createGain()
    dryGain.gain.value = 0.4
    dryGain.connect(dest)

    const wetGain = ctx.createGain()
    wetGain.gain.value = 0.7
    wetGain.connect(convolver)

    // Bell frequencies (singing bowl harmonics)
    const bellFreqs = [174, 285, 396, 528, 639]
    let bellIndex = 0

    const playBell = () => {
      const now = ctx.currentTime
      const fundamental = bellFreqs[bellIndex % bellFreqs.length]
      bellIndex++

      // Multiple harmonics for rich bell sound
      const harmonics = [1, 2.0, 3.0, 4.2, 5.4]
      const harmonicsGains = [1, 0.5, 0.3, 0.15, 0.08]

      harmonics.forEach((ratio, i) => {
        const osc = ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.value = fundamental * ratio

        const env = ctx.createGain()
        env.gain.setValueAtTime(0, now)
        env.gain.linearRampToValueAtTime(harmonicsGains[i] * 0.3, now + 0.01) // fast attack
        env.gain.exponentialRampToValueAtTime(0.001, now + 6 + i * 0.5) // long decay

        osc.connect(env)
        env.connect(dryGain)
        env.connect(wetGain)
        osc.start(now)
        osc.stop(now + 8)
        nodes.push(osc, env)
      })
    }

    // Play bell immediately, then every 8-12 seconds
    playBell()
    const interval = setInterval(() => {
      playBell()
    }, 8000 + Math.random() * 4000)

    // Store interval for cleanup
    const cleanupNode = { disconnect: () => clearInterval(interval) } as unknown as AudioNode
    nodes.push(cleanupNode)

    return [dryGain, wetGain, convolver, cleanupNode]
  }, [])

  const createMeditationMelody = useCallback((ctx: AudioContext, dest: AudioNode) => {
    // Soft ambient pad with slow chord changes + gentle melody notes
    const nodes: AudioNode[] = []

    // Reverb
    const convolver = ctx.createConvolver()
    const reverbLength = 5 * ctx.sampleRate
    const reverbBuffer = ctx.createBuffer(2, reverbLength, ctx.sampleRate)
    for (let ch = 0; ch < 2; ch++) {
      const data = reverbBuffer.getChannelData(ch)
      for (let i = 0; i < reverbLength; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / reverbLength, 2)
      }
    }
    convolver.buffer = reverbBuffer

    const wetGain = ctx.createGain()
    wetGain.gain.value = 0.6
    convolver.connect(wetGain)
    wetGain.connect(dest)

    const dryGain = ctx.createGain()
    dryGain.gain.value = 0.3
    dryGain.connect(dest)

    // Pentatonic scale notes (C major pentatonic in different octaves)
    const scaleNotes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25]
    // Chord pads (slow evolving)
    const chords = [
      [261.63, 329.63, 392.00], // C major
      [220.00, 261.63, 329.63], // Am
      [246.94, 293.66, 369.99], // Bm-ish
      [196.00, 246.94, 293.66], // G
    ]

    let chordIndex = 0
    let noteIndex = 0

    // Pad: slow chord changes every 8 seconds
    const playChord = () => {
      const now = ctx.currentTime
      const chord = chords[chordIndex % chords.length]
      chordIndex++

      chord.forEach((freq) => {
        const osc = ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.value = freq

        const env = ctx.createGain()
        env.gain.setValueAtTime(0, now)
        env.gain.linearRampToValueAtTime(0.08, now + 2) // slow fade in
        env.gain.linearRampToValueAtTime(0.06, now + 6) // sustain
        env.gain.linearRampToValueAtTime(0, now + 8) // fade out

        osc.connect(env)
        env.connect(dryGain)
        env.connect(convolver)
        osc.start(now)
        osc.stop(now + 8.5)
        nodes.push(osc, env)
      })
    }

    // Melody: random pentatonic notes every 2-4 seconds
    const playMelodyNote = () => {
      const now = ctx.currentTime
      const freq = scaleNotes[Math.floor(Math.random() * scaleNotes.length)]

      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = freq

      const env = ctx.createGain()
      env.gain.setValueAtTime(0, now)
      env.gain.linearRampToValueAtTime(0.12, now + 0.3)
      env.gain.exponentialRampToValueAtTime(0.001, now + 3)

      osc.connect(env)
      env.connect(dryGain)
      env.connect(convolver)
      osc.start(now)
      osc.stop(now + 3.5)
      nodes.push(osc, env)
    }

    // Start
    playChord()
    const chordInterval = setInterval(playChord, 8000)
    const melodyInterval = setInterval(() => {
      if (Math.random() > 0.3) playMelodyNote()
    }, 2500)

    const cleanupNode = { disconnect: () => { clearInterval(chordInterval); clearInterval(melodyInterval) } } as unknown as AudioNode
    nodes.push(cleanupNode)

    return [dryGain, wetGain, convolver, cleanupNode]
  }, [])

  // --- Sound control ---

  const startSound = useCallback((soundId: SoundType) => {
    const ctx = getCtx()
    const masterGain = ctx.createGain()
    masterGain.gain.value = 0
    masterGain.gain.linearRampToValueAtTime(masterVolume, ctx.currentTime + 1)
    masterGain.connect(ctx.destination)

    let sources: AudioNode[] = []

    switch (soundId) {
      case 'brown-noise': sources = createBrownNoise(ctx, masterGain); break
      case 'freq-432': sources = createFrequency(ctx, masterGain, 432); break
      case 'freq-528': sources = createFrequency(ctx, masterGain, 528); break
      case 'binaural-theta': sources = createBinaural(ctx, masterGain); break
      case 'bells': sources = createBells(ctx, masterGain); break
      case 'meditation-melody': sources = createMeditationMelody(ctx, masterGain); break
    }

    nodesRef.current.set(soundId, { sources, gain: masterGain })
  }, [getCtx, masterVolume, createBrownNoise, createFrequency, createBinaural, createBells, createMeditationMelody])

  const stopSound = useCallback((soundId: SoundType) => {
    const node = nodesRef.current.get(soundId)
    if (node && audioCtxRef.current) {
      node.gain.gain.linearRampToValueAtTime(0, audioCtxRef.current.currentTime + 1)
      setTimeout(() => {
        node.sources.forEach(s => {
          try { (s as any).stop?.() } catch {}
          try { (s as any).disconnect?.() } catch {}
        })
        node.gain.disconnect()
      }, 1200)
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

  const stopAll = useCallback(() => {
    activeSounds.forEach((_, id) => stopSound(id))
    setActiveSounds(new Map())
  }, [activeSounds, stopSound])

  // Update volume when master changes
  const updateMasterVolume = useCallback((v: number) => {
    setMasterVolume(v)
    nodesRef.current.forEach((node) => {
      if (audioCtxRef.current) {
        node.gain.gain.linearRampToValueAtTime(v, audioCtxRef.current.currentTime + 0.1)
      }
    })
  }, [])

  return (
    <AudioCtx.Provider value={{
      activeSounds,
      toggleSound,
      stopAll,
      masterVolume,
      setMasterVolume: updateMasterVolume,
      isPlayerOpen,
      setIsPlayerOpen,
    }}>
      {children}
    </AudioCtx.Provider>
  )
}
