"use client"

import { useState } from "react"
import { Menu, Transition } from "@headlessui/react"
import { Fragment } from "react"
import {
  CalendarIcon,
  ClockIcon,
  MailIcon,
  MoreVerticalIcon,
  EditIcon,
  TrashIcon,
  CheckIcon,
  XIcon,
} from "lucide-react"
import { format } from "date-fns"

const InterviewCard = ({ interview, onEdit, onDelete, onStatusUpdate }) => {
  const [loading, setLoading] = useState(false)

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

  const handleStatusUpdate = async (status) => {
    setLoading(true)
    await onStatusUpdate(interview._id, status)
    setLoading(false)
  }

  const handleDelete = async () => {
    setLoading(true)
    await onDelete(interview._id)
    setLoading(false)
  }

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-primary-600 font-medium">{interview.candidateName.charAt(0).toUpperCase()}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-medium text-gray-900 truncate">{interview.candidateName}</h3>
              <span className={`badge ${getStatusBadge(interview.status)}`}>{interview.status}</span>
              <span className={`badge ${getTypeBadge(interview.type)}`}>{interview.type}</span>
            </div>

            <p className="text-sm text-gray-600 mb-3">{interview.position}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
              <div className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-2" />
                <span>{format(new Date(interview.date), "MMM dd, yyyy")}</span>
              </div>
              <div className="flex items-center">
                <ClockIcon className="w-4 h-4 mr-2" />
                <span>
                  {interview.time} ({interview.duration} min)
                </span>
              </div>
              <div className="flex items-center">
                <MailIcon className="w-4 h-4 mr-2" />
                <span className="truncate">{interview.candidateEmail}</span>
              </div>
            </div>

            {interview.notes && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">{interview.notes}</p>
              </div>
            )}
          </div>
        </div>

        <Menu as="div" className="relative ml-4">
          <Menu.Button
            disabled={loading}
            className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
          >
            <MoreVerticalIcon className="w-5 h-5 text-gray-400" />
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => onEdit(interview)}
                      className={`${
                        active ? "bg-gray-100" : ""
                      } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                    >
                      <EditIcon className="w-4 h-4 mr-3" />
                      Edit Interview
                    </button>
                  )}
                </Menu.Item>

                {interview.status === "scheduled" && (
                  <>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => handleStatusUpdate("completed")}
                          className={`${
                            active ? "bg-gray-100" : ""
                          } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                        >
                          <CheckIcon className="w-4 h-4 mr-3" />
                          Mark as Completed
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => handleStatusUpdate("cancelled")}
                          className={`${
                            active ? "bg-gray-100" : ""
                          } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                        >
                          <XIcon className="w-4 h-4 mr-3" />
                          Cancel Interview
                        </button>
                      )}
                    </Menu.Item>
                  </>
                )}

                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleDelete}
                      className={`${
                        active ? "bg-gray-100" : ""
                      } flex items-center w-full px-4 py-2 text-sm text-red-600`}
                    >
                      <TrashIcon className="w-4 h-4 mr-3" />
                      Delete Interview
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </div>
  )
}

export default InterviewCard
