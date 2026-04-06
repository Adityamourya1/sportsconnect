class WebSocketService {
  constructor() {
    this.notificationWs = null
    this.messagingWs = null
    this.userId = localStorage.getItem('user_id')
    this.listeners = {}
  }

  // Connect to notifications WebSocket
  connectNotifications() {
    if (!this.userId) {
      console.error('User ID not found')
      return
    }

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const wsUrl = `${protocol}://localhost:8000/api/ws/notifications/${this.userId}`

    try {
      this.notificationWs = new WebSocket(wsUrl)

      this.notificationWs.onopen = () => {
        console.log('✓ Connected to notifications WebSocket')
        this.emit('notification_connected')
      }

      this.notificationWs.onmessage = (event) => {
        const data = JSON.parse(event.data)
        console.log('📬 Notification received:', data)
        this.emit('notification', data)
        
        // Emit specific notification types
        if (data.type) {
          this.emit(`notification:${data.type}`, data)
        }
      }

      this.notificationWs.onerror = (error) => {
        console.error('❌ Notification WebSocket error:', error)
        this.emit('notification_error', error)
      }

      this.notificationWs.onclose = () => {
        console.log('Disconnected from notifications')
        this.emit('notification_disconnected')
        // Attempt to reconnect after 3 seconds
        setTimeout(() => this.connectNotifications(), 3000)
      }
    } catch (error) {
      console.error('Failed to connect to notifications:', error)
    }
  }

  // Connect to messaging WebSocket
  connectMessaging() {
    if (!this.userId) {
      console.error('User ID not found')
      return
    }

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const wsUrl = `${protocol}://localhost:8000/api/ws/messaging/${this.userId}`

    try {
      this.messagingWs = new WebSocket(wsUrl)

      this.messagingWs.onopen = () => {
        console.log('✓ Connected to messaging WebSocket')
        this.emit('messaging_connected')
      }

      this.messagingWs.onmessage = (event) => {
        const data = JSON.parse(event.data)
        console.log('💬 Message received:', data)
        this.emit('message', data)
      }

      this.messagingWs.onerror = (error) => {
        console.error('❌ Messaging WebSocket error:', error)
        this.emit('messaging_error', error)
      }

      this.messagingWs.onclose = () => {
        console.log('Disconnected from messaging')
        this.emit('messaging_disconnected')
        // Attempt to reconnect after 3 seconds
        setTimeout(() => this.connectMessaging(), 3000)
      }
    } catch (error) {
      console.error('Failed to connect to messaging:', error)
    }
  }

  // Send a message
  sendMessage(recipientId, text) {
    if (!this.messagingWs || this.messagingWs.readyState !== WebSocket.OPEN) {
      console.error('Messaging WebSocket not connected')
      return false
    }

    const message = {
      type: 'message',
      recipient_id: recipientId,
      text,
      timestamp: new Date().toISOString()
    }

    try {
      this.messagingWs.send(JSON.stringify(message))
      return true
    } catch (error) {
      console.error('Failed to send message:', error)
      return false
    }
  }

  // Keep connection alive by sending pings
  startHeartbeat() {
    setInterval(() => {
      if (this.notificationWs && this.notificationWs.readyState === WebSocket.OPEN) {
        this.notificationWs.send(JSON.stringify({ type: 'ping' }))
      }
      if (this.messagingWs && this.messagingWs.readyState === WebSocket.OPEN) {
        this.messagingWs.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000) // Every 30 seconds
  }

  // Event emitter methods
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  off(event, callback) {
    if (!this.listeners[event]) return
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback)
  }

  emit(event, data) {
    if (!this.listeners[event]) return
    this.listeners[event].forEach(callback => callback(data))
  }

  // Disconnect all WebSockets
  disconnect() {
    if (this.notificationWs) {
      this.notificationWs.close()
    }
    if (this.messagingWs) {
      this.messagingWs.close()
    }
  }
}

// Create singleton instance
export const wsService = new WebSocketService()
