import React, { useState } from 'react'
import { postService, aiService, uploadService } from '../services'
import { FaImage, FaTimes } from 'react-icons/fa'
import toast from 'react-hot-toast'

const CreatePostModal = ({ isOpen, onClose, userId, onPostCreated }) => {
  const [caption, setCaption] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [hashtags, setHashtags] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }

      setSelectedFile(file)

      // Show preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadImage = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first')
      return
    }

    try {
      setIsUploading(true)
      const response = await uploadService.uploadImage(selectedFile)
      setImageUrl(response.data.url)
      toast.success('Image uploaded successfully!')
      setImagePreview('')
      setSelectedFile(null)
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = () => {
    setImageUrl('')
    setImagePreview('')
    setSelectedFile(null)
  }

  const handleGenerateCaption = async () => {
    try {
      setIsLoading(true)
      const response = await aiService.generateCaption({
        sport: 'cricket',
        context: caption,
      })
      if (response.data.success) {
        setCaption(response.data.data)
        toast.success('Caption generated!')
      }
    } catch (error) {
      toast.error('Failed to generate caption')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateHashtags = async () => {
    try {
      setIsLoading(true)
      const response = await aiService.generateHashtags({
        caption,
        sport: 'cricket',
      })
      if (response.data.success) {
        setHashtags(response.data.data.split(','))
        toast.success('Hashtags generated!')
      }
    } catch (error) {
      toast.error('Failed to generate hashtags')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePost = async () => {
    if (!caption.trim()) {
      toast.error('Please enter a caption')
      return
    }

    try {
      setIsLoading(true)
      await postService.createPost(userId, {
        caption,
        image_url: imageUrl,
        hashtags,
        ai_generated: false,
      })
      toast.success('Post created successfully!')
      onPostCreated?.()
      onClose()
      setCaption('')
      setImageUrl('')
      setImagePreview('')
      setSelectedFile(null)
      setHashtags([])
    } catch (error) {
      toast.error('Failed to create post')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Create Post</h2>

        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-4 border border-gray-300 rounded-lg mb-4 resize-none focus:outline-none focus:border-green-500"
          rows={4}
        />

        {/* Image Upload Section */}
        <div className="mb-4 border-2 border-dashed border-gray-300 rounded-lg p-4">
          {imagePreview ? (
            <div>
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-h-40 object-cover rounded-lg mb-2"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleUploadImage}
                  disabled={isUploading}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Upload to Cloud'}
                </button>
                <button
                  onClick={() => {
                    setImagePreview('')
                    setSelectedFile(null)
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : imageUrl ? (
            <div>
              <img
                src={imageUrl}
                alt="Uploaded"
                className="w-full max-h-40 object-cover rounded-lg mb-2"
              />
              <button
                onClick={removeImage}
                className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Remove Image
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center cursor-pointer">
              <FaImage size={32} className="text-gray-400 mb-2" />
              <p className="text-gray-600">Click to select an image or drag and drop</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          )}
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={handleGenerateCaption}
            disabled={isLoading || !caption}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm"
          >
            Generate Caption
          </button>
          <button
            onClick={handleGenerateHashtags}
            disabled={isLoading || !caption}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 text-sm"
          >
            Generate Hashtags
          </button>
        </div>

        {hashtags.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-semibold mb-2">Hashtags:</p>
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleCreatePost}
            disabled={isLoading || isUploading}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            {isLoading || isUploading ? 'Creating...' : 'Create Post'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreatePostModal
