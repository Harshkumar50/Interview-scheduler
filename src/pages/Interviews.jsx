"use client"

import { useState, useEffect } from "react"
import { PlusIcon, SearchIcon, FilterIcon } from "lucide-react"
import api from "../services/api"
import LoadingSpinner from "../components/LoadingSpinner"
import InterviewModal from "../components/InterviewModal"
import InterviewCard from "../components/InterviewCard"
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
        page: pagination.current,
        limit: pagination.limit,
        ...(filters.status && { status: filters.status }),
        ...(filters.type && { type: filters.type }),
      })

      const response = await api.get(`/interviews?${params}`)
      setInterviews(response.data.interviews)
      setPagination(response.data.pagination)
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

  const handleEditInterview = (interview) => {
    setEditingInterview(interview)
    setShowModal(true)
  }

  const handleDeleteInterview = async (id) => {
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

  const handleStatusUpdate = async (id, status) => {
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
    (interview) =>
      interview.candidateName.toLowerCase().includes(filters.search.toLowerCase()) ||
      interview.position.toLowerCase().includes(filters.search.toLowerCase()) ||
      interview.candidateEmail.toLowerCase().includes(filters.search.toLowerCase()),
  )

  if (loading && interviews.length === 0) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Interviews</h1>
        <button onClick={handleCreateInterview} className="btn-primary flex items-center">
          <PlusIcon className="w-4 h-4 mr-2" />
          Schedule Interview
        </button>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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
            <FilterIcon className="w-4 h-4 mr-2" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Interviews List */}
      <div className="space-y-4">
        {filteredInterviews.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <PlusIcon className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews found</h3>
            <p className="text-gray-500 mb-4">
              {filters.search || filters.status || filters.type
                ? "Try adjusting your filters or search terms."
                : "Get started by scheduling your first interview."}
            </p>
            <button onClick={handleCreateInterview} className="btn-primary">
              Schedule Interview
            </button>
          </div>
        ) : (
          filteredInterviews.map((interview) => (
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

          <span className="text-sm text-gray-700">
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
  )
}

export default Interviews
