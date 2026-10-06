import { useState } from 'react'
import Home from './components/Home'
import Breathing from './components/Breathing'
import VisualExercise from './components/VisualExercise'
import Sounds from './components/Sounds'

type Screen = 'home' | 'breathing' | 'visual' | 'sounds'

function App() {
  const [screen, setScreen] = useState<Screen>('home')

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {screen === 'home' && <Home onNavigate={setScreen} />}
      {screen === 'breathing' && <Breathing onBack={() => setScreen('home')} />}
      {screen === 'visual' && <VisualExercise onBack={() => setScreen('home')} />}
      {screen === 'sounds' && <Sounds onBack={() => setScreen('home')} />}
    </div>
  )
}

export default App
