import { useEffect, useState } from 'react'
import type { Tab, View, Outcome } from './types'
import BottomNav from './components/BottomNav'
import MapScreen from './screens/MapScreen'
import CaptureScreen from './screens/CaptureScreen'
import VerifyingScreen from './screens/VerifyingScreen'
import ResultScreen from './screens/ResultScreen'
import LearnScreen from './screens/LearnScreen'
import TeamsScreen from './screens/TeamsScreen'
import ProfileScreen from './screens/ProfileScreen'
import WireframePrototype from './screens/WireframePrototype'

export default function App() {
  const [wireframe, setWireframe] = useState(false)
  const [view, setView] = useState<View>('map')
  const [tab, setTabState] = useState<Tab>('map')
  const [outcome, setOutcome] = useState<Outcome>('confirmed')
  const [stage, setStage] = useState('Adult')
  const [reports, setReports] = useState(12)
  const [campusReports, setCampusReports] = useState(72)
  const [points, setPoints] = useState(286)
  const [teamProgress, setTeamProgress] = useState(31)
  const [passedLessons, setPassedLessons] = useState<number[]>([])
  const [reportsThisWeek, setReportsThisWeek] = useState(2)
  const [eggFound, setEggFound] = useState(false)
  const [anonymous, setAnonymous] = useState(false)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (view !== 'verifying') return
    const id = window.setTimeout(() => setView('result'), 1500)
    return () => window.clearTimeout(id)
  }, [view])

  if (wireframe) return <WireframePrototype onExit={() => setWireframe(false)} />

  const setTab = (t: Tab) => { setTabState(t); setView(t) }

  const applyReward = () => {
    if (!pending) return;
    if (outcome === 'confirmed') {
      setReports(r => r + 1);
      setReportsThisWeek(r => r + 1);
      setCampusReports(r => r + 1);
      setPoints(p => p + 10);
      if (stage === 'Egg mass') {
        setTeamProgress(p => p + 1);
        setEggFound(true);
      }
    } else if (outcome === 'native') {
      setPoints(p => p + 2);
    }
    setPending(false);
  }

  const passLesson = (lesson: number) => {
      if (passedLessons.includes(lesson)) return
      setPassedLessons(current => [...current, lesson])
      setPoints(p => p + 10)
  }

  const done = () => { applyReward(); setTab('map') }
  const resultTeam = () => { applyReward(); setTab('teams') }
  const resultLearn = () => {
    applyReward();
    setTabState('learn');
    setView('learn');
    setTimeout(()=>document.getElementById('lookalikes')?.scrollIntoView({behavior:'smooth'}), 100)
  }

  return (
      <div className="app-shell">
        <div className="web-container">
          <button className="mode-toggle" onClick={() => setWireframe(value => !value)} aria-pressed={wireframe}>
            <span>{wireframe ? '◆' : '◇'}</span>{wireframe ? 'View design' : 'Wireframe'}
          </button>

          {view === 'map' && <MapScreen onReport={()=>setView('capture')}/>}
          {view === 'capture' && <CaptureScreen
              onBack={()=>setTab('map')}
              onSuccess={(res) => {
                if (res.detection.status === 'detected') {
                  setOutcome('confirmed');
                  setStage('Adult');
                } else {
                  setOutcome('uncertain');
                }
                setPending(true)
                setView('verifying');
              }}
          />}
          {view === 'verifying' && <VerifyingScreen onBack={()=>setView('capture')}/>}
          {view === 'result' && <ResultScreen outcome={outcome} stage={stage} onDone={done} onLearn={resultLearn} onTeam={resultTeam} onRetake={()=>setView('capture')}/>}
          {view === 'learn' && <LearnScreen passedLessons={passedLessons} passLesson={passLesson}/>}
          {view === 'teams' && <TeamsScreen anonymous={anonymous} teamProgress={teamProgress}/>}
          {view === 'me' && <ProfileScreen points={points} reports={reports} passedLessons={passedLessons} reportsThisWeek={reportsThisWeek} eggFound={eggFound} anonymous={anonymous} setAnonymous={setAnonymous}/>}

          {(['map','learn','teams','me'] as string[]).includes(view) && <BottomNav tab={tab} setTab={setTab}/>}
        </div>
      </div>
  )
}