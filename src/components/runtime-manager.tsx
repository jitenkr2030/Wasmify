'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@//components/ui/select'
import { 
  Cpu, 
  Zap, 
  Shield, 
  Activity, 
  Settings, 
  PlayCircle, 
  PauseCircle, 
  RefreshCw,
  Server,
  Code2,
  Globe,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

interface Runtime {
  id: string
  name: string
  version: string
  type: 'production' | 'beta' | 'experimental'
  status: 'active' | 'inactive' | 'maintenance' | 'offline'
  uptime: number
  activeInstances: number
  totalInstances: number
  memoryUsage: number
  cpuUsage: number
  lastActivity: string
  capabilities: any
}

interface ExecutionResult {
  executionId: string
  runtimeId: string
  moduleId: string
  functionName: string
  args: any[]
  result: any
  executionTime: number
  memoryUsed: number
  instructions: number
  success: boolean
  error?: string
}

export default function RuntimeManager() {
  const [runtimes, setRuntimes] = useState<Runtime[]>([])
  const [selectedRuntime, setSelectedRuntime] = useState('')
  const [executionHistory, setExecutionHistory] = useState<ExecutionResult[]>([])
  const [isExecuting, setIsExecuting] = useState(false)
  const [runtimeStats, setRuntimeStats] = useState<any>(null)

  useEffect(() => {
    fetchRuntimeData()
    const interval = setInterval(fetchRuntimeData, 10000) // Update every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchRuntimeData = async () => {
    try {
      const response = await fetch('/api/runtime?action=list-runtimes')
      const data = await response.json()
      if (data.success) {
        setRuntimes(data.data.runtimes)
        setRuntimeStats(data.data.summary)
      }
    } catch (error) {
      console.error('Error fetching runtime data:', error)
    }
  }

  const handleExecute = async (moduleId: string, functionName: string, args: any[] = []) => {
    if (!selectedRuntime) {
      return
        alert('Please select a runtime first')
    }

    setIsExecuting(true)
    try {
      const response = await fetch('/api/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'execute-standalone',
          runtime: selectedRuntime,
          config: {
            moduleId,
            functionName,
            args,
            enableWasi: true,
            maxExecutionTime: 30000
          }
        })
      })

      const result = await response.json()
      
      const executionResult: ExecutionResult = {
        executionId: result.data.executionId,
        runtimeId: selectedRuntime,
        moduleId,
        functionName,
        args,
        result: result.data.result,
        executionTime: result.data.executionTime,
        memoryUsed: result.data.memoryUsed,
        instructions: result.data.instructions,
        success: result.data.success,
        error: result.data.error
      }

      setExecutionHistory(prev => [executionResult, ...prev.slice(-4)]) // Keep last 5 executions
      setIsExecuting(false)

      return executionResult
    } catch (error) {
      setIsExecuting(false)
      return {
        executionId: `error-${Date.now()}`,
        runtimeId: selectedRuntime,
        moduleId,
        functionName,
        args,
        result: null,
        executionTime: 0,
        memoryUsed: 0,
        instructions: 0,
        success: false,
        error: error.message
      }
    }
  }

  const handleDeploy = async (moduleId: string, regions: string[], config: any) => {
    try {
      const response = await fetch('/api/edge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deploy',
          moduleId,
          regions,
          config: {
            memory: config.memory || '256MB',
            cpu: config.cpu || '200m',
            replicas: config.replicas || 3,
            autoScaling: true
          }
        })
      })

      const result = await response.json()
      
      return result
    } catch (error) {
      console.error('Deployment error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  const handleOptimize = async (runtimeId: string) => {
    try {
      const response = await fetch('/api/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'optimize',
          runtime: runtimeId
        })
      })

      return result.data
    } catch (error) {
      console.error('Optimization error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'inactive': return 'bg-gray-500'
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

  const getPlatformIcon = (runtimeId: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'wasmtime': <Code2 className="h-6 w-6" />,
      'wasmer': <Server className="h-6 w-6" />,
      'wasm3': <Cpu className="h-6 w-6" />,
      'wasm4': <Zap className="h-6 w-6" />
    }

    return icons[runtimeId.toLowerCase()] || <Code2 className="h-6 w-6" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold flex items-center justify-center">
          <Cpu className="h-8 w-8 mr-3" />
          Runtime Manager
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Manage WebAssembly runtimes for embedded and standalone execution
        </p>
      </div>

      {/* Runtime Status Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Runtimes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{runtimeStats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">Running instances</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{runtimeStats?.totalInstances || 0}</div>
            <p className="text-xs text-muted-foreground">Total capacity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{runtimeStats?.uptime || 99.9}%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Resource Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Memory</span>
                <span className={getUtilizationColor(runtimeStats?.memoryUsage || 0)}>
                  {runtimeStats?.memoryUsage || 0}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>CPU</span>
                <span className={getUtilizationColor(runtimeStats?.cpuUsage || 0)}>
                  {runtimeStats?.cpuUsage || 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Runtime List */}
      <Card>
        <CardHeader>
          <CardTitle>Available Runtimes</CardTitle>
          <CardDescription>
            Select and manage WebAssembly runtimes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {runtimes.map((runtime) => (
              <Card key={runtime.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(runtime.status)}`} />
                      <CardTitle className="text-lg">{runtime.name}</CardTitle>
                      <Badge variant={runtime.status === 'active' ? 'default' : 'secondary'}>
                        {runtime.type === 'production' ? 'Production' : 
                         runtime.type === 'beta' ? 'Beta' : 
                         runtime.type === 'experimental' ? 'Experimental' : 'Development'}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="text-sm text-muted-foreground">
                    {runtime.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Version</p>
                      <p className="font-medium">{runtime.version}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-medium capitalize">{runtime.type}</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Instances</span>
                    <span className="font-medium">{runtime.activeInstances}/{runtime.totalInstances}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Capacity</span>
                    <span className="font-medium">{runtime.capacity}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Available</span>
                    <span className="font-medium text-green-600">{runtime.available}</span>
                  </div>
                  <Progress 
                    value={(runtime.currentLoad / runtime.capacity) * 100} 
                    className="w-full"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleOptimize(runtime.id)}
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Optimize
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleDeploy('module-id', ['global'])}
                  >
                    <Rocket className="h-4 w-4 mr-1" />
                    Deploy
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Execution History */}
      <Card>
        <CardHeader>
          <CardTitle>Execution History</CardTitle>
          <CardDescription>
            Recent WebAssembly executions and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {executionHistory.length === 0 ? (
            <div className="text-center py-8">
              <Server className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No executions yet</h3>
              <p className="text-muted-foreground">
                Execute WebAssembly modules to see performance data here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {executionHistory.map((execution, index) => (
                <Card key={execution.executionId} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        execution.success ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className="font-medium">{execution.functionName}</span>
                      <Badge variant={execution.success ? 'default' : 'destructive'}>
                        {execution.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Module: {execution.moduleId}</span>
                      <span>Runtime: {execution.runtimeId}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Time: {execution.executionTime.toFixed(2)}ms</span>
                      <span>Memory: {(execution.memoryUsed / 1024 / 1024).toFixed(1)}MB</span>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <span className="text-xs text-muted-foreground">
                      {new Date(execution.endTime).toLocaleTimeString()}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Runtime Details */}
      {selectedRuntime && getPlatform(selectedRuntime) && (
        <Card>
          <CardHeader>
          <CardTitle className="flex items-center">
            {getPlatformIcon(selectedRuntime)}
            <CardTitle className="ml-2">
              {getPlatform(selectedRuntime).name} Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-3">Runtime Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Version</span>
                    <span className="font-medium">{getPlatform(selectedRuntime).version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium capitalize">{getPlatform(selectedRuntime).type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">License</span>
                    <span className="font-medium">MIT</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Capabilities</h4>
                <div className="space-y-2">
                  {getPlatform(selectedRuntime).capabilities.features.map((capability, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{capability}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="Performance Metrics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Uptime</span>
                    <span className="font-medium">{getPlatform(selectedRuntime).uptime}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Memory Usage</span>
                    <span className="font-medium">{runtimeStats?.memoryUsage || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CPU Usage</span>
                    <span className="font-medium">{runtimeStats?.cpuUsage || 0}%</span>
                  </div>
                </div>

              <div>
                <h4 className="Health Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground">Overall</span>
                    <Badge variant={getPlatform(selectedRuntime).health.overall === 'healthy' ? 'default' : 'destructive'}>
                      {getPlatform(selectedRuntime).health.overall}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-muted-foreground">Runtime</span>
                      <Badge variant={getPlatform(selectedRuntime).health.components.runtime ? 'default' : 'secondary'}>
                        {getPlatform(selectedRuntime).health.components.runtime}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-muted-foreground">Compiler</span>
                      <Badge variant={getPlatform(selectedRuntime).health.components.compiler ? 'default' : 'secondary'}>
                        {getPlatform(selectedRuntime).health.components.compiler}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-muted-foreground">Cache</span>
                      <Badge variant={getPlatform(selectedRuntime).health.components.cache ? 'default' : 'secondary'}>
                        {getPlatform(selectedRuntime).health.components.cache}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button size="lg">
                  <Download className="h-4 w-4 mr-2" />
                  Download Runtime SDK
                </Button>
              </div>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </div>
  )
}