'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Code2, 
  Upload, 
  Download, 
  Rocket, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  FileText,
  GitBranch,
  Container,
  Server,
  Zap,
  Settings
} from 'lucide-react'

interface MigrationResult {
  success: boolean
  data?: {
    wasmCode?: string
    buildScript?: string
    dockerfile?: string
    steps?: string[]
    estimatedBuildTime?: string
    compatibility?: any
    recommendations?: string[]
    potentialIssues?: string[]
  }
  error?: string
}

export default function ApplicationMigration() {
  const [sourceCode, setSourceCode] = useState('')
  const [language, setLanguage] = useState('')
  const [framework, setFramework] = useState('')
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)
  const [activeTab, setActiveTab] = useState('analyze')

  const languages = [
    { value: 'javascript', label: 'JavaScript', compatibility: 95 },
    { value: 'typescript', label: 'TypeScript', compatibility: 95 },
    { value: 'rust', label: 'Rust', compatibility: 100 },
    { value: 'go', label: 'Go', compatibility: 90 },
    { value: 'python', label: 'Python', compatibility: 75 },
    { value: 'java', label: 'Java', compatibility: 70 },
    { value: 'c', label: 'C', compatibility: 85 },
    { value: 'cpp', label: 'C++', compatibility: 85 },
    { value: 'c#', label: 'C#', compatibility: 65 },
    { value: 'php', label: 'PHP', compatibility: 60 }
  ]

  const frameworks = [
    { value: 'react', label: 'React', language: 'javascript' },
    { value: 'vue', label: 'Vue.js', language: 'javascript' },
    { value: 'angular', label: 'Angular', language: 'typescript' },
    { value: 'express', label: 'Express.js', language: 'javascript' },
    { value: 'django', label: 'Django', language: 'python' },
    { value: 'flask', label: 'Flask', language: 'python' },
    { value: 'spring', label: 'Spring Boot', language: 'java' },
    { value: 'aspnet', label: 'ASP.NET', language: 'c#' },
    { value: 'laravel', label: 'Laravel', language: 'php' }
  ]

  const handleAnalyze = async () => {
    if (!sourceCode || !language) {
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze',
          sourceCode,
          language
        })
      })

      const result = await response.json()
      setMigrationResult(result)
    } catch (error) {
      setMigrationResult({
        success: false,
        error: 'Analysis failed. Please try again.'
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleMigrate = async () => {
    if (!sourceCode || !language || !framework) {
      return
    }

    setIsMigrating(true)
    try {
      const response = await fetch('/api/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'migrate',
          sourceCode,
          language,
          framework,
          config: {
            memory: '128MB',
            cpu: '100m',
            replicas: 3
          }
        })
      })

      const result = await response.json()
      setMigrationResult(result)
      if (result.success) {
        setActiveTab('result')
      }
    } catch (error) {
      setMigrationResult({
        success: false,
        error: 'Migration failed. Please try again.'
      })
    } finally {
      setIsMigrating(false)
    }
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
          <Rocket className="h-8 w-8 mr-3" />
          Application Migration to WebAssembly
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Move your existing applications to WebAssembly without changing a line of code. 
          Our intelligent migration tools analyze, convert, and optimize your code for WebAssembly execution.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analyze">Analyze</TabsTrigger>
          <TabsTrigger value="migrate">Migrate</TabsTrigger>
          <TabsTrigger value="result">Result</TabsTrigger>
          <TabsTrigger value="deploy">Deploy</TabsTrigger>
        </TabsList>

        {/* Analyze Tab */}
        <TabsContent value="analyze" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Code Analysis</CardTitle>
              <CardDescription>
                Paste your source code to analyze WebAssembly compatibility and migration requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Programming Language</label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          <div className="flex items-center space-x-2">
                            <span>{lang.label}</span>
                            <Badge variant={getCompatibilityBadge(lang.compatibility)}>
                              {lang.compatibility}% compatible
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Framework (Optional)</label>
                  <Select value={framework} onValueChange={setFramework}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select framework" />
                    </SelectTrigger>
                    <SelectContent>
                      {frameworks.map((fw) => (
                        <SelectItem key={fw.value} value={fw.value}>
                          {fw.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Source Code</label>
                <Textarea
                  placeholder="Paste your source code here..."
                  value={sourceCode}
                  onChange={(e) => setSourceCode(e.target.value)}
                  className="min-h-64 font-mono text-sm"
                />
              </div>

              <Button 
                onClick={handleAnalyze} 
                disabled={!sourceCode || !language || isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Code2 className="h-4 w-4 mr-2" />
                    Analyze Code
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {migrationResult && !migrationResult.success && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-red-600">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Analysis Failed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-600">{migrationResult.error}</p>
              </CardContent>
            </Card>
          )}

          {migrationResult && migrationResult.success && migrationResult.data && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  Analysis Complete
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Lines of Code</p>
                    <p className="text-2xl font-bold">{migrationResult.data.linesOfCode?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Complexity</p>
                    <p className="text-2xl font-bold">{migrationResult.data.complexity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Est. Effort</p>
                    <p className="text-2xl font-bold">{migrationResult.data.estimatedEffort}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">WebAssembly Compatibility</p>
                  <div className="flex items-center space-x-2">
                    <Progress value={migrationResult.data.wasmCompatibility} className="flex-1" />
                    <span className={`text-sm font-medium ${getCompatibilityColor(migrationResult.data.wasmCompatibility)}`}>
                      {migrationResult.data.wasmCompatibility}%
                    </span>
                  </div>
                </div>

                {migrationResult.data.recommendations && (
                  <div>
                    <p className="text-sm font-medium mb-2">Recommendations</p>
                    <ul className="list-disc list-inside space-y-1">
                      {migrationResult.data.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-muted-foreground">{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {migrationResult.data.potentialIssues && migrationResult.data.potentialIssues.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Potential Issues</p>
                    <ul className="list-disc list-inside space-y-1">
                      {migrationResult.data.potentialIssues.map((issue, index) => (
                        <li key={index} className="text-sm text-red-600">{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button onClick={() => setActiveTab('migrate')} className="w-full">
                  <Rocket className="h-4 w-4 mr-2" />
                  Start Migration
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Migrate Tab */}
        <TabsContent value="migrate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Migration Configuration</CardTitle>
              <CardDescription>
                Configure your WebAssembly migration settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-sm font-medium">Memory Limit</label>
                  <Select defaultValue="128MB">
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
                </div>
                <div>
                  <label className="text-sm font-medium">CPU Limit</label>
                  <Select defaultValue="100m">
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
                <div>
                  <label className="text-sm font-medium">Replicas</label>
                  <Select defaultValue="3">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleMigrate} 
                disabled={!sourceCode || !language || !framework || isMigrating}
                className="w-full"
              >
                {isMigrating ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Migrating...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4 mr-2" />
                    Start Migration
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Result Tab */}
        <TabsContent value="result" className="space-y-6">
          {migrationResult && migrationResult.success && migrationResult.data && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    Migration Successful
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Badge variant="default">WebAssembly Generated</Badge>
                    <Badge variant="secondary">Build Ready</Badge>
                    <Badge variant="outline">Est. Build Time: {migrationResult.data.estimatedBuildTime}</Badge>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Migration Steps</p>
                    <ol className="list-decimal list-inside space-y-1">
                      {migrationResult.data.steps?.map((step, index) => (
                        <li key={index} className="text-sm text-muted-foreground">{step}</li>
                      ))}
                    </ol>
                  </div>
                </CardContent>
              </Card>

              {/* Generated Code Tabs */}
              <Card>
                <CardHeader>
                  <CardTitle>Generated Assets</CardTitle>
                  <CardDescription>
                    Download the generated WebAssembly code and configuration files
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="wasm" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="wasm">WASM Code</TabsTrigger>
                      <TabsTrigger value="build">Build Script</TabsTrigger>
                      <TabsTrigger value="dockerfile">Dockerfile</TabsTrigger>
                      <TabsTrigger value="config">Config</TabsTrigger>
                    </TabsList>

                    <TabsContent value="wasm" className="space-y-4">
                      <div className="relative">
                        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                          <code>{migrationResult.data.wasmCode}</code>
                        </pre>
                        <Button
                          className="absolute top-2 right-2"
                          onClick={() => {
                            const blob = new Blob([migrationResult.data.wasmCode], { type: 'text/plain' })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = 'wasm-module.js'
                            a.click()
                            URL.revokeObjectURL(url)
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="build" className="space-y-4">
                      <div className="relative">
                        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                          <code>{migrationResult.data.buildScript}</code>
                        </pre>
                        <Button
                          className="absolute top-2 right-2"
                          onClick={() => {
                            const blob = new Blob([migrationResult.data.buildScript], { type: 'text/plain' })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = 'package.json'
                            a.click()
                            URL.revokeObjectURL(url)
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="dockerfile" className="space-y-4">
                      <div className="relative">
                        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                          <code>{migrationResult.data.dockerfile}</code>
                        </pre>
                        <Button
                          className="absolute top-2 right-2"
                          onClick={() => {
                            const blob = new Blob([migrationResult.data.dockerfile], { type: 'text/plain' })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = 'Dockerfile'
                            a.click()
                            URL.revokeObjectURL(url)
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="config" className="space-y-4">
                      <div className="relative">
                        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                          <code>{JSON.stringify(migrationResult.data.config, null, 2)}</code>
                        </pre>
                        <Button
                          className="absolute top-2 right-2"
                          onClick={() => {
                            const blob = new Blob([JSON.stringify(migrationResult.data.config, null, 2)], { type: 'application/json' })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = 'wasm-config.json'
                            a.click()
                            URL.revokeObjectURL(url)
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Compatibility Report */}
              {migrationResult.data.compatibility && (
                <Card>
                  <CardHeader>
                    <CardTitle>Compatibility Report</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium mb-2">Overall Compatibility</p>
                        <div className="flex items-center space-x-2">
                          <Progress value={migrationResult.data.compatibility.overall} className="flex-1" />
                          <span className={`text-sm font-medium ${getCompatibilityColor(migrationResult.data.compatibility.overall)}`}>
                            {migrationResult.data.compatibility.overall}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Features</p>
                        <div className="space-y-1">
                          {Object.entries(migrationResult.data.compatibility.features).map(([feature, rating]) => (
                            <div key={feature} className="flex justify-between text-sm">
                              <span className="capitalize">{feature.replace(/([A-Z])/g, ' $1')}</span>
                              <Badge variant="outline">{rating}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Deploy Tab */}
        <TabsContent value="deploy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Deploy to Edge</CardTitle>
              <CardDescription>
                Deploy your migrated WebAssembly module to our global edge network
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <Server className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Ready to Deploy</h3>
                <p className="text-muted-foreground mb-4">
                  Your WebAssembly module is ready for edge deployment. Choose your deployment preferences.
                </p>
                <div className="flex justify-center space-x-4">
                  <Button variant="outline">
                    <Container className="h-4 w-4 mr-2" />
                    Configure Deployment
                  </Button>
                  <Button>
                    <Zap className="h-4 w-4 mr-2" />
                    Deploy Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}