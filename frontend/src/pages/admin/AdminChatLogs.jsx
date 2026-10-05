import React, { useState, useEffect } from 'react'
import { 
  MessageSquare, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  Filter,
  ArrowRight,
  User,
  Clock,
  BarChart3,
  MessageCircle,
  HelpCircle,
  Download,
  Shield,
  Zap,
  ChevronRight,
  ChevronLeft,
  X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminService } from '../../services/api'
import { Card, CardHeader, CardBody } from '../../components/shared/Card'
import Button from '../../components/shared/Button'
import Badge from '../../components/shared/Badge'
import LoadingSpinner from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'

const AdminChatLogs = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all') // all, escalated, resolved
  const [selectedChat, setSelectedChat] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [resolution, setResolution] = useState('')
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 })

  useEffect(() => {
    fetchLogs()
  }, [filter, searchTerm, pagination.current])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.current,
        limit: 15,
        search: searchTerm,
        escalated: filter === 'escalated' ? 'true' : filter === 'resolved' ? '' : '',
        resolved: filter === 'resolved' ? 'true' : ''
      }
      const response = await adminService.getChatLogs(params)
      setLogs(response.data.data.chatLogs)
      setPagination(response.data.data.pagination)
    } catch (error) {
      toast.error('Failed to sync chat intelligence')
    } finally {
      setLoading(false)
    }
  }

  const handleResolve = async (id) => {
    if (!resolution.trim()) {
      toast.error('Resolution notes required')
      return
    }
    try {
      await adminService.resolveChatLog(id, resolution)
      toast.success('Incident resolved and archived.')
      fetchLogs()
      setShowModal(false)
      setResolution('')
    } catch (error) {
      toast.error('Resolution failed')
    }
  }

  const handleExport = () => {
    // Basic CSV export logic
    const headers = ['Date', 'User', 'Role', 'Status', 'Messages']
    const rows = logs.map(l => [
      new Date(l.createdAt).toISOString(),
      l.userId?.email || 'Anonymous',
      l.role,
      l.resolved ? 'Resolved' : l.escalated ? 'Escalated' : 'Managed',
      l.messages.length
    ])
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `chat_audit_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    toast.success('Audit trail exported')
  }

  return (
    <div className="min-h-screen bg-brand-50/50 pb-20">
      <div className="bg-white border-b border-brand-100 pt-8 pb-12">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="primary">Mission Control</Badge>
                <span className="text-brand-300">/</span>
                <span className="text-[11px] font-bold text-brand-400 uppercase tracking-widest">Intelligence Pulse</span>
              </div>
              <h1 className="text-4xl font-display font-bold text-brand-900 tracking-tight">Chat Intelligence</h1>
              <p className="text-brand-500 mt-2">Oversee automated interactions and manage high-priority escalations.</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="secondary" size="sm" onClick={handleExport} icon={Download}>Export Audit</Button>
              <Button variant="primary" size="sm" onClick={fetchLogs} icon={TrendingUp}>Refresh Sync</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-8">
        {/* Core Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Registry Interactions', value: pagination.total, icon: MessageCircle, color: 'text-primary-600', bg: 'bg-primary-50' },
            { label: 'Active Escalations', value: logs.filter(l => l.escalated && !l.resolved).length, icon: AlertCircle, color: 'text-warning-600', bg: 'bg-warning-50' },
            { label: 'System Resolutions', value: logs.filter(l => l.resolved).length, icon: CheckCircle2, color: 'text-success-600', bg: 'bg-success-50' },
            { label: 'Mean Response', value: '0.9s', icon: Zap, color: 'text-brand-600', bg: 'bg-brand-50' }
          ].map((stat, i) => (
            <Card key={i}>
              <CardBody className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-2xl font-display font-bold text-brand-900">{stat.value}</p>
                </div>
                <div className={`p-4 ${stat.bg} rounded-2xl`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Intelligence Ledger */}
        <Card>
          <CardHeader 
            title="Interaction Ledger" 
            subtitle="Deep audit of Citizen Sentinel and Command Nexus streams"
            action={
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
                  <input 
                    type="text" 
                    placeholder="Search queries..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-brand-50 border-none text-xs font-medium px-10 py-2 rounded-xl focus:ring-2 focus:ring-primary-500 w-64 transition-all"
                  />
                </div>
                <select 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-brand-50 border-none text-[11px] font-bold text-brand-600 uppercase tracking-widest px-4 py-2 rounded-xl outline-none cursor-pointer"
                >
                  <option value="all">Global Stream</option>
                  <option value="escalated">Escalated Only</option>
                  <option value="resolved">Resolved Hub</option>
                </select>
              </div>
            }
          />
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-brand-50/50 border-b border-brand-100">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold text-brand-400 uppercase tracking-widest">Session ID</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-brand-400 uppercase tracking-widest">Entity / Role</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-brand-400 uppercase tracking-widest">Sentinel Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-brand-400 uppercase tracking-widest">Pulse / Latency</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-brand-400 uppercase tracking-widest text-right">Directives</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-50">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-20 text-center"><LoadingSpinner /></td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center">
                          <HelpCircle className="w-12 h-12 text-brand-100 mb-4" />
                          <p className="text-brand-400 font-bold uppercase tracking-widest text-xs">No active streams detected</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    logs.map((log, idx) => (
                      <motion.tr 
                        key={log._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-brand-50/30 transition-colors group cursor-pointer"
                        onClick={() => { setSelectedChat(log); setShowModal(true); }}
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                              log.role === 'public' ? 'bg-brand-50 border-brand-100 text-brand-600' : 'bg-primary-50 border-primary-100 text-primary-600'
                            }`}>
                              {log.role === 'public' ? <User className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                            </div>
                            <div>
                              <p className="font-bold text-brand-900 text-sm tracking-tight">{log.sessionId.slice(0, 12)}...</p>
                              <p className="text-[10px] text-brand-400 font-bold uppercase tracking-tight">{log.userInfo?.ip || 'Internal System'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <Badge variant={log.role === 'public' ? 'neutral' : 'primary'}>{log.role === 'public' ? 'Citizen' : 'Staff Operative'}</Badge>
                        </td>
                        <td className="px-6 py-5">
                          {log.resolved ? (
                            <Badge variant="success">Resolved Hub</Badge>
                          ) : log.escalated ? (
                            <Badge variant="warning">Manual Escalation</Badge>
                          ) : (
                            <Badge variant="neutral">AI Managed</Badge>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center text-[11px] text-brand-600 font-bold uppercase tracking-tight">
                              <Clock className="w-3.5 h-3.5 mr-1.5 text-brand-300" />
                              {new Date(log.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="flex items-center text-[10px] text-brand-400 font-bold uppercase tracking-widest">
                              <TrendingUp className="w-3 h-3 mr-1 text-success-500" /> 
                              {log.messages[log.messages.length - 1]?.metadata?.responseTime || '850'}ms
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="secondary" size="xs">Audit Transcript</Button>
                            {log.escalated && !log.resolved && (
                              <div className="w-2 h-2 bg-warning-500 rounded-full animate-ping" />
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            <div className="px-6 py-4 bg-brand-50/30 border-t border-brand-100 flex items-center justify-between">
              <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">
                Showing {logs.length} of {pagination.total} intelligence pulses
              </p>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="secondary" 
                  size="xs" 
                  disabled={pagination.current === 1}
                  onClick={() => setPagination(p => ({ ...p, current: p.current - 1 }))}
                  icon={ChevronLeft}
                />
                <span className="text-xs font-bold text-brand-600 px-3">Page {pagination.current} of {pagination.pages}</span>
                <Button 
                  variant="secondary" 
                  size="xs" 
                  disabled={pagination.current === pagination.pages}
                  onClick={() => setPagination(p => ({ ...p, current: p.current + 1 }))}
                  icon={ChevronRight}
                />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Transcript Modal */}
      <AnimatePresence>
        {showModal && selectedChat && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-brand-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-white rounded-3xl shadow-premium overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="bg-brand-900 text-white p-6 flex items-center justify-between border-b border-brand-800">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                    <MessageSquare className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-display font-bold tracking-tight">Stream Audit: {selectedChat.sessionId.slice(0, 16)}</h3>
                    <p className="text-xs text-brand-400 font-bold uppercase tracking-widest">{selectedChat.role} Interaction Hub</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-brand-50/20">
                {selectedChat.messages.map((m, i) => (
                  <div key={i} className={`flex ${m.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] space-y-1 ${m.type === 'user' ? 'text-right' : 'text-left'}`}>
                      <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest px-2">
                        {m.type === 'user' ? (selectedChat.role === 'public' ? 'Citizen' : 'Staff') : 'Sentinel AI'} • {new Date(m.timestamp).toLocaleTimeString()}
                      </p>
                      <div className={`p-4 rounded-2xl text-[13px] leading-relaxed shadow-sm border ${
                        m.type === 'user' 
                          ? 'bg-primary-600 text-white border-primary-500 rounded-tr-none' 
                          : 'bg-white text-brand-900 border-brand-100 rounded-tl-none'
                      }`}>
                        {m.content}
                        {m.metadata?.intent && (
                          <div className={`mt-3 pt-2 border-t text-[10px] font-bold uppercase tracking-widest ${
                            m.type === 'user' ? 'border-primary-500 text-primary-200' : 'border-brand-50 text-brand-400'
                          }`}>
                            Detected Intent: {m.metadata.intent}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedChat.escalated && !selectedChat.resolved && (
                <div className="p-8 bg-white border-t border-brand-100">
                  <div className="bg-warning-50 rounded-2xl p-6 border border-warning-100 mb-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <AlertCircle className="w-5 h-5 text-warning-600" />
                      <h4 className="font-bold text-brand-900 text-sm tracking-tight">Escalation Directives</h4>
                    </div>
                    <textarea 
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      placeholder="Enter resolution actions or notes for the audit trail..."
                      className="w-full bg-white border-2 border-brand-100 focus:border-primary-500 rounded-xl px-4 py-3 text-sm outline-none transition-all h-24 resize-none"
                    />
                  </div>
                  <Button variant="primary" className="w-full" onClick={() => handleResolve(selectedChat._id)}>
                    Finalize Resolution & Close Incident
                  </Button>
                </div>
              )}

              {selectedChat.resolved && (
                <div className="p-8 bg-brand-900 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <CheckCircle2 className="w-5 h-5 text-success-400" />
                        <span className="font-bold text-sm tracking-tight">Incident Resolved</span>
                      </div>
                      <p className="text-xs text-brand-400 font-bold uppercase tracking-widest">
                        Resolution Authored by Staff Node • {new Date(selectedChat.resolvedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="success">Closed Hub</Badge>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminChatLogs

