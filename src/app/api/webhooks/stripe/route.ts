import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { headers } from 'next/headers'

// This would be your Stripe webhook secret
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = headers().get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    // In a real implementation, you would verify the webhook signature
    // const event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)
    
    // For now, we'll parse the JSON directly
    const event = JSON.parse(body)

    console.log('Received Stripe event:', event.type)

    switch (event.type) {
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object)
        break
        
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object)
        break
        
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object)
        break
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object)
        break
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break
        
      case 'payment_method.attached':
        await handlePaymentMethodAttached(event.data.object)
        break
        
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  try {
    // Update invoice status in database
    await db.invoice.updateMany({
      where: { stripeInvoiceId: invoice.id },
      data: {
        status: 'PAID',
        paidAt: new Date()
      }
    })

    // Create billing event
    await db.billingEvent.create({
      data: {
        userId: invoice.customer,
        type: 'INVOICE_PAYMENT_SUCCEEDED',
        amount: invoice.amount_paid,
        description: `Payment succeeded for invoice ${invoice.id}`,
        stripeEventId: `invoice_${invoice.id}`,
        metadata: {
          invoiceId: invoice.id,
          amount: invoice.amount_paid,
          currency: invoice.currency
        }
      }
    })

    console.log(`Invoice ${invoice.id} payment succeeded`)
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error)
  }
}

async function handleInvoicePaymentFailed(invoice: any) {
  try {
    // Update invoice status in database
    await db.invoice.updateMany({
      where: { stripeInvoiceId: invoice.id },
      data: { status: 'OPEN' }
    })

    // Create billing event
    await db.billingEvent.create({
      data: {
        userId: invoice.customer,
        type: 'INVOICE_PAYMENT_FAILED',
        amount: invoice.amount_due,
        description: `Payment failed for invoice ${invoice.id}`,
        stripeEventId: `invoice_${invoice.id}`,
        metadata: {
          invoiceId: invoice.id,
          amount: invoice.amount_due,
          currency: invoice.currency,
          attemptCount: invoice.attempt_count
        }
      }
    })

    console.log(`Invoice ${invoice.id} payment failed`)
  } catch (error) {
    console.error('Error handling invoice payment failed:', error)
  }
}

async function handleSubscriptionCreated(subscription: any) {
  try {
    // Find user by Stripe customer ID
    const user = await db.user.findFirst({
      where: { stripeCustomerId: subscription.customer }
    })

    if (!user) {
      console.error('User not found for subscription:', subscription.id)
      return
    }

    // Map Stripe price to our plan tiers
    const tier = mapPriceToTier(subscription.items.data[0].price.id)

    // Create or update subscription
    await db.subscription.upsert({
      where: { userId: user.id },
      update: {
        tier,
        status: 'ACTIVE',
        stripeSubscriptionId: subscription.id,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      },
      create: {
        userId: user.id,
        tier,
        status: 'ACTIVE',
        stripeSubscriptionId: subscription.id,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      }
    })

    // Create billing event
    await db.billingEvent.create({
      data: {
        userId: user.id,
        type: 'SUBSCRIPTION_CREATED',
        amount: subscription.items.data[0].price.unit_amount,
        description: `Subscription created: ${tier}`,
        stripeEventId: subscription.id,
        metadata: {
          subscriptionId: subscription.id,
          tier,
          amount: subscription.items.data[0].price.unit_amount
        }
      }
    })

    console.log(`Subscription ${subscription.id} created for user ${user.id}`)
  } catch (error) {
    console.error('Error handling subscription created:', error)
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  try {
    const user = await db.user.findFirst({
      where: { stripeCustomerId: subscription.customer }
    })

    if (!user) {
      console.error('User not found for subscription:', subscription.id)
      return
    }

    const tier = mapPriceToTier(subscription.items.data[0].price.id)

    await db.subscription.update({
      where: { userId: user.id },
      data: {
        tier,
        status: subscription.status.toUpperCase(),
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      }
    })

    // Create billing event
    await db.billingEvent.create({
      data: {
        userId: user.id,
        type: 'SUBSCRIPTION_UPDATED',
        amount: subscription.items.data[0].price.unit_amount,
        description: `Subscription updated: ${tier}`,
        stripeEventId: subscription.id,
        metadata: {
          subscriptionId: subscription.id,
          tier,
          status: subscription.status
        }
      }
    })

    console.log(`Subscription ${subscription.id} updated for user ${user.id}`)
  } catch (error) {
    console.error('Error handling subscription updated:', error)
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  try {
    const user = await db.user.findFirst({
      where: { stripeCustomerId: subscription.customer }
    })

    if (!user) {
      console.error('User not found for subscription:', subscription.id)
      return
    }

    await db.subscription.update({
      where: { userId: user.id },
      data: {
        status: 'CANCELED',
        stripeSubscriptionId: null,
        currentPeriodEnd: null
      }
    })

    // Create billing event
    await db.billingEvent.create({
      data: {
        userId: user.id,
        type: 'SUBSCRIPTION_CANCELED',
        description: `Subscription canceled`,
        stripeEventId: subscription.id,
        metadata: {
          subscriptionId: subscription.id
        }
      }
    })

    console.log(`Subscription ${subscription.id} deleted for user ${user.id}`)
  } catch (error) {
    console.error('Error handling subscription deleted:', error)
  }
}

async function handlePaymentMethodAttached(paymentMethod: any) {
  try {
    const user = await db.user.findFirst({
      where: { stripeCustomerId: paymentMethod.customer }
    })

    if (!user) {
      console.error('User not found for payment method:', paymentMethod.id)
      return
    }

    // Store payment method
    await db.paymentMethod.create({
      data: {
        userId: user.id,
        stripePaymentMethodId: paymentMethod.id,
        type: paymentMethod.type,
        brand: paymentMethod.card?.brand,
        last4: paymentMethod.card?.last4,
        expiryMonth: paymentMethod.card?.exp_month,
        expiryYear: paymentMethod.card?.exp_year,
        isDefault: false
      }
    })

    // Create billing event
    await db.billingEvent.create({
      data: {
        userId: user.id,
        type: 'PAYMENT_METHOD_ADDED',
        description: `Payment method added: ${paymentMethod.type}`,
        stripeEventId: paymentMethod.id,
        metadata: {
          paymentMethodId: paymentMethod.id,
          type: paymentMethod.type,
          brand: paymentMethod.card?.brand,
          last4: paymentMethod.card?.last4
        }
      }
    })

    console.log(`Payment method ${paymentMethod.id} attached to user ${user.id}`)
  } catch (error) {
    console.error('Error handling payment method attached:', error)
  }
}

// Helper function to map Stripe price IDs to plan tiers
function mapPriceToTier(priceId: string): 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE' {
  // In a real implementation, you would map actual Stripe price IDs
  // For now, we'll use a simple mapping based on price ID patterns
  if (priceId.includes('starter')) return 'STARTER'
  if (priceId.includes('professional')) return 'PROFESSIONAL'
  if (priceId.includes('enterprise')) return 'ENTERPRISE'
  return 'FREE'
}