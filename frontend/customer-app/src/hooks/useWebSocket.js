import { useEffect, useState, useRef, useCallback } from 'react'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import activityLogger from '../utils/activityLogger'
import SecurityUtils from '../utils/security'

// Singleton WebSocket instance
let globalSocket = null
let globalConnectionStatus = 'disconnected'
let globalIsConnected = false
let subscribers = new Set()

const notifySubscribers = (type, data) => {
  subscribers.forEach(callback => callback(type, data))
}

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(globalIsConnected)
  const [connectionStatus, setConnectionStatus] = useState(globalConnectionStatus)
  const [notifications, setNotifications] = useState([])
  const [aiResponses, setAiResponses] = useState([])
  const [chatMessages, setChatMessages] = useState([])
  const [typingUsers, setTypingUsers] = useState(new Set())
  const [onlineUsers, setOnlineUsers] = useState(new Map())
  const [realtimeData, setRealtimeData] = useState({})
  const socketRef = useRef(null)
  const reconnectAttempts = useRef(0)
  const heartbeatInterval = useRef(null)
  const isConnecting = useRef(false)
  const { user, token } = useAuthStore()

  const connect = useCallback(() => {
    if (globalSocket && (globalSocket.readyState === WebSocket.CONNECTING || globalSocket.readyState === WebSocket.OPEN)) {
      socketRef.current = globalSocket
      return
    }
    
    if (isConnecting.current) return
    
    try {
      isConnecting.current = true
      globalConnectionStatus = 'connecting'
      setConnectionStatus('connecting')
      notifySubscribers('status', 'connecting')
      
      const userId = user?.id || 'anonymous'
      // Use secure WebSocket connections
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const host = window.location.hostname
      const port = process.env.NODE_ENV === 'production' ? '8087' : '8087'
      const wsUrl = `${protocol}//${host}:${port}/ws`
      
      // Validate URL before connecting
      if (!SecurityUtils.validateURL(wsUrl.replace('ws:', 'http:').replace('wss:', 'https:'))) {
        throw new Error('Invalid WebSocket URL')
      }
      
      const ws = new WebSocket(wsUrl)
      globalSocket = ws
      socketRef.current = ws

      ws.onopen = () => {
        isConnecting.current = false
        globalIsConnected = true
        globalConnectionStatus = 'connected'
        setIsConnected(true)
        setConnectionStatus('connected')
        reconnectAttempts.current = 0
        console.log('🔗 WebSocket connected with advanced features')
        notifySubscribers('status', 'connected')
        activityLogger.log('websocket_connected')
        
        // Start heartbeat
        heartbeatInterval.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'heartbeat' }))
          }
        }, 30000)
        
        // Authenticate WebSocket connection
        if (token) {
          ws.send(JSON.stringify({ 
            type: 'authenticate', 
            token: token,
            userId: userId 
          }))
        }
        
        // Join default rooms
        ws.send(JSON.stringify({ type: 'join-room', room: 'general' }))
        ws.send(JSON.stringify({ type: 'presence', status: 'online' }))
      }

      ws.onclose = (event) => {
        isConnecting.current = false
        globalIsConnected = false
        globalConnectionStatus = 'disconnected'
        globalSocket = null
        setIsConnected(false)
        setConnectionStatus('disconnected')
        clearInterval(heartbeatInterval.current)
        
        console.log('🔌 WebSocket disconnected:', event.code, event.reason)
        notifySubscribers('status', 'disconnected')
        activityLogger.log('websocket_disconnected', { code: event.code, reason: event.reason })
        
        // Exponential backoff reconnection
        if (reconnectAttempts.current < 10) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
          setTimeout(() => {
            reconnectAttempts.current++
            connect()
          }, delay)
        }
      }

      ws.onerror = (error) => {
        isConnecting.current = false
        globalConnectionStatus = 'error'
        console.error('❌ WebSocket error:', error)
        setConnectionStatus('error')
        notifySubscribers('status', 'error')
      }

      ws.onmessage = (event) => {
        try {
          // Validate message size to prevent DoS
          if (event.data.length > 1024 * 1024) { // 1MB limit
            console.warn('📨 Message too large, ignoring')
            return
          }
          
          const data = SecurityUtils.safeJSONParse(event.data)
          if (!data || !data.type) {
            console.warn('📨 Invalid WebSocket message received')
            return
          }
          
          // Rate limiting check
          const clientId = user?.id || 'anonymous'
          if (!SecurityUtils.rateLimiter.isAllowed(`ws_${clientId}`, 100, 60000)) {
            console.warn('📨 Rate limit exceeded, ignoring message')
            return
          }
          
          handleMessage(data)
          notifySubscribers('message', data)
        } catch (e) {
          console.warn('📨 Failed to parse WebSocket message:', e)
        }
      }
    } catch (error) {
      isConnecting.current = false
      console.error('🚫 WebSocket connection failed:', error)
      setConnectionStatus('error')
    }
  }, [user?.id, token])

  const handleMessage = useCallback((data) => {
    const { type } = data
    
    switch (type) {
      case 'connection':
        toast.success('🚀 Connected with real-time features!')
        console.log('✨ Features available:', data.features)
        break
        
      case 'ai-response':
        setAiResponses(prev => [data, ...prev.slice(0, 19)])
        activityLogger.logAIInteraction('websocket_ai_response', data.message)
        break
        
      case 'ai-recommendations':
        setRealtimeData(prev => ({ ...prev, recommendations: data.products }))
        toast.success('🤖 AI found personalized recommendations!')
        break
        
      case 'chat':
        setChatMessages(prev => [data, ...prev.slice(0, 99)])
        if (data.userId !== user?.id) {
          toast(`💬 ${data.userId}: ${data.message.substring(0, 50)}...`)
        }
        activityLogger.log('chat_received', { from: data.userId, room: data.room })
        break
        
      case 'typing':
        setTypingUsers(prev => {
          const newSet = new Set(prev)
          if (data.typing) {
            newSet.add(data.userId)
          } else {
            newSet.delete(data.userId)
          }
          return newSet
        })
        break
        
      case 'presence-update':
        setOnlineUsers(prev => new Map(prev.set(data.userId, {
          status: data.status,
          lastSeen: data.timestamp
        })))
        break
        
      case 'order-status':
      case 'order-update':
        toast.success(`📦 Order ${data.orderId}: ${data.status}`)
        setRealtimeData(prev => ({ 
          ...prev, 
          orders: { ...prev.orders, [data.orderId]: data } 
        }))
        break
        
      case 'price-update':
        setRealtimeData(prev => ({ 
          ...prev, 
          prices: { ...prev.prices, [data.productId]: data.price } 
        }))
        toast(`💰 Price updated for product ${data.productId}`)
        break
        
      case 'inventory-update':
      case 'product-views':
        setRealtimeData(prev => ({ 
          ...prev, 
          inventory: { ...prev.inventory, [data.productId]: data } 
        }))
        break
        
      case 'cart-sync':
        setRealtimeData(prev => ({ ...prev, cart: data.cart }))
        toast.success('🛒 Cart synced across devices')
        break
        
      case 'voice-note':
        setChatMessages(prev => [data, ...prev.slice(0, 99)])
        toast('🎤 Voice message received')
        break
        
      case 'file-share':
        setChatMessages(prev => [data, ...prev.slice(0, 99)])
        toast(`📎 File shared: ${data.fileName}`)
        break
        
      case 'notification':
        setNotifications(prev => [data, ...prev.slice(0, 49)])
        if (data.type === 'success') {
          toast.success(data.message)
        } else if (data.type === 'error') {
          toast.error(data.message)
        } else {
          toast(data.message)
        }
        break
        
      case 'ping':
        sendMessage('heartbeat')
        break
        
      case 'pong':
        // Heartbeat acknowledged
        break
        
      case 'room-joined':
        console.log(`🏠 Joined room: ${data.room}`)
        break
        
      case 'room-left':
        console.log(`🚪 Left room: ${data.room}`)
        break
        
      case 'error':
        toast.error(`❌ ${data.message}`)
        break
        
      default:
        console.log('📨 Unknown message type:', type, data)
    }
  }, [user?.id])

  useEffect(() => {
    const subscriber = (type, data) => {
      if (type === 'status') {
        setConnectionStatus(data)
        setIsConnected(data === 'connected')
      } else if (type === 'message') {
        handleMessage(data)
      }
    }
    
    subscribers.add(subscriber)
    connect()
    
    return () => {
      subscribers.delete(subscriber)
      clearInterval(heartbeatInterval.current)
    }
  }, [connect, handleMessage])

  // Enhanced message sending with security validation
  const sendMessage = useCallback((type, data = {}) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      // Sanitize message data
      const sanitizedData = {}
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') {
          sanitizedData[key] = SecurityUtils.sanitizeInput(value)
        } else {
          sanitizedData[key] = value
        }
      }
      
      const message = JSON.stringify({ 
        type: SecurityUtils.sanitizeInput(type), 
        ...sanitizedData, 
        timestamp: Date.now(),
        userId: user?.id
      })
      
      // Check message size
      if (message.length > 64 * 1024) { // 64KB limit
        console.warn('Message too large to send')
        return false
      }
      
      socketRef.current.send(message)
      return true
    }
    return false
  }, [user?.id])

  // AI Chat
  const sendAIMessage = useCallback((message, context = 'general') => {
    return sendMessage('ai-chat', { message, context })
  }, [sendMessage])

  // Chat functions with input validation
  const sendChatMessage = useCallback((message, room = 'general') => {
    // Validate message length and content
    if (!message || typeof message !== 'string' || message.length > 1000) {
      console.warn('Invalid chat message')
      return false
    }
    
    // Sanitize room name
    const sanitizedRoom = SecurityUtils.sanitizeInput(room)
    if (!sanitizedRoom || sanitizedRoom.length > 50) {
      console.warn('Invalid room name')
      return false
    }
    
    return sendMessage('chat', { message, room: sanitizedRoom })
  }, [sendMessage])

  const sendTyping = useCallback((isTyping, room = 'general') => {
    return sendMessage('typing', { typing: isTyping, room })
  }, [sendMessage])

  // Room management
  const joinRoom = useCallback((room) => {
    return sendMessage('join-room', { room })
  }, [sendMessage])

  const leaveRoom = useCallback((room) => {
    return sendMessage('leave-room', { room })
  }, [sendMessage])

  // Product interactions
  const trackProductView = useCallback((productId) => {
    return sendMessage('product-view', { productId })
  }, [sendMessage])

  const updateCart = useCallback((cart) => {
    return sendMessage('cart-update', { cart })
  }, [sendMessage])

  const trackOrder = useCallback((orderId) => {
    return sendMessage('order-tracking', { orderId })
  }, [sendMessage])

  // Media sharing
  const sendVoiceNote = useCallback((audioData, duration, room = 'general') => {
    return sendMessage('voice-note', { audioData, duration, room })
  }, [sendMessage])

  const shareFile = useCallback((fileName, fileUrl, fileSize, room = 'general') => {
    return sendMessage('file-share', { fileName, fileUrl, fileSize, room })
  }, [sendMessage])

  // Presence
  const updatePresence = useCallback((status) => {
    return sendMessage('presence', { status })
  }, [sendMessage])

  // Activity tracking
  const trackActivity = useCallback((activity, metadata = {}) => {
    return sendMessage('activity', { 
      userId: user?.id, 
      activity, 
      metadata,
      timestamp: new Date().toISOString() 
    })
  }, [sendMessage, user?.id])

  return {
    // Connection state
    isConnected,
    connectionStatus,
    
    // Data streams
    notifications,
    aiResponses,
    chatMessages,
    typingUsers,
    onlineUsers,
    realtimeData,
    
    // Core functions
    sendMessage,
    trackActivity,
    
    // AI functions
    sendAIMessage,
    
    // Chat functions
    sendChatMessage,
    sendTyping,
    joinRoom,
    leaveRoom,
    
    // E-commerce functions
    trackProductView,
    updateCart,
    trackOrder,
    
    // Media functions
    sendVoiceNote,
    shareFile,
    
    // Presence functions
    updatePresence,
    
    // Utility functions
    clearNotifications: () => setNotifications([]),
    clearAIResponses: () => setAiResponses([]),
    clearChatMessages: () => setChatMessages([]),
    reconnect: connect
  }
}