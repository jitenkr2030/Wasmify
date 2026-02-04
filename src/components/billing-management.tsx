'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  Check, 
  X, 
  Zap, 
  Crown, 
  Building,
  TrendingUp,
  CreditCard,
  FileText,
  AlertTriangle,
  ArrowRight
} from 'lucide-react'

interface BillingData {
  subscription: any
  currentUsage: Record<string, number>
  limits: any
  plans: Array<{
    id: string
    name: string
    price: number
    features: any
    current: boolean
  }>
}

export function BillingManagement() {
  const [billingData, setBillingData] = useState<BillingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)

  useEffect(() => {
    fetchBillingData()
  }, [])

  const fetchBillingData = async () => {
    try {
      const response = await fetch('/api/billing/subscription')
      if (response.ok) {
        const data = await response.json()
        setBillingData(data.data)
      }
    } catch (error) {
      console.error('Error fetching billing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (tier: string) => {
    setUpgrading(tier)
    try {
      const response = await fetch('/api/billing/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier })
      })

      if (response.ok) {
        await fetchBillingData()
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error)
    } finally {
      setUpgrading(null)
    }
  }

  const handleCancelSubscription = async () => {
    try {
      const response = await fetch('/api/billing/subscription', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' })
      })

      if (response.ok) {
        await fetchBillingData()
      }
    } catch (error) {
      console.error('Error canceling subscription:', error)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price / 100)
  }

  const getUsageIcon = (metric: string) => {
    switch (metric) {
      case 'MODULES': return <Crown className="h-4 w-4" />
      case 'DEPLOYMENTS': return <Building className="h-4 w-4" />
      case 'API_REQUESTS': return <Zap className="h-4 w-4" />
      case 'BANDWIDTH': return <TrendingUp className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'MODULES': return 'WebAssembly Modules'
      case 'DEPLOYMENTS': return 'Edge Deployments'
      case 'API_REQUESTS': return 'API Requests'
      case 'BANDWIDTH': return 'Bandwidth (MB)'
      case 'BUILD_MINUTES': return 'Build Minutes'
      case 'COLLABORATORS': return 'Team Collaborators'
      default: return metric
    }
  }

  if (loading) {
    return <div className="p-6">Loading billing information...</div>
  }

  if (!billingData) {
    return <div className="p-6">Error loading billing information</div>
  }

  const { subscription, currentUsage, limits, plans } = billingData

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Current Subscription
          </CardTitle>
          <CardDescription>
            Your current plan and billing status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold">
                  {plans.find(p => p.current)?.name || 'Free'}
                </h3>
                <Badge variant={subscription?.tier === 'FREE' ? 'secondary' : 'default'}>
                  {subscription?.status || 'ACTIVE'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {subscription?.currentPeriodEnd && (
                  <>Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</>
                )}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {formatPrice(plans.find(p => p.current)?.price || 0)}
                <span className="text-sm font-normal text-muted-foreground">/month</span>
              </div>
              {subscription?.tier !== 'FREE' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelSubscription}
                  className="mt-2"
                >
                  Cancel Subscription
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Overview</CardTitle>
          <CardDescription>
            Your current usage for this billing period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(currentUsage).map(([metric, value]) => {
              const limit = limits[metric.toLowerCase()]
              const percentage = limit === -1 ? 0 : (value / limit) * 100
              const isNearLimit = percentage >= 80
              const isOverLimit = percentage >= 100

              return (
                <div key={metric} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getUsageIcon(metric)}
                      <span className="font-medium">{getMetricLabel(metric)}</span>
                      {isOverLimit && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Over Limit
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {value.toLocaleString()} / {limit === -1 ? '∞' : limit.toLocaleString()}
                    </div>
                  </div>
                  <Progress 
                    value={Math.min(percentage, 100)} 
                    className={`h-2 ${isNearLimit ? 'bg-orange-100' : ''}`}
                  />
                  {isNearLimit && (
                    <p className="text-xs text-orange-600">
                      {isOverLimit ? 'Usage limit exceeded' : 'Approaching usage limit'}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>
            Upgrade or downgrade your subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-4">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative ${plan.current ? 'border-primary' : ''}`}>
                {plan.current && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge variant="default">Current Plan</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center">
                    {plan.id === 'FREE' && <Crown className="h-8 w-8 text-gray-500" />}
                    {plan.id === 'STARTER' && <Zap className="h-8 w-8 text-blue-500" />}
                    {plan.id === 'PROFESSIONAL' && <TrendingUp className="h-8 w-8 text-purple-500" />}
                    {plan.id === 'ENTERPRISE' && <Building className="h-8 w-8 text-orange-500" />}
                  </div>
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="text-3xl font-bold">
                    {plan.price === 0 ? 'Free' : formatPrice(plan.price)}
                    {plan.price > 0 && <span className="text-sm font-normal">/month</span>}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      {plan.features.modules === -1 ? 'Unlimited' : plan.features.modules} modules
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      {plan.features.deployments === -1 ? 'Unlimited' : plan.features.deployments} deployments
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      {plan.features.apiRequests === -1 ? 'Unlimited' : plan.features.apiRequests.toLocaleString()} requests
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      {plan.features.bandwidth === -1 ? 'Unlimited' : `${plan.features.bandwidth / 1024}GB`} bandwidth
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      {plan.features.collaborators === -1 ? 'Unlimited' : plan.features.collaborators} collaborators
                    </li>
                  </ul>
                  <Separator className="my-4" />
                  <Button 
                    className="w-full" 
                    variant={plan.current ? "outline" : "default"}
                    disabled={plan.current || upgrading === plan.id}
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    {upgrading === plan.id ? 'Processing...' : 
                     plan.current ? 'Current Plan' : 
                     plan.price > 0 ? `Upgrade to ${plan.name}` : 'Downgrade to Free'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}