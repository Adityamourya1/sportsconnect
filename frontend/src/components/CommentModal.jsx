import React, { useState, useEffect } from 'react'
import { FaTimes } from 'react-icons/fa'
import { postService, notificationService } from '../services'
import toast from 'react-hot-toast'

const CommentModal = ({ isOpen, onClose, postId, userId, onCommentAdded }) => {
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && postId) {
      loadComments()
    }
  }, [isOpen, postId])

  const loadComments = async () => {
    try {
      setIsLoading(true)
      const response = await postService.getPost(postId)
      setPost(response.data)
      setComments(response.data.comments || [])
    } catch (error) {
      console.error('Failed to load comments:', error)
      toast.error('Failed to load comments')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return

    try {
      await postService.addComment(postId, userId, { text: commentText })
      setCommentText('')
      
      // Create notification for post owner
      if (post && post.user && post.user.id !== userId) {
        try {
          await notificationService.createNotification({
            user_id: post.user.id,
            notif_type: 'comment',
            actor_id: userId,
            post_id: postId,
            message: 'Someone commented on your post'
          })
        } catch (notifError) {
          console.error('Failed to create notification:', notifError)
        }
      }
      
      loadComments()
      onCommentAdded?.()
      toast.success('Comment added!')
    } catch (error) {
      console.error('Failed to add comment:', error)
      toast.error('Failed to add comment')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-96 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Comments</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="text-center text-gray-600">Loading...</div>
          ) : comments.length === 0 ? (
            <div className="text-center text-gray-600">No comments yet</div>
          ) : (
            comments.map((comment, idx) => (
              <div key={idx} className="border-b pb-3">
                <p className="text-sm font-semibold text-gray-800">
                  {comment.user_id}
                </p>
                <p className="text-gray-700 text-sm">{comment.text}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(comment.created_at).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Comment Input */}
        <form onSubmit={handleAddComment} className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-sm"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition text-sm font-semibold"
            >
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CommentModal
