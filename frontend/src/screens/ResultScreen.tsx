import Header from '../components/Header'
import Icon from '../components/Icon'
import type { Outcome } from '../types'
import '../styles/capture.css'

export default function Result({ outcome, stage, onDone, onLearn, onTeam, onRetake }: { outcome: Outcome; stage: string; onDone: () => void; onLearn: () => void; onTeam: () => void; onRetake: () => void }) {
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
