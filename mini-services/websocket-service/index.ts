import { Server } from 'socket.io'

const io = new Server(3001, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"]
  }
})

console.log('WebSocket service running on port 3001')

// Store active connections and rooms
const connections = new Map()
const rooms = new Map()

// Metrics data
let metrics = {
  requests: 0,
  errors: 0,
  responseTime: 0,
  activeModules: 0,
  edgeNodes: 5
}

// Generate random metrics updates
setInterval(() => {
  metrics.requests += Math.floor(Math.random() * 100) + 50
  metrics.errors += Math.floor(Math.random() * 5)
  metrics.responseTime = Math.floor(Math.random() * 100) + 20
  metrics.activeModules = Math.floor(Math.random() * 10) + 3

  // Broadcast to all connected clients
  io.emit('metrics:update', {
    ...metrics,
    timestamp: new Date().toISOString()
  })
}, 5000) // Every 5 seconds

// Handle connections
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)
  connections.set(socket.id, {
    connectedAt: new Date(),
    rooms: []
  })

  // Send initial data
  socket.emit('metrics:update', {
    ...metrics,
    timestamp: new Date().toISOString()
  })

  // Join room for specific updates
  socket.on('join:room', (room) => {
    socket.join(room)
    const connection = connections.get(socket.id)
    if (connection) {
      connection.rooms.push(room)
    }
    console.log(`Client ${socket.id} joined room: ${room}`)
  })

  // Leave room
  socket.on('leave:room', (room) => {
    socket.leave(room)
    const connection = connections.get(socket.id)
    if (connection) {
      connection.rooms = connection.rooms.filter((r: string) => r !== room)
    }
    console.log(`Client ${socket.id} left room: ${room}`)
  })

  // Handle deployment updates
  socket.on('deployment:update', (data) => {
    console.log('Deployment update:', data)
    // Broadcast to deployment room
    io.to('deployments').emit('deployment:update', {
      ...data,
      timestamp: new Date().toISOString()
    })
  })

  // Handle module updates
  socket.on('module:update', (data) => {
    console.log('Module update:', data)
    // Broadcast to modules room
    io.to('modules').emit('module:update', {
      ...data,
      timestamp: new Date().toISOString()
    })
  })

  // Handle alert notifications
  socket.on('alert:create', (alert) => {
    console.log('New alert:', alert)
    // Broadcast to alerts room
    io.to('alerts').emit('alert:new', {
      ...alert,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    })
  })

  // Handle edge node updates
  socket.on('edge:update', (data) => {
    console.log('Edge node update:', data)
    // Broadcast to edge room
    io.to('edge').emit('edge:update', {
      ...data,
      timestamp: new Date().toISOString()
    })
  })

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`)
    connections.delete(socket.id)
  })

  // Handle errors
  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error)
  })
})

// Simulate deployment events
setInterval(() => {
  const deploymentEvents = [
    { type: 'deploying', module: 'auth-service', status: 'in-progress' },
    { type: 'success', module: 'image-processor', status: 'completed' },
    { type: 'failed', module: 'api-handler', status: 'error' }
  ]
  
  const event = deploymentEvents[Math.floor(Math.random() * deploymentEvents.length)]
  
  io.to('deployments').emit('deployment:event', {
    ...event,
    timestamp: new Date().toISOString(),
    id: Date.now().toString()
  })
}, 30000) // Every 30 seconds

// Simulate alert events
setInterval(() => {
  const alerts = [
    { level: 'warning', message: 'High memory usage detected', module: 'auth-service' },
    { level: 'info', message: 'Deployment completed successfully', module: 'image-processor' },
    { level: 'critical', message: 'Error rate exceeded threshold', module: 'api-handler' }
  ]
  
  const alert = alerts[Math.floor(Math.random() * alerts.length)]
  
  io.to('alerts').emit('alert:new', {
    ...alert,
    id: Date.now().toString(),
    timestamp: new Date().toISOString()
  })
}, 45000) // Every 45 seconds

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down WebSocket service...')
  io.close()
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('Shutting down WebSocket service...')
  io.close()
  process.exit(0)
})