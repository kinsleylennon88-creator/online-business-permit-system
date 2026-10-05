import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Activity, 
  Search, 
  Filter, 
  Calendar, 
  Shield, 
  User, 
  ArrowLeft, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Info, 
  Eye, 
  Download,
  AlertTriangle,
  Lock
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminService } from '../../services/api'
import { Card, CardHeader, CardBody } from '../../components/shared/Card'
import Button from '../../components/shared/Button'
import Badge from '../../components/shared/Badge'
import Input from '../../components/shared/Input'
import toast from 'react-hot-toast'

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [resultFilter, setResultFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 })
  const [selectedLog, setSelectedLog] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    fetchLogs()
  }, [pagination.current, roleFilter, actionFilter, resultFilter, startDate, endDate])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.current,
        limit: 20,
        search: searchTerm || undefined,
        role: roleFilter || undefined,
        action: actionFilter || undefined,
        result: resultFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      }

      const response = await adminService.getAuditLogs(params)
      if (response.data?.data) {
        setLogs(response.data.data.auditLogs || [])
        setPagination(response.data.data.pagination || { current: 1, pages: 1, total: 0 })
      }
    } catch (error) {
      toast.error('Failed to load audit trail records')
    } finally {
      setLoading(false)
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPagination(p => ({ ...p, current: 1 }))
    fetchLogs()
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setRoleFilter('')
    setActionFilter('')
    setResultFilter('')
    setStartDate('')
    setEndDate('')
    setPagination(p => ({ ...p, current: 1 }))
  }

  const formatTimestamp = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  }

  const getRoleBadge = (role) => {
    switch (role) {
      case 'superadmin':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800">System Admin</span>
      case 'admin':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-sky-100 text-sky-800">BPLO Staff</span>
      case 'fire_reviewer':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">Bureau of Fire</span>
      case 'sanitation_reviewer':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">Bureau of Sanitation</span>
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">Citizen</span>
    }
  }

  const getActionBadge = (action) => {
    const actionLower = (action || '').toLowerCase()
    if (actionLower.includes('approved') || actionLower.includes('success')) {
      return <span className="inline-flex items-center px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">{action}</span>
    }
    if (actionLower.includes('rejected') || actionLower.includes('failed') || actionLower.includes('unauthorized') || actionLower.includes('deleted')) {
      return <span className="inline-flex items-center px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">{action}</span>
    }
    if (actionLower.includes('correction') || actionLower.includes('warning')) {
      return <span className="inline-flex items-center px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">{action}</span>
    }
    return <span className="inline-flex items-center px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-slate-100 text-slate-800">{action}</span>
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 pt-8 pb-10">
        <div className="container">
          <Link to="/admin" className="inline-flex items-center text-slate-500 hover:text-slate-900 transition-colors font-bold text-xs mb-4">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Command Center
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xs font-bold text-primary-700 uppercase tracking-widest bg-primary-50 px-2.5 py-1 rounded-md border border-primary-100 flex items-center">
                  <Lock className="w-3.5 h-3.5 mr-1 text-primary-600" /> Immutable Government Audit Trail
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                System Audit & Compliance Logs
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Forensic record of all authentications, submissions, approvals, deficiency notices, and agency reviews.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Button 
                variant="secondary" 
                size="sm" 
                leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
                onClick={fetchLogs}
              >
                Refresh Log Stream
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-8 space-y-6">
        {/* Filter Controls Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row items-center gap-3">
            <div className="flex-1 w-full">
              <Input
                placeholder="Search by actor name, email, tracking number, or action..."
                icon={<Search className="w-4 h-4" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:w-auto">
              <select
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setPagination(p => ({ ...p, current: 1 })); }}
                className="rounded-xl border-2 border-slate-200 py-2.5 px-3 text-xs font-semibold bg-white cursor-pointer focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none"
              >
                <option value="">Role: All Roles</option>
                <option value="superadmin">System Admin</option>
                <option value="admin">BPLO Staff</option>
                <option value="fire_reviewer">Bureau of Fire</option>
                <option value="sanitation_reviewer">Bureau of Sanitation</option>
                <option value="user">Citizen / Applicant</option>
              </select>

              <select
                value={resultFilter}
                onChange={(e) => { setResultFilter(e.target.value); setPagination(p => ({ ...p, current: 1 })); }}
                className="rounded-xl border-2 border-slate-200 py-2.5 px-3 text-xs font-semibold bg-white cursor-pointer focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none"
              >
                <option value="">Result: All</option>
                <option value="success">Success Only</option>
                <option value="failure">Failure / Security Alert</option>
              </select>

              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPagination(p => ({ ...p, current: 1 })); }}
                className="rounded-xl border-2 border-slate-200 py-2.5 px-3 text-xs font-semibold bg-white focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none"
                title="Filter Start Date"
              />

              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPagination(p => ({ ...p, current: 1 })); }}
                className="rounded-xl border-2 border-slate-200 py-2.5 px-3 text-xs font-semibold bg-white focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none"
                title="Filter End Date"
              />
            </div>

            <div className="flex items-center space-x-2 w-full lg:w-auto">
              <Button type="submit" size="sm" className="w-full lg:w-auto text-xs">
                Filter
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={handleResetFilters} className="w-full lg:w-auto text-xs">
                Reset
              </Button>
            </div>
          </form>
        </div>

        {/* Audit Log Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading && logs.length === 0 ? (
            <div className="p-20 flex flex-col items-center justify-center">
              <Activity className="w-8 h-8 animate-spin text-primary-600 mb-2" />
              <p className="text-sm font-bold text-slate-600">Retrieving immutable audit records...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Shield className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-800">No audit events found</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No log entries match your active filter criteria. Click reset to see all recorded activities.
              </p>
              <Button variant="secondary" size="sm" onClick={handleResetFilters} className="mt-4 text-xs">
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">Actor / User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Action Event</th>
                    <th className="px-6 py-4">Entity / Reference</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-600">
                        {formatTimestamp(log.timestamp)}
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{log.actor?.name || 'System / Anonymous'}</p>
                        <p className="text-slate-400 text-[11px]">{log.actor?.email}</p>
                      </td>

                      <td className="px-6 py-4">
                        {getRoleBadge(log.role || log.actor?.role)}
                      </td>

                      <td className="px-6 py-4">
                        {getActionBadge(log.action)}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          {log.trackingNumber && (
                            <span className="font-mono font-bold text-primary-700">{log.trackingNumber}</span>
                          )}
                          <span className="text-[11px] text-slate-400 uppercase font-semibold">
                            {log.entityType} {log.entityId ? `• ${log.entityId.slice(-6)}` : ''}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {log.result === 'success' ? (
                          <span className="inline-flex items-center text-emerald-700 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Success
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-rose-700 font-bold">
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Failed / Blocked
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => { setSelectedLog(log); setShowDetailModal(true); }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-slate-100 transition-colors"
                          title="View Full Metadata"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Page {pagination.current} of {pagination.pages} ({pagination.total} total audit records)
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.current === 1}
                onClick={() => setPagination(p => ({ ...p, current: p.current - 1 }))}
                iconOnly={<ChevronLeft className="w-4 h-4" />}
              />
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.current === pagination.pages}
                onClick={() => setPagination(p => ({ ...p, current: p.current + 1 }))}
                iconOnly={<ChevronRight className="w-4 h-4" />}
              />
            </div>
          </div>
        )}

        {/* Audit Event Detail Modal */}
        <AnimatePresence>
          {showDetailModal && selectedLog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                onClick={() => setShowDetailModal(false)}
              />

              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
              >
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-primary-100 rounded-2xl text-primary-700">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Audit Log Record Details</h3>
                      <p className="text-xs text-slate-500">ID: {selectedLog._id}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 overflow-y-auto space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Timestamp</span>
                      <p className="font-bold text-slate-900 mt-0.5">{formatTimestamp(selectedLog.timestamp)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Action</span>
                      <p className="font-bold text-slate-900 mt-0.5">{selectedLog.action}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Actor</span>
                      <p className="font-bold text-slate-900 mt-0.5">{selectedLog.actor?.name} ({selectedLog.actor?.email})</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">IP Address / User-Agent</span>
                      <p className="font-mono text-slate-800 mt-0.5">{selectedLog.ipAddress}</p>
                    </div>
                    {selectedLog.trackingNumber && (
                      <div className="col-span-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Tracking Number</span>
                        <p className="font-mono font-bold text-primary-700 mt-0.5">{selectedLog.trackingNumber}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Payload Metadata Details</span>
                    <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl overflow-x-auto text-[11px] font-mono leading-relaxed">
                      {JSON.stringify(selectedLog.details, null, 2) || '{}'}
                    </pre>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                  <Button size="sm" variant="secondary" onClick={() => setShowDetailModal(false)}>
                    Close
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default AdminAuditLogs
