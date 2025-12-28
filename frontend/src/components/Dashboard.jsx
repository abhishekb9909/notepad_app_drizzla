import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Trash2, CheckCircle, Circle, Calendar as CalendarIcon, List } from 'lucide-react'
import CalendarView from './CalendarView'
import AIAssistant from './AIAssistant'

export default function Dashboard({ session }) {
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [newTask, setNewTask] = useState('')
    const [view, setView] = useState('list') // 'list', 'history', 'calendar'

    useEffect(() => {
        fetchTasks()
    }, [])

    const fetchTasks = async () => {
        try {
            // In a real app, we'd filter by user_id from session
            // For now, the backend does a basic check or returns all for demo
            const response = await fetch('http://localhost:8000/tasks/')
            if (response.ok) {
                const data = await response.json()
                setTasks(data)
            }
        } catch (error) {
            console.error('Error fetching tasks:', error)
        } finally {
            setLoading(false)
        }
    }

    const addTask = async (e) => {
        e.preventDefault()
        if (!newTask.trim()) return

        try {
            const response = await fetch('http://localhost:8000/tasks/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: newTask,
                    user_id: session.user.id // Pass ID, backend validates
                }),
            })
            if (response.ok) {
                const task = await response.json()
                setTasks([task, ...tasks])
                setNewTask('')
            }
        } catch (error) {
            console.error('Error adding task:', error)
        }
    }

    const toggleTask = async (id, currentStatus) => {
        try {
            const response = await fetch(`http://localhost:8000/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_done: !currentStatus })
            })
            if (response.ok) {
                setTasks(tasks.map(t => t.id === id ? { ...t, is_done: !currentStatus } : t))
            }
        } catch (error) {
            console.error('Error updating task:', error)
        }
    }

    const deleteTask = async (id) => {
        try {
            await fetch(`http://localhost:8000/tasks/${id}`, { method: 'DELETE' })
            setTasks(tasks.filter(t => t.id !== id))
        } catch (error) {
            console.error('Error deleting task:', error)
        }
    }

    const activeTasks = tasks.filter(t => !t.is_done)
    const historyTasks = tasks.filter(t => t.is_done)

    return (
        <div className="dashboard">
            <div className="header">
                <h1>My Notepad</h1>
                <div className="user-info">
                    <span>{session.user.email}</span>
                    <button onClick={() => supabase.auth.signOut()} style={{ marginLeft: '1rem', background: '#333' }}>
                        Sign Out
                    </button>
                </div>
            </div>

            <div className="nav-tabs">
                <button
                    className={`nav-tab ${view === 'list' ? 'active' : ''}`}
                    onClick={() => setView('list')}
                >
                    <List size={18} style={{ marginRight: 5, verticalAlign: 'middle' }} /> Tasks
                </button>
                <button
                    className={`nav-tab ${view === 'calendar' ? 'active' : ''}`}
                    onClick={() => setView('calendar')}
                >
                    <CalendarIcon size={18} style={{ marginRight: 5, verticalAlign: 'middle' }} /> Calendar
                </button>
                <button
                    className={`nav-tab ${view === 'history' ? 'active' : ''}`}
                    onClick={() => setView('history')}
                >
                    <CheckCircle size={18} style={{ marginRight: 5, verticalAlign: 'middle' }} /> History
                </button>
            </div>

            {view === 'list' && (
                <>
                    <form onSubmit={addTask} style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem' }}>
                        <input
                            style={{ flex: 1 }}
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            placeholder="What needs to be done?"
                        />
                        <button type="submit">Add Task</button>
                    </form>

                    <div className="task-list">
                        {activeTasks.map(task => (
                            <div key={task.id} className="task-card">
                                <div className="task-content">
                                    <h3>{task.title}</h3>
                                </div>
                                <div className="task-actions">
                                    <button className="btn-icon" onClick={() => toggleTask(task.id, task.is_done)}>
                                        <Circle size={20} />
                                    </button>
                                    <button className="btn-icon btn-delete" onClick={() => deleteTask(task.id)}>
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {activeTasks.length === 0 && <p style={{ color: '#666' }}>No active tasks.</p>}
                    </div>
                </>
            )}

            {view === 'history' && (
                <div className="task-list">
                    {historyTasks.map(task => (
                        <div key={task.id} className="task-card" style={{ opacity: 0.7 }}>
                            <div className="task-content">
                                <h3 style={{ textDecoration: 'line-through' }}>{task.title}</h3>
                            </div>
                            <div className="task-actions">
                                <button className="btn-icon" onClick={() => toggleTask(task.id, task.is_done)}>
                                    <CheckCircle size={20} color="var(--success-color)" />
                                </button>
                                <button className="btn-icon btn-delete" onClick={() => deleteTask(task.id)}>
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {historyTasks.length === 0 && <p style={{ color: '#666' }}>No completed tasks.</p>}
                </div>
            )}

            {view === 'calendar' && <CalendarView tasks={tasks} />}

            <AIAssistant tasks={tasks} />
        </div>
    )
}
