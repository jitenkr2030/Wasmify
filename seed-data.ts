import { db } from '@/lib/db'

async function seedData() {
  try {
    // Create users
    const user1 = await db.user.create({
      data: {
        email: 'admin@wasmplatform.com',
        name: 'Platform Admin'
      }
    })

    const user2 = await db.user.create({
      data: {
        email: 'developer@example.com',
        name: 'John Developer'
      }
    })

    // Create WebAssembly modules
    const module1 = await db.wasmModule.create({
      data: {
        name: 'auth-service',
        description: 'Authentication and authorization service',
        version: '1.2.0',
        language: 'rust',
        wasmFile: '/modules/auth-service.wasm',
        sourceCode: '/src/auth-service/',
        size: 2048576,
        hash: 'sha256:abc123...',
        isPublic: true,
        authorId: user1.id
      }
    })

    const module2 = await db.wasmModule.create({
      data: {
        name: 'image-processor',
        description: 'Image processing and transformation service',
        version: '2.1.0',
        language: 'rust',
        wasmFile: '/modules/image-processor.wasm',
        sourceCode: '/src/image-processor/',
        size: 3145728,
        hash: 'sha256:def456...',
        isPublic: true,
        authorId: user2.id
      }
    })

    const module3 = await db.wasmModule.create({
      data: {
        name: 'api-handler',
        description: 'REST API request handler',
        version: '1.0.5',
        language: 'go',
        wasmFile: '/modules/api-handler.wasm',
        sourceCode: '/src/api-handler/',
        size: 1572864,
        hash: 'sha256:ghi789...',
        isPublic: false,
        authorId: user1.id
      }
    })

    // Create deployments
    const deployment1 = await db.deployment.create({
      data: {
        name: 'auth-service-prod',
        environment: 'production',
        region: 'us-east-1',
        status: 'active',
        moduleId: module1.id,
        deployerId: user1.id,
        config: {
          memory: '128MB',
          cpu: '100m',
          replicas: 3
        }
      }
    })

    const deployment2 = await db.deployment.create({
      data: {
        name: 'image-processor-edge',
        environment: 'production',
        region: 'global',
        status: 'active',
        moduleId: module2.id,
        deployerId: user2.id,
        config: {
          memory: '256MB',
          cpu: '200m',
          replicas: 5,
          edge: true
        }
      }
    })

    const deployment3 = await db.deployment.create({
      data: {
        name: 'api-handler-staging',
        environment: 'staging',
        region: 'eu-west-1',
        status: 'active',
        moduleId: module3.id,
        deployerId: user1.id,
        config: {
          memory: '64MB',
          cpu: '50m',
          replicas: 1
        }
      }
    })

    // Create some metrics
    const now = new Date()
    for (let i = 0; i < 50; i++) {
      const timestamp = new Date(now.getTime() - i * 60000) // Every minute for last 50 minutes
      await db.deploymentMetric.create({
        data: {
          timestamp,
          requestCount: Math.floor(Math.random() * 1000) + 500,
          responseTime: Math.random() * 100 + 20,
          errorRate: Math.random() * 0.1,
          memoryUsage: Math.floor(Math.random() * 100000000) + 50000000,
          cpuUsage: Math.random() * 80 + 10,
          deploymentId: deployment1.id
        }
      })
    }

    // Create edge nodes
    const edgeNodes = [
      { name: 'us-east-1-node-1', region: 'us-east-1', location: 'Virginia, USA', status: 'active', capacity: 100 },
      { name: 'us-west-1-node-1', region: 'us-west-1', location: 'California, USA', status: 'active', capacity: 100 },
      { name: 'eu-west-1-node-1', region: 'eu-west-1', location: 'Ireland', status: 'active', capacity: 100 },
      { name: 'ap-southeast-1-node-1', region: 'ap-southeast-1', location: 'Singapore', status: 'active', capacity: 100 },
      { name: 'ap-northeast-1-node-1', region: 'ap-northeast-1', location: 'Tokyo, Japan', status: 'maintenance', capacity: 100 }
    ]

    for (const node of edgeNodes) {
      await db.edgeNode.create({
        data: {
          ...node,
          currentLoad: Math.floor(Math.random() * 80)
        }
      })
    }

    // Create packages
    await db.package.create({
      data: {
        name: 'wasm-crypto',
        description: 'Cryptographic functions for WebAssembly',
        version: '1.0.0',
        isPublic: true,
        downloads: 1542,
        publisherId: user1.id
      }
    })

    await db.package.create({
      data: {
        name: 'wasm-http',
        description: 'HTTP client library for Wasm',
        version: '2.1.3',
        isPublic: true,
        downloads: 892,
        publisherId: user2.id
      }
    })

    console.log('Sample data seeded successfully!')
  } catch (error) {
    console.error('Error seeding data:', error)
  }
}

seedData()