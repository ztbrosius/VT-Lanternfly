import {useEffect, useState} from "react";
import Icon from '../components/Icon';
import BottomNav from '../components/BottomNav';

export default function WireframePrototype({ onExit }: { onExit: () => void }) {
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