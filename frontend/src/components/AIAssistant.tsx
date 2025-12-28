import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, X, Send, Loader2 } from 'lucide-react'
import { Task } from '../types'

interface AIAssistantProps {
    tasks: Task[]
    onCreateTask: (title: string, content?: string, due_date?: string) => Promise<void>
    onUpdateTask: (id: string, updates: any) => Promise<void>
    onDeleteTask: (id: string) => Promise<void>
}

// Frontend AI parser
function parseAIResponse(response: string): { type: 'text' | 'action', action?: any, text: string } {
    try {
        // Try to find JSON in the response
        const jsonMatch = response.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0])
            if (parsed.action === 'create_task' && parsed.title) {
                return {
                    type: 'action',
                    action: parsed,
                    text: response
                }
            }
        }
    } catch (e) {
        // Not JSON, treat as text
    }

    return { type: 'text', text: response }
}

// Parse relative dates
function parseRelativeDate(dateStr: string): string {
    const lower = dateStr.toLowerCase().trim()
    const now = new Date()

    if (lower === 'today') return now.toISOString()
    if (lower === 'tomorrow') {
        now.setDate(now.getDate() + 1)
        return now.toISOString()
    }
    if (lower === 'next week') {
        now.setDate(now.getDate() + 7)
        return now.toISOString()
    }

    // Check for "in X days"
    const daysMatch = lower.match(/in (\d+) days?/)
    if (daysMatch) {
        now.setDate(now.getDate() + parseInt(daysMatch[1]))
        return now.toISOString()
    }

    return dateStr
}

export default function AIAssistant({ tasks, onCreateTask, onUpdateTask, onDeleteTask }: AIAssistantProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
        { role: 'ai', content: 'Hi! I can help you manage your tasks. Try saying "Create a task to buy groceries tomorrow".' }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)

    const sendMessage = async () => {
        if (!input.trim()) return

        const userMsg = { role: 'user', content: input }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setLoading(true)

        const taskContext = tasks.length > 0
            ? "User's Current Tasks:\n" + tasks.map((t, i) => `${i + 1}. ${t.title} (ID: ${t.id}, Status: ${t.is_done ? 'Done' : 'Pending'}, Due: ${t.due_date || 'No Date'})`).join('\n')
            : "The user has no tasks currently."

        try {
            const response = await fetch('http://localhost:8000/llm/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: input,
                    context: taskContext
                })
            })
            const data = await response.json()

            // Parse the AI response in frontend
            const parsed = parseAIResponse(data.response)

            if (parsed.type === 'action' && parsed.action) {
                // Execute the action
                try {
                    if (parsed.action.action === 'create_task') {
                        const dueDate = parsed.action.due_date ? parseRelativeDate(parsed.action.due_date) : undefined
                        await onCreateTask(parsed.action.title, parsed.action.content, dueDate)
                        setMessages(prev => [...prev, {
                            role: 'ai',
                            content: `✅ Created task: "${parsed.action.title}"${dueDate ? ` (Due: ${new Date(dueDate).toLocaleDateString()})` : ''}`
                        }])
                    }
                } catch (error) {
                    setMessages(prev => [...prev, { role: 'ai', content: `❌ Error: ${error}` }])
                }
            } else {
                // Just text response
                setMessages(prev => [...prev, { role: 'ai', content: data.response }])
            }
        } catch (error) {
            console.error('Error:', error)
            setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error.' }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed bottom-8 right-8 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="absolute bottom-20 right-0 w-96 h-[500px] bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden"
                    >
                        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-600/20 to-purple-600/20">
                            <h3 className="font-semibold text-white">AI Assistant</h3>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((m, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[80%] p-3 rounded-lg ${m.role === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-800 text-slate-200'
                                        }`}>
                                        {m.content}
                                    </div>
                                </motion.div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-800 text-slate-200 p-3 rounded-lg flex items-center gap-2">
                                        <Loader2 className="animate-spin" size={16} />
                                        Thinking...
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                            <div className="flex gap-2">
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
                                    placeholder="Try: 'Add task to call mom tomorrow'"
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-400 disabled:opacity-50"
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={loading}
                                    className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <Send size={20} className="text-white" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
            >
                <Bot size={24} className="text-white" />
            </motion.button>
        </div>
    )
}
