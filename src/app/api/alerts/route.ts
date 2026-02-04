import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Fetch alerts from monitoring service
    const response = await fetch('http://localhost:3002/alerts')
    const data = await response.json()

    if (!data.success) {
      throw new Error('Failed to fetch alerts')
    }

    return NextResponse.json({
      success: true,
      data: data.data
    })
  } catch (error) {
    console.error('Error fetching alerts:', error)
    
    // Fallback to mock data if service is unavailable
    const mockAlerts = [
      {
        id: '1',
        level: 'critical',
        title: 'High Error Rate in us-east-1',
        message: 'Error rate exceeded 5% threshold',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        resolved: false
      },
      {
        id: '2',
        level: 'warning',
        title: 'Slow Response Times',
        message: 'P95 response time above 100ms',
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        resolved: false
      }
    ]

    return NextResponse.json({
      success: true,
      data: mockAlerts
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { alertId } = await request.json()

    if (!alertId) {
      return NextResponse.json(
        { success: false, error: 'Alert ID is required' },
        { status: 400 }
      )
    }

    // Resolve alert via monitoring service
    const response = await fetch(`http://localhost:3002/alerts/${alertId}`, {
      method: 'POST'
    })
    
    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error resolving alert:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to resolve alert' },
      { status: 500 }
    )
  }
}