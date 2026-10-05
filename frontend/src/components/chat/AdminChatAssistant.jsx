import React, { useState, useRef, useEffect } from 'react'
import { 
  Terminal, 
  X, 
  Send, 
  Search, 
  LayoutDashboard, 
  ClipboardCheck, 
  Mail, 
  History,
  Activity,
  Zap,
  MoreVertical,
  ChevronRight,
  User,
  ShieldAlert
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { chatbotService } from '../../services/api'
import toast from 'react-hot-toast'

const AdminChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: 'Command Nexus online. Registry access established. Ready for staff directives.'
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState(`admin_session_${Date.now()}`)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) scrollToBottom()
  }, [messages, isOpen])

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
        sessionId: sessionId
      })

      const { response: botContent, intent } = response.data.data
      
      setMessages(prev => [...prev, {
        type: 'bot',
        content: botContent,
        intent: intent
      }])
    } catch (error) {
      toast.error('Nexus sync failure')
      setMessages(prev => [...prev, {
        type: 'bot',
        content: 'System Error: Registry link unstable. Please re-authenticate.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const staffTools = [
    { label: 'Summarize Queue', query: 'Give me a summary of the pending cases.', icon: Activity },
    { label: 'Search Registry', query: 'Search for citizen: ', icon: Search },
    { label: 'Draft Approval', query: 'Draft a standard approval email for a business permit.', icon: Mail },
    { label: 'Review SOP', query: 'Show me the internal SOP for zoning clearance.', icon: ClipboardCheck }
  ]

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className="w-96 h-[700px] max-h-[calc(100vh-6rem)] bg-brand-900 border border-brand-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden mr-4"
          >
            {/* Staff Nexus Header */}
            <div className="p-5 border-b border-brand-800 flex items-center justify-between bg-black/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-600/20 rounded-xl flex items-center justify-center border border-primary-600/30">
                  <Terminal className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <h3 className="text-white font-display font-bold text-sm tracking-tight">Command Nexus</h3>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-1 h-1 bg-primary-400 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">Administrative Access</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-brand-500 hover:text-white p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Workflow Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {messages.map((msg, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-[90%] ${msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                      msg.type === 'user' ? 'bg-primary-900 border-primary-700 text-primary-400' : 'bg-black/40 border-brand-700 text-brand-400'
                    }`}>
                      {msg.type === 'user' ? <User className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                    </div>
                    <div className={`p-4 rounded-2xl text-[13px] leading-relaxed ${
                      msg.type === 'user' 
                        ? 'bg-primary-600 text-white font-medium' 
                        : 'bg-brand-800/50 text-brand-100 border border-brand-700'
                    }`}>
                      <p className="whitespace-pre-line">{msg.content}</p>
                      {msg.intent && (
                        <div className="mt-3 pt-3 border-t border-brand-700 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-brand-500 uppercase tracking-widest">Intent: {msg.intent}</span>
                          <button className="text-[10px] font-bold text-primary-400 hover:text-primary-300 uppercase tracking-widest flex items-center">
                            Copy Data <ChevronRight className="w-3 h-3 ml-1" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-brand-800/50 border border-brand-700 rounded-2xl px-4 py-3">
                    <div className="flex space-x-1.5">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-1.5 h-1.5 bg-brand-600 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Staff Toolbox */}
            <div className="p-6 bg-black/20 border-t border-brand-800">
              <p className="text-[10px] font-bold text-brand-500 uppercase tracking-widest mb-4">Staff Toolbox</p>
              <div className="grid grid-cols-2 gap-3">
                {staffTools.map((tool, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(null, tool.query)}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl border border-brand-700 bg-brand-800/30 hover:bg-brand-800 hover:border-brand-600 transition-all text-center group"
                  >
                    <tool.icon className="w-4 h-4 text-brand-400 group-hover:text-primary-400 mb-2" />
                    <span className="text-[10px] font-bold text-brand-300 uppercase tracking-tight">{tool.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Terminal */}
            <form onSubmit={handleSendMessage} className="p-6 bg-brand-900">
              <div className="relative group">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Enter directive..."
                  className="w-full bg-black/40 border-2 border-brand-800 focus:border-primary-600 rounded-2xl px-5 py-4 text-sm font-mono text-primary-100 placeholder:text-brand-600 outline-none transition-all pr-14"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputMessage.trim()}
                  className="absolute right-2 top-2 bottom-2 w-12 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-2xl shadow-premium flex items-center justify-center transition-all ${
          isOpen ? 'bg-brand-800 text-white' : 'bg-primary-600 text-white'
        }`}
      >
        {isOpen ? <X className="w-8 h-8" /> : <Terminal className="w-8 h-8" />}
      </motion.button>
    </div>
  )
}

export default AdminChatAssistant
