import {useState} from "react";
import Header from '../components/Header';
import Icon from '../components/Icon';
import '../styles/features.css';
import type { LeaderboardEntry } from '../types';

export default function Teams({ teamsData, teamProgress }: { teamsData: LeaderboardEntry[]; teamProgress: number }) {
    const [segment, setSegment] = useState('Teams')

    return <main className="screen teams-screen">
        <Header title="Leaderboard" eyebrow="TOGETHER, WE SPOT MORE" />
        <div className="segments">
            {['Friends','Teams','Majors','Campus'].map(x => <button className={segment === x ? 'active':''} onClick={() => setSegment(x)} key={x}>{x}</button>)}
        </div>

        <section className="goal-card"><div className="goal-top"><div><small>TEAM GOAL</small><h3>50 egg masses before December</h3></div><div className="goal-icon"><Icon name="trophy"/></div></div><div className="bar"><i style={{width:`${teamProgress/50*100}%`}}/></div><p><b>{teamProgress}/50 found</b><span>{50-teamProgress} to go</span></p></section>
        <div className="rank-heading"><span>RANK</span><span>TEAM / PLAYER</span><span>POINTS</span></div>
        <div className="rank-list">
            {teamsData.length === 0 && <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '24px 0' }}>No verified reports yet. Be the first on the board!</p>}
            {teamsData.map((team, i) => (
                <article className={team.isCurrentUser ? 'is-me' : ''} key={team.name}>
                    <span className={`rank rank-${i}`}>{i+1}</span>
                    <span className="team-avatar">{team.name[0]}</span>
                    <div>
                        <b>{team.name}</b>
                        <small>{team.isCurrentUser ? 'You' : 'Campus member'}</small>
                    </div>
                    <strong>{team.points}</strong>
                </article>
            ))}
        </div>
        <div className="team-actions"><button className="primary"><Icon name="share"/> Invite friends</button><button className="secondary">Create team</button></div>
    </main>
}
