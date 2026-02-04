'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Globe, 
  Server, 
  Zap, 
  Database, 
  Code2, 
  Settings, 
  Rocket,
  Upload,
  Download,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  Globe2,
  Cloud,
  Shield,
  TrendingUp
} from 'lucide-react'

interface Platform {
  id: string
  name: string
  type: 'cms' | 'backend' | 'jamstack' | 'static'
  description: string
  icon: React.ReactNode
  wasmCompatibility: number
  features: string[]
  deploymentTime: string
  pricing: string
  popularity: number
}

interface HostingConfig {
  platform: string
  config: any
  deploymentId?: string
  status: string
  estimatedTime?: string
  steps?: string[]
}

const platforms: Platform[] = [
  {
    id: 'wordpress',
    name: 'WordPress',
    type: 'cms',
    description: 'Content management system with WebAssembly acceleration',
    icon: <FileText className="h-5 w-5" />,
    wasmCompatibility: 85,
    features: ['Instant Page Load', 'SEO Optimized', 'Mobile Responsive', 'Plugin Ecosystem'],
    deploymentTime: '5-10 minutes',
    pricing: 'Free to $100/month',
    popularity: 95
  },
  {
    id: 'static-site',
    name: 'Static Site',
    type: 'jamstack',
    description: 'Static site generator with WebAssembly modules',
    icon: <Globe className="h-5 w-5" />,
    wasmCompatibility: 95,
    features: ['Instant Loading', 'Global CDN', 'High Performance', 'Low Cost'],
    deploymentTime: '2-5 minutes',
    pricing: 'Free',
    popularity: 90
  },
  {
    'id: 'php',
    name: 'PHP Applications',
    type: 'backend',
    description: 'PHP backend with WebAssembly performance boost',
    icon: <Database className="h-5 w-5" />,
    wasmCompatibility: 75,
    features: ['Low Latency', 'High Concurrency', 'Memory Efficient', 'Easy Migration'],
    deploymentTime: '3-8 minutes',
    pricing: 'Free to $50/month',
    popularity: 88
  },
  {
    'id: 'django',
    name: 'Django',
    type: 'backend',
    description: 'Python framework with WebAssembly modules',
    icon: <Server className="h-5 w-5" />,
    wasmCompatibility: 70,
    features: ['Rapid Development', 'Scalable', 'Admin Interface', 'Rich Ecosystem'],
    deploymentTime: '5-15 minutes',
    pricing: 'Free to $100/month',
    popularity: 85
  },
  {
    'nodejs',
    name: 'Node.js',
    type: 'backend',
    description: 'JavaScript runtime with WebAssembly modules',
    icon: <Code2 className="h-5 w-5" />,
    wasmCompatibility: 95,
    features: ['Fast Execution', 'NPM Ecosystem', 'Real-time', 'Microservices'],
    deploymentTime: '2-5 minutes',
    pricing: 'Free to $100/month',
    popularity: 92
  }
]

export default function HostingSolutions() {
  const [selectedPlatform, setSelectedPlatform] = useState('')
  const [hostingConfig, setHostingConfig] = useState<HostingConfig | null>(null)
  const [isDeploying, setIsDeploying] = useState(false)

  const handlePlatformSelect = (platformId: string) => {
    setSelectedPlatform(platformId)
    setHostingConfig(null)
  }

  const handleDeploy = async (platform: string) => {
    setIsDeploying(true)
    try {
      const response = await fetch('/api/hosting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deploy',
          platform,
          config: {
            regions: ['global'],
            replicas: 3,
            memory: '256MB',
            cpu: '200m'
          }
        })
      })

      const result = await response.json()
      setHostingConfig(result.data)
    } catch (error) {
      console.error('Deployment error:', error)
    } finally {
      setIsDeploying(false)
    }
  }

  const handleOptimize = async (platform: string) => {
    try {
      const response = await fetch('/api/hosting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'optimize',
          platform
        })
      })

      const result = await response.json()
      console.log('Optimization result:', result.data)
    } catch (error) {
      console.error('Optimization error:', error)
    }
  }

  const getPlatform = (platformId: string) => {
    return platforms.find(p => p.id === platformId)
  }

  const getCompatibilityColor = (compatibility: number) => {
    if (compatibility >= 90) return 'text-green-600'
    if (compatibility >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getCompatibilityBadge = (compatibility: number) => {
    if (compatibility >= 90) return 'default'
    if (compatibility >= 70) return 'secondary'
    return 'destructive'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold flex items-center justify-center">
          <Cloud className="h-8 w-8 mr-3" />
          Hosting Solutions
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Deploy your applications to our edge network with platform-specific optimizations. 
          Move existing applications to WebAssembly without changing a line of code.
        </p>
      </div>

      {/* Platform Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Choose Your Platform</CardTitle>
          <CardDescription>
            Select your current platform to see WebAssembly integration options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {platforms.map((platform) => (
              <Card 
                key={platform.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedPlatform === platform.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handlePlatformSelect(platform.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{platform.name}</CardTitle>
                    <Badge variant={getCompatibilityBadge(platform.wasmCompatibility)}>
                      {platform.wasmCompatibility}% Wasm
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {platform.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {platform.features.slice(0, 3).map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {platform.features.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{platform.features.length - 3} more
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{platform.pricing}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-green-600">{platform.popularity}% popular</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Platform Configuration */}
      {selectedPlatform && getPlatform(selectedPlatform) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              {getPlatform(selectedPlatform).name} Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium mb-2">Deployment Type</p>
                <Select defaultValue="edge">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="edge">Edge Network</SelectItem>
                    <SelectItem value="traditional">Traditional</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Resource Allocation</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">Memory</label>
                    <Select defaultValue="256MB">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                      <SelectItem value="64MB">64 MB</SelectItem>
                      <SelectItem value="128MB">128 MB</SelectItem>
                      <SelectItem value="256MB">256 MB</SelectItem>
                      <SelectItem value="512MB">512 MB</SelectItem>
                    </SelectContent>
                  </Select>
                  <div>
                    <label className="text-xs text-muted-foreground">CPU</label>
                    <Select defaultValue="200m">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                      <SelectItem value="50m">50m</SelectItem>
                      <SelectItem value="100m">100m</SelectItem>
                      <SelectItem value="200m">200m</SelectItem>
                      <SelectItem value="500m">500m</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <Button 
                variant="outline"
                onClick={() => handleOptimize(selectedPlatform)}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Optimize
              </Button>
              <Button 
                onClick={() => handleDeploy(selectedPlatform)}
                disabled={isDeploying}
              >
                {isDeploying ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4 mr-2" />
                    Deploy Now
                  </>
                )}
              </Button>
            </div>

            {/* Deployment Status */}
            {hostingConfig && (
              <Card>
                <CardHeader>
                  <CardTitle>Deployment Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      hostingConfig.status === 'active' ? 'bg-green-500' : 
                      hostingConfig.status === 'in_progress' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <span className="text-sm font-medium capitalize">
                      {hostingConfig.status}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Deployment Steps:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      {hostingConfig.steps?.map((step, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Estimated Time:</span>
                    <span className="font-medium">{hostingConfig.estimatedTime}</span>
                  </div>

                  {hostingConfig.status === 'active' && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-green-600">Deployment Complete!</span>
                      <Button variant="outline" size="sm">
                        <Globe2 className="h-4 w-4 mr-1" />
                        View Deployment
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          )}
        </Card>

        {/* Platform Details */}
        {selectedPlatform && getPlatform(selectedPlatform) && (
          <Card>
            <CardHeader>
              <CardTitle>Platform Details</CardTitle>
              <CardDescription>
                Detailed information and WebAssembly integration for {getPlatform(selectedPlatform).name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-3">WebAssembly Integration</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Compatibility</span>
                      <Badge variant={getCompatibilityBadge(getPlatform(selectedPlatform).wasmCompatibility)}>
                        {getPlatform(selectedPlatform).wasmCompatibility}%
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Migration Complexity</span>
                      <Badge variant="outline">
                        {getPlatform(selectedPlatform).migrationComplexity}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Build Time</span>
                      <span className="text-sm font-medium">{getPlatform(selectedPlatform).deploymentTime}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="Platform Features</h4>
                  <div className="space-y-2">
                    {getPlatform(selectedPlatform).features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="WebAssembly Benefits</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-blue-500" />
                    <span>40-80% performance improvement</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-green-500" />
                    <span>60-80% latency reduction</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-purple-500" />
                    <span>Enhanced security sandbox</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                    <span>Auto-scaling capabilities</span>
                  </li>
                </ul>
              </div>

              <div className="flex justify-center">
                <Button size="lg">
                  <Rocket className="h-4 w-4 mr-2" />
                  Get Started with {getPlatform(selectedPlatform).name}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Start Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Quick Start</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Choose a platform above to get started with WebAssembly deployment
              </p>
              <Button className="w-full">
                <Rocket className="h-4 w-4 mr-2" />
                Choose Platform
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Migration Tools</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Use our migration tools to convert existing applications
              </p>
              <Button variant="outline" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Migrate App
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Documentation</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Learn about WebAssembly integration
              </p>
              <Button variant="outline" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                View Docs
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Support</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Get help with your WebAssembly journey
              </p>
              <Button variant="outline" className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Get Help
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Overview */}
        <Card>
          <CardHeader>
          <CardTitle>Why Choose Wasmify for Hosting?</CardTitle>
          <CardDescription>
            Discover the benefits of WebAssembly-powered hosting
          </CardDescription>
        </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Zap className="h-8 w-8 text-blue-500" />
                  <div>
                    <h3 className="font-semibold">Lightning Fast</h3>
                    <p className="text-sm text-muted-foreground">
                      Millisecond cold starts with global edge caching
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Globe className="h-8 w-8 text-green-500" />
                  <div>
                    <h3 className="font-semibold">Global Scale</h3>
                    <p className="text-sm text-muted-foreground">
                      Deploy to 50+ edge locations instantly
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="h-8 w-8 text-purple-500" />
                  <div>
                    <h3 className="Enhanced Security</h3>
                    <p className="text-sm text-muted-foreground">
                      Sandboxed execution environment
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-8 w-8 text-orange-500" />
                  <div>
                    <h3>Cost Effective</h3>
                    <p className="text-sm text-muted-foreground">
                      Pay only for what you use with auto-scaling
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="h-8 w-8 text-indigo-500" />
                  <div>
                    <h3>Developer Friendly</h3>
                    <p className="text-sm text-muted-foreground">
                      No code changes required
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  )
}