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
  HelpCircle
} from 'lucide-react'
import { motion } from 'framer-motion'
import { adminService } from '../../services/api'
import { Card, CardHeader, CardBody } from '../../components/shared/Card'
import Button from '../../components/shared/Button'
import Badge from '../../components/shared/Badge'
import toast from 'react-hot-toast'

const ChatAnalytics = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, escalated, resolved
  const [stats, setStats] = useState({
    total: 0,
    escalated: 0,
    resolved: 0,
    avgResponse: '1.2s'
  })

  useEffect(() => {
    fetchLogs()
  }, [filter])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const response = await adminService.getChatLogs({ filter })
      setLogs(response.data.data.logs)
      
      // Mock stats calculation for now
      const escalated = response.data.data.logs.filter(l => l.escalated && !l.resolved).length
      const resolved = response.data.data.logs.filter(l => l.resolved).length
      setStats({
        total: response.data.data.logs.length,
        escalated,
        resolved,
        avgResponse: '0.8s'
      })
    } catch (error) {
      toast.error('Failed to sync chat intelligence')
    } finally {
      setLoading(false)
    }
  }

  const handleResolve = async (id) => {
    try {
      await adminService.resolveChatLog(id, 'Resolved via analytics panel')
      toast.success('Incident resolved and archived.')
      fetchLogs()
    } catch (error) {
      toast.error('Resolution failed')
    }
  }

  return (
    <div className="min-h-screen bg-brand-50/50 pb-20">
      <div className="bg-white border-b border-brand-100 pt-8 pb-12">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-display font-bold text-brand-900 tracking-tight">Chat Intelligence</h1>
              <p className="text-brand-500 mt-2">Monitor AI-citizen interactions and resolve escalated incidents.</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="secondary" size="sm" onClick={fetchLogs}>Refresh Logs</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-8">
        {/* Core Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Interactions', value: stats.total, icon: MessageCircle, color: 'text-primary-600', bg: 'bg-primary-50' },
            { label: 'Escalated Cases', value: stats.escalated, icon: AlertCircle, color: 'text-warning-600', bg: 'bg-warning-50' },
            { label: 'Resolved (24h)', value: stats.resolved, icon: CheckCircle2, color: 'text-success-600', bg: 'bg-success-50' },
            { label: 'AI Latency', value: stats.avgResponse, icon: TrendingUp, color: 'text-brand-600', bg: 'bg-brand-50' }
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

        {/* Intelligence Log */}
        <Card>
          <CardHeader 
            title="Interaction Log" 
            subtitle="Audit trail of Citizen Sentinel conversations"
            action={
              <div className="flex items-center space-x-2">
                <select 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-brand-50 border-none text-[11px] font-bold text-brand-600 uppercase tracking-widest px-3 py-1.5 rounded-lg outline-none cursor-pointer"
                >
                  <option value="all">All Logs</option>
                  <option value="escalated">Escalated</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            }
          />
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-brand-50/50 border-b border-brand-100">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold text-brand-400 uppercase tracking-widest">Citizen Session</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-brand-400 uppercase tracking-widest">Role</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-brand-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-brand-400 uppercase tracking-widest">Last Activity</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-brand-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-50">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center">
                          <HelpCircle className="w-10 h-10 text-brand-200 mb-4" />
                          <p className="text-brand-400 font-bold uppercase tracking-widest text-xs">No interactions found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    logs.map((log, idx) => (
                      <motion.tr 
                        key={log._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-brand-50/30 transition-colors group"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
                              <User className="w-4 h-4 text-brand-600" />
                            </div>
                            <div>
                              <p className="font-bold text-brand-900 text-xs truncate max-w-[150px]">{log.sessionId}</p>
                              <p className="text-[10px] text-brand-400 font-bold uppercase tracking-tight">{log.userInfo?.ip || 'Internal Node'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <Badge variant={log.role === 'public' ? 'neutral' : 'info'}>{log.role}</Badge>
                        </td>
                        <td className="px-6 py-5">
                          {log.resolved ? (
                            <Badge variant="success">Resolved</Badge>
                          ) : log.escalated ? (
                            <Badge variant="warning">Escalated</Badge>
                          ) : (
                            <Badge variant="neutral">Bot Managed</Badge>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center text-[11px] text-brand-500 font-medium">
                            <Clock className="w-3.5 h-3.5 mr-1.5 text-brand-300" />
                            {new Date(log.updatedAt).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="secondary" size="xs">View Transcript</Button>
                            {log.escalated && !log.resolved && (
                              <Button variant="primary" size="xs" onClick={() => handleResolve(log._id)}>Resolve</Button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default ChatAnalytics
