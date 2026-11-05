import { useEffect, useRef, useState } from 'react'
import { uploadPhoto, type UploadResponse } from './services/api'

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

function MapScreen({ onReport }: { onReport: () => void }) {
  const [summary, setSummary] = useState<{ uploaded: number; detected: number; mapped: number } | null>(null)
  const [mapVersion, setMapVersion] = useState(0)
  const [mapError, setMapError] = useState(false)

  const refreshMap = () => {
    setMapError(false)
    setMapVersion(version => version + 1)
    fetch('/api/sightings/summary', { cache: 'no-store' })
      .then(async response => {
        if (!response.ok) throw new Error('Map summary unavailable')
        return response.json()
      })
      .then(setSummary)
      .catch(() => setSummary(null))
  }

  useEffect(() => { refreshMap() }, [])

  return <main className="screen map-screen">
    <Header title="Campus sightings" eyebrow="VT LANTERNFLY" />
    <section className="map-card" aria-label="Interactive spotted lanternfly sighting map">
      <div className="map-toolbar">
        <div><strong>Lanternfly sightings</strong><span>AI detections · awaiting review</span></div>
        <button onClick={refreshMap} aria-label="Refresh map">Refresh ↻</button>
      </div>
      <div style={{height:400,background:'#e5efe5',position:'relative'}}>
        <iframe
          key={mapVersion}
          src="/api/map"
          title="Interactive map of submitted lanternfly photographs"
          onError={() => setMapError(true)}
          style={{display:'block',width:'100%',height:'100%',border:0}}
        />
        {mapError && <p role="alert" style={{position:'absolute',top:12,left:12,background:'#fff',padding:12}}>
          Map unavailable. Make sure FastAPI is running on port 8000.
        </p>}
      </div>
      <p className="privacy-note">◎ Showing available photo GPS locations. AI detections are not confirmed sightings.</p>
    </section>
    <section className="stats-card">
      <div><p>Locally indexed uploads</p><strong>{summary ? `${summary.mapped} mapped sighting${summary.mapped === 1 ? '' : 's'}` : 'Loading map data…'}</strong></div>
      <span className="trend">{summary ? `${summary.uploaded} uploads` : '—'}</span>
    </section>
    <section className="tip-card"><div className="tip-icon"><Icon name="leaf" /></div><div><small>SEASONAL TIP · LATE FALL</small><p>Look for egg masses on tree bark, walls, and outdoor furniture.</p></div></section>
    <button className="report-button" onClick={onReport}><Icon name="camera" /> Report a Lanternfly</button>
  </main>
}

function Capture({ onBack }: { onBack: () => void }) {
  const [photo, setPhoto] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<UploadResponse | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!photo) { setPreview(null); return }
    const url = URL.createObjectURL(photo)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [photo])

  const submit = async () => {
    if (!photo || uploading) return
    setUploading(true)
    setError(null)
    setResult(null)
    try { setResult(await uploadPhoto(photo)) }
    catch (err) { setError(err instanceof Error ? err.message : 'Upload failed') }
    finally { setUploading(false) }
  }

  const retryPhoto = () => {
    setPhoto(null)
    setResult(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
      fileInputRef.current.click()
    }
  }

  return <main className="capture-screen">
    <div className="camera-top"><button onClick={onBack} aria-label="Back"><Icon name="arrow" /></button><strong>Photograph sighting</strong><span /></div>
    <div className="viewfinder">
      {preview ? <img src={preview} alt="Selected sighting" style={{width:'100%',height:'100%',objectFit:'contain'}} /> :
        <div className="forest-bg"><div className="tree"/><div className="bug"><i/><i/><b/></div></div>}
      {!preview && <div className="focus-frame"><span/><span/><span/><span/></div>}
      <p>{preview ? 'Selected photograph' : 'Choose a photograph to check for lanternflies'}</p>
    </div>
    <div className="capture-panel">
      <div className="safety"><strong>!</strong><p><b>Stay safe</b><br/>Stay on sidewalks. Never climb or step into roads.</p></div>
      <label htmlFor="photo-upload">Upload a lanternfly photo</label>
      <input ref={fileInputRef} id="photo-upload" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif,.mpo" onChange={e=>{setPhoto(e.target.files?.[0] ?? null);setResult(null);setError(null)}} style={{display:'block',width:'100%',margin:'12px 0',color:'#1f3329'}} />
      <button className="capture-button" disabled={!photo || uploading} onClick={submit}><span><Icon name="camera" /></span>{uploading ? 'Uploading...' : 'Upload & check photo'}</button>
      {error && <p role="alert" style={{color:'#b91c1c',marginTop:12}}>{error}</p>}
      {result && <section aria-live="polite" style={{background:'#fff',borderRadius:14,padding:16,marginTop:16,color:'#1f3329'}}>
        <strong>Photo received — metadata and detection results</strong>
        <p style={{fontSize:13,marginTop:8}}>AI predictions are not confirmed sightings. Detected photos with GPS appear on the development map; no points are awarded yet.</p>
        <div style={{marginTop:12,padding:12,background:'#f0f7f0',borderRadius:8}}>
          <strong>AI lanternfly detection</strong>
          {result.detection.status === 'detected' ? <>
            <p>Possible lanternfly detected ({result.detection.detection_count} bounding box{result.detection.detection_count === 1 ? '' : 'es'}).</p>
            {result.detection.detections.map((d, i) => <p key={i} style={{fontSize:13}}>{d.label}: {(d.confidence * 100).toFixed(1)}% model confidence</p>)}
          </> : result.detection.status === 'not_detected' ?
            <div role="status" style={{marginTop:12,padding:14,background:'#fffbeb',border:'1px solid #fcd34d',borderRadius:10}}>
              <strong style={{color:'#92400e'}}>Unable to Identify a Lanternfly</strong>
              <p style={{marginTop:8,fontSize:14,color:'#92400e'}}>
                We couldn't clearly identify a spotted lanternfly in your photo.
                Try taking another picture with better lighting, keeping the lanternfly in focus and clearly visible.
              </p>
              <p style={{marginTop:8,fontSize:12,color:'#92400e'}}>
                This doesn't mean your photo has no lanternfly—the AI may have missed it.
              </p>
              <button type="button" onClick={retryPhoto} style={{marginTop:12,padding:'10px 16px',background:'#b45309',color:'#fff',border:0,borderRadius:8,cursor:'pointer',fontWeight:600}}>
                Try Another Photo
              </button>
            </div> :
            <p role="status">Detector unavailable. Metadata was still extracted. Check the backend logs.</p>}
          <p style={{fontSize:12}}>Review status: pending. Model predictions require validation before approval.</p>
        </div>
        <p style={{marginTop:8}}>File: {result.metadata.file_name}</p>
        <p>Captured: {result.metadata.timestamp ?? 'Not available in EXIF'}</p>
        <p>Location: {result.metadata.latitude !== null && result.metadata.longitude !== null ? `${result.metadata.latitude}, ${result.metadata.longitude} (${result.metadata.location_source})` : 'No GPS coordinates in photo'}</p>
        <p>Camera: {[result.metadata.camera_make,result.metadata.camera_model].filter(Boolean).join(' ') || 'Unknown'}</p>
        <p>Resolution: {result.metadata.width} × {result.metadata.height}</p>
        <p style={{fontSize:12,marginTop:8}}>Saved locally for development. AI-detected photos with GPS appear on the map after refreshing; not linked to an account or database.</p>
      </section>}
      <p className="gps-note">⌖ Reads existing photo EXIF metadata; no browser location requested.</p>
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
    {view === 'map' && <MapScreen onReport={()=>setView('capture')}/>}
    {view === 'capture' && <Capture onBack={()=>setTab('map')}/>}
    {view === 'verifying' && <Verifying onBack={()=>setView('capture')}/>}
    {view === 'result' && <Result outcome={outcome} stage={stage} onDone={done} onLearn={resultLearn} onTeam={resultTeam} onRetake={()=>setView('capture')}/>}
    {view === 'learn' && <Learn passedLessons={passedLessons} passLesson={passLesson}/>}
    {view === 'teams' && <Teams anonymous={anonymous} teamProgress={teamProgress}/>}
    {view === 'me' && <Profile points={points} reports={reports} passedLessons={passedLessons} reportsThisWeek={reportsThisWeek} eggFound={eggFound} anonymous={anonymous} setAnonymous={setAnonymous}/>}
    {(['map','learn','teams','me'] as string[]).includes(view) && <BottomNav tab={tab} setTab={setTab}/>}
  </div></div>
}