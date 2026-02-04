'use client'

import { useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

interface UseWebSocketOptions {
  autoConnect?: boolean
  rooms?: string[]
}

interface WebSocketData {
  metrics?: {
    requests: number
    errors: number
    responseTime: number
    activeModules: number
    edgeNodes: number
    timestamp: string
  }
  deployment?: any
  alert?: any
  edge?: any
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { autoConnect = true, rooms = [] } = options
  const [isConnected, setIsConnected] = useState(false)
  const [data, setData] = useState<WebSocketData>({})
  const [error, setError] = useState<string | null>(null)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!autoConnect) return

    // Initialize socket connection
    const socket = io('http://localhost:3001', {
      transports: ['websocket', 'polling']
    })

    socketRef.current = socket

    // Connection events
    socket.on('connect', () => {
      console.log('Connected to WebSocket service')
      setIsConnected(true)
      setError(null)
      
      // Join rooms
      rooms.forEach(room => {
        socket.emit('join:room', room)
      })
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket service')
      setIsConnected(false)
    })

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
      setError(error.message)
      setIsConnected(false)
    })

    // Data events
    socket.on('metrics:update', (metrics) => {
      setData(prev => ({ ...prev, metrics }))
    })

    socket.on('deployment:update', (deployment) => {
      setData(prev => ({ ...prev, deployment }))
    })

    socket.on('deployment:event', (event) => {
      setData(prev => ({ 
        ...prev, 
        deployment: { ...prev.deployment, event }
      }))
    })

    socket.on('alert:new', (alert) => {
      setData(prev => ({ ...prev, alert }))
    })

    socket.on('edge:update', (edge) => {
      setData(prev => ({ ...prev, edge }))
    })

    // Cleanup
    return () => {
      rooms.forEach(room => {
        socket.emit('leave:room', room)
      })
      socket.disconnect()
    }
  }, [autoConnect, rooms])

  // Send message function
  const sendMessage = (event: string, data: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data)
    }
  }

  // Join room function
  const joinRoom = (room: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join:room', room)
    }
  }

  // Leave room function
  const leaveRoom = (room: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('leave:room', room)
    }
  }

  return {
    isConnected,
    data,
    error,
    sendMessage,
    joinRoom,
    leaveRoom
  }
}

// Hook for metrics specifically
export function useMetrics() {
  const { data, isConnected, error } = useWebSocket({ 
    autoConnect: true,
    rooms: ['metrics']
  })

  return {
    metrics: data.metrics,
    isConnected,
    error
  }
}

// Hook for deployment updates
export function useDeployments() {
  const { data, isConnected, error, sendMessage } = useWebSocket({ 
    autoConnect: true,
    rooms: ['deployments']
  })

  const updateDeployment = (deploymentData: any) => {
    sendMessage('deployment:update', deploymentData)
  }

  return {
    deployment: data.deployment,
    isConnected,
    error,
    updateDeployment
  }
}

// Hook for alerts
export function useAlerts() {
  const { data, isConnected, error, sendMessage } = useWebSocket({ 
    autoConnect: true,
    rooms: ['alerts']
  })

  const createAlert = (alertData: any) => {
    sendMessage('alert:create', alertData)
  }

  return {
    alert: data.alert,
    isConnected,
    error,
    createAlert
  }
}

// Hook for edge updates
export function useEdgeNodes() {
  const { data, isConnected, error, sendMessage } = useWebSocket({ 
    autoConnect: true,
    rooms: ['edge']
  })

  const updateEdgeNode = (edgeData: any) => {
    sendMessage('edge:update', edgeData)
  }

  return {
    edge: data.edge,
    isConnected,
    error,
    updateEdgeNode
  }
}