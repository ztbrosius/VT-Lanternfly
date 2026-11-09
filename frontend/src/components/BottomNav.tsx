import Icon from './Icon.tsx'
import type { Tab } from '../types.tsx'

const items = [['map', 'map', 'Map'], ['learn', 'book', 'Learn'], ['teams', 'users', 'Teams'], ['me', 'user', 'Me']] as const

export default function BottomNav({ tab, setTab }: { tab: Tab; setTab: (t:Tab)=>void }) {
    return <nav className="bottom-nav">{items.map(([t, ic, label]) =>
        <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
            <Icon name={ic}/>
            <span>
                {label}
            </span>
        </button>
    )} </nav>
}