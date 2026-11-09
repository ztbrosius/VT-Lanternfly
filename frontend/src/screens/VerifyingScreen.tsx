import Header from '../components/Header.tsx'

export default function Verifying({ onBack }: { onBack: () => void }) {
    return <main className="screen verifying"><Header title="Checking your photo" onBack={onBack} eyebrow="REPORT IN PROGRESS" />
        <div className="scan-visual"><div className="scan-insect"><i/><i/><b/></div><span className="scan-line"/></div><div className="progress"><i/><i/><i/></div>
        <h2>Checking wing pattern<br/>and body color...</h2><p>This usually takes a few seconds.</p>
        <section className="fact-card"><small>DID YOU KNOW?</small><h3>Lanternflies are drawn to the Tree of Heaven.</h3><p>Look for smooth gray bark and large compound leaves with smooth edges.</p></section>
    </main>
}
