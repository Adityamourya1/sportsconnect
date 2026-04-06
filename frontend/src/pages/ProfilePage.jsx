import React, { useState, useEffect } from 'react'
import { userService, postService, leagueManagementService } from '../services'
import { PostCard, EditProfileModal } from '../components'
import { FaEdit, FaTrophy } from 'react-icons/fa'
import toast from 'react-hot-toast'

const ProfilePage = () => {
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [isSettingRole, setIsSettingRole] = useState(false)
  const userId = localStorage.getItem('user_id')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      const profileRes = await userService.getProfile(userId)
      setProfile(profileRes.data)
      setSelectedRole(profileRes.data.role || null)

      const postsRes = await postService.getUserPosts(userId)
      setPosts(postsRes.data)
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleChange = async (role) => {
    try {
      setIsSettingRole(true)
      await leagueManagementService.setUserRole(userId, role)
      setSelectedRole(role)
      toast.success(`Role set to ${role}! 🎉 Go to Leagues to create leagues!`, {
        duration: 4000,
      })
      loadProfile()
    } catch (error) {
      toast.error('Failed to set role')
      console.error(error)
    } finally {
      setIsSettingRole(false)
    }
  }

  if (isLoading || !profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="ml-64 pt-24 p-6 max-w-4xl mx-auto">
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onProfileUpdate={loadProfile}
      />

      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-6">
            <img
              src={profile.profile_picture || 'https://via.placeholder.com/120'}
              alt={profile.username}
              className="w-32 h-32 rounded-full"
            />
            <div>
              <h1 className="text-4xl font-bold">{profile.username}</h1>
              <p className="text-gray-600 mt-2">{profile.bio || 'No bio yet'}</p>
              <div className="flex gap-6 mt-4 text-sm">
                <div>
                  <p className="font-semibold text-lg">{profile.posts_count}</p>
                  <p className="text-gray-600">Posts</p>
                </div>
                <div>
                  <p className="font-semibold text-lg">{profile.followers_count}</p>
                  <p className="text-gray-600">Followers</p>
                </div>
                <div>
                  <p className="font-semibold text-lg">{profile.following_count}</p>
                  <p className="text-gray-600">Following</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <FaEdit />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <div className="mt-4">
            <p className="font-semibold mb-2">Interests</p>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Role Selection */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="font-semibold mb-3 flex items-center gap-2">
            <FaTrophy className="text-yellow-500" />
            Select Your Role
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => handleRoleChange('scout')}
              disabled={isSettingRole}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedRole === 'scout'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-blue-500 border border-blue-500 hover:bg-blue-50'
              } disabled:opacity-50`}
            >
              Scout 🔍
            </button>
            <button
              onClick={() => handleRoleChange('league_owner')}
              disabled={isSettingRole}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedRole === 'league_owner'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-blue-500 border border-blue-500 hover:bg-blue-50'
              } disabled:opacity-50`}
            >
              League Owner 👑
            </button>
            <button
              onClick={() => handleRoleChange('regular_player')}
              disabled={isSettingRole}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedRole === 'regular_player'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-blue-500 border border-blue-500 hover:bg-blue-50'
              } disabled:opacity-50`}
            >
              Regular Player ⚽
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {selectedRole === 'scout' && 'You can now participate and explore leagues!'}
            {selectedRole === 'league_owner' && 'You can now create leagues and manage players!'}
            {selectedRole === 'regular_player' && 'You can browse and apply to leagues.'}
            {!selectedRole && 'Select a role to get started.'}
          </p>
        </div>
      </div>

      {/* User Posts */}
      <h2 className="text-2xl font-bold mb-6">Posts</h2>
      {posts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-600">No posts yet. Create your first post!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isOwnPost={true}
              onLike={() => {}}
              onComment={() => {}}
              onDelete={loadProfile}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ProfilePage
