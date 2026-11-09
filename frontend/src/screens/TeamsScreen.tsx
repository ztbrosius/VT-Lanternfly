import {useState} from "react";
import Header from '../components/Header';
import Icon from '../components/Icon';
import '../styles/features.css';

export default function Teams({ anonymous, teamProgress }: { anonymous: boolean; teamProgress: number }) {
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
