'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Code, Download, Star, Globe, Package, Filter } from 'lucide-react'

interface Package {
  id: string
  name: string
  description: string
  version: string
  downloadCount: number
  supportedLanguages: string[]
  category: string
  tags: string[]
  publisher: {
    name: string
    email: string
  }
  license: string
  createdAt: string
}

interface RegistryStats {
  totalPackages: number
  totalDownloads: number
  supportedLanguages: string[]
  categories: string[]
}

export default function UniversalRegistry() {
  const [packages, setPackages] = useState<Package[]>([])
  const [stats, setStats] = useState<RegistryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('popularity')

  useEffect(() => {
    fetchPackages()
    fetchStats()
  }, [searchQuery, selectedLanguage, selectedCategory, sortBy])

  const fetchPackages = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        q: searchQuery,
        language: selectedLanguage,
        category: selectedCategory,
        sort: sortBy
      })

      const response = await fetch(`/api/registry/search?${params}`)
      const data = await response.json()

      if (data.success) {
        setPackages(data.data.packages)
        setStats(prev => prev ? { ...prev, ...data.data.filters } : data.data.filters)
      }
    } catch (error) {
      console.error('Error fetching packages:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/registry/stats')
      const data = await response.json()

      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const LanguageIcon = ({ language }: { language: string }) => {
    const icons: { [key: string]: string } = {
      javascript: '🟨',
      typescript: '🔷',
      python: '🐍',
      go: '🐹',
      rust: '🦀',
      c: '⚙️',
      cpp: '⚙️',
      java: '☕',
      'c#': '🔷',
      php: '🐘',
      ruby: '💎',
      swift: '🍎',
      kotlin: '🎯'
    }

    return <span className="text-lg">{icons[language.toLowerCase()] || '📦'}</span>
  }

  if (loading && !packages.length) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Package className="h-12 w-12 mx-auto mb-4 animate-pulse text-muted-foreground" />
          <p className="text-muted-foreground">Loading universal registry...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Universal Package Registry</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover, share, and use WebAssembly packages across all programming languages. 
          One package, multiple languages, infinite possibilities.
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPackages.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDownloads.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Languages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.supportedLanguages.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.categories.length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Search Packages
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Button>Search</Button>
          </div>
          
          <div className="flex gap-4 flex-wrap">
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Languages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Languages</SelectItem>
                {stats?.supportedLanguages.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    <div className="flex items-center space-x-2">
                      <LanguageIcon language={lang} />
                      <span>{lang}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {stats?.categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">Most Popular</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="updated">Recently Updated</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Language Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="javascript">JavaScript</TabsTrigger>
          <TabsTrigger value="python">Python</TabsTrigger>
          <TabsTrigger value="go">Go</TabsTrigger>
          <TabsTrigger value="rust">Rust</TabsTrigger>
          <TabsTrigger value="c">C/C++</TabsTrigger>
          <TabsTrigger value="java">Java</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <PackageGrid packages={packages} />
        </TabsContent>
        
        <TabsContent value="javascript" className="space-y-4">
          <PackageGrid packages={packages.filter(p => p.supportedLanguages.includes('javascript'))} />
        </TabsContent>
        
        <TabsContent value="python" className="space-y-4">
          <PackageGrid packages={packages.filter(p => p.supportedLanguages.includes('python'))} />
        </TabsContent>
        
        <TabsContent value="go" className="space-y-4">
          <PackageGrid packages={packages.filter(p => p.supportedLanguages.includes('go'))} />
        </TabsContent>
        
        <TabsContent value="rust" className="space-y-4">
          <PackageGrid packages={packages.filter(p => p.supportedLanguages.includes('rust'))} />
        </TabsContent>
        
        <TabsContent value="c" className="space-y-4">
          <PackageGrid packages={packages.filter(p => p.supportedLanguages.includes('c') || p.supportedLanguages.includes('cpp'))} />
        </TabsContent>
        
        <TabsContent value="java" className="space-y-4">
          <PackageGrid packages={packages.filter(p => p.supportedLanguages.includes('java'))} />
        </TabsContent>
        
        <TabsContent value="other" className="space-y-4">
          <PackageGrid packages={packages.filter(p => 
            !['javascript', 'python', 'go', 'rust', 'c', 'cpp', 'java'].some(lang => p.supportedLanguages.includes(lang))
          )} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function PackageGrid({ packages }: { packages: Package[] }) {
  if (packages.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No packages found</h3>
        <p className="text-muted-foreground">Try adjusting your search filters</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {packages.map((pkg) => (
        <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{pkg.name}</CardTitle>
                <CardDescription className="mt-1">{pkg.description}</CardDescription>
              </div>
              <Badge variant="secondary">{pkg.version}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Supported Languages */}
            <div>
              <p className="text-sm font-medium mb-2">Supported Languages:</p>
              <div className="flex flex-wrap gap-1">
                {pkg.supportedLanguages.slice(0, 4).map((lang) => (
                  <Badge key={lang} variant="outline" className="text-xs">
                    <div className="flex items-center space-x-1">
                      <span className="text-xs">
                        {lang === 'javascript' && '🟨'}
                        {lang === 'python' && '🐍'}
                        {lang === 'go' && '🐹'}
                        {lang === 'rust' && '🦀'}
                        {lang === 'c' && '⚙️'}
                        {lang === 'java' && '☕'}
                      </span>
                      <span>{lang}</span>
                    </div>
                  </Badge>
                ))}
                {pkg.supportedLanguages.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{pkg.supportedLanguages.length - 4} more
                  </Badge>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Download className="h-4 w-4" />
                  <span>{pkg.downloadCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4" />
                  <span>4.8</span>
                </div>
              </div>
              <Badge variant="outline">{pkg.license}</Badge>
            </div>

            {/* Publisher */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                by {pkg.publisher.name}
              </p>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Code className="h-4 w-4 mr-1" />
                  Use
                </Button>
                <Button size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Install
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}