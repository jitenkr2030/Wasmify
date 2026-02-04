import { NextRequest, NextResponse } from 'next/server'
import { fileStorage } from '@/lib/file-storage'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'application/wasm',
      'application/octet-stream',
      'text/x-c',
      'text/x-c++',
      'text/x-rust',
      'text/x-go'
    ]

    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.wasm')) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only WebAssembly files are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 100MB.' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Upload file
    const result = await fileStorage.uploadWasmFile(buffer, file.name)

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        originalName: file.name,
        uploadedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload file' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder') || 'uploads'

    const files = await fileStorage.listFiles(folder)

    return NextResponse.json({
      success: true,
      data: files
    })
  } catch (error) {
    console.error('List files error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to list files' },
      { status: 500 }
    )
  }
}