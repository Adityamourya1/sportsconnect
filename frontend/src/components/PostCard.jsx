import React, { useState } from 'react'
import { FaHeart, FaComment, FaShare, FaTrash } from 'react-icons/fa'
import { postService } from '../services'
import toast from 'react-hot-toast'

const PostCard = ({ post, onLike, onComment, onShare, onDelete, isOwnPost }) => {
  const userId = localStorage.getItem('user_id')

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postService.deletePost(post.id, userId)
        toast.success('Post deleted successfully!')
        onDelete?.()
      } catch (error) {
        toast.error(error.response?.data?.detail || 'Failed to delete post')
      }
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md mb-4 max-w-2xl">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <img
            src={post.user?.profile_picture || 'https://via.placeholder.com/40'}
            alt={post.user?.username}
            className="w-10 h-10 rounded-full cursor-pointer hover:opacity-80"
          />
          <div>
            <h3 className="font-semibold text-gray-800 cursor-pointer hover:text-green-500">
              {post.user?.username}
            </h3>
            <p className="text-xs text-gray-500">
              {new Date(post.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        {/* Delete Button */}
        {isOwnPost && (
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 p-2"
            title="Delete post"
          >
            <FaTrash />
          </button>
        )}
      </div>

      {/* Post Image */}
      {post.image_url && (
        <img
          src={post.image_url}
          alt="Post"
          className="w-full object-cover max-h-96"
        />
      )}

      {/* Post Caption */}
      <div className="p-4">
        <p className="text-gray-800 mb-2">{post.caption}</p>
        <div className="flex flex-wrap gap-2">
          {post.hashtags?.map((tag, idx) => (
            <span
              key={idx}
              className="text-green-500 hover:underline cursor-pointer"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Post Stats */}
      <div className="px-4 py-2 border-t border-b text-sm text-gray-600">
        <div className="flex justify-between">
          <span>{post.likes_count || 0} likes</span>
          <span>{post.comments_count || 0} comments</span>
        </div>
      </div>

      {/* Post Actions */}
      <div className="p-4 flex justify-around border-t">
        <button
          onClick={() => onLike?.(post.id)}
          className={`flex items-center space-x-2 transition ${
            post.is_liked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
          }`}
        >
          <FaHeart size={20} />
          <span>Like</span>
        </button>

        <button
          onClick={() => onComment?.(post.id)}
          className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition"
        >
          <FaComment size={20} />
          <span>Comment</span>
        </button>

        <button
          onClick={() => onShare?.(post.id)}
          className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition"
        >
          <FaShare size={20} />
          <span>Share</span>
        </button>
      </div>
    </div>
  )
}

export default PostCard
