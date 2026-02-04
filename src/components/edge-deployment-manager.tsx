'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Globe, 
  Server, 
  Activity, 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  MapPin,
  Users,
  Cpu,
  MemoryStick,
  Wifi,
  Settings,
  Rocket,
  BarChart3
} from 'lucide-react'

interface EdgeRegion {
  id: string
  name: string
  location: string
  status: 'active' | 'maintenance' | 'offline'
  currentLoad: number
  capacity: number
  available: number
  utilization: number
  lastUpdated: Date
}

interface EdgeDeployment {
  id: string
  name: string
  status: string
  region: string
  module: {
    name: string
    version: string
    language: string
  }
  edgeMetrics: {
    globalReplicas: number
    avgLatency: number
    cacheHitRate: number
    edgeRequests: number
    bandwidthSaved: string
  }
  globalReplicas: number
  latency: number
}

interface EdgeMetrics {
  totalRequests: number
  avgResponseTime: number
  totalMemoryUsed: number
  totalCpuUsed: number
  errorRate: number
  uptime: number
  cacheHitRate: number
}

export default function EdgeDeploymentManager() {
  const [regions, setRegions] = useState<EdgeRegion[]>([])
  const [deployments, setDeployments] = useState<EdgeDeployment[]>([])
  const [metrics, setMetrics] = useState<EdgeMetrics | null>(null)
  const [scalingEvents, setScalingEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState('')

  useEffect(() => {
    fetchEdgeData()
    const interval = setInterval(fetchEdgeData, 10000) // Update every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchEdgeData = async () => {
    try {
      const [regionsRes, deploymentsRes, metricsRes, scalingRes] = await Promise.all([
        fetch('/api/edge?action=regions'),
        fetch('/api/edge?action=deployments'),
        fetch('/api/edge?action=metrics'),
        fetch('/api/edge?action=scaling')
      ])

      const regionsData = await regionsRes.json()
      const deploymentsData = await deploymentsRes.json()
      const metricsData = await metricsRes.json()
      const scalingData = await scalingRes.json()

      if (regionsData.success) setRegions(regionsData.data.regions)
      if (deploymentsData.success) setDeployments(deploymentsData.data)
      if (metricsData.success) setMetrics(metricsData.data)
      if (scalingData.success) setScalingEvents(scalingData.data.scalingEvents)
    } catch (error) {
      console.error('Error fetching edge data:', error)
    } finally {
      setLoading(false)
    }
  }

  const deployToEdge = async (moduleId: string, regions: string[]) => {
    try {
      const response = await fetch('/api/edge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deploy',
          moduleId,
          regions,
          config: {
            autoScaling: true,
            replicas: 3,
            memory: '128MB',
            cpu: '100m'
          }
        })
      })

      const data = await response.json()
      if (data.success) {
        fetchEdgeData() // Refresh data
      }
    } catch (error) {
      console.error('Error deploying to edge:', error)
    }
  }

  const scaleDeployment = async (deploymentId: string, action: string) => {
    try {
      const response = await fetch('/api/edge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'scale',
          deploymentId,
          action,
          config: {
            replicas: action === 'scale_out' ? 5 : 2
          }
        })
      })

      const data = await response.json()
      if (data.success) {
        fetchEdgeData() // Refresh data
      }
    } catch (error) {
      console.error('Error scaling deployment:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'maintenance': return 'bg-yellow-500'
      case 'offline': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getUtilizationColor = (utilization: number) => {
    if (utilization > 80) return 'text-red-600'
    if (utilization > 60) return 'text-yellow-600'
    return 'text-green-600'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Globe className="h-12 w-12 mx-auto mb-4 animate-pulse text-muted-foreground" />
          <p className="text-muted-foreground">Loading edge deployment data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold flex items-center justify-center">
          <Globe className="h-8 w-8 mr-3" />
          Global Edge Deployment
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Deploy your WebAssembly applications to our global edge network. 
          Experience millisecond latency worldwide with automatic scaling.
        </p>
      </div>

      {/* Edge Metrics Overview */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Activity className="h-4 w-4 mr-2" />
                Total Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalRequests.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Zap className="h-4 w-4 mr-2" />
                Avg Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.avgResponseTime.toFixed(0)}ms</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <MemoryStick className="h-4 w-4 mr-2" />
                Memory Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(metrics.totalMemoryUsed / 1024 / 1024).toFixed(1)}GB</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Cpu className="h-4 w-4 mr-2" />
                CPU Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalCpuUsed.toFixed(0)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Wifi className="h-4 w-4 mr-2" />
                Cache Hit Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.cacheHitRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Uptime
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.uptime.toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="regions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="regions">Edge Regions</TabsTrigger>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="scaling">Auto Scaling</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Edge Regions */}
        <TabsContent value="regions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Global Edge Regions</h2>
            <div className="flex items-center space-x-2">
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Regions</SelectItem>
                  {regions.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button>
                <Rocket className="h-4 w-4 mr-2" />
                Deploy New
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {regions
              .filter(region => !selectedRegion || region.id === selectedRegion)
              .map((region) => (
                <Card key={region.id} className="relative overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(region.status)}`} />
                        <CardTitle className="text-lg">{region.name}</CardTitle>
                      </div>
                      <Badge variant={region.status === 'active' ? 'default' : 'secondary'}>
                        {region.status}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {region.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Utilization</span>
                        <span className={getUtilizationColor(region.utilization)}>
                          {region.utilization.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={region.utilization} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Load</p>
                        <p className="font-medium">{region.currentLoad}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Available</p>
                        <p className="font-medium text-green-600">{region.available}</p>
                      </div>
                    </div>

                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Capacity: {region.capacity}</span>
                      <span>Updated: {new Date(region.lastUpdated).toLocaleTimeString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* Deployments */}
        <TabsContent value="deployments" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Edge Deployments</h2>
            <Button>
              <Server className="h-4 w-4 mr-2" />
              New Deployment
            </Button>
          </div>

          <div className="space-y-4">
            {deployments.map((deployment) => (
              <Card key={deployment.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{deployment.name}</span>
                        <Badge variant="outline">{deployment.status}</Badge>
                      </CardTitle>
                      <CardDescription>
                        {deployment.module.name} v{deployment.module.version} • {deployment.module.language}
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => scaleDeployment(deployment.id, 'scale_out')}
                      >
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Scale Out
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => scaleDeployment(deployment.id, 'scale_in')}
                      >
                        <TrendingUp className="h-4 w-4 mr-1 rotate-180" />
                        Scale In
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-5">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Global Replicas</p>
                      <p className="text-2xl font-bold">{deployment.edgeMetrics.globalReplicas}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Avg Latency</p>
                      <p className="text-2xl font-bold">{deployment.edgeMetrics.avgLatency}ms</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Cache Hit Rate</p>
                      <p className="text-2xl font-bold">{deployment.edgeMetrics.cacheHitRate}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Edge Requests</p>
                      <p className="text-2xl font-bold">{deployment.edgeMetrics.edgeRequests.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Bandwidth Saved</p>
                      <p className="text-2xl font-bold">{deployment.edgeMetrics.bandwidthSaved}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Auto Scaling */}
        <TabsContent value="scaling" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Auto Scaling Events</h2>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configure Scaling
            </Button>
          </div>

          {scalingEvents.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Scaling Events</h3>
                <p className="text-muted-foreground">All regions are operating within normal parameters</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {scalingEvents.map((event, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant={event.type === 'scale_out' ? 'default' : 'secondary'}>
                            {event.type === 'scale_out' ? 'Scale Out' : 'Scale In'}
                          </Badge>
                          <Badge variant="outline">{event.region}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{event.reason}</p>
                        <div className="grid gap-2 md:grid-cols-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Current Load: </span>
                            <span className="font-medium">{event.currentLoad}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Capacity: </span>
                            <span className="font-medium">{event.capacity}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Utilization: </span>
                            <span className={`font-medium ${getUtilizationColor(event.utilizationRate)}`}>
                              {event.utilizationRate.toFixed(1)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Action: </span>
                            <span className="font-medium">{event.recommendedAction}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Execute
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Edge Performance Analytics</CardTitle>
              <CardDescription>
                Real-time performance metrics across all edge regions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                  <p>Edge analytics dashboard</p>
                  <p className="text-sm">Integration with real-time analytics coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}