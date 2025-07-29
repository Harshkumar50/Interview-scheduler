"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, Users, Plus } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import api from "../services/api"
import LoadingSpinner from "./loading-spinner"
import Layout from "./layout"

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
      setRecentInterviews(interviewsResponse.data.interviews || [])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      scheduled: "badge-blue",
      completed: "badge-green",
      cancelled: "badge-red",
      rescheduled: "badge-yellow",
    }
    return badges[status as keyof typeof badges] || "badge-blue"
  }

  const getTypeBadge = (type: string) => {
    const badges = {
      technical: "badge-purple",
      behavioral: "badge-orange",
      hr: "badge-cyan",
      final: "badge-yellow",
    }
    return badges[type as keyof typeof badges] || "badge-purple"
  }

  if (loading) {
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
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <Link href="/interviews" className="btn-primary flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Schedule Interview
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-muted-foreground truncate">Total Interviews</dt>
                  <dd className="text-lg font-medium text-foreground">{stats?.total || 0}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-muted-foreground truncate">Upcoming</dt>
                  <dd className="text-lg font-medium text-foreground">{stats?.upcoming || 0}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-muted-foreground truncate">Completed</dt>
                  <dd className="text-lg font-medium text-foreground">{stats?.completed || 0}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-muted-foreground truncate">Cancelled</dt>
                  <dd className="text-lg font-medium text-foreground">{stats?.cancelled || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Interviews */}
        <div className="card">
          <div className="px-6 py-4 border-b border-border">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-foreground">Recent Interviews</h2>
              <Link href="/interviews" className="text-sm text-primary hover:text-primary/80">
                View all
              </Link>
            </div>
          </div>
          <div className="divide-y divide-border">
            {recentInterviews.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-foreground">No interviews</h3>
                <p className="mt-1 text-sm text-muted-foreground">Get started by scheduling your first interview.</p>
                <div className="mt-6">
                  <Link href="/interviews" className="btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Interview
                  </Link>
                </div>
              </div>
            ) : (
              recentInterviews.map((interview: any) => (
                <div key={interview._id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-primary font-medium text-sm">
                              {interview.candidateName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{interview.candidateName}</p>
                          <p className="text-sm text-muted-foreground truncate">{interview.position}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`badge ${getStatusBadge(interview.status)}`}>{interview.status}</span>
                      <span className={`badge ${getTypeBadge(interview.type)}`}>{interview.type}</span>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(interview.date), "MMM dd, yyyy")}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard
