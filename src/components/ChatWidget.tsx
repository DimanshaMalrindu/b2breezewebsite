import { useState, useRef, useEffect } from 'react'
import '../App.css'

interface Message {
    id: string
    role: 'user' | 'bot'
    text: string
}

// Simple placeholder bot logic (can be replaced with real backend)
function generateBotReply(input: string): string {
    const lower = input.toLowerCase()
    if (lower.includes('price') || lower.includes('cost')) return 'Our pricing is tailored by usage and seats—drop your email and we will follow up with a custom quote.'
    if (lower.includes('hello') || lower.includes('hi')) return 'Hi there! How can I help you with B2Breeze today?'
    if (lower.includes('feature')) return 'Key pillars: Collaboration, Visibility, Automation, Partner Intelligence. Ask about any for more detail.'
    if (lower.includes('demo')) return 'Happy to set up a demo—leave your company name and preferred time.'
    return "Thanks for your message! A human will review if the assistant can't fully answer."
}

export default function ChatWidget() {
    const [open, setOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([{
        id: 'welcome', role: 'bot', text: 'Welcome! Ask me about features, pricing, or request a demo.'
    }])
    const [input, setInput] = useState('')
    const listRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight
        }
    }, [messages, open])

    const send = () => {
        const trimmed = input.trim()
        if (!trimmed) return
        const userMsg: Message = { id: Date.now() + '-u', role: 'user', text: trimmed }
        setMessages(m => [...m, userMsg])
        setInput('')
        setTimeout(() => {
            const reply: Message = { id: Date.now() + '-b', role: 'bot', text: generateBotReply(trimmed) }
            setMessages(m => [...m, reply])
        }, 450)
    }

    const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
    }

    return (
        <div className={'chat-root' + (open ? ' open' : '')}>
            {!open && (
                <button aria-label="Open chat" className="chat-fab" onClick={() => setOpen(true)}>💬</button>
            )}
            {open && (
                <div className="chat-window" role="dialog" aria-label="Customer support chat" aria-modal="false">
                    <header className="chat-header">
                        <strong>Support</strong>
                        <button className="chat-close" aria-label="Close chat" onClick={() => setOpen(false)}>×</button>
                    </header>
                    <div className="chat-messages" ref={listRef}>
                        {messages.map(msg => (
                            <div key={msg.id} className={'chat-msg ' + msg.role}>
                                <div className="bubble">{msg.text}</div>
                            </div>
                        ))}
                    </div>
                    <div className="chat-input-row">
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKey}
                            placeholder="Type your message..."
                            aria-label="Chat message"
                        />
                        <button className="send-btn" onClick={send} disabled={!input.trim()}>Send</button>
                    </div>
                    <p className="chat-handoff">Need a human? Leave your email and we’ll follow up.</p>
                </div>
            )}
        </div>
    )
}
