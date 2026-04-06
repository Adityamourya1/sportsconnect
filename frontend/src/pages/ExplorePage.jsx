import React, { useState, useEffect } from 'react'
import { exploreService, userService } from '../services'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const ExplorePage = () => {
  const navigate = useNavigate()
  const [trending, setTrending] = useState([])
  const [suggestedUsers, setSuggestedUsers] = useState([])
  const [trendingHashtags, setTrendingHashtags] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [followingUsers, setFollowingUsers] = useState(new Set())
  const userId = localStorage.getItem('user_id')

  useEffect(() => {
    loadExploreData()
  }, [])

  const loadExploreData = async () => {
    try {
      setIsLoading(true)
      const [trendingRes, suggestedRes, hashtagsRes] = await Promise.all([
        exploreService.getTrendingPosts(),
        exploreService.getSuggestedUsers(userId),
        exploreService.getTrendingHashtags(),
      ])

      setTrending(trendingRes.data)
      setSuggestedUsers(suggestedRes.data)
      setTrendingHashtags(hashtagsRes.data)
      
      // Check which users are already followed
      if (suggestedRes.data) {
        const following = new Set()
        suggestedRes.data.forEach(user => {
          if (user.followers && user.followers.includes(userId)) {
            following.add(user.id)
          }
        })
        setFollowingUsers(following)
      }
    } catch (error) {
      console.error('Error loading explore:', error)
      toast.error('Failed to load explore data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFollowClick = async (targetUserId, isFollowing) => {
    try {
      if (isFollowing) {
        await userService.unfollowUser(userId, targetUserId)
        toast.success('User unfollowed!')
        setFollowingUsers(prev => {
          const newSet = new Set(prev)
          newSet.delete(targetUserId)
          return newSet
        })
      } else {
        await userService.followUser(userId, targetUserId)
        toast.success('User followed!')
        setFollowingUsers(prev => new Set([...prev, targetUserId]))
      }
    } catch (error) {
      console.error('Error following user:', error)
      toast.error(error.response?.data?.detail || 'Failed to update follow status')
    }
  }

  const handleUserClick = (userId) => {
    navigate(`/user/${userId}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="ml-64 p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Explore</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trending Posts */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Trending Posts</h2>
          <div className="space-y-4">
            {trending.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center space-x-3 mb-3 cursor-pointer" onClick={() => handleUserClick(post.user?.id)}>
                  <img
                    src={post.user?.profile_picture || 'https://via.placeholder.com/40'}
                    alt={post.user?.username}
                    className="w-10 h-10 rounded-full hover:opacity-80"
                  />
                  <span className="font-semibold hover:text-green-500">{post.user?.username}</span>
                </div>
                <p className="text-gray-800 mb-2">{post.caption}</p>
                <div className="flex gap-3 text-sm text-gray-600">
                  <span>❤️ {post.likes_count} likes</span>
                  <span>💬 {post.comments_count} comments</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* Suggested Users */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <h3 className="text-xl font-bold mb-4">Suggested Users</h3>
            <div className="space-y-4">
              {suggestedUsers.map((user) => {
                const isFollowing = followingUsers.has(user.id)
                return (
                  <div key={user.id} className="flex items-center justify-between">
                    <div
                      className="flex items-center space-x-2 cursor-pointer flex-1"
                      onClick={() => handleUserClick(user.id)}
                    >
                      <img
                        src={user.profile_picture || 'https://via.placeholder.com/32'}
                        alt={user.username}
                        className="w-8 h-8 rounded-full hover:opacity-80"
                      />
                      <span className="font-semibold text-sm hover:text-green-500">{user.username}</span>
                    </div>
                    <button
                      onClick={() => handleFollowClick(user.id, isFollowing)}
                      className={`px-3 py-1 text-xs rounded transition ${
                        isFollowing
                          ? 'bg-gray-300 text-gray-800 hover:bg-gray-400'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Trending Hashtags */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-xl font-bold mb-4">Trending Hashtags</h3>
            <div className="space-y-2">
              {trendingHashtags.map((tag, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 hover:bg-gray-100 rounded cursor-pointer">
                  <span className="text-green-500 font-semibold">#{tag.hashtag}</span>
                  <span className="text-xs text-gray-600">{tag.count} posts</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExplorePage
