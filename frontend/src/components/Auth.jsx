import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth({ onLogin }) {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSignUp, setIsSignUp] = useState(false)
    const [error, setError] = useState(null)

    const handleAuth = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                })
                if (error) throw error
                alert('Check your email for the login link!')
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                onLogin()
            }
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-container">
            <h2>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
            <form onSubmit={handleAuth} className="auth-form">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
                </button>
            </form>
            {error && <p style={{ color: 'var(--danger-color)' }}>{error}</p>}
            <p style={{ marginTop: '1rem', cursor: 'pointer', fontSize: '0.9rem' }} onClick={() => setIsSignUp(!isSignUp)}>
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </p>
        </div>
    )
}
