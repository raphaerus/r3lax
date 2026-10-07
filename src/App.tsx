import { useState } from 'react'
import { AudioProvider } from './context/AudioContext'
import Home from './components/Home'
import Breathing from './components/Breathing'
import VisualExercise from './components/VisualExercise'
import SoundPlayer from './components/SoundPlayer'

type Screen = 'home' | 'breathing' | 'visual'

function App() {
  const [screen, setScreen] = useState<Screen>('home')

  return (
    <AudioProvider>
      <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
        {screen === 'home' && <Home onNavigate={setScreen} />}
        {screen === 'breathing' && <Breathing onBack={() => setScreen('home')} />}
        {screen === 'visual' && <VisualExercise onBack={() => setScreen('home')} />}
        
        {/* Global sound player - always available */}
        <SoundPlayer />
      </div>
    </AudioProvider>
  )
}

export default App
