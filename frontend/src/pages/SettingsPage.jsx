import React, { useState } from 'react'
import { userService, authService } from '../services'
import { useNavigate } from 'react-router-dom'
import { FaCog } from 'react-icons/fa'
import toast from 'react-hot-toast'

const SettingsPage = () => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleChangePassword = async (e) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    try {
      setIsLoading(true)
      // API call would go here
      toast.success('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      toast.error('Failed to change password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_id')
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you absolutely sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.'
    )

    if (!confirmed) return

    const doubleConfirmed = window.confirm(
      'This is your final warning. Click OK to permanently delete your account and all your data.'
    )

    if (!doubleConfirmed) return

    try {
      setIsLoading(true)
      const userId = localStorage.getItem('user_id')
      await userService.deleteAccount(userId)
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_id')
      toast.success('Account deleted successfully')
      navigate('/login')
    } catch (error) {
      toast.error('Failed to delete account')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="ml-64 p-6 max-w-2xl mx-auto">
      <div className="flex items-center space-x-3 mb-8">
        <FaCog size={40} className="text-purple-500" />
        <h1 className="text-4xl font-bold">Settings</h1>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Change Password</h2>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 font-semibold transition"
          >
            {isLoading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Privacy</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Private Account</span>
            <input type="checkbox" className="w-6 h-6" />
          </div>

          <div className="flex items-center justify-between">
            <span>Allow Messages from Strangers</span>
            <input type="checkbox" className="w-6 h-6" />
          </div>

          <div className="flex items-center justify-between">
            <span>Show Profile in Explore</span>
            <input type="checkbox" className="w-6 h-6" defaultChecked />
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 rounded-lg shadow-md p-6 border border-red-200">
        <h2 className="text-2xl font-bold mb-4 text-red-600">Danger Zone</h2>

        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold transition"
        >
          Logout
        </button>

        <button
          onClick={handleDeleteAccount}
          disabled={isLoading}
          className="w-full mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 hover:shadow-lg font-semibold transition disabled:opacity-50"
        >
          {isLoading ? 'Deleting...' : 'Delete Account'}
        </button>
      </div>
    </div>
  )
}

export default SettingsPage
