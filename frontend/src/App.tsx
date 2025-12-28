import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { Session } from '@supabase/supabase-js'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import './index.css'

function App() {
    const [session, setSession] = useState<Session | null>(null)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
        })

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })

        return () => subscription.unsubscribe()
    }, [])

    return (
        <div className="app-container">
            {!session ? (
                <Auth onLogin={() => { }} />
            ) : (
                <Dashboard session={session} />
            )}
        </div>
    )
}

export default App
