import React, { useState, useEffect } from 'react'
import { messageService, exploreService } from '../services'
import { FaEnvelope, FaPaperPlane, FaPlus } from 'react-icons/fa'
import toast from 'react-hot-toast'

const MessagesPage = () => {
  const [conversations, setConversations] = useState([])
  const [suggestedUsers, setSuggestedUsers] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showNewConversation, setShowNewConversation] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const userId = localStorage.getItem('user_id')

  useEffect(() => {
    loadConversations()
    loadSuggestedUsers()
  }, [])

  useEffect(() => {
    if (selectedChat || selectedUser) {
      console.log('Loading messages for:', { selectedChat, selectedUser })
      loadMessages()
    }
  }, [selectedChat, selectedUser])

  const loadConversations = async () => {
    try {
      setIsLoading(true)
      const response = await messageService.getConversations(userId)
      setConversations(response.data)
    } catch (error) {
      toast.error('Failed to load conversations')
    } finally {
      setIsLoading(false)
    }
  }

  const loadSuggestedUsers = async () => {
    try {
      setLoadingUsers(true)
      const response = await exploreService.getSuggestedUsers(userId)
      console.log('Suggested users response:', response.data)
      setSuggestedUsers(response.data || [])
      if (!response.data || response.data.length === 0) {
        console.warn('No suggested users returned from API')
      }
    } catch (error) {
      console.error('Failed to load suggested users:', error)
      toast.error('Failed to load users list')
    } finally {
      setLoadingUsers(false)
    }
  }

  const loadMessages = async () => {
    try {
      let chatId
      if (selectedChat) {
        chatId = selectedChat
      } else if (selectedUser) {
        const ids = [userId, selectedUser.id].sort()
        chatId = `${ids[0]}_${ids[1]}`
      }

      if (chatId) {
        const response = await messageService.getChatMessages(chatId)
        setMessages(response.data)
      }
    } catch (error) {
      toast.error('Failed to load messages')
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!messageText.trim() || !selectedChat && !selectedUser) return

    try {
      const receiverId = selectedUser ? selectedUser.id : 
        conversations.find(c => c.chat_id === selectedChat)?.other_user_id

      if (!receiverId) {
        toast.error('Invalid receiver')
        console.error('No receiver ID found', { selectedUser, selectedChat, conversations })
        return
      }

      console.log('Sending message:', {
        sender_id: userId,
        receiver_id: receiverId,
        text: messageText,
      })

      await messageService.sendMessage({
        sender_id: userId,
        receiver_id: receiverId,
        text: messageText,
      })
      
      setMessageText('')
      loadMessages()
      loadConversations()
      
      if (selectedUser && !selectedChat) {
        const ids = [userId, selectedUser.id].sort()
        setSelectedChat(`${ids[0]}_${ids[1]}`)
        setSelectedUser(null)
        setShowNewConversation(false)
      }
      
      toast.success('Message sent!')
    } catch (error) {
      console.error('Send message error:', error.response?.data || error.message)
      toast.error(error.response?.data?.detail || 'Failed to send message')
    }
  }

  const startNewConversation = (user) => {
    console.log('Starting conversation with:', user)
    setSelectedUser(user)
    setSelectedChat(null)
    setShowNewConversation(false)
    setMessages([]) // Clear old messages
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  const activeChat = selectedChat || (selectedUser && `new_${selectedUser.id}`)

  return (
    <div className="ml-64 flex h-screen bg-gray-100">
      {/* Conversations List */}
      <div className="w-80 bg-white shadow-lg overflow-y-auto border-r">
        <div className="sticky top-0 bg-white p-4 border-b">
          <div className="flex items-center justify-between text-2xl font-bold mb-4">
            <div className="flex items-center space-x-2">
              <FaEnvelope className="text-green-500" />
              <span>Messages</span>
            </div>
            <button
              onClick={() => setShowNewConversation(!showNewConversation)}
              className="flex items-center gap-2 bg-green-500 text-white hover:bg-green-600 px-3 py-1.5 rounded-lg transition text-sm font-semibold"
              title="Start a new message"
            >
              <FaPlus size={16} />
              New
            </button>
          </div>
        </div>

        {showNewConversation && (
          <div className="p-4 border-b bg-blue-50">
            <p className="text-sm font-semibold mb-3 text-gray-700">👥 Select user to message</p>
            {loadingUsers ? (
              <p className="text-xs text-gray-500 text-center py-4">Loading users...</p>
            ) : suggestedUsers.length === 0 ? (
              <div className="text-xs text-center py-6 text-gray-500">
                <p>😅 No users available</p>
                <p className="mt-2 text-gray-400">Go to Explore to find and follow users first</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {suggestedUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => startNewConversation(user)}
                    className="w-full text-left p-3 hover:bg-blue-100 bg-white rounded-lg transition text-sm border border-gray-200"
                  >
                    <img 
                      src={user.profile_picture || 'https://via.placeholder.com/30'} 
                      alt={user.username}
                      className="w-8 h-8 rounded-full inline-block mr-2"
                    />
                    <div className="inline-block">
                      <p className="font-semibold text-gray-800">{user.username}</p>
                      <p className="text-xs text-gray-600 truncate">{user.bio || 'No bio'}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {conversations.length === 0 && !showNewConversation && (
          <div className="p-4 text-center text-gray-600">
            <div className="text-4xl mb-2">💬</div>
            <p className="font-semibold mb-1">No messages yet</p>
            <p className="text-sm mb-3">Start a new conversation</p>
            <button
              onClick={() => setShowNewConversation(true)}
              className="w-full bg-green-500 text-white hover:bg-green-600 py-2 px-4 rounded-lg text-sm font-semibold transition"
            >
              + New Message
            </button>
          </div>
        )}

        <div>
          {conversations.map((convo) => (
            <div
              key={convo.chat_id}
              onClick={() => {
                setSelectedChat(convo.chat_id)
                setSelectedUser(null)
              }}
              className={`p-4 border-b cursor-pointer transition ${
                activeChat === convo.chat_id
                  ? 'bg-green-50 border-l-4 border-green-500'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <img
                  src={convo.other_user_profile_picture || 'https://via.placeholder.com/40'}
                  alt={convo.other_user_username}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800">
                    {convo.other_user_username}
                  </p>
                  <p className="text-sm text-gray-600 truncate">
                    {convo.last_message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(convo.last_message_time).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b p-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-800">
                  {selectedUser ? selectedUser.username : 'Chat'}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedUser && selectedUser.bio}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedUser(null)
                  setSelectedChat(null)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender_id === userId ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.sender_id === userId
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-300 text-gray-800'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t bg-white"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                  disabled={!selectedUser && !selectedChat}
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                  disabled={!selectedUser && !selectedChat}
                >
                  <FaPaperPlane />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-green-50 to-gray-100">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-4">✨</div>
              <p className="text-3xl font-bold text-gray-800 mb-3">Ready to chat?</p>
              <p className="text-gray-600 mb-2">👇 Click the <span className="font-bold bg-green-100 px-2 py-1 rounded">+ New</span> button to start messaging!</p>
              <p className="text-sm text-gray-500 mb-6">Or select a conversation from your list on the left</p>
              <button
                onClick={() => setShowNewConversation(true)}
                className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition font-semibold text-lg"
              >
                📨 Start Messaging
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MessagesPage
