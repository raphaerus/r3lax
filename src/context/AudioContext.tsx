import { createContext, useContext, useRef, useState, useCallback, ReactNode } from 'react'

export type SoundType =
  | 'brown-noise'
  | 'harmony-432'
  | 'harmony-528'
  | 'binaural-alpha'
  | 'bells'
  | 'melody-serene'
  | 'melody-dawn'
  | 'melody-flow'
  | 'melody-space'
  | 'melody-drift'

interface SoundNode {
  sources: AudioNode[]
  gain: GainNode
  intervals?: number[]
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

  // --- Reverb helper ---
  const createReverb = useCallback((ctx: AudioContext, duration = 4, decay = 2.5) => {
    const convolver = ctx.createConvolver()
    const length = duration * ctx.sampleRate
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate)
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch)
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay)
      }
    }
    convolver.buffer = buffer
    return convolver
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

  // Musical harmonic pad at a given fundamental
  const createHarmonicPad = useCallback((ctx: AudioContext, dest: AudioNode, fundamental: number) => {
    const nodes: AudioNode[] = []
    const reverb = createReverb(ctx, 5, 2)
    const wetGain = ctx.createGain()
    wetGain.gain.value = 0.5
    reverb.connect(wetGain)
    wetGain.connect(dest)

    const dryGain = ctx.createGain()
    dryGain.gain.value = 0.4
    dryGain.connect(dest)

    // Create rich harmonic series
    const harmonics = [
      { ratio: 1, gain: 0.25, type: 'sine' as OscillatorType },
      { ratio: 2, gain: 0.12, type: 'sine' as OscillatorType },
      { ratio: 3, gain: 0.06, type: 'sine' as OscillatorType },
      { ratio: 4, gain: 0.03, type: 'sine' as OscillatorType },
      { ratio: 0.5, gain: 0.15, type: 'sine' as OscillatorType }, // sub octave
      { ratio: 1.5, gain: 0.08, type: 'triangle' as OscillatorType }, // fifth
    ]

    harmonics.forEach((h) => {
      const osc = ctx.createOscillator()
      osc.type = h.type
      osc.frequency.value = fundamental * h.ratio

      // Slow LFO for movement
      const lfo = ctx.createOscillator()
      const lfoGain = ctx.createGain()
      lfo.frequency.value = 0.05 + Math.random() * 0.1
      lfoGain.gain.value = h.gain * 0.3
      lfo.connect(lfoGain)
      lfoGain.connect(osc.frequency)
      lfo.start()

      // Envelope gain
      const env = ctx.createGain()
      env.gain.value = h.gain
      osc.connect(env)
      env.connect(dryGain)
      env.connect(reverb)
      osc.start()

      nodes.push(osc, lfo, env, lfoGain)
    })

    // Slow filter sweep
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 2000
    filter.Q.value = 1

    const filterLfo = ctx.createOscillator()
    const filterLfoGain = ctx.createGain()
    filterLfo.frequency.value = 0.03
    filterLfoGain.gain.value = 800
    filterLfo.connect(filterLfoGain)
    filterLfoGain.connect(filter.frequency)
    filterLfo.start()

    nodes.push(filter, filterLfo, filterLfoGain)

    return [dryGain, wetGain, reverb, filterLfo, ...nodes]
  }, [createReverb])

  // Binaural with musical context
  const createBinauralMusical = useCallback((ctx: AudioContext, dest: AudioNode) => {
    const nodes: AudioNode[] = []
    const reverb = createReverb(ctx, 4, 2.5)
    const wetGain = ctx.createGain()
    wetGain.gain.value = 0.4
    reverb.connect(wetGain)
    wetGain.connect(dest)

    const dryGain = ctx.createGain()
    dryGain.gain.value = 0.3
    dryGain.connect(dest)

    // Alpha waves (10Hz) - more pleasant than theta for most people
    // Using musical base frequencies
    const baseL = 220 // A3
    const baseR = 230 // 10Hz difference = alpha

    // Left ear
    const oscL = ctx.createOscillator()
    oscL.type = 'sine'
    oscL.frequency.value = baseL
    const gainL = ctx.createGain()
    gainL.gain.value = 0.3
    oscL.connect(gainL)
    gainL.connect(dryGain)
    gainL.connect(reverb)

    // Right ear
    const oscR = ctx.createOscillator()
    oscR.type = 'sine'
    oscR.frequency.value = baseR
    const gainR = ctx.createGain()
    gainR.gain.value = 0.3
    oscR.connect(gainR)
    gainR.connect(dryGain)
    gainR.connect(reverb)

    // Add subtle harmonic warmth
    const oscWarm = ctx.createOscillator()
    oscWarm.type = 'triangle'
    oscWarm.frequency.value = baseL * 0.5 // Sub octave
    const warmGain = ctx.createGain()
    warmGain.gain.value = 0.08
    oscWarm.connect(warmGain)
    warmGain.connect(dryGain)

    // Slow amplitude modulation for breathing feel
    const ampLfo = ctx.createOscillator()
    const ampLfoGain = ctx.createGain()
    ampLfo.frequency.value = 0.1 // Very slow
    ampLfoGain.gain.value = 0.1
    ampLfo.connect(ampLfoGain)
    ampLfoGain.connect(gainL.gain)
    ampLfoGain.connect(gainR.gain)

    oscL.start()
    oscR.start()
    oscWarm.start()
    ampLfo.start()

    nodes.push(oscL, oscR, oscWarm, ampLfo, gainL, gainR, warmGain, ampLfoGain)

    return [dryGain, wetGain, reverb, ...nodes]
  }, [createReverb])

  // Singing bowls / bells
  const createBells = useCallback((ctx: AudioContext, dest: AudioNode) => {
    const nodes: AudioNode[] = []
    const reverb = createReverb(ctx, 5, 2)
    const wetGain = ctx.createGain()
    wetGain.gain.value = 0.7
    reverb.connect(wetGain)
    wetGain.connect(dest)

    const dryGain = ctx.createGain()
    dryGain.gain.value = 0.3
    dryGain.connect(dest)

    const bellFreqs = [174, 285, 396, 528, 639]
    let bellIndex = 0

    const playBell = () => {
      const now = ctx.currentTime
      const fundamental = bellFreqs[bellIndex % bellFreqs.length]
      bellIndex++

      const harmonics = [1, 2.0, 3.0, 4.2, 5.4]
      const harmonicsGains = [1, 0.5, 0.3, 0.15, 0.08]

      harmonics.forEach((ratio, i) => {
        const osc = ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.value = fundamental * ratio

        const env = ctx.createGain()
        env.gain.setValueAtTime(0, now)
        env.gain.linearRampToValueAtTime(harmonicsGains[i] * 0.25, now + 0.02)
        env.gain.exponentialRampToValueAtTime(0.001, now + 7 + i * 0.5)

        osc.connect(env)
        env.connect(dryGain)
        env.connect(reverb)
        osc.start(now)
        osc.stop(now + 9)
        nodes.push(osc, env)
      })
    }

    playBell()
    const interval = setInterval(() => { playBell() }, 8000 + Math.random() * 4000)
    const cleanupNode = { disconnect: () => clearInterval(interval) } as unknown as AudioNode
    nodes.push(cleanupNode)

    return [dryGain, wetGain, reverb, cleanupNode]
  }, [createReverb])

  // --- Melody generators ---

  // Helper: play a musical note with envelope
  const playNote = (
    ctx: AudioContext,
    dest: AudioNode,
    freq: number,
    startTime: number,
    duration: number,
    volume: number = 0.1,
    type: OscillatorType = 'sine'
  ) => {
    const osc = ctx.createOscillator()
    osc.type = type
    osc.frequency.value = freq

    const env = ctx.createGain()
    env.gain.setValueAtTime(0, startTime)
    env.gain.linearRampToValueAtTime(volume, startTime + 0.3)
    env.gain.setValueAtTime(volume * 0.8, startTime + duration * 0.5)
    env.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

    osc.connect(env)
    env.connect(dest)
    osc.start(startTime)
    osc.stop(startTime + duration + 0.1)

    return [osc, env]
  }

  // Melody 1: "Noite Serena" - A minor pentatonic, very slow
  const createMelodySerene = useCallback((ctx: AudioContext, dest: AudioNode) => {
    const nodes: AudioNode[] = []
    const reverb = createReverb(ctx, 6, 2)
    const wetGain = ctx.createGain()
    wetGain.gain.value = 0.6
    reverb.connect(wetGain)
    wetGain.connect(dest)

    const dryGain = ctx.createGain()
    dryGain.gain.value = 0.25
    dryGain.connect(dest)

    // A minor pentatonic: A, C, D, E, G
    const scale = [220, 261.63, 293.66, 329.63, 392, 440, 523.25]
    const intervals: number[] = []

    // Slow pad chord
    const playPad = () => {
      const now = ctx.currentTime
      // Am chord: A, C, E
      const padNotes = [110, 130.81, 164.81]
      padNotes.forEach((freq) => {
        const osc = ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.value = freq
        const env = ctx.createGain()
        env.gain.setValueAtTime(0, now)
        env.gain.linearRampToValueAtTime(0.04, now + 3)
        env.gain.linearRampToValueAtTime(0.03, now + 8)
        env.gain.linearRampToValueAtTime(0, now + 12)
        osc.connect(env)
        env.connect(dryGain)
        env.connect(reverb)
        osc.start(now)
        osc.stop(now + 12.5)
        nodes.push(osc, env)
      })
    }

    // Melody notes
    const playMelodyNote = () => {
      const now = ctx.currentTime
      const freq = scale[Math.floor(Math.random() * scale.length)]
      const dur = 3 + Math.random() * 3
      playNote(ctx, dryGain, freq, now, dur, 0.08)
      playNote(ctx, reverb, freq, now, dur, 0.06)
    }

    playPad()
    const padInterval = setInterval(playPad, 12000)
    const melodyInterval = setInterval(() => {
      if (Math.random() > 0.25) playMelodyNote()
    }, 3500)

    intervals.push(padInterval, melodyInterval)
    const cleanupNode = { disconnect: () => intervals.forEach(clearInterval) } as unknown as AudioNode
    nodes.push(cleanupNode)

    return [dryGain, wetGain, reverb, cleanupNode]
  }, [createReverb])

  // Melody 2: "Amanhecer" - warm major, evolving
  const createMelodyDawn = useCallback((ctx: AudioContext, dest: AudioNode) => {
    const nodes: AudioNode[] = []
    const reverb = createReverb(ctx, 5, 2.2)
    const wetGain = ctx.createGain()
    wetGain.gain.value = 0.55
    reverb.connect(wetGain)
    wetGain.connect(dest)

    const dryGain = ctx.createGain()
    dryGain.gain.value = 0.25
    dryGain.connect(dest)

    // D major: D, E, F#, A, B
    const scale = [293.66, 329.63, 369.99, 440, 493.88, 587.33, 739.99]
    const intervals: number[] = []

    // Warm evolving pad
    const playPad = () => {
      const now = ctx.currentTime
      // D major: D, F#, A
      const padNotes = [146.83, 185.00, 220]
      padNotes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        osc.type = i === 0 ? 'sine' : 'triangle'
        osc.frequency.value = freq

        // Slow detune for warmth
        const lfo = ctx.createOscillator()
        const lfoGain = ctx.createGain()
        lfo.frequency.value = 0.08 + i * 0.02
        lfoGain.gain.value = 2
        lfo.connect(lfoGain)
        lfoGain.connect(osc.frequency)
        lfo.start(now)

        const env = ctx.createGain()
        env.gain.setValueAtTime(0, now)
        env.gain.linearRampToValueAtTime(0.035, now + 4)
        env.gain.linearRampToValueAtTime(0.025, now + 9)
        env.gain.linearRampToValueAtTime(0, now + 14)
        osc.connect(env)
        env.connect(dryGain)
        env.connect(reverb)
        osc.start(now)
        osc.stop(now + 14.5)
        nodes.push(osc, env, lfo, lfoGain)
      })
    }

    const playMelodyNote = () => {
      const now = ctx.currentTime
      const freq = scale[Math.floor(Math.random() * scale.length)]
      const dur = 2.5 + Math.random() * 2.5
      playNote(ctx, dryGain, freq, now, dur, 0.07, 'sine')
      playNote(ctx, reverb, freq, now, dur, 0.05, 'sine')
    }

    playPad()
    const padInterval = setInterval(playPad, 14000)
    const melodyInterval = setInterval(() => {
      if (Math.random() > 0.3) playMelodyNote()
    }, 3000)

    intervals.push(padInterval, melodyInterval)
    const cleanupNode = { disconnect: () => intervals.forEach(clearInterval) } as unknown as AudioNode
    nodes.push(cleanupNode)

    return [dryGain, wetGain, reverb, cleanupNode]
  }, [createReverb])

  // Melody 3: "Fluir" - arpeggios, gentle movement
  const createMelodyFlow = useCallback((ctx: AudioContext, dest: AudioNode) => {
    const nodes: AudioNode[] = []
    const reverb = createReverb(ctx, 5, 2)
    const wetGain = ctx.createGain()
    wetGain.gain.value = 0.5
    reverb.connect(wetGain)
    wetGain.connect(dest)

    const dryGain = ctx.createGain()
    dryGain.gain.value = 0.3
    dryGain.connect(dest)

    // C major pentatonic: C, D, E, G, A
    const scale = [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25]
    const intervals: number[] = []
    let arpIndex = 0

    // Arpeggio pattern - plays ascending/descending notes
    const playArp = () => {
      const now = ctx.currentTime
      const direction = Math.random() > 0.5 ? 1 : -1
      const startIdx = direction > 0 ? 0 : scale.length - 1
      const noteCount = 3 + Math.floor(Math.random() * 3)

      for (let i = 0; i < noteCount; i++) {
        const idx = startIdx + direction * i
        if (idx < 0 || idx >= scale.length) continue
        const freq = scale[idx]
        const time = now + i * 0.8
        playNote(ctx, dryGain, freq, time, 2.5, 0.06, 'sine')
        playNote(ctx, reverb, freq, time, 2.5, 0.04, 'sine')
      }
      arpIndex++
    }

    // Soft drone underneath
    const droneOsc = ctx.createOscillator()
    droneOsc.type = 'sine'
    droneOsc.frequency.value = 130.81 // C3
    const droneGain = ctx.createGain()
    droneGain.gain.value = 0.04
    droneOsc.connect(droneGain)
    droneGain.connect(dryGain)
    droneGain.connect(reverb)
    droneOsc.start()

    const droneOsc2 = ctx.createOscillator()
    droneOsc2.type = 'sine'
    droneOsc2.frequency.value = 196 // G3
    const droneGain2 = ctx.createGain()
    droneGain2.gain.value = 0.025
    droneOsc2.connect(droneGain2)
    droneGain2.connect(dryGain)
    droneGain2.connect(reverb)
    droneOsc2.start()

    const arpInterval = setInterval(playArp, 4000)
    intervals.push(arpInterval)

    const cleanupNode = { disconnect: () => { intervals.forEach(clearInterval); try { droneOsc.stop() } catch {} try { droneOsc2.stop() } catch {} } } as unknown as AudioNode
    nodes.push(droneOsc, droneGain, droneOsc2, droneGain2, cleanupNode)

    return [dryGain, wetGain, reverb, cleanupNode]
  }, [createReverb])

  // Melody 4: "Espaço" - spacey drones with sparse notes
  const createMelodySpace = useCallback((ctx: AudioContext, dest: AudioNode) => {
    const nodes: AudioNode[] = []
    const reverb = createReverb(ctx, 7, 1.8) // Long reverb for space
    const wetGain = ctx.createGain()
    wetGain.gain.value = 0.7
    reverb.connect(wetGain)
    wetGain.connect(dest)

    const dryGain = ctx.createGain()
    dryGain.gain.value = 0.2
    dryGain.connect(dest)

    const intervals: number[] = []

    // Deep evolving drone
    const createDrone = (freq: number, vol: number) => {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = freq

      const lfo = ctx.createOscillator()
      const lfoGain = ctx.createGain()
      lfo.frequency.value = 0.02 + Math.random() * 0.03
      lfoGain.gain.value = freq * 0.01
      lfo.connect(lfoGain)
      lfoGain.connect(osc.frequency)
      lfo.start()

      const env = ctx.createGain()
      env.gain.value = vol
      osc.connect(env)
      env.connect(dryGain)
      env.connect(reverb)
      osc.start()

      nodes.push(osc, lfo, lfoGain, env)
    }

    // Low drones
    createDrone(65.41, 0.05) // C2
    createDrone(98, 0.03) // G2
    createDrone(130.81, 0.025) // C3

    // Very sparse high notes (every 5-8 seconds)
    const highScale = [523.25, 659.25, 783.99, 1046.5, 1318.5] // C5, E5, G5, C6, E6
    const playHighNote = () => {
      const now = ctx.currentTime
      const freq = highScale[Math.floor(Math.random() * highScale.length)]
      playNote(ctx, reverb, freq, now, 5, 0.04, 'sine')
    }

    const highInterval = setInterval(() => {
      if (Math.random() > 0.4) playHighNote()
    }, 6000)
    intervals.push(highInterval)

    const cleanupNode = { disconnect: () => { intervals.forEach(clearInterval) } } as unknown as AudioNode
    nodes.push(cleanupNode)

    return [dryGain, wetGain, reverb, cleanupNode]
  }, [createReverb])

  // Melody 5: "Flutuar" - gentle floating melody (original one, improved)
  const createMelodyDrift = useCallback((ctx: AudioContext, dest: AudioNode) => {
    const nodes: AudioNode[] = []
    const reverb = createReverb(ctx, 5, 2)
    const wetGain = ctx.createGain()
    wetGain.gain.value = 0.6
    reverb.connect(wetGain)
    wetGain.connect(dest)

    const dryGain = ctx.createGain()
    dryGain.gain.value = 0.3
    dryGain.connect(dest)

    // G major pentatonic: G, A, B, D, E
    const scale = [196, 220, 246.94, 293.66, 329.63, 392, 440, 493.88]
    const chords = [
      [196, 246.94, 293.66], // G
      [174.61, 220, 261.63], // Em
      [164.81, 196, 246.94], // C
      [146.83, 185, 220], // D
    ]
    const intervals: number[] = []
    let chordIdx = 0

    const playChord = () => {
      const now = ctx.currentTime
      const chord = chords[chordIdx % chords.length]
      chordIdx++

      chord.forEach((freq) => {
        const osc = ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.value = freq

        const env = ctx.createGain()
        env.gain.setValueAtTime(0, now)
        env.gain.linearRampToValueAtTime(0.05, now + 2.5)
        env.gain.linearRampToValueAtTime(0.035, now + 7)
        env.gain.linearRampToValueAtTime(0, now + 10)

        osc.connect(env)
        env.connect(dryGain)
        env.connect(reverb)
        osc.start(now)
        osc.stop(now + 10.5)
        nodes.push(osc, env)
      })
    }

    const playMelodyNote = () => {
      const now = ctx.currentTime
      const freq = scale[Math.floor(Math.random() * scale.length)]
      const dur = 3 + Math.random() * 2
      playNote(ctx, dryGain, freq, now, dur, 0.08, 'sine')
      playNote(ctx, reverb, freq, now, dur, 0.05, 'sine')
    }

    playChord()
    const chordInterval = setInterval(playChord, 10000)
    const melodyInterval = setInterval(() => {
      if (Math.random() > 0.3) playMelodyNote()
    }, 2800)

    intervals.push(chordInterval, melodyInterval)
    const cleanupNode = { disconnect: () => intervals.forEach(clearInterval) } as unknown as AudioNode
    nodes.push(cleanupNode)

    return [dryGain, wetGain, reverb, cleanupNode]
  }, [createReverb])

  // --- Sound control ---

  const startSound = useCallback((soundId: SoundType) => {
    const ctx = getCtx()
    const masterGain = ctx.createGain()
    masterGain.gain.value = 0
    masterGain.gain.linearRampToValueAtTime(masterVolume, ctx.currentTime + 1.5)
    masterGain.connect(ctx.destination)

    let sources: AudioNode[] = []

    switch (soundId) {
      case 'brown-noise': sources = createBrownNoise(ctx, masterGain); break
      case 'harmony-432': sources = createHarmonicPad(ctx, masterGain, 432); break
      case 'harmony-528': sources = createHarmonicPad(ctx, masterGain, 528); break
      case 'binaural-alpha': sources = createBinauralMusical(ctx, masterGain); break
      case 'bells': sources = createBells(ctx, masterGain); break
      case 'melody-serene': sources = createMelodySerene(ctx, masterGain); break
      case 'melody-dawn': sources = createMelodyDawn(ctx, masterGain); break
      case 'melody-flow': sources = createMelodyFlow(ctx, masterGain); break
      case 'melody-space': sources = createMelodySpace(ctx, masterGain); break
      case 'melody-drift': sources = createMelodyDrift(ctx, masterGain); break
    }

    nodesRef.current.set(soundId, { sources, gain: masterGain })
  }, [getCtx, masterVolume, createBrownNoise, createHarmonicPad, createBinauralMusical, createBells, createMelodySerene, createMelodyDawn, createMelodyFlow, createMelodySpace, createMelodyDrift])

  const stopSound = useCallback((soundId: SoundType) => {
    const node = nodesRef.current.get(soundId)
    if (node && audioCtxRef.current) {
      node.gain.gain.linearRampToValueAtTime(0, audioCtxRef.current.currentTime + 1.5)
      setTimeout(() => {
        node.sources.forEach(s => {
          try { (s as any).stop?.() } catch {}
          try { (s as any).disconnect?.() } catch {}
        })
        node.gain.disconnect()
      }, 1800)
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
