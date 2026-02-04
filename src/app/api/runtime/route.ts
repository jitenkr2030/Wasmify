import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'status'

    switch (action) {
      case 'status':
        return getRuntimeStatus(searchParams.get('runtime') || 'wasmtime')
      case 'list-runtimes':
        return listAvailableRuntimes()
      case 'get-capabilities':
        return getRuntimeCapabilities()
      default:
        return getRuntimeStatus('wasmtime')
    }
  } catch (error) {
    console.error('Error in runtime GET API:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get runtime status' },
      { status: 500 }
    )
  }
}

async function listAvailableRuntimes() {
  const runtimes = [
    {
      id: 'wasmtime',
      name: 'Wasmtime',
      description: 'Fast and secure WebAssembly runtime',
      version: '15.0.0',
      type: 'production',
      status: 'active',
      capabilities: ['security', 'performance', 'flexibility', 'wasi', 'jit']
    },
    {
      id: 'wasmer',
      name: 'Wasmer',
      description: 'Universal WebAssembly runtime',
      version: '4.2.0',
      type: 'production',
      status: 'active',
      capabilities: ['security', 'performance', 'scalability', 'portability']
    },
    {
      id: 'wasm3',
      name: 'Wasm3',
      description: 'Next generation WebAssembly runtime',
      version: '2.0.0',
      type: 'beta',
      status: 'active',
      capabilities: ['threads', 'gc', 'tail-call', 'bulk-memory']
    },
    {
      id: 'wasm4',
      name: 'Wasm4',
      description: 'WebAssembly System Interface v4',
      version: '1.0.0',
      type: 'experimental',
      status: 'active',
      capabilities: ['component-model', 'gc-guided', 'exception-handling']
    }
  ]

  return NextResponse.json({
    success: true,
    data: {
      runtimes,
      summary: {
        total: runtimes.length,
        active: runtimes.filter(r => r.status === 'active').length,
        available: runtimes.length
      }
    }
  })
}

async function getRuntimeCapabilities() {
  const capabilities = {
    runtimes: ['wasmtime', 'wasmer', 'wasm3', 'wasm4'],
    features: {
      security: {
        sandbox: true,
        memory_safety: true,
        capability_based_security: true,
        resource_limits: true
      },
      performance: {
        jit_compilation: true,
        aot_compilation: true,
        opcode_cache: true,
        memory_optimization: true,
        parallel_execution: true
      },
      compatibility: {
        webassembly: '2.0+',
        wasi_preview1: true,
        wasi_preview2: true,
        threads: true,
        bulk_memory: true,
        tail_calls: true
      },
      features: {
        embedded_deployment: true,
        standalone_execution: true,
        hot_reloading: true,
        debugging: true,
        profiling: true
      }
    }
  }

  return NextResponse.json({
    success: true,
    data: capabilities
  })
}

async function getRuntimeStatus(runtimeType: string) {
  const status = {
    runtimeType,
    status: 'active',
    version: '1.0.0',
    uptime: 99.97,
    activeInstances: 12,
    totalInstances: 20,
    memoryUsage: 45, // percentage
    cpuUsage: 32, // percentage
    lastActivity: new Date().toISOString(),
    capabilities: {
      supportedLanguages: getSupportedLanguages(runtimeType),
      maxModuleSize: '100MB',
      maxMemoryUsage: '512MB',
      maxExecutionTime: '30s',
      concurrentInstances: 100
    },
    health: {
      overall: 'healthy',
      components: {
        runtime: 'active',
        compiler: 'active',
        cache: 'active',
        optimizer: 'active'
      }
    }
  }

  return NextResponse.json({
    success: true,
    data: status
  })
}