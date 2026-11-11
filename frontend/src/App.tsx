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
import AuthScreen from './screens/AuthScreen'

import type { UserProfile, LeaderboardEntry } from './types';

export default function App() {
  const [wireframe, setWireframe] = useState(false)
  const [view, setView] = useState<View>('map')
  const [tab, setTabState] = useState<Tab>('map')
  const [outcome, setOutcome] = useState<Outcome>('confirmed')
  const [stage, setStage] = useState('Adult')
  const [pending, setPending] = useState(false)

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [teamProgress, setTeamProgress] = useState(31)

  // initialize leaderboard
  useEffect(() => {
    // fetch('/api/leaderboard')
  }, [])

  // auto-advance verifying screen after 2 seconds
  useEffect(() => {
    if (view !== 'verifying') return;
    const id = window.setTimeout(() => setView('result'), 2000);
    return () => clearTimeout(id);
  }, [view])

  const setTab = (t: Tab) => { setTabState(t); setView(t) }

  const applyReward = () => {
    if (!pending || !currentUser) return;

    const updatedUser = {...currentUser };

    if (outcome === 'confirmed') {
      updatedUser.reportsTotal += 1;
      updatedUser.reportsThisWeek += 1;
      updatedUser.points += 10;

      if (stage === 'Egg mass') {
        setTeamProgress(p => p + 1);
        updatedUser.eggFound = true;
      }
    } else if (outcome === 'native') {
      updatedUser.points += 2;
    }

    setCurrentUser(updatedUser);
    setPending(false);
  }

  const passLesson = (lesson: number) => {
      if (!currentUser || currentUser.passedLessons.includes(lesson)) return;

      setCurrentUser({
        ...currentUser,
        points: currentUser.points + 10,
        passedLessons: [...currentUser.passedLessons, lesson]
      });
  }

  const handleUpdateSettings = (key: string, val: boolean) => {
    if (!currentUser) return;
    // send PATCH request to /api/users/me/settings
    setCurrentUser({...currentUser, [key]: val});
  }

  const done = () => { applyReward(); setTab('map') }
  const resultTeam = () => { applyReward(); setTab('teams') }
  const resultLearn = () => {
    applyReward();
    setTabState('learn');
    setView('learn');
    setTimeout(()=>document.getElementById('lookalikes')?.scrollIntoView({behavior:'smooth'}), 100)
  }

  if (wireframe) return <WireframePrototype onExit={() => setWireframe(false)} />

  // trap user in AuthScreen if not logged in
  if (!currentUser) {
    return (
        <div className="app-shell">
          <div className="web-container">
            <AuthScreen onLogin={setCurrentUser} />
          </div>
        </div>
    );
  }

  return (
      <div className="app-shell">
        <div className="web-container">
          <button className="mode-toggle" onClick={() => setWireframe(value => !value)} aria-pressed={wireframe}>
            <span>{wireframe ? '◆' : '◇'}</span>{wireframe ? 'View design' : 'Wireframe'}
          </button>

          {view === 'map' && <MapScreen onReport={()=> {setView('capture'); setPending(true);}}/>}
          {view === 'capture' && <CaptureScreen
              userId={currentUser.id}
              onBack={()=>setTab('map')}
              onSuccess={(res) => {
                if (res.detection.status === 'detected') {
                  setOutcome('confirmed');
                  setStage(res.detection.detections[0]?.label || 'Adult');
                } else {
                  setOutcome('uncertain');
                }
                setView('verifying');
              }}
          />}
          {view === 'verifying' && <VerifyingScreen onBack={()=>setView('capture')}/>}
          {view === 'result' && <ResultScreen outcome={outcome} stage={stage} onDone={done} onLearn={resultLearn} onTeam={resultTeam} onRetake={()=>setView('capture')}/>}
          {view === 'learn' && <LearnScreen passedLessons={currentUser.passedLessons} passLesson={passLesson}/>}
          {view === 'teams' && <TeamsScreen teamsData={leaderboard} teamProgress={teamProgress}/>}
          {view === 'me' && <ProfileScreen user={currentUser} onUpdateSettings={handleUpdateSettings}/>}

          {(['map','learn','teams','me'] as string[]).includes(view) && <BottomNav tab={tab} setTab={setTab}/>}
        </div>
      </div>
  )
}