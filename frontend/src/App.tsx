import { useEffect, useState } from 'react'

type Tab = 'map' | 'learn' | 'teams' | 'me'
type View = Tab | 'capture' | 'verifying' | 'result'
type Outcome = 'confirmed' | 'native' | 'uncertain'

function Icon({ name, size = 22 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    map: <><path d="m3 6 5-3 8 3 5-3v15l-5 3-8-3-5 3Z"/><path d="M8 3v15M16 6v15"/></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5Z"/><path d="M4 6.5v13"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    camera: <><path d="M14.5 4 16 7h4a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h4l1.5-3Z"/><circle cx="12" cy="13" r="3"/></>,
    arrow: <path d="m15 18-6-6 6-6"/>,
    check: <path d="m5 12 4 4L19 6"/>,
    trophy: <><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0Z"/><path d="M7 6H4v2a4 4 0 0 0 4 4M17 6h3v2a4 4 0 0 1-4 4"/></>,
    flame: <path d="M12 22c4 0 7-3 7-7 0-3-2-6-5-9 0 3-2 4-3 5 0-3-1-6-3-9 0 5-3 7-3 12 0 4 3 8 7 8Z"/>,
    share: <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4"/></>,
    leaf: <><path d="M11 20A7 7 0 0 1 9.8 6.1C15 2 21 3 21 3s1 6-3.1 11.2A7 7 0 0 1 11 20Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6.94C9.8 12.73 12 10 13 8"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{paths[name]}</svg>
}

const stages = [
  ['Egg mass', 'Sep–Jun', 'Gray, mud-like patches laid in rows on smooth outdoor surfaces.'],
  ['Black nymph', 'Apr–Jul', 'Tiny black body with bright white spots; quick and wingless.'],
  ['Red nymph', 'Jul–Sep', 'Vivid red with black bands and white dots before adulthood.'],
  ['Adult', 'Jul–Dec', 'Gray spotted forewings hide striking red-and-black hindwings.'],
]
const lessons = [
  {
    title: 'Life Stages',
    eyebrow: 'LESSON 1',
    summary: 'Learn how egg masses, black nymphs, red nymphs, and adults change through the year.',
    questions: [
      ['Which stage has gray spotted wings?', ['Adult', 'Egg mass', 'Black nymph'], 0],
      ['When are egg masses commonly visible?', ['Only July', 'Sep–Jun', 'Only April'], 1],
    ],
  },
  {
    title: 'Host Trees',
    eyebrow: 'LESSON 2',
    summary: 'Identify the trees where lanternflies feed and where egg masses are often found.',
    questions: [
      ['Which is a favorite host?', ['Tree of Heaven', 'Dogwood', 'Pine'], 0],
      ['What can identify Tree of Heaven?', ['Needle clusters', 'Burnt peanut butter smell', 'White flowers'], 1],
    ],
  },
  {
    title: 'Look-alikes and Impact',
    eyebrow: 'LESSON 3',
    summary: 'Protect native insects and understand how lanternflies damage Virginia plants.',
    questions: [
      ['What should you do when unsure?', ['Report and leave it alone', 'Remove it', 'Ignore safety'], 0],
      ['Sugary lanternfly waste can cause…', ['Sooty mold', 'Frost', 'Drought'], 0],
    ],
  },
] as const

function Header({ title, onBack, eyebrow }: { title: string; onBack?: () => void; eyebrow?: string }) {
  // added Tailwind classes for a sticky header with a blur effect
  return <header className="page-header sticky top-0 bg-white/90 backdrop-blur-md z-50 px-5 -mx-5 mb-4">
    {onBack && <button className="icon-button" onClick={onBack} aria-label="Go back"><Icon name="arrow" /></button>}
    <div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1></div>
    <div className="header-mark" aria-hidden><span>VT</span></div>
  </header>
}

function MapScreen({ reports, onReport }: { reports: number; onReport: () => void }) {
  return <main className="screen map-screen">
    <Header title="Good afternoon, Alex" eyebrow="VT LANTERNFLY" />
    <section className="map-card" aria-label="Aggregated verified sighting heat map">
      <div className="map-toolbar"><div><strong>Campus activity</strong><span>Verified sightings · coarse grid</span></div><button>7 days⌄</button></div>
      <div className="map-art">
        <div className="road road-a" /><div className="road road-b" /><div className="road road-c" /><div className="pond" />
        <span className="map-label label-1">Drillfield</span><span className="map-label label-2">Duck Pond</span><span className="map-label label-3">Lane Stadium</span>
        <div className="heat-grid">{Array.from({length:12},(_,n) => <i key={n} className={`heat heat-${n}`} />)}</div>
        <div className="map-legend"><i/><span>Fewer</span><i/><i/><i/><span>More</span></div>
      </div>
      <p className="privacy-note"><span>◎</span> Locations are grouped to protect privacy</p>
    </section>
    <section className="stats-card"><div><p>This week on campus</p><strong>{reports} verified reports</strong></div><span className="trend">↗ 18%</span></section>
    <section className="campus-goal">
      <div><small>CAMPUS GOAL</small><strong>Reach 100 verified campus reports before December</strong></div>
      <div className="bar"><i style={{width: `${Math.min(reports, 100)}%`}} /></div>
      <p><b>{Math.min(reports, 100)}/100 verified</b><span>{reports >= 100 ? 'Goal reached' : `${100 - reports} to go`}</span></p>
    </section>
    <section className="tip-card"><div className="tip-icon"><Icon name="leaf" /></div><div><small>SEASONAL TIP · LATE FALL</small><p>Look for egg masses on tree bark, walls, and outdoor furniture.</p></div></section>
    <button className="report-button" onClick={onReport}><Icon name="camera" /> Report a Lanternfly</button>
  </main>
}

function Capture({ onBack, onTake }: { onBack: () => void; onTake: (stage: string, outcome: Outcome) => void }) {
  const [stage, setStage] = useState('Adult')
  const [demo, setDemo] = useState<Outcome | 'random'>('random')
  const outcomes: Outcome[] = ['confirmed', 'native', 'uncertain']
  return <main className="capture-screen">
    <div className="camera-top"><button onClick={onBack} aria-label="Back"><Icon name="arrow" /></button><strong>Photograph sighting</strong><span /></div>
    <div className="viewfinder"><div className="forest-bg"><div className="tree"/><div className="bug"><i/><i/><b/></div></div><div className="focus-frame"><span/><span/><span/><span/></div><p>Center the insect and hold steady</p></div>
    <div className="capture-panel">
      <div className="safety"><strong>!</strong><p><b>Stay safe</b><br/>Stay on sidewalks. Never climb or step into roads.</p></div>
      <label>Life stage <span>Optional</span></label>
      <div className="chips">{stages.map(([name]) => <button key={name} className={stage === name ? 'active' : ''} onClick={() => setStage(name)}>{name}</button>)}</div>
      <button className="capture-button" onClick={() => onTake(stage, demo === 'random' ? outcomes[Math.floor(Math.random() * 3)] : demo)}><span><Icon name="camera" /></span> Take Photo</button>
      <button className="gps-note" onClick={() => setDemo(demo === 'random' ? 'confirmed' : demo === 'confirmed' ? 'native' : demo === 'native' ? 'uncertain' : 'random')}>⌖ GPS location and time are recorded at capture <i>{demo !== 'random' ? ` · ${demo}` : ''}</i></button>
    </div>
  </main>
}

function Verifying({ onBack }: { onBack: () => void }) {
  return <main className="screen verifying"><Header title="Checking your photo" onBack={onBack} eyebrow="REPORT IN PROGRESS" />
    <div className="scan-visual"><div className="scan-insect"><i/><i/><b/></div><span className="scan-line"/></div><div className="progress"><i/><i/><i/></div>
    <h2>Checking wing pattern<br/>and body color...</h2><p>This usually takes a few seconds.</p>
    <section className="fact-card"><small>DID YOU KNOW?</small><h3>Lanternflies are drawn to the Tree of Heaven.</h3><p>Look for smooth gray bark and large compound leaves with smooth edges.</p></section>
  </main>
}

function Result({ outcome, stage, onDone, onLearn, onTeam, onRetake }: { outcome: Outcome; stage: string; onDone: () => void; onLearn: () => void; onTeam: () => void; onRetake: () => void }) {
  if (outcome === 'confirmed') return <main className="screen result-screen"><Header title="Report complete" onBack={onDone} eyebrow="VERIFICATION RESULT" />
    <div className="result-icon confirmed"><Icon name="check" size={36}/></div><p className="status confirmed-text">CONFIRMED</p><h2>Spotted Lanternfly<br/>— {stage}</h2>
    <div className="points-pill">+10 points <span>Accurate report</span></div>
    <section className="learn-card"><div className="mini-bug"><i/><i/><b/></div><div><small>KNOW WHAT YOU FOUND</small><h3>{stage}</h3><p>Adults have gray spotted wings and a flash of red underneath. They are active from July through December.</p></div></section>
    <button className="primary" onClick={onTeam}>See team progress</button><button className="secondary" onClick={onDone}>Done</button>
  </main>
  if (outcome === 'native') return <main className="screen result-screen"><Header title="Report complete" onBack={onDone} eyebrow="VERIFICATION RESULT" />
    <div className="result-icon native"><Icon name="leaf" size={36}/></div><p className="status native-text">NATIVE INSECT</p><h2>Thanks for checking first.</h2>
    <p className="result-copy">This looks like a native insect. Please leave it alone — native species keep our ecosystem healthy.</p><div className="points-pill">+2 points <span>Careful identification</span></div>
    <button className="primary" onClick={onLearn}>Compare look-alikes</button><button className="secondary" onClick={onDone}>Done</button>
  </main>
  return <main className="screen result-screen"><Header title="Needs another look" onBack={onDone} eyebrow="VERIFICATION RESULT" />
    <div className="result-icon uncertain">?</div><p className="status uncertain-text">LOW CONFIDENCE</p><h2>We couldn't tell for sure.</h2><p className="result-copy">Try another photo in brighter light, or send this one to a trained campus reviewer.</p>
    <button className="primary" onClick={onRetake}><Icon name="camera"/> Retake photo</button><button className="secondary" onClick={onDone}>Send for manual review</button>
  </main>
}

function Learn({ passedLessons, passLesson }: { passedLessons: number[]; passLesson: (lesson: number) => void }) {
  const [lesson, setLesson] = useState<number | null>(null)
  const [q, setQ] = useState(0), [answers, setAnswers] = useState<number[]>([])
  const active = lesson === null ? null : lessons[lesson]
  const score = active ? answers.filter((a, i) => a === active.questions[i]?.[2]).length : 0
  const answer = (a: number) => {
    if (!active || lesson === null) return
    const next = [...answers, a]
    setAnswers(next)
    if (q < active.questions.length - 1) setQ(q + 1)
    else if (next.every((v, i) => v === active.questions[i][2])) passLesson(lesson)
  }
  const closeLesson = () => { setLesson(null); setQ(0); setAnswers([]) }
  if (active && lesson !== null) return <main className="screen learn-screen"><Header title={active.title} onBack={closeLesson} eyebrow={`${active.eyebrow} · +10 PTS`} />
    <section className="lesson-intro"><div className="badge-small"><Icon name={lesson === 1 ? 'leaf' : lesson === 2 ? 'users' : 'book'} /></div><div><small>QUICK LESSON</small><p>{active.summary}</p></div></section>
    {answers.length < active.questions.length ? <><div className="quiz-progress"><i style={{width: `${(q + 1) * 50}%`}}/></div><p className="question-count">CHECK YOUR KNOWLEDGE · {q + 1} OF 2</p><h2 className="quiz-question">{active.questions[q][0]}</h2><div className="answer-list">{active.questions[q][1].map((a, i) => <button key={a} onClick={() => answer(i)}><span>{String.fromCharCode(65+i)}</span>{a}</button>)}</div></> :
        <div className="quiz-finish"><div className="badge-large"><Icon name={score === 2 ? 'check' : 'book'} size={42}/></div><p className={`status ${score === 2 ? 'confirmed-text' : 'uncertain-text'}`}>{score === 2 ? 'LESSON PASSED' : 'TRY AGAIN'}</p><h2>{score}/2 correct</h2><p>{score === 2 ? `${passedLessons.includes(lesson) ? 'Completed' : '+10 points earned'} · ${passedLessons.length}/3 lessons passed` : 'Review the lesson and try the two questions again.'}</p><button className="primary" onClick={score === 2 ? closeLesson : () => {setQ(0);setAnswers([])}}>{score === 2 ? 'Back to lessons' : 'Try again'}</button></div>}
  </main>
  return <main className="screen learn-screen"><Header title="Field guide" eyebrow="LEARN · IDENTIFY · PROTECT" />
    <section className="hero-learn"><div><small>QUICK ID</small><h2>Know what<br/>to look for.</h2><p>Each life stage looks different.</p></div><div className="hero-bug"><i/><i/><b/></div></section>
    <div className="section-title"><div><small>IDENTIFICATION</small><h2>Life stages</h2></div><span>Swipe to explore</span></div>
    <div className="stage-scroll">{stages.map(([name, months, desc], i) => <article className="stage-card" key={name}><div className="stage-art"><div className="stage-symbol">{i === 0 ? '≋' : i === 1 ? '••' : i === 2 ? '✣' : '◆'}</div><span>{months}</span></div><h3>{name}</h3><p>{desc}</p></article>)}</div>
    <div className="section-title"><div><small>WHERE TO LOOK</small><h2>Host trees</h2></div></div>
    <div className="host-list">{[['Tree of Heaven','Crushed leaves smell like burnt peanut butter. Smooth leaf edges.'],['Black walnut','Dark, deeply furrowed bark and long compound leaves.'],['Maple','Opposite branches with familiar pointed, lobed leaves.']].map(([n,d]) => <article key={n}><span className="leaf-shape">♣</span><div><h3>{n}</h3><p>{d}</p></div><Icon name="chevron"/></article>)}</div>
    <section id="lookalikes" className="lookalikes"><small>COMPARE</small><h2>Lanternfly or look-alike?</h2><div className="compare"><div><span className="compare-bug">◆</span><b>Lanternfly</b><p>Spotted gray wings, red beneath</p></div><div><span className="compare-bug">◉</span><b>Native moth</b><p>Soft scaled wings, no red flash</p></div></div><p className="protect-note">When in doubt, report first and leave it alone.</p></section>
    <section className="why-card"><span>01</span><div><small>WHY IT MATTERS</small><h3>Sugary waste feeds sooty mold</h3><p>It blocks sunlight and weakens trees, vines, and crops across Virginia.</p></div></section>
    <div className="section-title"><div><small>BUILD YOUR SKILLS</small><h2>Lessons & quizzes</h2></div><span>{passedLessons.length}/3 passed</span></div>
    <div className="lesson-list">{lessons.map((item, index) => <button key={item.title} onClick={() => {setLesson(index);setQ(0);setAnswers([])}} className={passedLessons.includes(index) ? 'passed' : ''}><span className="lesson-number">{passedLessons.includes(index) ? <Icon name="check" size={18}/> : index + 1}</span><div><small>{item.eyebrow} · 2 QUESTIONS</small><b>{item.title}</b><p>{item.summary}</p></div><Icon name="chevron"/></button>)}</div>
    <section className={`field-expert-progress ${passedLessons.length === 3 ? 'complete' : ''}`}><div className="badge-small"><Icon name="trophy"/></div><div><small>FIELD EXPERT BADGE</small><b>{passedLessons.length === 3 ? 'Badge earned' : `Pass all lessons · ${passedLessons.length}/3`}</b></div></section>
  </main>
}

function Teams({ anonymous, teamProgress }: { anonymous: boolean; teamProgress: number }) {
  const [segment, setSegment] = useState('Teams')
  const teams = [['Hokie Hunters','410'],['Ag Eng Club','355'],["Lucy's Squad",'298'],[anonymous ? 'Anonymous Hokie' : 'Alex Morgan','286'],['Soil Squad','241']]
  return <main className="screen teams-screen"><Header title="Leaderboard" eyebrow="TOGETHER, WE SPOT MORE" />
    <div className="segments">{['Friends','Teams','Majors','Campus'].map(x => <button className={segment === x ? 'active':''} onClick={() => setSegment(x)} key={x}>{x}</button>)}</div>
    <section className="goal-card"><div className="goal-top"><div><small>TEAM GOAL</small><h3>50 egg masses before December</h3></div><div className="goal-icon"><Icon name="trophy"/></div></div><div className="bar"><i style={{width:`${teamProgress/50*100}%`}}/></div><p><b>{teamProgress}/50 found</b><span>{50-teamProgress} to go</span></p></section>
    <div className="rank-heading"><span>RANK</span><span>TEAM / PLAYER</span><span>POINTS</span></div>
    <div className="rank-list">{teams.map(([name, points],i) => <article className={i === 3 ? 'is-me':''} key={name}><span className={`rank rank-${i}`}>{i+1}</span><span className="team-avatar">{name[0]}</span><div><b>{name}</b><small>{i === 3 ? 'You · Hokie Hunters' : `${12-i*2} members`}</small></div><strong>{points}</strong></article>)}</div>
    <div className="team-actions"><button className="primary"><Icon name="share"/> Invite friends</button><button className="secondary">Create team</button></div>
  </main>
}

function Profile({ points, reports, passedLessons, reportsThisWeek, eggFound, anonymous, setAnonymous }: { points: number; reports: number; passedLessons: number[]; reportsThisWeek: number; eggFound: boolean; anonymous: boolean; setAnonymous: (v:boolean)=>void }) {
  const [research, setResearch] = useState(true)
  const hasBadge = passedLessons.length === 3
  return <main className="screen profile-screen"><Header title="My field log" eyebrow="PROFILE" />
    <section className="profile-hero"><div className="avatar">AM<span>7</span></div><h2>Alex Morgan</h2><p>Environmental Science · Class of ’27</p><div className="profile-stats"><div><b>#{Math.max(1, 18-reports)}</b><span>Campus rank</span></div><div><b>{points}</b><span>Points</span></div><div><b><Icon name="flame" size={17}/> 6</b><span>Day streak</span></div></div></section>
    <div className="section-title"><div><small>ACHIEVEMENTS</small><h2>Badges</h2></div><span>2 of 4</span></div>
    <div className="badge-grid">{[['Field Expert','trophy',hasBadge],['First Report','check',reports>0],['Recruiter','users',false],['Egg Hunter','leaf',false]].map(([n,ic,on]) => <article className={on ? 'earned':'locked'} key={String(n)}><div><Icon name={String(ic)}/></div><b>{n}</b><small>{on ? 'Earned' : 'Locked'}</small></article>)}</div>
    <section className="learn-progress-card"><div><small>LEARN PROGRESS</small><b>{passedLessons.length}/3 quizzes passed</b></div><div className="bar"><i style={{width: `${passedLessons.length / 3 * 100}%`}} /></div><p>{hasBadge ? 'Field Expert earned' : 'Pass all three to earn Field Expert'}</p></section>
    <div className="section-title"><div><small>CONTRIBUTIONS</small><h2>My reports</h2></div><span>{reports} verified</span></div>
    <section className="report-summary"><div><span>◆</span><b>{reports}</b><small>Adults</small></div><div><span>✣</span><b>3</b><small>Nymphs</small></div><div><span>≋</span><b>2</b><small>Egg masses</small></div></section>
    <div className="section-title"><div><small>THIS WEEK</small><h2>Personal goals</h2></div></div>
    <section className="personal-goals">{[
      ['Report 3 verified lanternflies this week', `${Math.min(reportsThisWeek, 3)}/3`, reportsThisWeek >= 3],
      ['Find and scrape 1 egg mass', eggFound ? '1/1' : '0/1', eggFound],
      ['Complete a Learn quiz', passedLessons.length ? '1/1' : '0/1', passedLessons.length > 0],
      ['Invite 1 friend', '0/1', false],
    ].map(([label, count, complete]) => <div key={String(label)} className={complete ? 'complete' : ''}><span>{complete ? <Icon name="check" size={16}/> : ''}</span><b>{label}</b><small>{count}</small></div>)}</section>
    <div className="section-title"><div><small>SETTINGS</small><h2>Privacy</h2></div></div>
    <section className="settings"><label><div><b>Appear anonymous</b><small>On public leaderboards</small></div><input type="checkbox" checked={anonymous} onChange={e=>setAnonymous(e.target.checked)}/><i/></label><label><div><b>Share data with VT researchers</b><small>Helps improve campus response</small></div><input type="checkbox" checked={research} onChange={e=>setResearch(e.target.checked)}/><i/></label></section>
  </main>
}

function BottomNav({ tab, setTab }: { tab: Tab; setTab: (t:Tab)=>void }) {
  return <nav className="bottom-nav">{([['map','map','Map'],['learn','book','Learn'],['teams','users','Teams'],['me','user','Me']] as const).map(([t,ic,label]) => <button key={t} className={tab===t?'active':''} onClick={()=>setTab(t)}><Icon name={ic}/><span>{label}</span></button>)}</nav>
}

function WireframePrototype({ onExit }: { onExit: () => void }) {
  const [page, setPage] = useState<View>('map')
  const [tab, setTab] = useState<Tab>('map')
  const navigate = (next: Tab) => { setTab(next); setPage(next) }
  const title = page === 'capture' ? 'Capture' : page === 'verifying' ? 'Verifying' : page === 'result' ? 'Result' : page === 'map' ? 'Campus Map' : page === 'learn' ? 'Learn' : page === 'teams' ? 'Teams' : 'Me'
  useEffect(() => {
    if (page !== 'verifying') return
    const id = window.setTimeout(() => setPage('result'), 1200)
    return () => window.clearTimeout(id)
  }, [page])

  // replaced .phone with .web-container here
  return <div className="app-shell"><div className="web-container wireframe-prototype">
    <button className="mode-toggle wireframe-exit" onClick={onExit}><span>◆</span> View design</button>
    <header className="wf-header">{!(['map','learn','teams','me'] as string[]).includes(page) && <button onClick={() => setPage(page === 'capture' ? 'map' : 'capture')}><Icon name="arrow" size={18}/></button>}<div><small>VT LANTERNFLY · WIREFRAME</small><h1>{title}</h1></div><span className="wf-logo">LOGO</span></header>

    {page === 'map' && <main className="wf-screen">
      <section className="wf-map"><span>AGGREGATED CAMPUS HEAT MAP</span><div className="wf-grid">{Array.from({length:12},(_,i)=><i key={i}/>)}</div></section>
      <section className="wf-row"><div><small>THIS WEEK ON CAMPUS</small><b>72 verified reports</b></div><span>+18%</span></section>
      <section className="wf-card"><small>CAMPUS GOAL</small><b>Reach 100 verified campus reports before December</b><div className="wf-progress"><i style={{width:'72%'}}/></div><p>72/100 verified</p></section>
      <section className="wf-card"><small>SEASONAL TIP</small><p>Late fall: look for egg masses on tree bark, walls, and outdoor furniture.</p></section>
      <button className="wf-primary" onClick={() => setPage('capture')}><Icon name="camera"/> Report a Lanternfly</button>
    </main>}

    {page === 'capture' && <main className="wf-screen">
      <section className="wf-viewfinder"><span>CAMERA VIEWFINDER</span><div>INSECT<br/>FRAMING GUIDE</div></section>
      <section className="wf-warning">! &nbsp; Stay on sidewalks. Never climb or step into roads.</section>
      <small className="wf-label">OPTIONAL LIFE STAGE</small>
      <div className="wf-chips"><button>Egg mass</button><button>Black nymph</button><button>Red nymph</button><button>Adult</button></div>
      <button className="wf-primary" onClick={() => setPage('verifying')}><Icon name="camera"/> Take Photo</button>
      <p className="wf-helper">GPS location and time recorded at capture</p>
    </main>}

    {page === 'verifying' && <main className="wf-screen wf-center">
      <div className="wf-loader">ANALYZING<br/>PHOTO</div><h2>Checking wing pattern<br/>and body color...</h2><div className="wf-progress"><i style={{width:'65%'}}/></div>
      <section className="wf-card wf-left"><small>DID YOU KNOW?</small><b>Lanternflies are drawn to the Tree of Heaven.</b></section>
    </main>}

    {page === 'result' && <main className="wf-screen wf-center">
      <div className="wf-result-icon"><Icon name="check" size={30}/></div><small>CONFIRMED</small><h2>Spotted Lanternfly — Adult</h2>
      <div className="wf-points">+10 POINTS</div><section className="wf-card wf-left"><small>LEARN CARD</small><b>Adult life stage</b><p>Short identification detail and seasonal information.</p></section>
      <button className="wf-primary" onClick={() => navigate('teams')}>See team progress</button><button className="wf-secondary" onClick={() => navigate('map')}>Done</button>
    </main>}

    {page === 'learn' && <main className="wf-screen">
      <section className="wf-hero"><span>FEATURE IMAGE</span><h2>Know what to look for.</h2></section>
      <small className="wf-label">3 LESSONS · 0/3 PASSED</small>
      {['Life Stages','Host Trees','Look-alikes and Impact'].map((lesson,i)=><button className="wf-list-item" key={lesson}><span>{i+1}</span><div><small>LESSON {i+1} · 2 QUESTIONS</small><b>{lesson}</b><p>Brief lesson summary goes here.</p></div><Icon name="chevron"/></button>)}
      <section className="wf-card"><small>FIELD EXPERT BADGE</small><b>Pass all three lessons to unlock</b></section>
    </main>}

    {page === 'teams' && <main className="wf-screen">
      <div className="wf-segments"><button>Friends</button><button className="active">Teams</button><button>Majors</button><button>Campus</button></div>
      <section className="wf-card"><small>TEAM GOAL</small><b>50 egg masses before December</b><div className="wf-progress"><i style={{width:'62%'}}/></div><p>31/50 found</p></section>
      <small className="wf-label">LEADERBOARD</small>
      {['1  Hokie Hunters','2  Ag Eng Club',"3  Lucy's Squad",'4  Alex Morgan'].map((team,i)=><div className="wf-rank" key={team}><span>{team}</span><b>{410-i*48} pts</b></div>)}
      <button className="wf-primary">Invite friends</button><button className="wf-secondary">Create team</button>
    </main>}

    {page === 'me' && <main className="wf-screen">
      <section className="wf-profile"><div>AVATAR</div><h2>Alex Morgan</h2><p>Environmental Science · Class of ’27</p></section>
      <small className="wf-label">BADGES</small><div className="wf-badges">{['Field Expert','First Report','Recruiter','Egg Hunter'].map(x=><div key={x}><span>BADGE</span><b>{x}</b></div>)}</div>
      <section className="wf-card"><small>LEARN PROGRESS</small><b>0/3 quizzes passed</b><div className="wf-progress"><i style={{width:'0%'}}/></div></section>
      <small className="wf-label">PERSONAL GOALS</small>
      {['Report 3 verified lanternflies this week','Find and scrape 1 egg mass','Complete a Learn quiz','Invite 1 friend'].map(x=><div className="wf-goal" key={x}><i/><span>{x}</span><small>0/1</small></div>)}
    </main>}

    {(['map','learn','teams','me'] as string[]).includes(page) && <BottomNav tab={tab} setTab={navigate}/>}
  </div></div>
}

export default function App() {
  const [wireframe, setWireframe] = useState(false)
  const [view, setView] = useState<View>('map'), [tab, setTabState] = useState<Tab>('map')
  const [outcome, setOutcome] = useState<Outcome>('confirmed'), [stage, setStage] = useState('Adult')
  const [reports, setReports] = useState(12), [campusReports, setCampusReports] = useState(72), [points, setPoints] = useState(286), [teamProgress, setTeamProgress] = useState(31)
  const [passedLessons, setPassedLessons] = useState<number[]>([]), [reportsThisWeek, setReportsThisWeek] = useState(2), [eggFound, setEggFound] = useState(false)
  const [anonymous, setAnonymous] = useState(false), [pending, setPending] = useState(false)

  const setTab = (t: Tab) => { setTabState(t); setView(t) }
  const take = (s: string, o: Outcome) => { setStage(s); setOutcome(o); setView('verifying'); setPending(true) }
  useEffect(() => { if (view !== 'verifying') return; const id = window.setTimeout(() => setView('result'), 2000); return () => clearTimeout(id) }, [view])
  const applyReward = () => { if (!pending) return; if (outcome === 'confirmed') { setReports(r=>r+1); setReportsThisWeek(r=>r+1); setCampusReports(r=>r+1); setPoints(p=>p+10); if(stage==='Egg mass') { setTeamProgress(p=>p+1); setEggFound(true) } } else if (outcome === 'native') setPoints(p=>p+2); setPending(false) }

  const passLesson = (lesson: number) => setPassedLessons(current => {
    if (current.includes(lesson)) return current
    setPoints(p => p + 10)
    return [...current, lesson]
  })
  const done = () => { applyReward(); setTab('map') }
  const resultTeam = () => { applyReward(); setTab('teams') }
  const resultLearn = () => { applyReward(); setTabState('learn'); setView('learn'); setTimeout(()=>document.getElementById('lookalikes')?.scrollIntoView({behavior:'smooth'}),100) }

  if (wireframe) return <WireframePrototype onExit={() => setWireframe(false)} />

  // replaced .phone with .web-container here
  return <div className="app-shell"><div className="web-container">
    <button className="mode-toggle" onClick={() => setWireframe(value => !value)} aria-pressed={wireframe}>
      <span>{wireframe ? '◆' : '◇'}</span>{wireframe ? 'View design' : 'Wireframe'}
    </button>
    {view === 'map' && <MapScreen reports={campusReports} onReport={()=>setView('capture')}/>}
    {view === 'capture' && <Capture onBack={()=>setTab('map')} onTake={take}/>}
    {view === 'verifying' && <Verifying onBack={()=>setView('capture')}/>}
    {view === 'result' && <Result outcome={outcome} stage={stage} onDone={done} onLearn={resultLearn} onTeam={resultTeam} onRetake={()=>setView('capture')}/>}
    {view === 'learn' && <Learn passedLessons={passedLessons} passLesson={passLesson}/>}
    {view === 'teams' && <Teams anonymous={anonymous} teamProgress={teamProgress}/>}
    {view === 'me' && <Profile points={points} reports={reports} passedLessons={passedLessons} reportsThisWeek={reportsThisWeek} eggFound={eggFound} anonymous={anonymous} setAnonymous={setAnonymous}/>}
    {(['map','learn','teams','me'] as string[]).includes(view) && <BottomNav tab={tab} setTab={setTab}/>}
  </div></div>
}