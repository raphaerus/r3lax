import { useAudio, SoundType } from '../context/AudioContext'

interface SoundConfig {
  id: SoundType
  name: string
  emoji: string
  description: string
  category: 'noise' | 'harmony' | 'melody'
}

const sounds: SoundConfig[] = [
  { id: 'brown-noise', name: 'Ruído Marrom', emoji: '🟤', description: 'Suave e envolvente', category: 'noise' },
  { id: 'harmony-432', name: 'Harmonia 432', emoji: '🎵', description: 'Pad rico e musical', category: 'harmony' },
  { id: 'harmony-528', name: 'Harmonia 528', emoji: '🎶', description: 'Frequência de cura', category: 'harmony' },
  { id: 'binaural-alpha', name: 'Binaural Alpha', emoji: '🧠', description: 'Use fones · 10Hz', category: 'harmony' },
  { id: 'bells', name: 'Sinos', emoji: '🔔', description: 'Tibetanos com reverb', category: 'melody' },
  { id: 'melody-serene', name: 'Noite Serena', emoji: '🌙', description: 'Menor, muito lenta', category: 'melody' },
  { id: 'melody-dawn', name: 'Amanhecer', emoji: '🌅', description: 'Tons quentes', category: 'melody' },
  { id: 'melody-flow', name: 'Fluir', emoji: '🌊', description: 'Arpejos suaves', category: 'melody' },
  { id: 'melody-space', name: 'Espaço', emoji: '🌌', description: 'Drones espaciais', category: 'melody' },
  { id: 'melody-drift', name: 'Flutuar', emoji: '☁️', description: 'Melodia etérea', category: 'melody' },
]

export default function SoundPlayer() {
  const { activeSounds, toggleSound, stopAll, masterVolume, setMasterVolume, isPlayerOpen, setIsPlayerOpen } = useAudio()
  const hasActive = activeSounds.size > 0

  return (
    <>
      {/* Floating button - always visible */}
      <button
        onClick={() => setIsPlayerOpen(!isPlayerOpen)}
        className={`fixed bottom-20 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
          hasActive
            ? 'bg-indigo-500/30 border border-indigo-400/50 shadow-indigo-500/20'
            : 'bg-slate-800/80 border border-slate-700/50'
        } backdrop-blur-md active:scale-95`}
      >
        {hasActive ? (
          <div className="flex items-center gap-0.5">
            <div className="w-0.5 h-3 bg-indigo-300 rounded-full animate-pulse" />
            <div className="w-0.5 h-4 bg-indigo-300 rounded-full animate-pulse" style={{ animationDelay: '0.15s' }} />
            <div className="w-0.5 h-2 bg-indigo-300 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
            <div className="w-0.5 h-5 bg-indigo-300 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
          </div>
        ) : (
          <span className="text-xl">🎧</span>
        )}
      </button>

      {/* Player panel */}
      {isPlayerOpen && (
        <div className="fixed inset-0 z-40 flex items-end justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsPlayerOpen(false)}
          />

          {/* Panel */}
          <div className="relative w-full max-w-lg bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 rounded-t-3xl p-6 pb-10 max-h-[80vh] overflow-y-auto">
            {/* Handle */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-slate-700" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6 mt-2">
              <h3 className="text-lg font-light text-slate-200">Sons & Frequências</h3>
              <button
                onClick={() => setIsPlayerOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-sm"
              >
                ✕
              </button>
            </div>

            {/* Master volume */}
            <div className="mb-6 px-1">
              <div className="flex items-center gap-3">
                <span className="text-slate-500 text-sm">🔈</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={masterVolume}
                  onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                  className="flex-1 h-1 rounded-full cursor-pointer"
                />
                <span className="text-slate-500 text-sm">🔊</span>
              </div>
            </div>

            {/* Sound categories */}
            <div className="space-y-5">
              {/* Noise */}
              <div>
                <p className="text-xs text-slate-600 uppercase tracking-wider mb-2 px-1">Ruído</p>
                <div className="grid grid-cols-1 gap-2">
                  {sounds.filter(s => s.category === 'noise').map(sound => (
                    <SoundButton
                      key={sound.id}
                      sound={sound}
                      isActive={activeSounds.has(sound.id)}
                      onToggle={() => toggleSound(sound.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Harmonies */}
              <div>
                <p className="text-xs text-slate-600 uppercase tracking-wider mb-2 px-1">Harmonias</p>
                <div className="grid grid-cols-2 gap-2">
                  {sounds.filter(s => s.category === 'harmony').map(sound => (
                    <SoundButton
                      key={sound.id}
                      sound={sound}
                      isActive={activeSounds.has(sound.id)}
                      onToggle={() => toggleSound(sound.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Melodies */}
              <div>
                <p className="text-xs text-slate-600 uppercase tracking-wider mb-2 px-1">Melodias</p>
                <div className="grid grid-cols-2 gap-2">
                  {sounds.filter(s => s.category === 'melody').map(sound => (
                    <SoundButton
                      key={sound.id}
                      sound={sound}
                      isActive={activeSounds.has(sound.id)}
                      onToggle={() => toggleSound(sound.id)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Mix hint */}
            <div className="mt-6 p-3 rounded-xl bg-slate-800/30 border border-slate-700/20 text-center">
              <p className="text-xs text-slate-500">
                💡 Combine sons para criar sua mixagem perfeita
              </p>
            </div>

            {/* Stop all */}
            {hasActive && (
              <button
                onClick={stopAll}
                className="mt-4 w-full py-3 rounded-xl bg-slate-800/40 border border-slate-700/30 text-slate-400 text-sm active:bg-slate-800/60 transition"
              >
                ⏹ Parar todos
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}

function SoundButton({ sound, isActive, onToggle }: {
  sound: SoundConfig
  isActive: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className={`p-3 rounded-xl border text-left transition-all duration-300 active:scale-[0.97] ${
        isActive
          ? 'bg-indigo-500/15 border-indigo-500/40'
          : 'bg-slate-800/20 border-slate-700/30 active:bg-slate-800/40'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{sound.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-light truncate ${isActive ? 'text-indigo-300' : 'text-slate-300'}`}>
            {sound.name}
          </p>
          <p className="text-xs text-slate-600 truncate">{sound.description}</p>
        </div>
        {isActive && (
          <div className="flex items-center gap-0.5">
            <div className="w-0.5 h-2 bg-indigo-400 rounded-full animate-pulse" />
            <div className="w-0.5 h-3 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-0.5 h-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        )}
      </div>
    </button>
  )
}
