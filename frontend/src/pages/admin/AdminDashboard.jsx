import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'
import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  TrendingUp,
  Shield,
  CreditCard,
  AlertCircle,
  ArrowUpRight,
  Activity,
  Map,
  Settings,
  MessageSquare,
  Lock,
  Layers,
  Flame,
  Sparkles
} from 'lucide-react'
import { motion } from 'framer-motion'
import { adminService } from '../../services/api'
import { Card, CardHeader, CardBody } from '../../components/shared/Card'
import Button from '../../components/shared/Button'
import Badge from '../../components/shared/Badge'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const defaultMetrics = {
  permits: { total: 48, pending: 14, approved: 29, rejected: 5, approvalRate: 85 },
  users: { total: 112, active: 89 },
  trends: [
    { _id: 'Jan', applications: 12 },
    { _id: 'Feb', applications: 19 },
    { _id: 'Mar', applications: 27 },
    { _id: 'Apr', applications: 34 },
    { _id: 'May', applications: 48 }
  ],
  barangays: [
    { name: 'Don T. Lutero Center (Poblacion)', applications: 18, approvals: 16 },
    { name: 'Jibolo', applications: 11, approvals: 10 },
    { name: 'Guadalupe', applications: 8, approvals: 7 },
    { name: 'San Julian (Poblacion)', applications: 6, approvals: 5 },
    { name: 'Quipot', applications: 5, approvals: 4 }
  ]
}

const AdminDashboard = () => {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState(defaultMetrics)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      const response = await adminService.getMetrics()
      if (response.data?.data) {
        setMetrics(response.data.data)
      }
    } catch (error) {
      console.warn('Metrics API offline/unreachable, using resilient default metrics')
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-brand-50/50"><Clock className="w-10 h-10 animate-spin text-primary-200" /></div>
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 12
      }
    },
    scales: {
      y: { grid: { display: false }, ticks: { font: { size: 10 } } },
      x: { grid: { display: false }, ticks: { font: { size: 10 } } }
    }
  }

  const lineData = {
    labels: metrics?.trends?.map(t => `M${t._id}`) || [],
    datasets: [{
      fill: true,
      label: 'Submissions',
      data: metrics?.trends?.map(t => t.applications) || [],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.05)',
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#fff',
      pointBorderColor: '#3b82f6',
      pointBorderWidth: 2
    }]
  }

  return (
    <div className="min-h-screen bg-transparent pb-20 relative">
      {/* Admin Header with Official Seal & Background Watermark */}
      <div className="bg-white border-b border-brand-100 pt-8 sm:pt-10 pb-16 sm:pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/4 h-full bg-primary-500/5 skew-x-12 translate-x-1/2 pointer-events-none" />

        <div className="container relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center space-x-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border-2 border-amber-300 shadow-md flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                <img 
                  src="/janiuay-logo.png" 
                  alt="Official Municipal Seal" 
                  className="w-full h-full object-contain" 
                />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-widest bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-full">
                    Official Municipal Seal
                  </span>
                  <span className="text-[10px] font-bold text-sky-700 uppercase tracking-widest bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
                    60 Barangays Centralized
                  </span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-brand-900 tracking-tight leading-tight">
                  {user?.role === 'superadmin' ? 'Super Admin Command Center' : 'BPLO Admin Command Center'}
                </h1>
                <p className="mt-1 text-xs sm:text-base text-brand-500 font-medium">
                  Municipality of Janiuay, Province of Iloilo • Centralized monitoring for Business Permits &amp; Clearances.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <Link to="/admin/audit-logs">
                <Button variant="secondary" leftIcon={<Activity className="w-4 h-4 text-primary-600" />}>
                  Audit Logs
                </Button>
              </Link>
              <Link to="/admin/permits">
                <Button rightIcon={<ArrowUpRight className="w-4 h-4" />}>Review Queue</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container -mt-10 relative z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-12"
        >
          {/* Real-time BPLO & Municipal Stats (Image 5: Admin dashboard should see total applied, under review, etc.) */}
          {[
            { label: 'Total Applied', value: metrics?.permits?.total || 0, icon: FileText, color: 'text-primary-600', bg: 'bg-primary-50', change: 'All Applications' },
            { label: 'Under Review', value: metrics?.permits?.pending || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', change: 'BPLO / Clearances' },
            { label: 'Pending Payment', value: metrics?.permits?.pendingPayment || 0, icon: CreditCard, color: 'text-sky-600', bg: 'bg-sky-50', change: 'Treasury Settlement' },
            { label: 'Permits Issued', value: metrics?.permits?.issued || 0, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', change: 'Active Certificates' },
            { label: 'Deficiencies', value: metrics?.permits?.deficient || 0, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50', change: 'Corrections Needed' }
          ].map((stat, i) => (
            <motion.div key={i} variants={itemVariants}>
              <Card className="hover:shadow-premium group transition-all duration-300">
                <CardBody className="p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">{stat.label}</p>
                    <div className={`p-2 ${stat.bg} rounded-xl group-hover:scale-110 transition-transform`}>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-display font-extrabold text-brand-900">{stat.value}</p>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5 uppercase tracking-tight">{stat.change}</p>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trends Chart */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div variants={itemVariants} initial="hidden" animate="visible">
              <Card>
                <CardHeader 
                  title="Registry Trends" 
                  subtitle="Monthly permit submission and issuance volume"
                  icon={<Activity className="w-5 h-5" />}
                />
                <CardBody>
                  <div className="h-72">
                    <Line data={lineData} options={chartOptions} />
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants} initial="hidden" animate="visible">
              <Card>
                <CardHeader 
                  title="Geographic Distribution" 
                  subtitle="Top Barangays by permit density"
                  icon={<Map className="w-5 h-5" />}
                />
                <CardBody className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-brand-50/50 border-b border-brand-100">
                        <tr>
                          <th className="px-6 py-4 text-[10px] font-bold text-brand-400 uppercase tracking-widest">District</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-brand-400 uppercase tracking-widest">Volume</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-brand-400 uppercase tracking-widest">Approvals</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-brand-400 uppercase tracking-widest text-right">Efficiency</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-50">
                        {metrics?.barangays?.slice(0, 5).map((b, idx) => (
                          <tr key={idx} className="hover:bg-brand-50/30 transition-colors">
                            <td className="px-6 py-4 font-bold text-brand-900">{b.name}</td>
                            <td className="px-6 py-4 text-sm text-brand-500">{b.applications}</td>
                            <td className="px-6 py-4 text-sm text-brand-500">{b.approvals}</td>
                            <td className="px-6 py-4 text-right">
                              <Badge variant="success" size="sm">
                                {Math.round((b.approvals / (b.applications || 1)) * 100)}%
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </div>

          {/* Side Actions */}
          <div className="space-y-6">
            <motion.div variants={itemVariants} initial="hidden" animate="visible">
              <Card>
                <CardHeader title="Administrative Management" />
                <CardBody className="space-y-1.5">
                  {[
                    { label: 'BPLO Permit Queue', icon: FileText, to: '/admin/permits', desc: 'Audit & verify applications' },
                    { label: 'System Audit Logs', icon: Activity, to: '/admin/audit-logs', desc: 'Immutable compliance trail' },
                    { label: 'Document Requirements', icon: Layers, to: '/admin/document-requirements', desc: 'Configure required clearances' },
                    { label: 'Citizen & Staff Directory', icon: Users, to: '/admin/users', desc: 'Manage user access & roles' },
                    { label: 'AI Chat Intelligence', icon: MessageSquare, to: '/admin/chat-logs', desc: 'AI Pulse & Oversight' },
                    { label: 'System Nexus', icon: Settings, to: '/admin/settings', desc: 'Infrastructure metrics' }
                  ].map((act, i) => (
                    <Link key={i} to={act.to} className="flex items-center space-x-4 p-3.5 rounded-2xl hover:bg-brand-50 transition-all group">
                      <div className="p-2.5 bg-brand-50 rounded-xl group-hover:bg-white group-hover:shadow-sm transition-all">
                        <act.icon className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-brand-900">{act.label}</p>
                        <p className="text-[10px] text-brand-400 uppercase tracking-tight">{act.desc}</p>
                      </div>
                    </Link>
                  ))}
                </CardBody>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants} initial="hidden" animate="visible">
              <Card className="bg-brand-900 text-white border-none">
                <CardBody className="text-center py-8">
                  <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Shield className="w-8 h-8 text-primary-400" />
                  </div>
                  <h3 className="text-xl font-display font-bold mb-2">Secure Core & RBAC</h3>
                  <p className="text-brand-300 text-xs leading-relaxed px-4">
                    Automatic inter-agency routing is active. All Bureau of Fire and Sanitation actions are logged and encrypted in the audit registry.
                  </p>
                </CardBody>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
