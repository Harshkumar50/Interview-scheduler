"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter } from "lucide-react"
import api from "../services/api"
import LoadingSpinner from "./loading-spinner"
import InterviewModal from "./interview-modal"
import InterviewCard from "./interview-card"
import Layout from "./layout"
import toast from "react-hot-toast"

const Interviews = () => {
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingInterview, setEditingInterview] = useState(null)
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    type: "",
  })
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 10,
  })

  useEffect(() => {
    fetchInterviews()
  }, [filters, pagination.current])

  const fetchInterviews = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.current.toString(),
        limit: pagination.limit.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.type && { type: filters.type }),
      })

      const response = await api.get(`/interviews?${params}`)
      setInterviews(response.data.interviews || [])
      setPagination(response.data.pagination || pagination)
    } catch (error) {
      console.error("Error fetching interviews:", error)
      toast.error("Failed to fetch interviews")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateInterview = () => {
    setEditingInterview(null)
    setShowModal(true)
  }

  const handleEditInterview = (interview: any) => {
    setEditingInterview(interview)
    setShowModal(true)
  }

  const handleDeleteInterview = async (id: string) => {
    if (!confirm("Are you sure you want to delete this interview?")) return

    try {
      await api.delete(`/interviews/${id}`)
      toast.success("Interview deleted successfully")
      fetchInterviews()
    } catch (error) {
      console.error("Error deleting interview:", error)
      toast.error("Failed to delete interview")
    }
  }

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await api.patch(`/interviews/${id}/status`, { status })
      toast.success("Interview status updated")
      fetchInterviews()
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Failed to update status")
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setEditingInterview(null)
  }

  const handleModalSuccess = () => {
    setShowModal(false)
    setEditingInterview(null)
    fetchInterviews()
  }

  const filteredInterviews = interviews.filter(
    (interview: any) =>
      interview.candidateName.toLowerCase().includes(filters.search.toLowerCase()) ||
      interview.position.toLowerCase().includes(filters.search.toLowerCase()) ||
      interview.candidateEmail.toLowerCase().includes(filters.search.toLowerCase()),
  )

  if (loading && interviews.length === 0) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Interviews</h1>
          <button onClick={handleCreateInterview} className="btn-primary flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Schedule Interview
          </button>
        </div>

        {/* Filters */}
        <div className="card p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search interviews..."
                className="input pl-10"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>

            <select
              className="input"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rescheduled">Rescheduled</option>
            </select>

            <select
              className="input"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="">All Types</option>
              <option value="technical">Technical</option>
              <option value="behavioral">Behavioral</option>
              <option value="hr">HR</option>
              <option value="final">Final</option>
            </select>

            <button
              onClick={() => setFilters({ search: "", status: "", type: "" })}
              className="btn-secondary flex items-center justify-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </button>
          </div>
        </div>

        {/* Interviews List */}
        <div className="space-y-4">
          {filteredInterviews.length === 0 ? (
            <div className="card p-8 text-center">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No interviews found</h3>
              <p className="text-muted-foreground mb-4">
                {filters.search || filters.status || filters.type
                  ? "Try adjusting your filters or search terms."
                  : "Get started by scheduling your first interview."}
              </p>
              <button onClick={handleCreateInterview} className="btn-primary">
                Schedule Interview
              </button>
            </div>
          ) : (
            filteredInterviews.map((interview: any) => (
              <InterviewCard
                key={interview._id}
                interview={interview}
                onEdit={handleEditInterview}
                onDelete={handleDeleteInterview}
                onStatusUpdate={handleStatusUpdate}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <button
              onClick={() => setPagination({ ...pagination, current: pagination.current - 1 })}
              disabled={pagination.current === 1}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <span className="text-sm text-muted-foreground">
              Page {pagination.current} of {pagination.pages}
            </span>

            <button
              onClick={() => setPagination({ ...pagination, current: pagination.current + 1 })}
              disabled={pagination.current === pagination.pages}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        {/* Interview Modal */}
        {showModal && (
          <InterviewModal interview={editingInterview} onClose={handleModalClose} onSuccess={handleModalSuccess} />
        )}
      </div>
    </Layout>
  )
}

export default Interviews
