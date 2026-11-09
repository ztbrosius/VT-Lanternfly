import Icon from './Icon'
import '../styles/features.css'

export default function Header({ title, onBack, eyebrow }: { title: string; onBack?: () => void; eyebrow?: string }) {
    return (
        <header className="page-header sticky top-0 bg-white/90 backdrop-blur-md z-50 px-5 -mx-5 mb-4">
            {onBack && <button className="icon-button" onClick={onBack} aria-label="Go back"><Icon name="arrow" /></button>}
            <div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1></div>
            <div className="header-mark" aria-hidden><span>VT</span></div>
        </header>
    )
}