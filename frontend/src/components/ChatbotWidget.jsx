import React, { useState, useRef, useEffect } from 'react'
import { 
  MessageSquare, 
  X, 
  Send, 
  Minimize2, 
  Maximize2, 
  Sparkles,
  User,
  Shield,
  Bot,
  ClipboardList,
  Search,
  HelpCircle,
  HeadphonesIcon
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { chatbotService } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const ChatbotWidget = () => {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: '👋 **Hello! I am Citizen Sentinel**, your official AI Assistant for the Municipality of Janiuay Business Permit & Licensing Office (BPLO).\n\nHow can I guide your business permit application or inquiry today?'
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState(`session_${Date.now()}`)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isOpen, isLoading])

  const handleSendMessage = async (e, customMessage = null) => {
    if (e) e.preventDefault()
    const userMessage = customMessage || inputMessage.trim()
    if (!userMessage || isLoading) return

    setInputMessage('')
    setMessages(prev => [...prev, { type: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const response = await chatbotService.sendMessage({
        message: userMessage,
        sessionId: sessionId,
        userId: user?._id || user?.id
      })

      const botContent = response.data?.reply || response.data?.data?.response || response.data?.data?.reply || 'Response received.'
      const escalated = response.data?.data?.escalated || false
      const intent = response.data?.data?.intent || 'chat'
      
      setMessages(prev => [...prev, {
        type: 'bot',
        content: botContent,
        escalated: escalated,
        intent: intent
      }])

      if (escalated) {
        toast.info('Your inquiry has been escalated to our BPLO staff.')
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'bot',
        content: '⚠️ I encountered a temporary connection issue. You can still reach the Janiuay BPLO directly at 📞 **09811568676** or email **bplo.janiuay@gmail.com**.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const quickActions = [
    { label: 'Requirements', icon: ClipboardList, query: 'What documents do I need?' },
    { label: 'Check Status', icon: Search, query: 'What is my permit status?' },
    { label: 'Fee Inquiry', icon: HelpCircle, query: 'How much does a permit cost?' },
    { label: 'Human Help', icon: HeadphonesIcon, query: 'I want to talk to a human agent' }
  ]

  // Render markdown text with bolding and bullet list support cleanly
  const renderMessageContent = (content) => {
    if (!content) return null
    return (
      <div className="whitespace-pre-wrap break-words leading-relaxed text-sm space-y-1">
        {content.split('\n').map((line, lineIdx) => {
          // Parse bold markdown **text**
          const parts = line.split(/(\*\*.*?\*\*)/g)
          return (
            <div key={lineIdx} className={line === '' ? 'h-2' : ''}>
              {parts.map((part, partIdx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={partIdx} className="font-semibold text-brand-900">{part.slice(2, -2)}</strong>
                }
                if (part.startsWith('*') && part.endsWith('*')) {
                  return <em key={partIdx} className="text-brand-700">{part.slice(1, -1)}</em>
                }
                if (part.startsWith('`') && part.endsWith('`')) {
                  return <code key={partIdx} className="px-1 py-0.5 bg-brand-100 rounded text-xs text-primary-700 font-mono">{part.slice(1, -1)}</code>
                }
                return part
              })}
            </div>
          )
        })}
      </div>
    )
  }

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl shadow-xl flex items-center justify-center transition-all group overflow-hidden border-2 border-white/20"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <MessageSquare className="w-7 h-7 relative z-10" />
      </motion.button>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.95 }}
      className={`fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-2xl border border-brand-100 flex flex-col overflow-hidden transition-all duration-300 ${isMinimized ? 'h-16' : 'h-[620px]'}`}
    >
      {/* Premium Header */}
      <div className="bg-brand-900 text-white p-4 flex items-center justify-between relative overflow-hidden border-b border-brand-800">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-transparent pointer-events-none" />
        <div className="flex items-center space-x-3 relative z-10">
          <div className="w-10 h-10 bg-primary-600/30 border border-primary-500/40 rounded-xl flex items-center justify-center backdrop-blur-md">
            <Bot className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-display font-bold text-sm tracking-tight text-white">Citizen Sentinel</h3>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-primary-500/20 text-primary-300 rounded border border-primary-400/30 uppercase">Qwen-7B AI</span>
            </div>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-medium text-brand-300 tracking-wide">Janiuay BPLO Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1 relative z-10">
          <button 
            onClick={() => setIsMinimized(!isMinimized)} 
            className="p-2 text-brand-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title={isMinimized ? "Maximize" : "Minimize"}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => setIsOpen(false)} 
            className="p-2 text-brand-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Chat Canvas */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
            <AnimatePresence mode="popLayout">
              {messages.map((msg, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: msg.type === 'user' ? 15 : -15, y: 10 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2.5 max-w-[88%] ${msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm ${
                      msg.type === 'user' ? 'bg-primary-600 text-white' : 'bg-brand-900 text-white border border-brand-800'
                    }`}>
                      {msg.type === 'user' ? <User className="w-4 h-4" /> : <Shield className="w-4 h-4 text-primary-400" />}
                    </div>
                    <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                      msg.type === 'user' 
                        ? 'bg-primary-600 text-white rounded-tr-none' 
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                    }`}>
                      {renderMessageContent(msg.content)}
                      {msg.escalated && (
                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center text-[10px] font-bold text-amber-600 uppercase tracking-tight">
                          <Sparkles className="w-3 h-3 mr-1.5" /> Escalated to BPLO Officer
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-brand-900 text-white flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4 text-primary-400" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 flex items-center space-x-2 shadow-sm">
                    <div className="flex space-x-1">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                    <span className="text-xs text-slate-500 font-medium">Sentinel is thinking...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Chips */}
          <div className="px-4 py-3 bg-white border-t border-slate-100">
            <div className="grid grid-cols-2 gap-1.5">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(null, action.query)}
                  disabled={isLoading}
                  className="flex items-center space-x-2 p-2 rounded-xl border border-slate-200 hover:border-primary-400 hover:bg-primary-50/50 transition-all text-left group disabled:opacity-50"
                >
                  <action.icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary-600" />
                  <span className="text-[11px] font-semibold text-slate-700 group-hover:text-primary-700 tracking-tight truncate">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200">
            <div className="relative group">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about requirements, fees, permits..."
                disabled={isLoading}
                className="w-full bg-slate-50 border border-slate-200 focus:border-primary-500 focus:bg-white rounded-2xl px-4 py-3 text-sm font-medium outline-none transition-all pr-12 text-slate-800 placeholder-slate-400"
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="absolute right-1.5 top-1.5 bottom-1.5 w-10 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-all shadow-md shadow-primary-500/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-2 text-[10px] text-center text-slate-400 font-medium tracking-wide">
              Official Janiuay LGU Assistant • Powered by Ollama Qwen 7B
            </p>
          </form>
        </>
      )}
    </motion.div>
  )
}

export default ChatbotWidget
