import type { ReactNode } from 'react';

export default function Icon({ name, size = 22 }: { name: string; size?: number }) {
    const paths: Record<string, React.ReactNode> = {
        map: <><path d="m3 6 5-3 8 3 5-3v15l-5 3-8-3-5 3Z"/><path d="M8 3v15M16 6v15"/></>,
        book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5Z"/><path d="M4 6.5v13"/></>,
        users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
        user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
        camera: <><path d="M14.5 4 16 7h4a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h4l1.5-3Z"/><circle cx="12" cy="13" r="3"/></>,
        arrow: <path d="m15 18-6-6 6-6"/>,
        check: <path d="m5 12 4 4L19 6"/>,
        trophy: <><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0Z"/><path d="M7 6H4v2a4 4 0 0 0 4 4M17 6h3v2a4 4 0 0 1-4 4"/></>,
        flame: <path d="M12 22c4 0 7-3 7-7 0-3-2-6-5-9 0 3-2 4-3 5 0-3-1-6-3-9 0 5-3 7-3 12 0 4 3 8 7 8Z"/>,
        share: <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4"/></>,
        leaf: <><path d="M11 20A7 7 0 0 1 9.8 6.1C15 2 21 3 21 3s1 6-3.1 11.2A7 7 0 0 1 11 20Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6.94C9.8 12.73 12 10 13 8"/></>,
        chevron: <path d="m9 18 6-6-6-6"/>,
    }
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{paths[name]}</svg>
}
