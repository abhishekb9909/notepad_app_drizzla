import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, X, Send } from 'lucide-react'
import { Task } from '../types'

interface AIAssistantProps {
    tasks: Task[]
}

export default function AIAssistant({ tasks }: AIAssistantProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
        { role: 'ai', content: 'Hi! I can help you organize your tasks. What would you like to know?' }
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
            ? "User's Current Tasks:\n" + tasks.map(t => `- ${t.title} (Status: ${t.is_done ? 'Done' : 'Pending'}, Due: ${t.due_date || 'No Date'})`).join('\n')
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

            setMessages(prev => [...prev, { role: 'ai', content: data.response }])
        } catch (error) {
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
                                    <div className="bg-slate-800 text-slate-200 p-3 rounded-lg">
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
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                    placeholder="Ask AI..."
                                    className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-400"
                                />
                                <button
                                    onClick={sendMessage}
                                    className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
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
