'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { UserAuth } from '@/components/user-auth'
import { 
  RequestVolumeChart, 
  ResponseTimeChart, 
  ErrorRateChart, 
  ModuleUsageChart,
  generateSampleData,
  generateModuleData 
} from '@/components/charts'
import { 
  Cpu, 
  Package, 
  Cloud, 
  Activity, 
  TrendingUp, 
  Globe, 
  Zap, 
  Shield,
  Server,
  Code2,
  BarChart3,
  Settings,
  PlayCircle,
  PauseCircle,
  RefreshCw
} from 'lucide-react'

export default function Home() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({
    totalModules: 0,
    activeDeployments: 0,
    totalRequests: 0,
    avgResponseTime: 0,
    uptime: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch real data from our APIs
    const fetchData = async () => {
      try {
        const response = await fetch('/api/stats')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setStats({
              totalModules: data.data.totalModules,
              activeDeployments: data.data.activeDeployments,
              totalRequests: data.data.totalRequests,
              avgResponseTime: data.data.avgResponseTime,
              uptime: data.data.uptime
            })
          }
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const StatCard = ({ icon: Icon, title, value, subtitle, trend }: any) => (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
        {trend && (
          <div className="flex items-center mt-2">
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            <span className="text-xs text-green-500">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm dark:bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img 
                  src="/wasm-logo.png" 
                  alt="WebAssembly Platform" 
                  className="h-10 w-10 rounded-lg"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  WebAssembly Platform
                </h1>
                <p className="text-sm text-muted-foreground">
                  Build, Deploy, and Scale Wasm Applications
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <UserAuth />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="runtime">Runtime</TabsTrigger>
            <TabsTrigger value="packages">Packages</TabsTrigger>
            <TabsTrigger value="edge">Edge Cloud</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <StatCard
                icon={Package}
                title="Total Modules"
                value={isLoading ? "..." : stats.totalModules}
                subtitle="Published packages"
                trend="+12 this week"
              />
              <StatCard
                icon={Cloud}
                title="Active Deployments"
                value={isLoading ? "..." : stats.activeDeployments}
                subtitle="Running globally"
                trend="+3 this week"
              />
              <StatCard
                icon={Activity}
                title="Total Requests"
                value={isLoading ? "..." : stats.totalRequests.toLocaleString()}
                subtitle="All time"
                trend="+18% this month"
              />
              <StatCard
                icon={Zap}
                title="Avg Response"
                value={isLoading ? "..." : `${stats.avgResponseTime}ms`}
                subtitle="Last 24 hours"
                trend="-5ms improvement"
              />
              <StatCard
                icon={Shield}
                title="Uptime"
                value={isLoading ? "..." : `${stats.uptime}%`}
                subtitle="Last 30 days"
                trend="Stable"
              />
            </div>

            {/* Hero Section */}
            <div className="relative rounded-xl overflow-hidden">
              <img 
                src="/wasm-dashboard.png" 
                alt="WebAssembly Platform Dashboard" 
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                <div className="p-6 text-white">
                  <h2 className="text-3xl font-bold mb-2">Welcome to Your Wasm Platform</h2>
                  <p className="text-lg opacity-90">
                    Deploy WebAssembly modules at the edge with millisecond cold starts
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Code2 className="h-5 w-5 mr-2 text-blue-600" />
                    Create Module
                  </CardTitle>
                  <CardDescription>
                    Compile and publish your first WebAssembly module
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Get Started</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="h-5 w-5 mr-2 text-green-600" />
                    Deploy to Edge
                  </CardTitle>
                  <CardDescription>
                    Deploy your modules to our global edge network
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">Deploy Now</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                    View Analytics
                  </CardTitle>
                  <CardDescription>
                    Monitor performance and usage metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">View Dashboard</Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest deployments and system events</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { action: "Deployment", module: "api-handler", status: "success", time: "2 minutes ago" },
                  { action: "Module Published", module: "auth-service", status: "success", time: "15 minutes ago" },
                  { action: "Scale Event", module: "image-processor", status: "info", time: "1 hour ago" },
                  { action: "Update", module: "database-migrator", status: "success", time: "3 hours ago" }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.status === 'success' ? 'bg-green-500' : 
                        activity.status === 'info' ? 'bg-blue-500' : 'bg-yellow-500'
                      }`} />
                      <span className="text-sm font-medium">{activity.action}</span>
                      <span className="text-sm text-muted-foreground">{activity.module}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Runtime Tab */}
          <TabsContent value="runtime" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Cpu className="h-5 w-5 mr-2" />
                    Runtime Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Wasmtime Engine</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Version</span>
                    <span className="text-sm text-muted-foreground">v15.0.0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Memory Usage</span>
                    <span className="text-sm text-muted-foreground">2.3 GB / 8 GB</span>
                  </div>
                  <Progress value={28} className="mt-2" />
                  <div className="flex justify-between items-center">
                    <span>Active Instances</span>
                    <span className="text-sm text-muted-foreground">47</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span>WASI Support</span>
                    <Badge variant="secondary">Enabled</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>JIT Compiler</span>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Sandbox Mode</span>
                    <Badge variant="default">Secure</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Server className="h-5 w-5 mr-2" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Cold Start Time</span>
                    <span className="text-sm font-medium">12ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Throughput</span>
                    <span className="text-sm font-medium">1.2K req/s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Error Rate</span>
                    <span className="text-sm font-medium text-green-600">0.02%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Cache Hit Rate</span>
                    <span className="text-sm font-medium">94.7%</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span>Compilation Time</span>
                    <span className="text-sm font-medium">45ms avg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Module Load Time</span>
                    <span className="text-sm font-medium">8ms avg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>GC Pauses</span>
                    <span className="text-sm font-medium">2.3ms avg</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Supported Languages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Code2 className="h-5 w-5 mr-2" />
                  Supported Languages
                </CardTitle>
                <CardDescription>
                  Languages that can be compiled to WebAssembly and run on our platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {[
                    { name: 'Rust', status: 'Excellent', color: 'bg-green-500' },
                    { name: 'Go', status: 'Good', color: 'bg-blue-500' },
                    { name: 'C/C++', status: 'Excellent', color: 'bg-green-500' },
                    { name: 'AssemblyScript', status: 'Good', color: 'bg-blue-500' },
                    { name: 'Zig', status: 'Experimental', color: 'bg-yellow-500' },
                    { name: 'D', status: 'Good', color: 'bg-blue-500' },
                    { name: 'C#', status: 'Experimental', color: 'bg-yellow-500' },
                    { name: 'Java', status: 'Limited', color: 'bg-orange-500' }
                  ].map((lang, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${lang.color}`} />
                      <span className="font-medium">{lang.name}</span>
                      <Badge variant="outline" className="ml-auto">{lang.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Runtime Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Runtime Configuration</CardTitle>
                <CardDescription>
                  Current runtime settings and limits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="font-medium">Memory Limits</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Default Memory</span>
                        <span>64 MB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max Memory</span>
                        <span>4 GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Memory Growth Limit</span>
                        <span>512 MB</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium">Execution Limits</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Max Execution Time</span>
                        <span>30 seconds</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max Instructions</span>
                        <span>10^9</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max Table Size</span>
                        <span>10^6</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Packages Tab */}
          <TabsContent value="packages" className="space-y-6">
            {/* Package Registry Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2,847</div>
                  <p className="text-xs text-muted-foreground">+127 this month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Downloads</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">45.2K</div>
                  <p className="text-xs text-muted-foreground">+12% this week</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Publishers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">384</div>
                  <p className="text-xs text-muted-foreground">23 new this month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">My Packages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">3 private</p>
                </CardContent>
              </Card>
            </div>

            {/* Package Search and Upload */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Package Registry</CardTitle>
                    <CardDescription>Browse, publish, and manage Wasm packages</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline">Upload Package</Button>
                    <Button>New Package</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4 mb-6">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search packages..."
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <select className="p-2 border rounded-md">
                    <option>All Categories</option>
                    <option>Authentication</option>
                    <option>Database</option>
                    <option>HTTP</option>
                    <option>Cryptography</option>
                    <option>Utilities</option>
                  </select>
                  <select className="p-2 border rounded-md">
                    <option>Most Popular</option>
                    <option>Recently Updated</option>
                    <option>Newest</option>
                    <option>Most Downloaded</option>
                  </select>
                </div>

                {/* Package List */}
                <div className="space-y-4">
                  {[
                    {
                      name: 'wasm-crypto',
                      description: 'Cryptographic functions for WebAssembly including hashing, encryption, and digital signatures',
                      version: '1.2.0',
                      downloads: 1542,
                      publisher: 'Platform Admin',
                      updated: '2 days ago',
                      tags: ['crypto', 'security', 'hashing']
                    },
                    {
                      name: 'wasm-http',
                      description: 'HTTP client library for Wasm with support for REST APIs and webhooks',
                      version: '2.1.3',
                      downloads: 892,
                      publisher: 'John Developer',
                      updated: '1 week ago',
                      tags: ['http', 'network', 'api']
                    },
                    {
                      name: 'wasm-db',
                      description: 'Database abstraction layer supporting SQLite, PostgreSQL, and MySQL',
                      version: '0.9.5',
                      downloads: 656,
                      publisher: 'DB Team',
                      updated: '3 days ago',
                      tags: ['database', 'sql', 'storage']
                    },
                    {
                      name: 'wasm-logger',
                      description: 'Structured logging library with multiple output formats and log levels',
                      version: '1.0.2',
                      downloads: 423,
                      publisher: 'Platform Admin',
                      updated: '5 days ago',
                      tags: ['logging', 'debugging', 'utilities']
                    }
                  ].map((pkg, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-lg">{pkg.name}</h3>
                            <Badge variant="secondary">v{pkg.version}</Badge>
                            <div className="flex space-x-1">
                              {pkg.tags.slice(0, 2).map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <p className="text-muted-foreground mb-2">{pkg.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>by {pkg.publisher}</span>
                            <span>•</span>
                            <span>{pkg.downloads.toLocaleString()} downloads</span>
                            <span>•</span>
                            <span>updated {pkg.updated}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button variant="outline" size="sm">View</Button>
                          <Button size="sm">Install</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* My Packages */}
            <Card>
              <CardHeader>
                <CardTitle>My Packages</CardTitle>
                <CardDescription>Packages you have published</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    {
                      name: 'auth-wasm',
                      description: 'JWT authentication middleware',
                      version: '1.0.0',
                      downloads: 234,
                      status: 'published',
                      lastUpdated: '1 week ago'
                    },
                    {
                      name: 'image-resizer',
                      description: 'Image processing and resizing',
                      version: '0.8.2',
                      downloads: 89,
                      status: 'draft',
                      lastUpdated: '3 days ago'
                    }
                  ].map((pkg, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{pkg.name}</h3>
                        <Badge variant={pkg.status === 'published' ? 'default' : 'secondary'}>
                          {pkg.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{pkg.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">v{pkg.version} • {pkg.downloads} downloads</span>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">Edit</Button>
                          <Button variant="ghost" size="sm">Stats</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Edge Cloud Tab */}
          <TabsContent value="edge" className="space-y-6">
            <div className="relative rounded-xl overflow-hidden">
              <img 
                src="/edge-network.png" 
                alt="Edge Network" 
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                <div className="p-6 text-white">
                  <h2 className="text-2xl font-bold mb-2">Global Edge Network</h2>
                  <p className="opacity-90">
                    Deploy your modules to 50+ edge locations worldwide
                  </p>
                </div>
              </div>
            </div>

            {/* Edge Network Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Regions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">23</div>
                  <p className="text-xs text-muted-foreground">Edge locations</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Nodes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">147</div>
                  <p className="text-xs text-muted-foreground">Running instances</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Coverage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">99.9%</div>
                  <p className="text-xs text-muted-foreground">Global coverage</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12ms</div>
                  <p className="text-xs text-muted-foreground">To users</p>
                </CardContent>
              </Card>
            </div>

            {/* Global Node Map */}
            <Card>
              <CardHeader>
                <CardTitle>Edge Node Status</CardTitle>
                <CardDescription>Real-time status of global edge nodes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[
                    { name: 'us-east-1-node-1', region: 'US East', location: 'Virginia, USA', status: 'active', load: 67, latency: '8ms' },
                    { name: 'us-west-1-node-1', region: 'US West', location: 'California, USA', status: 'active', load: 45, latency: '12ms' },
                    { name: 'eu-west-1-node-1', region: 'Europe West', location: 'Ireland', status: 'active', load: 72, latency: '15ms' },
                    { name: 'eu-central-1-node-1', region: 'Europe Central', location: 'Frankfurt, Germany', status: 'active', load: 58, latency: '11ms' },
                    { name: 'ap-southeast-1-node-1', region: 'Asia Pacific', location: 'Singapore', status: 'maintenance', load: 0, latency: '18ms' },
                    { name: 'ap-northeast-1-node-1', region: 'Asia Northeast', location: 'Tokyo, Japan', status: 'active', load: 81, latency: '9ms' }
                  ].map((node, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium">{node.region}</h3>
                          <p className="text-sm text-muted-foreground">{node.location}</p>
                        </div>
                        <Badge variant={node.status === 'active' ? 'default' : 'secondary'}>
                          {node.status}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Load</span>
                          <span>{node.load}%</span>
                        </div>
                        <Progress value={node.load} className="h-2" />
                        <div className="flex justify-between text-sm">
                          <span>Latency</span>
                          <span>{node.latency}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Deployments */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Active Deployments</CardTitle>
                    <CardDescription>Modules currently deployed to the edge network</CardDescription>
                  </div>
                  <Button>Deploy New</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      name: 'auth-service-prod',
                      module: 'auth-service',
                      version: '1.2.0',
                      regions: ['us-east-1', 'us-west-1', 'eu-west-1'],
                      status: 'active',
                      requests: '2.3M/day',
                      lastDeployed: '2 hours ago'
                    },
                    {
                      name: 'image-processor-edge',
                      module: 'image-processor',
                      version: '2.1.0',
                      regions: ['global'],
                      status: 'active',
                      requests: '847K/day',
                      lastDeployed: '1 day ago'
                    },
                    {
                      name: 'api-handler-staging',
                      module: 'api-handler',
                      version: '1.0.5',
                      regions: ['eu-west-1'],
                      status: 'deploying',
                      requests: '124K/day',
                      lastDeployed: '5 minutes ago'
                    }
                  ].map((deployment, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">{deployment.name}</h3>
                            <Badge variant="secondary">{deployment.version}</Badge>
                            <Badge variant={deployment.status === 'active' ? 'default' : 'secondary'}>
                              {deployment.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Module: {deployment.module} • {deployment.requests}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>Regions: {deployment.regions.join(', ')}</span>
                            <span>•</span>
                            <span>Deployed {deployment.lastDeployed}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button variant="outline" size="sm">Manage</Button>
                          <Button variant="outline" size="sm">Logs</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Edge Configuration */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Deployment Settings</CardTitle>
                  <CardDescription>Configure edge deployment behavior</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Auto-scaling</h4>
                      <p className="text-sm text-muted-foreground">Automatically scale based on load</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Geo-routing</h4>
                      <p className="text-sm text-muted-foreground">Route to nearest edge node</p>
                    </div>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Cache Headers</h4>
                      <p className="text-sm text-muted-foreground">Configure caching behavior</p>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Edge network performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Global Hit Rate</span>
                    <span className="font-medium">96.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Cache Size</span>
                    <span className="font-medium">2.8 TB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Data Transfer</span>
                    <span className="font-medium">124 GB/day</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Edge Compute Time</span>
                    <span className="font-medium">4.2ms avg</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            {/* Performance Overview */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2.8M</div>
                  <p className="text-xs text-muted-foreground">Last 24 hours</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-500">+18%</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0.02%</div>
                  <p className="text-xs text-muted-foreground">Last 24 hours</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-500">-0.01%</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">42ms</div>
                  <p className="text-xs text-muted-foreground">Last 24 hours</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-500">-5ms</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">2 critical, 1 warning</p>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 mr-1" />
                    <span className="text-xs text-red-500">Action needed</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-2">
              <RequestVolumeChart 
                data={generateSampleData()} 
                title="Request Volume" 
                description="Requests per hour over the last 24 hours"
              />
              <ResponseTimeChart 
                data={generateSampleData()} 
                title="Response Times" 
                description="Response time distribution (P50, P95)"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <ErrorRateChart 
                data={generateSampleData()} 
                title="Error Rate" 
                description="Error rate percentage over time"
              />
              <ModuleUsageChart 
                data={generateModuleData()} 
                title="Module Usage" 
                description="Most used WebAssembly modules"
              />
            </div>

            {/* Active Alerts */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Active Alerts</CardTitle>
                    <CardDescription>System alerts and notifications</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">Configure Alerts</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      level: 'critical',
                      title: 'High Error Rate in us-east-1',
                      description: 'Error rate exceeded 5% threshold',
                      time: '5 minutes ago',
                      status: 'active'
                    },
                    {
                      level: 'critical',
                      title: 'Memory Usage High on node-3',
                      description: 'Memory usage at 92% capacity',
                      time: '12 minutes ago',
                      status: 'active'
                    },
                    {
                      level: 'warning',
                      title: 'Slow Response Times',
                      description: 'P95 response time above 100ms',
                      time: '25 minutes ago',
                      status: 'acknowledged'
                    }
                  ].map((alert, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        alert.level === 'critical' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{alert.title}</h4>
                          <Badge variant={alert.level === 'critical' ? 'destructive' : 'secondary'}>
                            {alert.level}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-xs text-muted-foreground">{alert.time}</span>
                          {alert.status === 'acknowledged' && (
                            <Badge variant="outline" className="text-xs">Acknowledged</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Deployment History */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Deployments</CardTitle>
                <CardDescription>Latest deployment activity and status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      module: 'auth-service',
                      version: '1.2.0',
                      environment: 'production',
                      status: 'success',
                      deployedBy: 'Platform Admin',
                      deployedAt: '2 hours ago',
                      duration: '3m 24s'
                    },
                    {
                      module: 'image-processor',
                      version: '2.1.0',
                      environment: 'production',
                      status: 'success',
                      deployedBy: 'John Developer',
                      deployedAt: '6 hours ago',
                      duration: '5m 12s'
                    },
                    {
                      module: 'api-handler',
                      version: '1.0.5',
                      environment: 'staging',
                      status: 'deploying',
                      deployedBy: 'Platform Admin',
                      deployedAt: '5 minutes ago',
                      duration: '2m 45s'
                    },
                    {
                      module: 'database-migrator',
                      version: '1.0.3',
                      environment: 'production',
                      status: 'failed',
                      deployedBy: 'System',
                      deployedAt: '1 hour ago',
                      duration: '1m 18s'
                    }
                  ].map((deployment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-2 h-2 rounded-full ${
                          deployment.status === 'success' ? 'bg-green-500' :
                          deployment.status === 'deploying' ? 'bg-blue-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{deployment.module}</span>
                            <Badge variant="secondary">{deployment.version}</Badge>
                            <Badge variant="outline">{deployment.environment}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            by {deployment.deployedBy} • {deployment.deployedAt} • {deployment.duration}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm capitalize">{deployment.status}</span>
                        {deployment.status === 'failed' && (
                          <Button variant="outline" size="sm">Retry</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Health */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Runtime Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Wasmtime Engine</span>
                    <Badge variant="default">Healthy</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Module Cache</span>
                    <Badge variant="default">Healthy</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Memory Pool</span>
                    <Badge variant="secondary">Warning</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Network Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Edge Connectivity</span>
                    <Badge variant="default">Healthy</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Load Balancer</span>
                    <Badge variant="default">Healthy</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>CDN Status</span>
                    <Badge variant="default">Healthy</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Database Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Primary DB</span>
                    <Badge variant="default">Healthy</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Replication Lag</span>
                    <Badge variant="default">0.2s</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Backup Status</span>
                    <Badge variant="default">Current</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t bg-white/50 backdrop-blur-sm dark:bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              © 2024 WebAssembly Platform. Built with Next.js and Wasm.
            </p>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => alert('Settings panel would open here')}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}