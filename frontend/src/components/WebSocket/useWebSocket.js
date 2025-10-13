import { useState, useEffect, useRef } from 'react'

const useWebSocket = (url) => {
  const [lastMessage, setLastMessage] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [reconnectCount, setReconnectCount] = useState(0)
  const ws = useRef(null)
  const reconnectTimeout = useRef(null)
  const pingInterval = useRef(null)

  const connect = () => {
    try {
      console.log(`Connecting to WebSocket: ${url}`)
      ws.current = new WebSocket(url)
      
      ws.current.onopen = () => {
        console.log('WebSocket connected successfully')
        setIsConnected(true)
        setReconnectCount(0)
        
        // Start ping interval to keep connection alive
        pingInterval.current = setInterval(() => {
          if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send('ping')
          }
        }, 30000) // Send ping every 30 seconds
      }
      
      ws.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason)
        setIsConnected(false)
        clearInterval(pingInterval.current)
        
        // Attempt reconnect with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, reconnectCount), 30000)
        console.log(`Reconnecting in ${delay}ms...`)
        
        reconnectTimeout.current = setTimeout(() => {
          setReconnectCount(prev => prev + 1)
          connect()
        }, delay)
      }
      
      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          // Ignore ping/pong messages for the log display
          if (message.type !== 'ping' && message.type !== 'pong') {
            setLastMessage(message)
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error)
        setIsConnected(false)
      }
    } catch (error) {
      console.error('WebSocket connection failed:', error)
      setIsConnected(false)
    }
  }

  useEffect(() => {
    connect()

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current)
      }
      if (pingInterval.current) {
        clearInterval(pingInterval.current)
      }
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [url])

  return { lastMessage, isConnected, reconnectCount }
}

export default useWebSocket