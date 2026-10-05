import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Settings, 
  Shield,
  Server,
  Database,
  Activity,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Cpu,
  Globe,
  Lock,
  Terminal
} from 'lucide-react'
import { motion } from 'framer-motion'
import { adminService } from '../../services/api'
import { Card, CardHeader, CardBody } from '../../components/shared/Card'
import Button from '../../components/shared/Button'
import Badge from '../../components/shared/Badge'
import toast from 'react-hot-toast'

const AdminSettings = () => {
  const [systemHealth, setSystemHealth] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSystemHealth()
  }, [])

  const fetchSystemHealth = async () => {
    try {
      setLoading(true)
      const response = await adminService.getSystemHealth()
      setSystemHealth(response.data.data)
    } catch (error) {
      toast.error('Nexus sync failed')
    } finally {
      setLoading(false)
    }
  }

  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const formatBytes = (bytes) => {
    const gb = bytes / (1024 * 1024 * 1024)
    return `${gb.toFixed(2)} GB`
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-brand-50/50"><RefreshCw className="w-10 h-10 animate-spin text-primary-200" /></div>

  return (
    <div className="min-h-screen bg-brand-50/50 pb-20">
      <div className="bg-white border-b border-brand-100 pt-8 pb-12">
        <div className="container">
          <Link to="/admin" className="flex items-center text-brand-400 hover:text-brand-900 transition-colors font-bold text-sm mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Command Center
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-display font-bold text-brand-900 tracking-tight">System Nexus</h1>
              <p className="text-brand-500 mt-2">Real-time infrastructure monitoring and configuration oversight.</p>
            </div>
            <Button variant="secondary" size="sm" leftIcon={<RefreshCw className="w-4 h-4" />} onClick={fetchSystemHealth}>Re-Sync Nexus</Button>
          </div>
        </div>
      </div>

      <div className="container mt-8">
        {/* Core Infrastructure Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Cloud Status', value: 'Operational', icon: Server, color: 'text-success-600', bg: 'bg-success-50', sub: `Uptime: ${formatUptime(systemHealth?.uptime || 0)}` },
            { label: 'Registry Link', value: 'Connected', icon: Database, color: 'text-primary-600', bg: 'bg-primary-50', sub: `${systemHealth?.database?.collections?.users || 0} Citizens Sync'd` },
            { label: 'Heap Allocation', value: formatBytes(systemHealth?.memory?.heapUsed || 0), icon: Cpu, color: 'text-warning-600', bg: 'bg-warning-50', sub: `of ${formatBytes(systemHealth?.memory?.heapTotal || 0)}` },
            { label: 'Incident Ratio', value: `${systemHealth?.errorRate || 0}%`, icon: Shield, color: 'text-brand-600', bg: 'bg-brand-50', sub: 'Last 24 Cycle' }
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="hover:shadow-premium transition-all">
                <CardBody className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className="text-xl font-display font-bold text-brand-900">{stat.value}</p>
                    <p className="text-[10px] text-brand-500 font-bold mt-1 uppercase tracking-tight">{stat.sub}</p>
                  </div>
                  <div className={`p-4 ${stat.bg} rounded-2xl`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Collection Metrics */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card>
                <CardHeader title="Registry Persistence" subtitle="Persistent data storage volume" icon={<Terminal className="w-5 h-5" />} />
                <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {systemHealth?.database?.collections && Object.entries(systemHealth.database.collections).map(([name, count]) => (
                    <div key={name} className="p-6 bg-brand-50 rounded-2xl border-2 border-transparent hover:border-brand-100 transition-all group">
                      <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-1">{name}</p>
                      <p className="text-3xl font-display font-bold text-brand-900 group-hover:text-primary-600 transition-colors">{count.toLocaleString()}</p>
                      <p className="text-[10px] text-brand-400 font-bold uppercase mt-1">Records Established</p>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </motion.div>

            {/* Application Pulse */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card>
                <CardHeader title="Application Pulse" subtitle="24-hour activity monitoring" icon={<Activity className="w-5 h-5" />} />
                <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Active Citizens', value: systemHealth?.activity?.last24Hours?.activeUsers || 0, icon: CheckCircle2, color: 'text-success-600' },
                    { label: 'New Enrolments', value: systemHealth?.activity?.last24Hours?.newApplications || 0, icon: Activity, color: 'text-primary-600' },
                    { label: 'AI Assistance', value: systemHealth?.activity?.last24Hours?.chatQueries || 0, icon: AlertCircle, color: 'text-warning-600' }
                  ].map((act, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 bg-brand-50/50 rounded-2xl">
                      <act.icon className={`w-5 h-5 ${act.color}`} />
                      <div>
                        <p className="text-xs font-bold text-brand-900">{act.value}</p>
                        <p className="text-[10px] text-brand-400 font-bold uppercase">{act.label}</p>
                      </div>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </motion.div>
          </div>

          <div className="space-y-6">
            {/* System Profile */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
              <Card>
                <CardHeader title="Environment Profile" icon={<Globe className="w-5 h-5" />} />
                <CardBody className="space-y-4">
                  {[
                    { label: 'Node Runtime', value: '18.x LTS', icon: Cpu },
                    { label: 'Deployment Hub', value: 'Municipal Core', icon: Server },
                    { label: 'Security Layer', value: 'TLS 1.3 Active', icon: Lock },
                    { label: 'Dossier Version', value: '2.4.0-Stable', icon: Terminal }
                  ].map((inf, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-brand-50 last:border-0">
                      <div className="flex items-center space-x-3">
                        <inf.icon className="w-4 h-4 text-brand-400" />
                        <span className="text-[10px] font-bold text-brand-500 uppercase tracking-tight">{inf.label}</span>
                      </div>
                      <span className="text-xs font-bold text-brand-900">{inf.value}</span>
                    </div>
                  ))}
                  <div className="pt-4">
                    <Badge variant="success" className="w-full justify-center">Infrastructure Verified</Badge>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            {/* Support Core */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
              <Card className="bg-brand-900 text-white border-none">
                <CardBody className="text-center py-8">
                  <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Shield className="w-8 h-8 text-primary-400" />
                  </div>
                  <h3 className="text-xl font-display font-bold mb-2">Systems Sentinel</h3>
                  <p className="text-brand-300 text-xs leading-relaxed px-4 mb-6">
                    Continuous monitoring is active. Any anomalies are automatically established in the audit registry.
                  </p>
                  <Button variant="secondary" size="sm" className="w-full">Emergency Protocols</Button>
                </CardBody>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings

