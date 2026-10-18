import React, { useState, useRef, useEffect } from 'react'
import { 
  Terminal, 
  X, 
  Send, 
  Search, 
  ClipboardCheck, 
  Mail, 
  Activity, 
  Zap, 
  ChevronRight, 
  User 
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
    { label: 'Search Registry', query: 'Search registry', icon: Search },
    { label: 'Draft Approval', query: 'Draft a standard approval email for a business permit.', icon: Mail },
    { label: 'Review SOP', query: 'Show me the internal SOP for zoning clearance.', icon: ClipboardCheck }
  ]

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-x-2 bottom-2 sm:inset-auto sm:bottom-24 sm:right-6 z-50 w-auto sm:w-96 max-w-[calc(100vw-1rem)] sm:max-w-md h-[calc(100dvh-1rem)] sm:h-[620px] max-h-[720px] bg-brand-900 border border-brand-800 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Staff Nexus Header */}
            <div className="p-4 sm:p-5 border-b border-brand-800 flex items-center justify-between bg-black/30 shrink-0">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary-600/20 rounded-xl flex items-center justify-center border border-primary-600/30 shrink-0">
                  <Terminal className="w-5 h-5 text-primary-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-display font-bold text-sm tracking-tight truncate">Command Nexus</h3>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest truncate">Administrative Access</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-brand-400 hover:text-white p-2 rounded-lg hover:bg-brand-800/60 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Workflow Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 scrollbar-thin">
              {messages.map((msg, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2.5 sm:space-x-3 max-w-[92%] sm:max-w-[90%] ${msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                      msg.type === 'user' ? 'bg-primary-900 border-primary-700 text-primary-400' : 'bg-black/40 border-brand-700 text-brand-400'
                    }`}>
                      {msg.type === 'user' ? <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    </div>
                    <div className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-[13px] leading-relaxed break-words overflow-hidden ${
                      msg.type === 'user' 
                        ? 'bg-primary-600 text-white font-medium' 
                        : 'bg-brand-800/60 text-brand-100 border border-brand-700'
                    }`}>
                      <p className="whitespace-pre-line">{msg.content}</p>
                      {msg.intent && (
                        <div className="mt-2.5 pt-2.5 border-t border-brand-700 flex items-center justify-between">
                          <span className="text-[9px] sm:text-[10px] font-bold text-brand-400 uppercase tracking-widest">Intent: {msg.intent}</span>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(msg.content)
                              toast.success('Copied to clipboard')
                            }}
                            className="text-[9px] sm:text-[10px] font-bold text-primary-400 hover:text-primary-300 uppercase tracking-widest flex items-center"
                          >
                            Copy <ChevronRight className="w-3 h-3 ml-0.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-brand-800/60 border border-brand-700 rounded-2xl px-4 py-3">
                    <div className="flex space-x-1.5">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Staff Toolbox */}
            <div className="p-3 sm:p-4 bg-black/20 border-t border-brand-800 shrink-0">
              <p className="text-[9px] sm:text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-2 sm:mb-3">Staff Quick Directives</p>
              <div className="grid grid-cols-2 gap-2">
                {staffTools.map((tool, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(null, tool.query)}
                    className="flex items-center space-x-2 p-2 sm:p-2.5 rounded-xl border border-brand-700 bg-brand-800/40 hover:bg-brand-800 hover:border-brand-600 transition-all text-left group overflow-hidden"
                  >
                    <tool.icon className="w-3.5 h-3.5 text-brand-400 group-hover:text-primary-400 shrink-0" />
                    <span className="text-[10px] sm:text-[11px] font-bold text-brand-200 uppercase tracking-tight truncate">{tool.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Terminal */}
            <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-brand-900 border-t border-brand-800 shrink-0">
              <div className="relative group flex items-center">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Enter directive or query..."
                  className="w-full bg-black/50 border border-brand-700 focus:border-primary-500 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-mono text-primary-100 placeholder:text-brand-500 outline-none transition-all pr-12"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputMessage.trim()}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white rounded-lg flex items-center justify-center transition-all"
                  title="Send Directive"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shadow-premium flex items-center justify-center transition-all ${
          isOpen ? 'hidden sm:flex bg-brand-800 text-white' : 'flex bg-primary-600 text-white hover:bg-primary-500'
        }`}
        title="Open Command Nexus"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Terminal className="w-6 h-6" />}
      </motion.button>
    </>
  )
}

export default AdminChatAssistant
