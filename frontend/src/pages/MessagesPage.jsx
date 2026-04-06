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
  const userId = localStorage.getItem('user_id')

  useEffect(() => {
    loadConversations()
    loadSuggestedUsers()
  }, [])

  useEffect(() => {
    if (selectedChat || selectedUser) {
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
      const response = await exploreService.getSuggestedUsers(userId)
      setSuggestedUsers(response.data || [])
    } catch (error) {
      console.error('Failed to load suggested users')
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
    setSelectedUser(user)
    setSelectedChat(null)
    setShowNewConversation(false)
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
          <div className="flex items-center justify-between space-x-2 text-2xl font-bold mb-4">
            <div className="flex items-center space-x-2">
              <FaEnvelope className="text-green-500" />
              <span>Messages</span>
            </div>
            <button
              onClick={() => setShowNewConversation(!showNewConversation)}
              className="text-green-500 hover:bg-green-50 p-2 rounded-lg transition"
              title="New conversation"
            >
              <FaPlus size={20} />
            </button>
          </div>
        </div>

        {showNewConversation && (
          <div className="p-4 border-b bg-blue-50">
            <p className="text-sm font-semibold mb-2 text-gray-700">Start a conversation</p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {suggestedUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => startNewConversation(user)}
                  className="w-full text-left p-2 hover:bg-blue-100 rounded-lg transition text-sm"
                >
                  <p className="font-semibold">{user.username}</p>
                  <p className="text-xs text-gray-600 truncate">{user.bio}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {conversations.length === 0 && !showNewConversation && (
          <div className="p-4 text-center text-gray-600">
            <p>No conversations yet</p>
            <button
              onClick={() => setShowNewConversation(true)}
              className="mt-2 text-green-500 hover:text-green-600 text-sm"
            >
              Start a conversation
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
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
              {messages.map((msg) => (
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
              ))}
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
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                >
                  <FaPaperPlane />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-600 bg-white">
            <p>Select a conversation or start a new one</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default MessagesPage
