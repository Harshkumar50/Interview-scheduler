"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, ClockIcon, UsersIcon, PlusIcon } from "lucide-react"
import { Link } from "react-router-dom"
import api from "../services/api"
import LoadingSpinner from "../components/LoadingSpinner"
import { format } from "date-fns"

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [recentInterviews, setRecentInterviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, interviewsResponse] = await Promise.all([
        api.get("/interviews/stats"),
        api.get("/interviews?limit=5&sortBy=date&sortOrder=desc"),
      ])

      setStats(statsResponse.data)
      setRecentInterviews(interviewsResponse.data.interviews)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      scheduled: "badge-blue",
      completed: "badge-green",
      cancelled: "badge-red",
      rescheduled: "badge-yellow",
    }
    return badges[status] || "badge-blue"
  }

  const getTypeBadge = (type) => {
    const badges = {
      technical: "badge-purple",
      behavioral: "badge-orange",
      hr: "badge-cyan",
      final: "badge-yellow",
    }
    return badges[type] || "badge-purple"
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link to="/interviews" className="btn-primary flex items-center">
          <PlusIcon className="w-4 h-4 mr-2" />
          Schedule Interview
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CalendarIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Interviews</dt>
                <dd className="text-lg font-medium text-gray-900">{stats?.total || 0}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Upcoming</dt>
                <dd className="text-lg font-medium text-gray-900">{stats?.upcoming || 0}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                <dd className="text-lg font-medium text-gray-900">{stats?.completed || 0}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CalendarIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Cancelled</dt>
                <dd className="text-lg font-medium text-gray-900">{stats?.cancelled || 0}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Interviews */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Recent Interviews</h2>
            <Link to="/interviews" className="text-sm text-primary-600 hover:text-primary-500">
              View all
            </Link>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {recentInterviews.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No interviews</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by scheduling your first interview.</p>
              <div className="mt-6">
                <Link to="/interviews" className="btn-primary">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Schedule Interview
                </Link>
              </div>
            </div>
          ) : (
            recentInterviews.map((interview) => (
              <div key={interview._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-medium text-sm">
                            {interview.candidateName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{interview.candidateName}</p>
                        <p className="text-sm text-gray-500 truncate">{interview.position}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`badge ${getStatusBadge(interview.status)}`}>{interview.status}</span>
                    <span className={`badge ${getTypeBadge(interview.type)}`}>{interview.type}</span>
                    <div className="text-sm text-gray-500">{format(new Date(interview.date), "MMM dd, yyyy")}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
