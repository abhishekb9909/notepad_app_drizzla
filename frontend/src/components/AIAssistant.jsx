import { useState } from 'react'
import { MessageSquare, X, Send, Bot } from 'lucide-react'

export default function AIAssistant({ tasks = [] }) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
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

        // Format context from tasks
        const taskContext = tasks.length > 0
            ? "User's Current Tasks:\n" + tasks.map(t => `- ${t.title} (Status: ${t.is_done ? 'Done' : 'Pending'}, Due: ${t.due_date ? t.due_date : 'No Date'})`).join('\n')
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
        <div className="ai-assistant">
            {isOpen && (
                <div className="ai-panel">
                    <div className="ai-header">
                        <span>AI Assistant</span>
                        <button className="btn-icon" onClick={() => setIsOpen(false)}><X size={18} /></button>
                    </div>
                    <div className="ai-messages">
                        {messages.map((m, i) => (
                            <div key={i} className={`message ${m.role}`}>
                                {m.content}
                            </div>
                        ))}
                        {loading && <div className="message ai">Thinking...</div>}
                    </div>
                    <div className="ai-input-area">
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && sendMessage()}
                            placeholder="Ask AI..."
                        />
                        <button className="btn-icon" onClick={sendMessage}><Send size={18} /></button>
                    </div>
                </div>
            )}
            <button className="ai-fab" onClick={() => setIsOpen(!isOpen)}>
                <Bot color="white" />
            </button>
        </div>
    )
}
