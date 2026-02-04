import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get counts
    const totalModules = await db.wasmModule.count()
    const activeDeployments = await db.deployment.count({
      where: { status: 'active' }
    })
    const totalUsers = await db.user.count()
    const totalPackages = await db.package.count()

    // Get recent metrics
    const recentMetrics = await db.deploymentMetric.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100,
      include: {
        deployment: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      }
    })

    // Calculate stats
    const totalRequests = recentMetrics.reduce((sum, metric) => sum + metric.requestCount, 0)
    const avgResponseTime = recentMetrics.length > 0 
      ? recentMetrics.reduce((sum, metric) => sum + metric.responseTime, 0) / recentMetrics.length 
      : 0
    const avgErrorRate = recentMetrics.length > 0
      ? recentMetrics.reduce((sum, metric) => sum + metric.errorRate, 0) / recentMetrics.length
      : 0

    // Get edge nodes
    const edgeNodes = await db.edgeNode.findMany()
    const activeNodes = edgeNodes.filter(node => node.status === 'active').length

    return NextResponse.json({
      success: true,
      data: {
        totalModules,
        activeDeployments,
        totalUsers,
        totalPackages,
        totalRequests,
        avgResponseTime: Math.round(avgResponseTime),
        avgErrorRate: Math.round(avgErrorRate * 100) / 100,
        uptime: 99.97, // Simulated
        activeNodes,
        totalNodes: edgeNodes.length,
        recentActivity: [
          { action: 'Deployment', module: 'api-handler', status: 'success', time: '2 minutes ago' },
          { action: 'Module Published', module: 'auth-service', status: 'success', time: '15 minutes ago' },
          { action: 'Scale Event', module: 'image-processor', status: 'info', time: '1 hour ago' },
          { action: 'Update', module: 'database-migrator', status: 'success', time: '3 hours ago' }
        ]
      }
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}