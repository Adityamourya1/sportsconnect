import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { userService, postService, notificationService } from '../services'
import { PostCard } from '../components'
import { FaArrowLeft, FaUserPlus, FaUserMinus } from 'react-icons/fa'
import toast from 'react-hot-toast'

const UserProfilePage = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const currentUserId = localStorage.getItem('user_id')
  const isOwnProfile = currentUserId === userId

  useEffect(() => {
    loadProfile()
  }, [userId])

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      const profileRes = await userService.getProfile(userId)
      setProfile(profileRes.data)

      const postsRes = await postService.getUserPosts(userId)
      setPosts(postsRes.data)

      // Check if following
      if (!isOwnProfile && profileRes.data.followers) {
        setIsFollowing(profileRes.data.followers.includes(currentUserId))
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFollow = async () => {
    try {
      await userService.followUser(currentUserId, userId)
      setIsFollowing(true)
      toast.success('User followed!')
      
      // Create notification
      try {
        await notificationService.createNotification({
          user_id: userId,
          notif_type: 'follow',
          actor_id: currentUserId,
          message: 'Someone started following you'
        })
      } catch (notifError) {
        console.error('Failed to create notification:', notifError)
      }
      
      loadProfile()
    } catch (error) {
      console.error('Follow error:', error)
      toast.error(error.response?.data?.detail || 'Failed to follow user')
    }
  }

  const handleUnfollow = async () => {
    try {
      await userService.unfollowUser(currentUserId, userId)
      setIsFollowing(false)
      toast.success('User unfollowed!')
      loadProfile()
    } catch (error) {
      console.error('Unfollow error:', error)
      toast.error(error.response?.data?.detail || 'Failed to unfollow user')
    }
  }

  const handleLike = async (postId) => {
    try {
      await postService.likePost(postId, currentUserId)
      toast.success('Post liked!')
      loadProfile()
    } catch (error) {
      console.error('Like error:', error)
      toast.error('Failed to like post')
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
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 mb-6 text-gray-600 hover:text-gray-800"
      >
        <FaArrowLeft />
        <span>Back</span>
      </button>

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

          {!isOwnProfile && (
            <button
              onClick={isFollowing ? handleUnfollow : handleFollow}
              className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition ${
                isFollowing
                  ? 'bg-gray-300 text-gray-800 hover:bg-gray-400'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {isFollowing ? <FaUserMinus /> : <FaUserPlus />}
              <span>{isFollowing ? 'Following' : 'Follow'}</span>
            </button>
          )}
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
      </div>

      {/* User Posts */}
      <h2 className="text-2xl font-bold mb-6">Posts</h2>
      {posts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-600">No posts yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isOwnPost={false}
              onLike={handleLike}
              onComment={() => toast.info('Coming soon!')}
              onDelete={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default UserProfilePage
