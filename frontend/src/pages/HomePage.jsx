import React, { useState, useEffect } from 'react'
import { feedService, postService, notificationService, userService } from '../services'
import { PostCard, CreatePostModal, CommentModal } from '../components'
import toast from 'react-hot-toast'

const HomePage = () => {
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [commentModalOpen, setCommentModalOpen] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState(null)
  const [likedPosts, setLikedPosts] = useState({})
  const [userInterests, setUserInterests] = useState([])
  const userId = localStorage.getItem('user_id')

  useEffect(() => {
    loadFeed()
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

  const loadFeed = async () => {
    try {
      setIsLoading(true)
      const response = await feedService.getPersonalizedFeed(userId)
      setPosts(response.data)
      
      // Track which posts are liked by current user
      const liked = {}
      response.data.forEach(post => {
        if (post.likes && post.likes.includes(userId)) {
          liked[post.id] = true
        }
      })
      setLikedPosts(liked)
    } catch (error) {
      toast.error('Failed to load feed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async (postId) => {
    try {
      const isLiked = likedPosts[postId]
      
      if (isLiked) {
        await postService.unlikePost(postId, userId)
        setLikedPosts(prev => ({ ...prev, [postId]: false }))
        toast.success('Post unliked!')
      } else {
        await postService.likePost(postId, userId)
        setLikedPosts(prev => ({ ...prev, [postId]: true }))
        toast.success('Post liked!')
        
        // Create notification
        const post = posts.find(p => p.id === postId)
        if (post && post.user && post.user.id !== userId) {
          try {
            await notificationService.createNotification({
              user_id: post.user.id,
              notif_type: 'like',
              actor_id: userId,
              post_id: postId,
              message: 'Someone liked your post'
            })
          } catch (notifError) {
            console.error('Failed to create notification:', notifError)
            // Silently fail, notification not critical
          }
        }
      }
      
      loadFeed()
    } catch (error) {
      console.error('Like error:', error)
      toast.error('Failed to update like')
    }
  }

  const handleComment = (postId) => {
    setSelectedPostId(postId)
    setCommentModalOpen(true)
  }

  const handleShare = (postId) => {
    const shareUrl = `${window.location.origin}/post/${postId}`
    navigator.clipboard.writeText(shareUrl)
    toast.success('Link copied to clipboard!')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="ml-64 pt-24 max-w-2xl mx-auto p-6">
      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={userId}
        onPostCreated={loadFeed}
      />

      <CommentModal
        isOpen={commentModalOpen}
        onClose={() => setCommentModalOpen(false)}
        postId={selectedPostId}
        userId={userId}
        onCommentAdded={loadFeed}
      />

      <h2 className="text-3xl font-bold mb-6">Your Feed</h2>

      {/* Interest-based Recommendations Banner */}
      {userInterests.length > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
          <p className="text-sm font-semibold text-green-700">
            ⭐ Personalized Feed Active
          </p>
          <p className="text-xs text-gray-700 mt-1">
            Showing posts based on your interests: <span className="font-semibold">{userInterests.join(', ')}</span>
          </p>
        </div>
      )}

      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full mb-6 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold"
      >
        + Create Post
      </button>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No posts yet. Follow users to see their posts!</p>
        </div>
      ) : (
        posts.map((post) => {
          const isOwned = post.user && post.user.id && post.user.id === userId;
          return (
            <PostCard
              key={post.id}
              post={{
                ...post,
                is_liked: likedPosts[post.id] || false
              }}
              isOwnPost={isOwned}
              onLike={handleLike}
              onComment={handleComment}
              onShare={handleShare}
              onDelete={loadFeed}
            />
          );
        })
      )}
    </div>
  )
}

export default HomePage
