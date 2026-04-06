import React, { useState, useEffect } from 'react'
import { storyService } from '../services'
import { FaPlus, FaTrash, FaClock } from 'react-icons/fa'
import toast from 'react-hot-toast'

const StoriesPage = () => {
  const [stories, setStories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedStory, setSelectedStory] = useState(null)
  const [caption, setCaption] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const userId = localStorage.getItem('user_id')

  useEffect(() => {
    loadStories()
  }, [])

  const loadStories = async () => {
    try {
      setIsLoading(true)
      const response = await storyService.getStoriesFeed(userId)
      setStories(response.data || [])
    } catch (error) {
      console.error('Failed to load stories:', error)
      toast.error('Failed to load stories')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateStory = async (e) => {
    e.preventDefault()
    if (!imageUrl.trim()) {
      toast.error('Please enter an image URL')
      return
    }

    try {
      const storyData = {
        user_id: userId,
        image_url: imageUrl,
        caption: caption || undefined,
      }

      await storyService.createStory(userId, storyData)
      toast.success('Story created successfully! 📸')
      setImageUrl('')
      setCaption('')
      setShowCreateModal(false)
      loadStories()
    } catch (error) {
      console.error('Error creating story:', error)
      toast.error('Failed to create story')
    }
  }

  const handleViewStory = async (story) => {
    try {
      setSelectedStory(story)
      await storyService.viewStory(story.id, userId)
    } catch (error) {
      console.error('Error marking story as viewed:', error)
    }
  }

  const handleDeleteStory = async (storyId) => {
    try {
      await storyService.deleteStory(storyId, userId)
      setSelectedStory(null)
      toast.success('Story deleted')
      loadStories()
    } catch (error) {
      console.error('Error deleting story:', error)
      toast.error('Failed to delete story')
    }
  }

  const formatTimeRemaining = (expiresAt) => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diff = expiry - now
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  if (selectedStory) {
    return (
      <div className="ml-64 h-screen bg-black flex items-center justify-center">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Story View */}
          <div className="relative max-w-md h-screen flex flex-col bg-black">
            {/* Header */}
            <div className="bg-gray-900 p-4 flex items-center justify-between text-white z-10">
              <div className="flex items-center gap-3">
                <img
                  src={selectedStory.profile_picture || 'https://via.placeholder.com/40'}
                  alt={selectedStory.username}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-semibold">{selectedStory.username}</p>
                  <p className="text-xs text-gray-400">
                    <FaClock className="inline mr-1" size={10} />
                    {formatTimeRemaining(selectedStory.expires_at)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStory(null)}
                className="text-2xl hover:text-gray-400"
              >
                ✕
              </button>
            </div>

            {/* Story Image */}
            <div className="flex-1 overflow-hidden flex items-center justify-center">
              <img
                src={selectedStory.image_url}
                alt="Story"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Story Info */}
            <div className="bg-gray-900 p-4 text-white border-t border-gray-700">
              {selectedStory.caption && (
                <p className="mb-3 text-sm">{selectedStory.caption}</p>
              )}
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>👁️ {selectedStory.view_count} views</span>
                {userId === selectedStory.user_id && (
                  <button
                    onClick={() => handleDeleteStory(selectedStory.id)}
                    className="text-red-500 hover:text-red-400 flex items-center gap-1"
                  >
                    <FaTrash size={14} />
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="ml-64 min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-800">📸 Stories</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition font-semibold"
          >
            <FaPlus size={18} />
            New Story
          </button>
        </div>

        {/* Create Story Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Create a Story</h2>
              <form onSubmit={handleCreateStory} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Caption (optional)
                  </label>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Add a caption to your story..."
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      setCaption('')
                      setImageUrl('')
                    }}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
                  >
                    Share Story
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Stories Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Loading stories...</p>
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-5xl mb-4">😴</p>
            <p className="text-gray-600 text-lg">No stories yet</p>
            <p className="text-gray-500 text-sm mt-2">Follow more users to see their stories!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {stories.map((story) => (
              <div
                key={story.id}
                onClick={() => handleViewStory(story)}
                className="relative cursor-pointer overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition transform hover:scale-105"
              >
                {/* Story Thumbnail */}
                <img
                  src={story.image_url}
                  alt={`${story.username}'s story`}
                  className="w-full h-48 object-cover"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-0 hover:opacity-60 transition"></div>

                {/* User Info */}
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                  <div className="flex items-center gap-2">
                    <img
                      src={story.profile_picture || 'https://via.placeholder.com/30'}
                      alt={story.username}
                      className="w-8 h-8 rounded-full border-2 border-white"
                    />
                    <div className="opacity-0 hover:opacity-100 transition">
                      <p className="text-xs font-semibold">{story.username}</p>
                      <p className="text-xs text-gray-300">👁️ {story.view_count}</p>
                    </div>
                  </div>
                </div>

                {/* Story Expiry Badge */}
                <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                  {formatTimeRemaining(story.expires_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default StoriesPage
