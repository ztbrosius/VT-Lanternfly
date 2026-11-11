import { useState } from 'react';
import { loginUser, registerUser } from '../services/api';
import type { UserProfile } from '../types';

export default function AuthScreen({ onLogin }: { onLogin: (user: UserProfile) => void}) {
    const [isRegistering, setIsRegistering] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [major, setMajor] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;
        setError(null);
        setSubmitting(true);

        try {
            const user = isRegistering
                ? await registerUser({ email, password, display_name: displayName, major })
                : await loginUser({ email, password });
            onLogin(user);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="screen" style={{ paddingTop: '80px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--maroon)' }}>
                {isRegistering ? 'Join VT Lanternfly' : 'Welcome Back'}
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '24px' }}>
                Track your sightings and protect the campus.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {isRegistering && (
                    <>
                        <input type="text" placeholder="Display Name (e.g. Alex Morgan)" value={displayName}
                               onChange={e => setDisplayName(e.target.value)}
                               required style={{ padding: '14px', borderRadius: '12px', border: '1px solid var(--line)' }}/>
                        <input type="text" placeholder="Major (Optional)" value={major}
                               onChange={e => setMajor(e.target.value)}
                               style={{ padding: '14px', borderRadius: '12px', border: '1px solid var(--line)'}} />
                    </>
                )}

                <input type="email" placeholder="VT Email" value={email}
                       onChange={e => setEmail(e.target.value)}
                       required style={{ padding: '14px', borderRadius: '12px', border: '1px solid var(--line)' }}/>
                <input type="password" placeholder={isRegistering ? 'Password (8+ characters)' : 'Password'} value={password}
                       minLength={isRegistering ? 8 : undefined} autoComplete={isRegistering ? 'new-password' : 'current-password'}
                       onChange={e => setPassword(e.target.value)}
                       required style={{ padding: '14px', borderRadius: '12px', border: '1px solid var(--line)' }}/>

                {error && <p style={{ color: '#b91c1c', fontSize: '12px', margin: 0}}>{error}</p>}

                <button type="submit" className="primary" style={{ marginTop: '8px' }} disabled={submitting}>
                    {submitting ? 'Please wait…' : isRegistering ? 'Create Account' : 'Log In'}
                </button>
            </form>

            <button type="button" onClick={() => { setIsRegistering(!isRegistering); setError(null); }}
                    style={{ width: '100%', background: 'none', border: 'none', color: 'var(--maroon)', marginTop: '20px', fontWeight: 600 }}>
                {isRegistering ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
            </button>
        </main>
    )
}