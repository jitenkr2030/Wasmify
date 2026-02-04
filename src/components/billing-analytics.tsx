'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  CreditCard,
  FileText,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface BillingAnalytics {
  revenue: {
    mrr: number
    arr: number
    growth: number
    churnRate: number
  }
  subscriptions: {
    total: number
    byTier: Record<string, number>
    newThisMonth: number
    canceledThisMonth: number
  }
  invoices: {
    total: number
    paid: number
    outstanding: number
    overdue: number
  }
  usage: {
    totalRequests: number
    totalBandwidth: number
    totalModules: number
    totalDeployments: number
  }
}

export function BillingAnalytics() {
  const [analytics, setAnalytics] = useState<BillingAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      // This would be a real API call in production
      const mockData: BillingAnalytics = {
        revenue: {
          mrr: 44300,
          arr: 531600,
          growth: 12.5,
          churnRate: 3.2
        },
        subscriptions: {
          total: 720,
          byTier: {
            FREE: 500,
            STARTER: 150,
            PROFESSIONAL: 60,
            ENTERPRISE: 10
          },
          newThisMonth: 45,
          canceledThisMonth: 12
        },
        invoices: {
          total: 1240,
          paid: 1180,
          outstanding: 48,
          overdue: 12
        },
        usage: {
          totalRequests: 125000000,
          totalBandwidth: 5120000, // MB
          totalModules: 8900,
          totalDeployments: 3400
        }
      }
      
      setAnalytics(mockData)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const StatCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    format = 'number' 
  }: {
    title: string
    value: number
    change?: number
    icon: any
    format?: 'currency' | 'number' | 'percentage'
  }) => {
    const isPositive = change && change > 0
    
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {format === 'currency' ? formatCurrency(value) :
             format === 'percentage' ? `${value}%` :
             formatNumber(value)}
          </div>
          {change && (
            <div className="flex items-center text-xs text-muted-foreground">
              {isPositive ? (
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
              )}
              {Math.abs(change)}% from last month
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return <div className="p-6">Loading analytics...</div>
  }

  if (!analytics) {
    return <div className="p-6">Error loading analytics</div>
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Billing Analytics</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant={timeRange === '7d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('7d')}
          >
            7 Days
          </Button>
          <Button
            variant={timeRange === '30d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('30d')}
          >
            30 Days
          </Button>
          <Button
            variant={timeRange === '90d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('90d')}
          >
            90 Days
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Custom Range
          </Button>
        </div>
      </div>

      {/* Revenue Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Monthly Recurring Revenue"
          value={analytics.revenue.mrr}
          change={analytics.revenue.growth}
          icon={DollarSign}
          format="currency"
        />
        <StatCard
          title="Annual Recurring Revenue"
          value={analytics.revenue.arr}
          change={analytics.revenue.growth}
          icon={TrendingUp}
          format="currency"
        />
        <StatCard
          title="Growth Rate"
          value={analytics.revenue.growth}
          icon={ArrowUpRight}
          format="percentage"
        />
        <StatCard
          title="Churn Rate"
          value={analytics.revenue.churnRate}
          change={-analytics.revenue.churnRate}
          icon={TrendingDown}
          format="percentage"
        />
      </div>

      <Tabs defaultValue="subscriptions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="usage">Usage Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Overview</CardTitle>
                <CardDescription>Total subscriptions by tier</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.subscriptions.byTier).map(([tier, count]) => (
                    <div key={tier} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant={tier === 'FREE' ? 'secondary' : 'default'}>
                          {tier}
                        </Badge>
                        <span className="text-sm">{count} subscribers</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {((count / analytics.subscriptions.total) * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total Subscriptions</span>
                    <span>{analytics.subscriptions.total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscription Changes</CardTitle>
                <CardDescription>This month's activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>New Subscriptions</span>
                    </div>
                    <span className="font-medium">+{analytics.subscriptions.newThisMonth}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      <span>Canceled Subscriptions</span>
                    </div>
                    <span className="font-medium">-{analytics.subscriptions.canceledThisMonth}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span>Net Change</span>
                    </div>
                    <span className="font-medium">
                      +{analytics.subscriptions.newThisMonth - analytics.subscriptions.canceledThisMonth}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              title="Total Invoices"
              value={analytics.invoices.total}
              icon={FileText}
            />
            <StatCard
              title="Paid Invoices"
              value={analytics.invoices.paid}
              icon={DollarSign}
            />
            <StatCard
              title="Outstanding"
              value={analytics.invoices.outstanding}
              icon={CreditCard}
            />
            <StatCard
              title="Overdue"
              value={analytics.invoices.overdue}
              icon={TrendingDown}
            />
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Platform Usage</CardTitle>
                <CardDescription>Total usage across all metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>API Requests</span>
                    <span className="font-medium">{formatNumber(analytics.usage.totalRequests)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bandwidth</span>
                    <span className="font-medium">{(analytics.usage.totalBandwidth / 1024).toFixed(1)} GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>WebAssembly Modules</span>
                    <span className="font-medium">{analytics.usage.totalModules.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Edge Deployments</span>
                    <span className="font-medium">{analytics.usage.totalDeployments.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Trends</CardTitle>
                <CardDescription>Usage patterns and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Avg. Requests/User</span>
                    <span className="font-medium">
                      {formatNumber(Math.round(analytics.usage.totalRequests / analytics.subscriptions.total))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Avg. Bandwidth/User</span>
                    <span className="font-medium">
                      {(analytics.usage.totalBandwidth / analytics.subscriptions.total / 1024).toFixed(1)} GB
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Modules per User</span>
                    <span className="font-medium">
                      {(analytics.usage.totalModules / analytics.subscriptions.total).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Deployments per User</span>
                    <span className="font-medium">
                      {(analytics.usage.totalDeployments / analytics.subscriptions.total).toFixed(1)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Reports</CardTitle>
          <CardDescription>Download billing and usage reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Revenue Report
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Usage Report
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Customer Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}