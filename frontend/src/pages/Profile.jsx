"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { EyeIcon, EyeOffIcon, UserIcon } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import api from "../services/api"
import toast from "react-hot-toast"

const Profile = () => {
  const { user } = useAuth()
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    setValue,
  } = useForm()

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm()

  useEffect(() => {
    if (user) {
      setValue("name", user.name)
      setValue("email", user.email)
    }
  }, [user, setValue])

  const onProfileSubmit = async (data) => {
    setLoading(true)
    try {
      await api.put("/users/profile", data)
      toast.success("Profile updated successfully")
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update profile"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const onPasswordSubmit = async (data) => {
    setLoading(true)
    try {
      await api.put("/users/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      toast.success("Password changed successfully")
      resetPasswordForm()
      setShowPasswordForm(false)
    } catch (error) {
      const message = error.response?.data?.message || "Failed to change password"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center">
          <span className="text-white text-xl font-medium">{user?.name?.charAt(0).toUpperCase()}</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
          <p className="text-gray-500 capitalize">{user?.role}</p>
        </div>
      </div>

      {/* Profile Information */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
          <UserIcon className="w-5 h-5 text-gray-400" />
        </div>

        <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              {...registerProfile("name", {
                required: "Name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
              })}
              type="text"
              className="input mt-1"
            />
            {profileErrors.name && <p className="mt-1 text-sm text-red-600">{profileErrors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              {...registerProfile("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid email address",
                },
              })}
              type="email"
              className="input mt-1"
            />
            {profileErrors.email && <p className="mt-1 text-sm text-red-600">{profileErrors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <input type="text" value={user?.role} disabled className="input mt-1 bg-gray-50 text-gray-500 capitalize" />
            <p className="mt-1 text-sm text-gray-500">Contact an administrator to change your role.</p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">Change Password</h2>
          <button onClick={() => setShowPasswordForm(!showPasswordForm)} className="btn-secondary">
            {showPasswordForm ? "Cancel" : "Change Password"}
          </button>
        </div>

        {showPasswordForm && (
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                Current Password
              </label>
              <div className="relative mt-1">
                <input
                  {...registerPassword("currentPassword", {
                    required: "Current password is required",
                  })}
                  type={showCurrentPassword ? "text" : "password"}
                  className="input pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOffIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {passwordErrors.currentPassword && (
                <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="relative mt-1">
                <input
                  {...registerPassword("newPassword", {
                    required: "New password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  type={showNewPassword ? "text" : "password"}
                  className="input pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOffIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {passwordErrors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false)
                  resetPasswordForm()
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Changing..." : "Change Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default Profile
