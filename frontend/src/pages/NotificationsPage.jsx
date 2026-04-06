import React, { useState, useEffect } from 'react'
import { notificationService } from '../services'
import { FaBell } from 'react-icons/fa'
import toast from 'react-hot-toast'

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const userId = localStorage.getItem('user_id')

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      setIsLoading(true)
      const response = await notificationService.getNotifications(userId)
      setNotifications(response.data)
    } catch (error) {
      toast.error('Failed to load notifications')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId)
      loadNotifications()
      toast.success('Notification marked as read')
    } catch (error) {
      toast.error('Failed to update notification')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="ml-64 p-6 max-w-2xl mx-auto">
      <div className="flex items-center space-x-3 mb-8">
        <FaBell size={40} className="text-blue-500" />
        <h1 className="text-4xl font-bold">Notifications</h1>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-600 text-lg">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-lg shadow-md cursor-pointer transition ${
                notif.is_read
                  ? 'bg-gray-100'
                  : 'bg-blue-50 border-l-4 border-blue-500'
              }`}
              onClick={() => handleMarkAsRead(notif.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-800">{notif.type}</p>
                  <p className="text-gray-600 mt-1">{notif.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(notif.created_at).toLocaleDateString()}
                  </p>
                </div>
                {!notif.is_read && (
                  <span className="w-3 h-3 bg-blue-500 rounded-full mt-2"></span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default NotificationsPage
