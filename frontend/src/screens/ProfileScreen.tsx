import Header from '../components/Header';
import Icon from '../components/Icon';
import type { UserProfile } from '../types.tsx';
import '../styles/features.css';

export default function ProfileScreen({ user, onUpdateSettings }: { user: UserProfile; onUpdateSettings: (key: string, val: boolean) => void }) {
    const hasBadge = user.passedLessons.length === 3
    const badgeList: [string, string, boolean][] = [
        ['Field Expert', 'trophy', hasBadge || user.badges.includes('Field Expert')],
        ['First Squash', 'check', user.reportsTotal > 0 || user.badges.includes('First Squash')],
        ['Recruiter', 'users', user.badges.includes('Recruiter')],
        ['Egg Hunter', 'leaf', user.eggFound || user.badges.includes('Egg Hunter')],
    ]
    const earnedCount = badgeList.filter(([, , on]) => on).length

    const initials = user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0,2);

    return <main className="screen profile-screen">
        <Header title="My field log" eyebrow="PROFILE" />
        <section className="profile-hero">
            <div className="avatar">
                {initials}
                <span>
                    {user.streak}
                </span>
            </div>
            <h2>{user.anonymous ? 'Anonymous Hokie' : user.displayName}</h2>
            <p>{user.major ? user.major : 'Virginia Tech Student'}</p>

            <div className="profile-stats">
                <div><b>#{user.rank}</b>
                    <span>Campus rank</span>
                </div>
                <div><b>{user.points}</b>
                    <span>Points</span>
                </div>
                <div>
                    <b><Icon name="flame" size={17}/>{user.streak}</b><span>Day streak</span>
                </div>
            </div>
        </section>
        <div className="section-title">
            <div>
                <small>ACHIEVEMENTS</small>
                <h2>Badges</h2></div><span>{earnedCount} of {badgeList.length}</span></div>
        <div className="badge-grid">{badgeList.map(([n,ic,on]) => <article className={on ? 'earned':'locked'} key={String(n)}><div><Icon name={String(ic)}/></div><b>{n}</b><small>{on ? 'Earned' : 'Locked'}</small></article>)}</div>
        <section className="learn-progress-card">
            <div>
                <small>LEARN PROGRESS</small>
                <b>{user.passedLessons.length}/3 quizzes passed</b>
            </div>

            <div className="bar">
                <i style={{width: `${user.passedLessons.length / 3 * 100}%`}} />
            </div>
            <p>{hasBadge ? 'Field Expert earned' : 'Pass all three to earn Field Expert'}</p>
        </section>
        <div className="section-title">
            <div>
                <small>CONTRIBUTIONS</small>
                <h2>My reports</h2></div>
            <span>{user.reportsTotal} verified</span>
        </div>
        <section className="report-summary">
            <div>
                <span>◆</span><b>{user.reportsByStage.adult}</b><small>Adults</small>
            </div>
            <div><span>✣</span><b>{user.reportsByStage.nymph}</b><small>Nymphs</small></div>
            <div><span>≋</span><b>{user.reportsByStage.eggMass}</b><small>Egg masses</small></div>
        </section>
        <div className="section-title">
            <div><small>THIS WEEK</small>
                <h2>Personal goals</h2>
            </div>
        </div>
        <section className="personal-goals">{[
            ['Report 3 verified lanternflies this week', `${Math.min(user.reportsThisWeek, 3)}/3`, user.reportsThisWeek >= 3],
            ['Find and scrape 1 egg mass', user.eggFound ? '1/1' : '0/1', user.eggFound],
            ['Complete a Learn quiz', user.passedLessons.length ? '1/1' : '0/1', user.passedLessons.length > 0],
            ['Invite 1 friend', '0/1', false],
        ].map(([label, count, complete]) => <div key={String(label)} className={complete ? 'complete' : ''}><span>{complete ? <Icon name="check" size={16}/> : ''}</span><b>{label}</b><small>{count}</small></div>)}
        </section>

        <div className="section-title">
            <div><small>SETTINGS</small><h2>Privacy</h2></div></div>
        <section className="settings"><label><div><b>Appear anonymous</b>
            <small>On public leaderboards</small></div><input type="checkbox" checked={user.anonymous} onChange={e=>onUpdateSettings('anonymous', e.target.checked)}/><i/></label><label>
            <div>
                <b>Share data with VT researchers</b><small>Helps improve campus response</small>
            </div><input type="checkbox" checked={user.shareWithResearchers} onChange={e=>onUpdateSettings('shareWithResearchers', e.target.checked)}/><i/></label>
        </section>
    </main>
}