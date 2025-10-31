import { useState, useEffect, useRef } from 'react'
import SecurityUtils from '../utils/security'

export const useWebSocket = (url) => {
  const [data, setData] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState('Connecting')
  const ws = useRef(null)

  useEffect(() => {
    const connectWebSocket = () => {
      try {
        // Create WebSocket URL through API gateway
        const wsUrl = url.replace('ws://localhost:8085', 'ws://localhost:8080')
        
        // Validate WebSocket URL
        if (!SecurityUtils.validateURL(wsUrl.replace('ws://', 'http://'))) {
          console.error('Invalid WebSocket URL')
          setConnectionStatus('Error')
          return
        }

        ws.current = new WebSocket(wsUrl)
        
        ws.current.onopen = () => {
          setConnectionStatus('Connected')
          console.log('WebSocket connected')
        }
        
        ws.current.onmessage = (event) => {
          try {
            // Secure JSON parsing with validation
            const message = SecurityUtils.safeJSONParse(event.data)
            
            // Additional validation for WebSocket messages
            if (message && typeof message === 'object') {
              setData(message)
            } else {
              console.warn('Invalid WebSocket message format')
            }
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error)
          }
        }
        
        ws.current.onclose = () => {
          setConnectionStatus('Disconnected')
          console.log('WebSocket disconnected')
          
          // Reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000)
        }
        
        ws.current.onerror = (error) => {
          setConnectionStatus('Error')
          console.error('WebSocket error:', error)
        }
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error)
        setConnectionStatus('Error')
      }
    }

    connectWebSocket()

    return () => {
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [url])

  const sendMessage = (message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      try {
        // Validate message before sending
        if (message && typeof message === 'object') {
          ws.current.send(JSON.stringify(message))
        }
      } catch (error) {
        console.error('Failed to send WebSocket message:', error)
      }
    }
  }

  return { data, connectionStatus, sendMessage }
}