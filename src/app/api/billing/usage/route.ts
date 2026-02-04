import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || new Date().toISOString().slice(0, 7) // YYYY-MM

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscription: true,
        usageRecords: {
          where: { period },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate usage by metric
    const usageByMetric = user.usageRecords.reduce((acc, record) => {
      if (!acc[record.metric]) {
        acc[record.metric] = {
          current: 0,
          records: []
        }
      }
      acc[record.metric].current += record.value
      acc[record.metric].records.push(record)
      return acc
    }, {} as Record<string, { current: number; records: any[] }>)

    // Get plan limits
    const planLimits = {
      FREE: {
        modules: 3,
        deployments: 2,
        apiRequests: 10000,
        bandwidth: 1024,
        buildMinutes: 100,
        collaborators: 1
      },
      STARTER: {
        modules: 25,
        deployments: 10,
        apiRequests: 100000,
        bandwidth: 10240,
        buildMinutes: 500,
        collaborators: 3
      },
      PROFESSIONAL: {
        modules: 100,
        deployments: 50,
        apiRequests: 1000000,
        bandwidth: 102400,
        buildMinutes: 2000,
        collaborators: 10
      },
      ENTERPRISE: {
        modules: -1,
        deployments: -1,
        apiRequests: -1,
        bandwidth: -1,
        buildMinutes: -1,
        collaborators: -1
      }
    }

    const limits = planLimits[user.subscription?.tier || 'FREE']

    // Calculate usage percentages
    const usageWithPercentages = Object.entries(usageByMetric).map(([metric, data]) => ({
      metric,
      current: data.current,
      limit: limits[metric as keyof typeof limits] || 0,
      percentage: limits[metric as keyof typeof limits] === -1 ? 0 : 
                   (data.current / limits[metric as keyof typeof limits]) * 100,
      records: data.records
    }))

    return NextResponse.json({
      success: true,
      data: {
        period,
        usage: usageWithPercentages,
        limits,
        subscription: user.subscription
      }
    })
  } catch (error) {
    console.error('Error fetching usage:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { metric, value, metadata } = await request.json()

    if (!metric || value === undefined) {
      return NextResponse.json({ error: 'Metric and value are required' }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has exceeded limits
    const currentPeriod = new Date().toISOString().slice(0, 7)
    
    const existingUsage = await db.usageRecord.aggregate({
      where: {
        userId: user.id,
        metric: metric as any,
        period: currentPeriod
      },
      _sum: { value: true }
    })

    const totalUsage = (existingUsage._sum.value || 0) + value

    // Get plan limits
    const planLimits = {
      FREE: { modules: 3, deployments: 2, apiRequests: 10000, bandwidth: 1024, buildMinutes: 100, collaborators: 1 },
      STARTER: { modules: 25, deployments: 10, apiRequests: 100000, bandwidth: 10240, buildMinutes: 500, collaborators: 3 },
      PROFESSIONAL: { modules: 100, deployments: 50, apiRequests: 1000000, bandwidth: 102400, buildMinutes: 2000, collaborators: 10 },
      ENTERPRISE: { modules: -1, deployments: -1, apiRequests: -1, bandwidth: -1, buildMinutes: -1, collaborators: -1 }
    }

    const limits = planLimits[user.subscription?.tier || 'FREE']
    const limit = limits[metric as keyof typeof limits] || 0

    if (limit !== -1 && totalUsage > limit) {
      // Create billing event for limit exceeded
      await db.billingEvent.create({
        data: {
          userId: user.id,
          type: 'USAGE_LIMIT_REACHED',
          description: `Exceeded ${metric} limit: ${totalUsage}/${limit}`,
          metadata: {
            metric,
            current: totalUsage,
            limit,
            requested: value
          }
        }
      })

      return NextResponse.json({
        error: 'Usage limit exceeded',
        data: {
          metric,
          current: totalUsage - value,
          limit,
          requested: value
        }
      }, { status: 429 })
    }

    // Record usage
    const usageRecord = await db.usageRecord.create({
      data: {
        userId: user.id,
        metric: metric as any,
        value,
        period: currentPeriod,
        metadata: metadata || {}
      }
    })

    // Check if we should send notifications (80% and 100% thresholds)
    if (limit !== -1) {
      const percentage = (totalUsage / limit) * 100
      
      if (percentage >= 80 && percentage < 80.1) {
        // Send 80% notification (in real app, would send email/webhook)
        console.log(`User ${user.id} has reached 80% of ${metric} limit`)
      } else if (percentage >= 100 && percentage < 100.1) {
        // Send 100% notification
        console.log(`User ${user.id} has reached 100% of ${metric} limit`)
      }
    }

    return NextResponse.json({
      success: true,
      data: usageRecord
    })
  } catch (error) {
    console.error('Error recording usage:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}