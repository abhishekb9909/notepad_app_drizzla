import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'

function App() {
  const [session, setSession] = useState(null)

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
    <>
      <div className="app-container">
        {!session ? (
          <Auth onLogin={() => { }} />
        ) : (
          <Dashboard session={session} />
        )}
      </div>
    </>
  )
}

export default App
