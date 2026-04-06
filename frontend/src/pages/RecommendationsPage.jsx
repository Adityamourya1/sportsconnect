import React, { useState, useEffect } from 'react'
import { feedService, userService } from '../services'
import { PostCard } from '../components'
import toast from 'react-hot-toast'

const RecommendationsPage = () => {
  const [posts, setPosts] = useState([])
  const [recommendedUsers, setRecommendedUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [userInterests, setUserInterests] = useState([])
  const [activeTab, setActiveTab] = useState('posts') // posts or users
  const [likedPosts, setLikedPosts] = useState({})
  const userId = localStorage.getItem('user_id')

  useEffect(() => {
    loadRecommendations()
    loadUserInterests()
  }, [])

  const loadUserInterests = async () => {
    try {
      const response = await userService.getProfile(userId)
      setUserInterests(response.data.interests || [])
    } catch (error) {
      console.error('Failed to load user interests:', error)
    }
  }

  const loadRecommendations = async () => {
    try {
      setIsLoading(true)
      const [postsRes, usersRes] = await Promise.all([
        feedService.getRecommendations(userId),
        feedService.getRecommendedUsers(userId)
      ])
      
      setPosts(postsRes.data || [])
      setRecommendedUsers(usersRes.data || [])
      
      // Track which posts are liked
      const liked = {}
      ;(postsRes.data || []).forEach(post => {
        if (post.is_liked) {
          liked[post.id] = true
        }
      })
      setLikedPosts(liked)
    } catch (error) {
      console.error('Failed to load recommendations:', error)
      toast.error('Failed to load recommendations')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async (postId) => {
    try {
      if (likedPosts[postId]) {
        await feedService.unlikePost(postId, userId)
        setLikedPosts(prev => ({
          ...prev,
          [postId]: false
        }))
      } else {
        await feedService.likePost(postId, userId)
        setLikedPosts(prev => ({
          ...prev,
          [postId]: true
        }))
      }
    } catch (error) {
      toast.error('Failed to update like')
    }
  }

  const handleFollowUser = async (targetUserId) => {
    try {
      await userService.followUser(userId, targetUserId)
      setRecommendedUsers(prev =>
        prev.filter(user => user.id !== targetUserId)
      )
      toast.success('User followed!')
    } catch (error) {
      toast.error('Failed to follow user')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading recommendations...</div>
      </div>
    )
  }

  return (
    <div className="ml-64 pt-24 max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Recommendations</h1>
          <p className="text-gray-600">Personalized content just for you</p>
        </div>
        
        {/* Interest Tags */}
        {userInterests.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {userInterests.map(interest => (
              <span
                key={interest}
                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold"
              >
                {interest}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-3 font-semibold transition ${
            activeTab === 'posts'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📝 Recommended Posts ({posts.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-3 font-semibold transition ${
            activeTab === 'users'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          👥 Suggested Users ({recommendedUsers.length})
        </button>
      </div>

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <div>
          {posts.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-2">No recommendations yet</p>
              <p className="text-sm text-gray-500">
                {userInterests.length === 0
                  ? 'Add your interests to get personalized recommendations'
                  : 'More recommendations coming soon!'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                      💡 {post.recommendation_type === 'interest-based' ? 'Matches Your Interests' : 'Trending'}
                    </span>
                    {post.match_score && (
                      <span className="text-xs text-gray-500">
                        Match Score: {post.match_score.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <PostCard
                    post={{
                      ...post,
                      is_liked: likedPosts[post.id] || false
                    }}
                    isOwnPost={post.user?.id === userId}
                    onLike={() => handleLike(post.id)}
                    onComment={() => {}}
                    onShare={() => toast.success('Shared!')}
                    onDelete={() => loadRecommendations()}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          {recommendedUsers.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No user recommendations available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition"
                >
                  {/* Profile Picture */}
                  <div className="flex justify-center mb-4">
                    <img
                      src={user.profile_picture || 'https://via.placeholder.com/80'}
                      alt={user.username}
                      className="w-20 h-20 rounded-full object-cover border-2 border-green-200"
                    />
                  </div>

                  {/* Username */}
                  <h3 className="text-lg font-bold text-center mb-1">
                    {user.username}
                  </h3>

                  {/* Bio */}
                  {user.bio && (
                    <p className="text-sm text-gray-600 text-center mb-3 line-clamp-2">
                      {user.bio}
                    </p>
                  )}

                  {/* Interests */}
                  {user.interests && user.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-center mb-3">
                      {user.interests.slice(0, 3).map((interest) => (
                        <span
                          key={interest}
                          className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                        >
                          {interest}
                        </span>
                      ))}
                      {user.interests.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{user.interests.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Followers Count */}
                  <p className="text-sm text-gray-600 text-center mb-4">
                    👥 {user.followers_count} followers
                  </p>

                  {/* Follow Button */}
                  <button
                    onClick={() => handleFollowUser(user.id)}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold"
                  >
                    + Follow
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State Info */}
      {userInterests.length === 0 && (
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800">
            💡 <strong>Tip:</strong> Add your sports interests in your profile to get personalized recommendations based on your favorite sports!
          </p>
        </div>
      )}
    </div>
  )
}

export default RecommendationsPage
