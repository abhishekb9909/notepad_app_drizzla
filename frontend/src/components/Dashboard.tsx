import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { Session } from '@supabase/supabase-js'
import { Task } from '../types'
import { Trash2, CheckCircle, Circle, Calendar, List, LogOut, Plus } from 'lucide-react'
import CalendarView from './CalendarView'
import AIAssistant from './AIAssistant'

interface DashboardProps {
    session: Session
}

export default function Dashboard({ session }: DashboardProps) {
    const [tasks, setTasks] = useState<Task[]>([])
    const [newTask, setNewTask] = useState('')
    const [view, setView] = useState<'list' | 'history' | 'calendar'>('list')
    const [calendarEvents, setCalendarEvents] = useState<any[]>([])

    useEffect(() => {
        fetchTasks()
    }, [])

    const fetchTasks = async () => {
        try {
            const response = await fetch('http://localhost:8000/tasks/')
            if (response.ok) {
                const data = await response.json()
                setTasks(data)
            }
        } catch (error) {
            console.error('Error fetching tasks:', error)
        }
    }

    const fetchCalendarEvents = async () => {
        try {
            const response = await fetch('http://localhost:8000/calendar/events')
            if (response.ok) {
                const data = await response.json()
                setCalendarEvents(data)
            }
        } catch (error) {
            console.error('Error fetching calendar events:', error)
        }
    }

    useEffect(() => {
        if (view === 'calendar') {
            fetchCalendarEvents()
        }
    }, [view])

    const addTask = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newTask.trim()) return

        try {
            const response = await fetch('http://localhost:8000/tasks/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newTask
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

    const createTaskFromAI = async (title: string, content?: string, due_date?: string) => {
        try {
            // Build request body - only include defined values
            const taskData: any = { title }
            if (content) taskData.content = content
            if (due_date) taskData.due_date = due_date

            const response = await fetch('http://localhost:8000/tasks/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData),
            })
            if (response.ok) {
                const task = await response.json()
                setTasks([task, ...tasks])
            } else {
                const errorText = await response.text()
                console.error('Backend error:', errorText)
                throw new Error(`Backend returned ${response.status}`)
            }
        } catch (error) {
            console.error('Error adding task:', error)
            throw error
        }
    }

    const updateTaskFromAI = async (id: string, updates: any) => {
        try {
            const response = await fetch(`http://localhost:8000/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            })
            if (response.ok) {
                const updatedTask = await response.json()
                setTasks(tasks.map(t => t.id === id ? updatedTask : t))
            }
        } catch (error) {
            console.error('Error updating task:', error)
            throw error
        }
    }

    const deleteTaskFromAI = async (id: string) => {
        try {
            await fetch(`http://localhost:8000/tasks/${id}`, { method: 'DELETE' })
            setTasks(tasks.filter(t => t.id !== id))
        } catch (error) {
            console.error('Error deleting task:', error)
            throw error
        }
    }

    const toggleTask = async (id: string, currentStatus: boolean) => {
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

    const deleteTask = async (id: string) => {
        try {
            await fetch(`http://localhost:8000/tasks/${id}`, { method: 'DELETE' })
            setTasks(tasks.filter(t => t.id !== id))
        } catch (error) {
            console.error('Error deleting task:', error)
        }
    }

    const activeTasks = tasks.filter(t => !t.is_done)
    const historyTasks = tasks.filter(t => t.is_done)

    const tabs = [
        { id: 'list', label: 'Tasks', icon: List },
        { id: 'calendar', label: 'Calendar', icon: Calendar },
        { id: 'history', label: 'History', icon: CheckCircle },
    ]

    return (
        <div className="min-h-screen bg-slate-950 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-2">
                            My Notepad
                        </h1>
                        <p className="text-slate-400">{session.user.email}</p>
                    </div>
                    <button
                        onClick={() => supabase.auth.signOut()}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setView(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${view === tab.id
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {view === 'list' && (
                    <div className="space-y-6">
                        <form onSubmit={addTask} className="flex gap-4">
                            <input
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                placeholder="What needs to be done?"
                                className="flex-1 px-6 py-4 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-400"
                            />
                            <button
                                type="submit"
                                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all transform hover:scale-[1.02] flex items-center gap-2"
                            >
                                <Plus size={20} />
                                Add Task
                            </button>
                        </form>

                        <div className="space-y-4">
                            {activeTasks.map((task, index) => (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl p-6 hover:border-blue-500/50 transition-all group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-medium text-white">{task.title}</h3>
                                            {task.due_date && (
                                                <p className="text-sm text-slate-400 mt-1">
                                                    Due: {new Date(task.due_date).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => toggleTask(task.id, task.is_done)}
                                                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                                            >
                                                <Circle size={20} className="text-slate-400 group-hover:text-blue-500" />
                                            </button>
                                            <button
                                                onClick={() => deleteTask(task.id)}
                                                className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={20} className="text-slate-400 hover:text-red-500" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {activeTasks.length === 0 && (
                                <p className="text-center text-slate-500 py-12">No active tasks. Add one to get started!</p>
                            )}
                        </div>
                    </div>
                )}

                {view === 'history' && (
                    <div className="space-y-4">
                        {historyTasks.map((task, index) => (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-slate-900/30 backdrop-blur-xl border border-slate-800 rounded-xl p-6 opacity-75"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-medium text-slate-400 line-through">{task.title}</h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => toggleTask(task.id, task.is_done)}
                                            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                                        >
                                            <CheckCircle size={20} className="text-green-500" />
                                        </button>
                                        <button
                                            onClick={() => deleteTask(task.id)}
                                            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={20} className="text-slate-400 hover:text-red-500" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {historyTasks.length === 0 && (
                            <p className="text-center text-slate-500 py-12">No completed tasks yet.</p>
                        )}
                    </div>
                )}

                {view === 'calendar' && <CalendarView events={calendarEvents} />}
            </div>

            <AIAssistant
                tasks={tasks}
                onCreateTask={createTaskFromAI}
                onUpdateTask={updateTaskFromAI}
                onDeleteTask={deleteTaskFromAI}
            />
        </div>
    )
}
