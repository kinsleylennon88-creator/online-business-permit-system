import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  FileText, 
  Plus, 
  Edit3, 
  Trash2, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Building2, 
  ListOrdered,
  Activity,
  Layers
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminService } from '../../services/api'
import { Card, CardHeader, CardBody } from '../../components/shared/Card'
import Button from '../../components/shared/Button'
import Badge from '../../components/shared/Badge'
import Input from '../../components/shared/Input'
import toast from 'react-hot-toast'

const AdminDocumentRequirements = () => {
  const [requirements, setRequirements] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRequirement, setEditingRequirement] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    issuingAgency: '',
    notes: '',
    isRequired: true,
    applicablePermitType: 'all',
    applicableBusinessType: ['all'],
    reviewingAgency: 'applicant',
    isActive: true,
    order: 0
  })

  useEffect(() => {
    fetchRequirements()
  }, [])

  const fetchRequirements = async () => {
    try {
      setLoading(true)
      const res = await adminService.getDocumentRequirements()
      if (res.data?.data) {
        setRequirements(res.data.data.requirements || [])
      }
    } catch (e) {
      toast.error('Failed to load document requirements')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (req = null) => {
    if (req) {
      setEditingRequirement(req)
      setFormData({
        name: req.name || '',
        code: req.code || '',
        description: req.description || '',
        issuingAgency: req.issuingAgency || '',
        notes: req.notes || '',
        isRequired: req.isRequired !== undefined ? req.isRequired : true,
        applicablePermitType: req.applicablePermitType || 'all',
        applicableBusinessType: req.applicableBusinessType || ['all'],
        reviewingAgency: req.reviewingAgency || 'applicant',
        isActive: req.isActive !== undefined ? req.isActive : true,
        order: req.order || 0
      })
    } else {
      setEditingRequirement(null)
      setFormData({
        name: '',
        code: `REQ-${Date.now().toString().slice(-4)}`,
        description: '',
        issuingAgency: 'Local Barangay Hall / Agency',
        notes: '1 clear photocopy / scan',
        isRequired: true,
        applicablePermitType: 'all',
        applicableBusinessType: ['all'],
        reviewingAgency: 'applicant',
        isActive: true,
        order: requirements.length + 1
      })
    }
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      if (editingRequirement) {
        await adminService.updateDocumentRequirement(editingRequirement._id, formData)
        toast.success('Document requirement updated!')
      } else {
        await adminService.createDocumentRequirement(formData)
        toast.success('New document requirement added!')
      }
      setShowModal(false)
      fetchRequirements()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save requirement')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this document requirement?')) return
    try {
      await adminService.deleteDocumentRequirement(id)
      toast.success('Requirement deleted')
      fetchRequirements()
    } catch (err) {
      toast.error('Failed to delete requirement')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b border-slate-200 pt-8 pb-10">
        <div className="container">
          <Link to="/admin" className="inline-flex items-center text-slate-500 hover:text-slate-900 transition-colors font-bold text-xs mb-4">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Command Center
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-xs font-bold text-primary-700 uppercase tracking-widest bg-primary-50 px-2.5 py-1 rounded-md border border-primary-100 flex items-center w-max">
                <Layers className="w-3.5 h-3.5 mr-1" /> Regulatory Configuration
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
                Document Requirements Manager
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Configure mandatory clearances for New vs Renewal applications and manage reviewing agency assignments.
              </p>
            </div>
            <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => handleOpenModal()}>
              Add New Requirement
            </Button>
          </div>
        </div>
      </div>

      <div className="container mt-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-20 flex justify-center"><Activity className="w-8 h-8 animate-spin text-primary-600" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Code & Document Name</th>
                    <th className="px-6 py-4">Issuing Office</th>
                    <th className="px-6 py-4">Reviewing Agency</th>
                    <th className="px-6 py-4">Permit Type</th>
                    <th className="px-6 py-4">Mandatory</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requirements.map((req) => (
                    <tr key={req._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 font-mono text-[10px] font-extrabold bg-primary-100 text-primary-800 rounded">
                            {req.code}
                          </span>
                          <span className="font-bold text-slate-900">{req.name}</span>
                        </div>
                        {req.description && <p className="text-[11px] text-slate-500 mt-0.5">{req.description}</p>}
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-medium">
                        {req.issuingAgency}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded font-bold text-[11px] ${
                          req.reviewingAgency === 'applicant'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : req.reviewingAgency === 'bureau_of_fire'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : req.reviewingAgency === 'bureau_of_sanitation'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-purple-50 text-purple-700'
                        }`}>
                          {req.reviewingAgency === 'applicant' ? 'Applicant Upload' : req.reviewingAgency.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800 uppercase">
                        {req.applicablePermitType}
                      </td>
                      <td className="px-6 py-4">
                        {req.isRequired ? (
                          <span className="text-emerald-700 font-bold">Required</span>
                        ) : (
                          <span className="text-slate-400">Optional</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {req.isActive ? (
                          <Badge variant="success" size="sm">Active</Badge>
                        ) : (
                          <Badge variant="neutral" size="sm">Inactive</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button onClick={() => handleOpenModal(req)} className="p-1.5 rounded hover:bg-slate-100 text-slate-600">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(req._id)} className="p-1.5 rounded hover:bg-rose-50 text-rose-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Edit / Create Modal */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden z-10 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  {editingRequirement ? 'Edit Document Requirement' : 'Add New Document Requirement'}
                </h2>
                <form onSubmit={handleSave} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Document Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-3 py-2 border rounded-xl"
                      placeholder="e.g. Barangay Clearance"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Code *</label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        required
                        className="w-full px-3 py-2 border rounded-xl uppercase font-mono"
                        placeholder="REQ-BRGY"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Issuing Office</label>
                      <input
                        type="text"
                        value={formData.issuingAgency}
                        onChange={(e) => setFormData({ ...formData, issuingAgency: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl"
                        placeholder="Barangay Hall"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Reviewing Agency</label>
                      <select
                        value={formData.reviewingAgency}
                        onChange={(e) => setFormData({ ...formData, reviewingAgency: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl bg-white"
                      >
                        <option value="applicant">Applicant (Upload Step)</option>
                        <option value="bureau_of_fire">Bureau of Fire</option>
                        <option value="bureau_of_sanitation">Bureau of Sanitation</option>
                        <option value="bplo">BPLO Staff</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Applicable Permit Type</label>
                      <select
                        value={formData.applicablePermitType}
                        onChange={(e) => setFormData({ ...formData, applicablePermitType: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl bg-white"
                      >
                        <option value="all">All (New & Renewal)</option>
                        <option value="new">New Permits Only</option>
                        <option value="renewal">Renewal Permits Only</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Description / Guidelines</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                      rows="2"
                    />
                  </div>
                  <div className="flex items-center space-x-6 pt-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isRequired}
                        onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                      />
                      <span className="font-bold">Mandatory Requirement</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      />
                      <span className="font-bold">Active in System</span>
                    </label>
                  </div>
                  <div className="pt-4 flex justify-end space-x-2 border-t">
                    <Button type="button" variant="secondary" size="sm" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button type="submit" size="sm">Save Requirement</Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default AdminDocumentRequirements
