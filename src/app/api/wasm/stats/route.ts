import { NextResponse } from 'next/server'
import { wasmRuntime } from '@/lib/wasm-runtime'

export async function GET() {
  try {
    const stats = wasmRuntime.getStats()
    
    return NextResponse.json({
      success: true,
      data: {
        runtime: {
          engine: 'Wasmtime',
          version: '0.0.2',
          status: 'active'
        },
        performance: {
          loadedModules: stats.loadedModules,
          activeInstances: stats.activeInstances,
          totalMemoryUsage: stats.totalMemoryUsage,
          cacheHitRate: stats.cacheHitRate
        },
        supportedLanguages: [
          { name: 'Rust', status: 'excellent', performance: 'high' },
          { name: 'Go', status: 'good', performance: 'medium' },
          { name: 'C/C++', status: 'excellent', performance: 'high' },
          { name: 'AssemblyScript', status: 'good', performance: 'medium' },
          { name: 'Zig', status: 'experimental', performance: 'medium' },
          { name: 'D', status: 'good', performance: 'medium' }
        ]
      }
    })
  } catch (error) {
    console.error('Error getting WebAssembly stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get WebAssembly stats' },
      { status: 500 }
    )
  }
}