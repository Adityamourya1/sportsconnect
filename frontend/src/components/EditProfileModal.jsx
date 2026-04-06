import React, { useState } from 'react'
import { userService } from '../services'
import toast from 'react-hot-toast'

const EditProfileModal = ({ isOpen, onClose, profile, onProfileUpdate }) => {
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    bio: profile?.bio || '',
    interests: profile?.interests || [],
    profile_picture: profile?.profile_picture || ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [interestInput, setInterestInput] = useState('')
  const userId = localStorage.getItem('user_id')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const addInterest = () => {
    if (interestInput.trim() && !formData.interests.includes(interestInput.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, interestInput.trim()]
      }))
      setInterestInput('')
    }
  }

  const removeInterest = (index) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.username.trim()) {
      toast.error('Username is required')
      return
    }

    try {
      setIsLoading(true)
      await userService.updateProfile(userId, formData)
      toast.success('Profile updated successfully!')
      onProfileUpdate()
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself..."
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
            />
          </div>

          {/* Profile Picture URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Profile Picture URL
            </label>
            <input
              type="url"
              name="profile_picture"
              value={formData.profile_picture}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
            />
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Interests
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                placeholder="Add interest..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
              />
              <button
                type="button"
                onClick={addInterest}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Add
              </button>
            </div>
            
            {/* Interest Tags */}
            <div className="flex flex-wrap gap-2">
              {formData.interests.map((interest, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-2"
                >
                  {interest}
                  <button
                    type="button"
                    onClick={() => removeInterest(idx)}
                    className="text-green-700 hover:text-green-900 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProfileModal
