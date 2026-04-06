import React, { useState, useRef, useEffect } from 'react'
import { FaSearch, FaTimes } from 'react-icons/fa'
import { exploreService } from '../services'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [showResults, setShowResults] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const searchRef = useRef(null)
  const navigate = useNavigate()

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      setSearchResults(null)
      return
    }

    try {
      setIsSearching(true)
      const results = await exploreService.search(searchQuery)
      setSearchResults(results.data)
      setShowResults(true)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`)
    setShowResults(false)
  }

  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`)
    setShowResults(false)
  }

  const handleHashtagClick = (hashtag) => {
    setSearchQuery(hashtag)
    setShowResults(false)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults(null)
    setShowResults(false)
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="ml-64 px-6 py-4 flex items-center justify-between">
        <div className="flex-1 max-w-md" ref={searchRef}>
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users, posts, leagues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-green-500"
              />
              <div className="absolute right-3 top-3 flex gap-2">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes />
                  </button>
                )}
                <button
                  type="submit"
                  className="text-gray-400 hover:text-green-500"
                >
                  <FaSearch />
                </button>
              </div>
            </div>

            {/* Search Results Dropdown */}
            {showResults && searchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-xl max-h-96 overflow-y-auto">
                {/* Users */}
                {searchResults.users && searchResults.users.length > 0 && (
                  <div className="p-3 border-b">
                    <p className="text-xs font-semibold text-gray-600 px-2 mb-2">USERS</p>
                    {searchResults.users.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleUserClick(user.id)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center gap-2"
                      >
                        <img
                          src={user.profile_picture || 'https://via.placeholder.com/32'}
                          alt={user.username}
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="text-gray-800">{user.username}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Posts */}
                {searchResults.posts && searchResults.posts.length > 0 && (
                  <div className="p-3 border-b">
                    <p className="text-xs font-semibold text-gray-600 px-2 mb-2">POSTS</p>
                    {searchResults.posts.map((post) => (
                      <button
                        key={post.id}
                        onClick={() => handlePostClick(post.id)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm text-gray-700"
                      >
                        {post.caption?.substring(0, 60)}...
                      </button>
                    ))}
                  </div>
                )}

                {/* Hashtags */}
                {searchResults.hashtags && searchResults.hashtags.length > 0 && (
                  <div className="p-3">
                    <p className="text-xs font-semibold text-gray-600 px-2 mb-2">HASHTAGS</p>
                    <div className="flex flex-wrap gap-2 px-2">
                      {searchResults.hashtags.map((hashtag, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleHashtagClick(hashtag)}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs hover:bg-green-200"
                        >
                          #{hashtag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Results */}
                {(!searchResults.users || searchResults.users.length === 0) &&
                  (!searchResults.posts || searchResults.posts.length === 0) &&
                  (!searchResults.hashtags || searchResults.hashtags.length === 0) && (
                    <div className="p-4 text-center text-gray-600">
                      No results found
                    </div>
                  )}
              </div>
            )}

            {/* Loading State */}
            {isSearching && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-xl p-4 text-center text-gray-600">
                Searching...
              </div>
            )}
          </form>
        </div>

        <div className="flex items-center space-x-4">
          <button className="px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition">
            Create Post
          </button>
          <img
            src="https://via.placeholder.com/40"
            alt="Profile"
            className="w-10 h-10 rounded-full"
          />
        </div>
      </div>
    </nav>
  )
}

export default Navbar
