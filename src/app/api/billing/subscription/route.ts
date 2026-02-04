import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// Pricing configuration
const PRICING_PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    features: {
      modules: 3,
      deployments: 2,
      apiRequests: 10000,
      bandwidth: 1024, // MB
      buildMinutes: 100,
      collaborators: 1
    }
  },
  STARTER: {
    name: 'Starter',
    price: 2900, // $29 in cents
    features: {
      modules: 25,
      deployments: 10,
      apiRequests: 100000,
      bandwidth: 10240, // MB
      buildMinutes: 500,
      collaborators: 3
    }
  },
  PROFESSIONAL: {
    name: 'Professional',
    price: 9900, // $99 in cents
    features: {
      modules: 100,
      deployments: 50,
      apiRequests: 1000000,
      bandwidth: 102400, // MB
      buildMinutes: 2000,
      collaborators: 10
    }
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 0, // Custom pricing
    features: {
      modules: -1, // Unlimited
      deployments: -1,
      apiRequests: -1,
      bandwidth: -1,
      buildMinutes: -1,
      collaborators: -1
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscription: true,
        usageRecords: {
          where: {
            period: new Date().toISOString().slice(0, 7) // YYYY-MM
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate current usage
    const currentUsage = user.usageRecords.reduce((acc, record) => {
      acc[record.metric] = (acc[record.metric] || 0) + record.value
      return acc
    }, {} as Record<string, number>)

    // Get subscription limits
    const plan = PRICING_PLANS[user.subscription?.tier || 'FREE']
    
    return NextResponse.json({
      success: true,
      data: {
        subscription: user.subscription,
        currentUsage,
        limits: plan.features,
        plans: Object.entries(PRICING_PLANS).map(([key, value]) => ({
          id: key,
          name: value.name,
          price: value.price,
          features: value.features,
          current: user.subscription?.tier === key
        }))
      }
    })
  } catch (error) {
    console.error('Error fetching subscription:', error)
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

    const { tier, paymentMethodId } = await request.json()

    if (!tier || !Object.keys(PRICING_PLANS).includes(tier)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Handle free plan downgrade
    if (tier === 'FREE') {
      if (user.subscription) {
        await db.subscription.update({
          where: { userId: user.id },
          data: {
            tier: 'FREE',
            status: 'ACTIVE',
            stripeSubscriptionId: null,
            currentPeriodEnd: null,
            cancelAtPeriodEnd: false
          }
        })
      } else {
        await db.subscription.create({
          data: {
            userId: user.id,
            tier: 'FREE',
            status: 'ACTIVE'
          }
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Successfully downgraded to Free plan'
      })
    }

    // For paid plans, we would integrate with Stripe here
    // For now, return a mock response
    const plan = PRICING_PLANS[tier as keyof typeof PRICING_PLANS]
    
    if (user.subscription) {
      await db.subscription.update({
        where: { userId: user.id },
        data: {
          tier: tier as any,
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          cancelAtPeriodEnd: false
        }
      })
    } else {
      await db.subscription.create({
        data: {
          userId: user.id,
          tier: tier as any,
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      })
    }

    // Create billing event
    await db.billingEvent.create({
      data: {
        userId: user.id,
        type: 'SUBSCRIPTION_CREATED',
        amount: plan.price,
        description: `Subscribed to ${plan.name} plan`
      }
    })

    return NextResponse.json({
      success: true,
      message: `Successfully subscribed to ${plan.name} plan`,
      data: {
        tier,
        price: plan.price,
        features: plan.features
      }
    })
  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action } = await request.json()

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true }
    })

    if (!user || !user.subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
    }

    if (action === 'cancel') {
      await db.subscription.update({
        where: { userId: user.id },
        data: {
          cancelAtPeriodEnd: true
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Subscription will be canceled at period end'
      })
    }

    if (action === 'resume') {
      await db.subscription.update({
        where: { userId: user.id },
        data: {
          cancelAtPeriodEnd: false
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Subscription resumed'
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}