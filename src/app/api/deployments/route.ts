import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const deployments = await db.deployment.findMany({
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
        },
        _count: {
          select: {
            metrics: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: deployments
    })
  } catch (error) {
    console.error('Error fetching deployments:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch deployments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, environment, region, moduleId, deployerId, config } = body

    if (!name || !environment || !region || !moduleId || !deployerId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const deployment = await db.deployment.create({
      data: {
        name,
        environment,
        region,
        moduleId,
        deployerId,
        config,
        status: 'deploying'
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
        }
      }
    })

    // Simulate deployment process
    setTimeout(async () => {
      await db.deployment.update({
        where: { id: deployment.id },
        data: { status: 'active' }
      })
    }, 2000)

    return NextResponse.json({
      success: true,
      data: deployment
    })
  } catch (error) {
    console.error('Error creating deployment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create deployment' },
      { status: 500 }
    )
  }
}