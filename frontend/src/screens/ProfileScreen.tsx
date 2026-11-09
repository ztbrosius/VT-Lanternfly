import {useState} from "react";
import Header from '../components/Header';
import Icon from '../components/Icon';
import '../styles/features.css';

export default function Profile({ points, reports, passedLessons, reportsThisWeek, eggFound, anonymous, setAnonymous }: { points: number; reports: number; passedLessons: number[]; reportsThisWeek: number; eggFound: boolean; anonymous: boolean; setAnonymous: (v:boolean)=>void }) {
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