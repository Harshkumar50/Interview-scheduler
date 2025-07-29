"use client"

import { useState, useEffect } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { Fragment } from "react"
import { useForm } from "react-hook-form"
import { XIcon } from "lucide-react"
import api from "../services/api"
import toast from "react-hot-toast"
import { format } from "date-fns"

const InterviewModal = ({ interview, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const isEditing = !!interview

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm()

  useEffect(() => {
    if (interview) {
      setValue("candidateName", interview.candidateName)
      setValue("candidateEmail", interview.candidateEmail)
      setValue("position", interview.position)
      setValue("date", format(new Date(interview.date), "yyyy-MM-dd"))
      setValue("time", interview.time)
      setValue("duration", interview.duration)
      setValue("type", interview.type)
      setValue("notes", interview.notes || "")
    } else {
      reset()
    }
  }, [interview, setValue, reset])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      if (isEditing) {
        await api.put(`/interviews/${interview._id}`, data)
        toast.success("Interview updated successfully")
      } else {
        await api.post("/interviews", data)
        toast.success("Interview scheduled successfully")
      }
      onSuccess()
    } catch (error) {
      const message = error.response?.data?.message || `Failed to ${isEditing ? "update" : "create"} interview`
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Transition appear show={true} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    {isEditing ? "Edit Interview" : "Schedule New Interview"}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <XIcon className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="candidateName" className="block text-sm font-medium text-gray-700">
                        Candidate Name
                      </label>
                      <input
                        {...register("candidateName", {
                          required: "Candidate name is required",
                          minLength: {
                            value: 2,
                            message: "Name must be at least 2 characters",
                          },
                        })}
                        type="text"
                        className="input mt-1"
                        placeholder="Enter candidate name"
                      />
                      {errors.candidateName && (
                        <p className="mt-1 text-sm text-red-600">{errors.candidateName.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="candidateEmail" className="block text-sm font-medium text-gray-700">
                        Candidate Email
                      </label>
                      <input
                        {...register("candidateEmail", {
                          required: "Email is required",
                          pattern: {
                            value: /^\S+@\S+$/i,
                            message: "Invalid email address",
                          },
                        })}
                        type="email"
                        className="input mt-1"
                        placeholder="Enter candidate email"
                      />
                      {errors.candidateEmail && (
                        <p className="mt-1 text-sm text-red-600">{errors.candidateEmail.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                      Position
                    </label>
                    <input
                      {...register("position", {
                        required: "Position is required",
                        minLength: {
                          value: 2,
                          message: "Position must be at least 2 characters",
                        },
                      })}
                      type="text"
                      className="input mt-1"
                      placeholder="Enter position"
                    />
                    {errors.position && <p className="mt-1 text-sm text-red-600">{errors.position.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                        Date
                      </label>
                      <input
                        {...register("date", {
                          required: "Date is required",
                          validate: (value) => {
                            const selectedDate = new Date(value)
                            const today = new Date()
                            today.setHours(0, 0, 0, 0)
                            return selectedDate >= today || "Date must be today or in the future"
                          },
                        })}
                        type="date"
                        className="input mt-1"
                        min={format(new Date(), "yyyy-MM-dd")}
                      />
                      {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
                    </div>

                    <div>
                      <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                        Time
                      </label>
                      <input
                        {...register("time", { required: "Time is required" })}
                        type="time"
                        className="input mt-1"
                      />
                      {errors.time && <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>}
                    </div>

                    <div>
                      <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                        Duration (minutes)
                      </label>
                      <select {...register("duration", { required: "Duration is required" })} className="input mt-1">
                        <option value="">Select duration</option>
                        <option value="30">30 minutes</option>
                        <option value="45">45 minutes</option>
                        <option value="60">60 minutes</option>
                        <option value="90">90 minutes</option>
                        <option value="120">120 minutes</option>
                      </select>
                      {errors.duration && <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                      Interview Type
                    </label>
                    <select {...register("type", { required: "Interview type is required" })} className="input mt-1">
                      <option value="">Select interview type</option>
                      <option value="technical">Technical</option>
                      <option value="behavioral">Behavioral</option>
                      <option value="hr">HR Round</option>
                      <option value="final">Final Round</option>
                    </select>
                    {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                      Notes (Optional)
                    </label>
                    <textarea
                      {...register("notes")}
                      rows={3}
                      className="input mt-1 resize-none"
                      placeholder="Any additional notes or requirements..."
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button type="button" onClick={onClose} className="btn-secondary">
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading
                        ? isEditing
                          ? "Updating..."
                          : "Scheduling..."
                        : isEditing
                          ? "Update Interview"
                          : "Schedule Interview"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default InterviewModal
