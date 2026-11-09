import {useEffect, useState} from "react";
import Header from '../components/Header'
import Icon from '../components/Icon'
import '../styles/map.css';

export default function MapScreen({ onReport }: { onReport: () => void }) {
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