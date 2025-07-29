"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Mail, MoreHorizontal, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Interview {
  _id: string
  candidateName: string
  candidateEmail: string
  position: string
  date: string
  time: string
  duration: number
  type: string
  status: string
  notes?: string
}

interface InterviewListProps {
  interviews: Interview[]
  onUpdate: () => void
}

export default function InterviewList({ interviews, onUpdate }: InterviewListProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const updateStatus = async (id: string, status: string) => {
    setLoading(id)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/interviews/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        onUpdate()
      }
    } catch (error) {
      console.error("Error updating interview:", error)
    } finally {
      setLoading(null)
    }
  }

  const deleteInterview = async (id: string) => {
    if (!confirm("Are you sure you want to delete this interview?")) return

    setLoading(id)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/interviews/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        onUpdate()
      }
    } catch (error) {
      console.error("Error deleting interview:", error)
    } finally {
      setLoading(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "technical":
        return "bg-purple-100 text-purple-800"
      case "behavioral":
        return "bg-orange-100 text-orange-800"
      case "hr":
        return "bg-cyan-100 text-cyan-800"
      case "final":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (interviews.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews scheduled</h3>
          <p className="text-gray-500">Schedule your first interview to get started.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Scheduled Interviews</h2>

      <div className="grid gap-4">
        {interviews.map((interview) => (
          <Card key={interview._id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{interview.candidateName}</CardTitle>
                  <CardDescription>{interview.position}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(interview.status)}>{interview.status}</Badge>
                  <Badge className={getTypeColor(interview.type)}>{interview.type}</Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {interview.status === "scheduled" && (
                        <DropdownMenuItem onClick={() => updateStatus(interview._id, "completed")}>
                          Mark as Completed
                        </DropdownMenuItem>
                      )}
                      {interview.status === "scheduled" && (
                        <DropdownMenuItem onClick={() => updateStatus(interview._id, "cancelled")}>
                          Cancel Interview
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => deleteInterview(interview._id)} className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>{new Date(interview.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>
                    {interview.time} ({interview.duration} min)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span>{interview.candidateEmail}</span>
                </div>
              </div>
              {interview.notes && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-700">{interview.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
