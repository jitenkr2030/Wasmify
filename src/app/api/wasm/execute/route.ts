import { NextRequest, NextResponse } from 'next/server'
import { wasmRuntime } from '@/lib/wasm-runtime'
import { writeFile, mkdir, unlink } from 'fs/promises'
import path from 'path'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const wasmFile = formData.get('wasmFile') as File
    const functionName = formData.get('functionName') as string
    const args = JSON.parse(formData.get('args') as string || '[]')
    const config = JSON.parse(formData.get('config') as string || '{}')

    if (!wasmFile) {
      return NextResponse.json(
        { success: false, error: 'WebAssembly file is required' },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Save uploaded file temporarily
    const fileName = `${Date.now()}-${wasmFile.name}`
    const filePath = join(uploadsDir, fileName)
    const buffer = Buffer.from(await wasmFile.arrayBuffer())
    await writeFile(filePath, buffer)

    try {
      // Load WebAssembly module
      const moduleId = await wasmRuntime.loadModule(buffer, config)

      // Execute function
      const result = await wasmRuntime.executeFunction(
        moduleId,
        functionName,
        args,
        config
      )

      // Clean up temporary file
      try {
        await unlink(filePath)
      } catch (error) {
        // Ignore cleanup errors
      }

      return NextResponse.json({
        success: true,
        data: {
          moduleId,
          result,
          stats: wasmRuntime.getStats()
        }
      })
    } catch (error) {
      // Clean up temporary file on error
      try {
        await unlink(filePath)
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
      throw error
    }
  } catch (error) {
    console.error('WebAssembly execution error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to execute WebAssembly module' 
      },
      { status: 500 }
    )
  }
}