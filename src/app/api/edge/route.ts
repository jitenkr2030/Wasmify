import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Global edge regions configuration
const EDGE_REGIONS = [
  { 
    id: 'us-east-1', 
    name: 'US East (N. Virginia)', 
    location: 'Virginia, USA',
    coordinates: { lat: 37.5, lng: -77.5 },
    capacity: 1000,
    currentLoad: 0
  },
  { 
    id: 'us-west-2', 
    name: 'US West (Oregon)', 
    location: 'Oregon, USA',
    coordinates: { lat: 45.5, lng: -122.5 },
    capacity: 1000,
    currentLoad: 0
  },
  { 
    id: 'eu-west-1', 
    name: 'Europe (Ireland)', 
    location: 'Dublin, Ireland',
    coordinates: { lat: 53.3, lng: -6.2 },
    capacity: 1000,
    currentLoad: 0
  },
  { 
    id: 'eu-central-1', 
    name: 'Europe (Frankfurt)', 
    location: 'Frankfurt, Germany',
    coordinates: { lat: 50.1, lng: 8.7 },
    capacity: 1000,
    currentLoad: 0
  },
  { 
    id: 'ap-southeast-1', 
    name: 'Asia Pacific (Singapore)', 
    location: 'Singapore',
    coordinates: { lat: 1.3, lng: 103.8 },
    capacity: 1000,
    currentLoad: 0
  },
  { 
    id: 'ap-northeast-1', 
    name: 'Asia Pacific (Tokyo)', 
    location: 'Tokyo, Japan',
    coordinates: { lat: 35.7, lng: 139.7 },
    capacity: 1000,
    currentLoad: 0
  },
  { 
    id: 'ap-south-1', 
    name: 'Asia Pacific (Mumbai)', 
    location: 'Mumbai, India',
    coordinates: { lat: 19.1, lng: 72.9 },
    capacity: 1000,
    currentLoad: 0
  },
  { 
    id: 'sa-east-1', 
    name: 'South America (São Paulo)', 
    location: 'São Paulo, Brazil',
    coordinates: { lat: -23.5, lng: -46.6 },
    capacity: 1000,
    currentLoad: 0
  },
  { 
    id: 'ca-central-1', 
    name: 'Canada (Central)', 
    location: 'Montreal, Canada',
    coordinates: { lat: 45.5, lng: -73.6 },
    capacity: 1000,
    currentLoad: 0
  },
  { 
    id: 'ap-northeast-2', 
    name: 'Asia Pacific (Seoul)', 
    location: 'Seoul, South Korea',
    coordinates: { lat: 37.6, lng: 127.0 },
    capacity: 1000,
    currentLoad: 0
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'status'

    switch (action) {
      case 'regions':
        return getEdgeRegions()
      case 'deployments':
        return getEdgeDeployments()
      case 'metrics':
        return getEdgeMetrics()
      case 'scaling':
        return getScalingStatus()
      default:
        return getEdgeStatus()
    }
  } catch (error) {
    console.error('Error in edge API:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process edge request' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'deploy':
        return deployToEdge(data)
      case 'scale':
        return scaleDeployment(data)
      case 'migrate':
        return migrateDeployment(data)
      case 'optimize':
        return optimizeDeployment(data)
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in edge POST API:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process edge request' },
      { status: 500 }
    )
  }
}

async function getEdgeRegions() {
  // Get current load from database
  const edgeNodes = await db.edgeNode.findMany()
  
  // Merge with static configuration
  const regions = EDGE_REGIONS.map(region => {
    const node = edgeNodes.find(n => n.region === region.id)
    return {
      ...region,
      status: node?.status || 'active',
      currentLoad: node?.currentLoad || 0,
      available: (region.capacity - (node?.currentLoad || 0)),
      lastUpdated: node?.lastSeen || new Date()
    }
  })

  return NextResponse.json({
    success: true,
    data: {
      regions,
      summary: {
        totalRegions: regions.length,
        activeRegions: regions.filter(r => r.status === 'active').length,
        totalCapacity: regions.reduce((sum, r) => sum + r.capacity, 0),
        totalUsed: regions.reduce((sum, r) => sum + r.currentLoad, 0),
        availability: regions.reduce((sum, r) => sum + r.available, 0)
      }
    }
  })
}

async function getEdgeDeployments() {
  const deployments = await db.deployment.findMany({
    where: {
      status: 'active'
    },
    include: {
      module: {
        select: {
          id: true,
          name: true,
          version: true,
          language: true
        }
      },
      deployer: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      metrics: {
        orderBy: {
          timestamp: 'desc'
        },
        take: 10
      }
    }
  })

  // Add edge-specific metrics
  const deploymentsWithEdgeMetrics = await Promise.all(
    deployments.map(async (deployment) => {
      const edgeMetrics = await getDeploymentEdgeMetrics(deployment.id)
      
      return {
        ...deployment,
        edgeMetrics,
        globalReplicas: await getGlobalReplicaCount(deployment.id),
        latency: await getAverageLatency(deployment.id)
      }
    })
  )

  return NextResponse.json({
    success: true,
    data: deploymentsWithEdgeMetrics
  })
}

async function getEdgeMetrics() {
  const edgeNodes = await db.edgeNode.findMany()
  
  const totalMetrics = {
    totalRequests: 0,
    avgResponseTime: 0,
    totalMemoryUsed: 0,
    totalCpuUsed: 0,
    errorRate: 0,
    uptime: 0,
    cacheHitRate: 0
  }

  let totalResponseTime = 0
  let totalMemory = 0
  let totalCpu = 0
  let totalErrors = 0
  let totalRequests = 0
  let activeNodes = 0

  for (const node of edgeNodes) {
    if (node.status === 'active') {
      activeNodes++
      // Get latest metrics for this node
      const latestMetric = await db.deploymentMetric.findFirst({
        where: {
          deployment: {
            region: node.region
          }
        },
        orderBy: {
          timestamp: 'desc'
        }
      })

      if (latestMetric) {
        totalMetrics.totalRequests += latestMetric.requestCount
        totalResponseTime += latestMetric.responseTime
        totalMemory += latestMetric.memoryUsage
        totalCpu += latestMetric.cpuUsage
        totalErrors += Math.floor(latestMetric.requestCount * latestMetric.errorRate / 100)
        totalRequests += latestMetric.requestCount
      }
    }
  }

  if (activeNodes > 0) {
    totalMetrics.avgResponseTime = totalResponseTime / activeNodes
    totalMetrics.totalMemoryUsed = totalMemory
    totalMetrics.totalCpuUsed = totalCpu
    totalMetrics.errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0
    totalMetrics.uptime = (activeNodes / edgeNodes.length) * 100
    totalMetrics.cacheHitRate = 94.7 // Simulated cache hit rate
  }

  return NextResponse.json({
    success: true,
    data: totalMetrics
  })
}

async function getScalingStatus() {
  const edgeNodes = await db.edgeNode.findMany()
  
  const scalingEvents = []
  
  for (const node of edgeNodes) {
    const utilizationRate = (node.currentLoad / node.capacity) * 100
    
    if (utilizationRate > 80) {
      scalingEvents.push({
        region: node.region,
        type: 'scale_out',
        reason: 'High utilization',
        currentLoad: node.currentLoad,
        capacity: node.capacity,
        utilizationRate,
        recommendedAction: 'Add more replicas or increase capacity'
      })
    } else if (utilizationRate < 20 && node.currentLoad > 0) {
      scalingEvents.push({
        region: node.region,
        type: 'scale_in',
        reason: 'Low utilization',
        currentLoad: node.currentLoad,
        capacity: node.capacity,
        utilizationRate,
        recommendedAction: 'Reduce replicas to save costs'
      })
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      scalingEvents,
      autoScalingEnabled: true,
      scaleOutThreshold: 80,
      scaleInThreshold: 20,
      cooldownPeriod: 300 // 5 minutes
    }
  })
}

async function getEdgeStatus() {
  const edgeNodes = await db.edgeNode.findMany()
  
  const status = {
    overall: 'healthy',
    regions: {},
    summary: {
      total: edgeNodes.length,
      active: edgeNodes.filter(n => n.status === 'active').length,
      maintenance: edgeNodes.filter(n => n.status === 'maintenance').length,
      offline: edgeNodes.filter(n => n.status === 'offline').length
    }
  }

  for (const node of edgeNodes) {
    status.regions[node.region] = {
      status: node.status,
      load: node.currentLoad,
      capacity: node.capacity,
      utilization: (node.currentLoad / node.capacity) * 100,
      lastSeen: node.lastSeen
    }
  }

  // Determine overall status
  if (status.summary.offline > 0) {
    status.overall = 'degraded'
  } else if (status.summary.maintenance > 0) {
    status.overall = 'maintenance'
  }

  return NextResponse.json({
    success: true,
    data: status
  })
}

async function deployToEdge(data: any) {
  const { moduleId, regions = [], config = {} } = data
  
  // Determine deployment regions
  const targetRegions = regions.length > 0 ? regions : ['global']
  
  // Create deployment record
  const deployment = await db.deployment.create({
    data: {
      name: `edge-deployment-${Date.now()}`,
      environment: 'production',
      region: targetRegions[0],
      status: 'deploying',
      moduleId,
      deployerId: 'system', // Would be actual user ID
      config: {
        ...config,
        edge: true,
        autoScaling: true,
        globalRegions: targetRegions
      }
    },
    include: {
      module: true,
      deployer: true
    }
  })

  // Simulate edge deployment process
  setTimeout(async () => {
    await db.deployment.update({
      where: { id: deployment.id },
      data: { status: 'active' }
    })
  }, 5000)

  return NextResponse.json({
    success: true,
    data: {
      deployment,
      regions: targetRegions,
      estimatedDeploymentTime: '5 minutes',
      status: 'deploying'
    }
  })
}

async function scaleDeployment(data: any) {
  const { deploymentId, action, targetRegions, config = {} } = data
  
  const deployment = await db.deployment.findUnique({
    where: { id: deploymentId }
  })

  if (!deployment) {
    return NextResponse.json(
      { success: false, error: 'Deployment not found' },
      { status: 404 }
    )
  }

  // Update deployment configuration
  const updatedDeployment = await db.deployment.update({
    where: { id: deploymentId },
    data: {
      config: {
        ...deployment.config,
        ...config,
        lastScaled: new Date().toISOString(),
        scalingAction: action
      }
    }
  })

  return NextResponse.json({
    success: true,
    data: {
      deployment: updatedDeployment,
      scalingAction: action,
      targetRegions,
      estimatedTime: '2-3 minutes'
    }
  })
}

// Helper functions
async function getDeploymentEdgeMetrics(deploymentId: string) {
  // Simulate edge-specific metrics
  return {
    globalReplicas: 12,
    avgLatency: 42,
    cacheHitRate: 94.7,
    edgeRequests: 125000,
    bandwidthSaved: '2.3 GB'
  }
}

async function getGlobalReplicaCount(deploymentId: string) {
  // Simulate global replica count
  return Math.floor(Math.random() * 20) + 5
}

async function getAverageLatency(deploymentId: string) {
  // Simulate average latency across edge locations
  return Math.floor(Math.random() * 50) + 20
}

async function migrateDeployment(data: any) {
  const { deploymentId, fromRegion, toRegion } = data
  
  // Simulate migration process
  return {
    migrationId: `migration-${Date.now()}`,
    status: 'in_progress',
    estimatedTime: '10 minutes'
  }
}

async function optimizeDeployment(data: any) {
  const { deploymentId, optimizationType } = data
  
  // Simulate optimization
  return {
    optimizationId: `opt-${Date.now()}`,
    type: optimizationType,
    expectedImprovement: '15-25%',
    status: 'in_progress'
  }
}