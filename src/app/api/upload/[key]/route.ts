import { NextRequest, NextResponse } from 'next/server'
import { fileStorage } from '@/lib/file-storage'

export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const key = decodeURIComponent(params.key)
    
    // Get file info
    const fileInfo = await fileStorage.getFileInfo(key)
    
    // Generate download URL
    const downloadUrl = await fileStorage.getDownloadUrl(key)

    return NextResponse.json({
      success: true,
      data: {
        ...fileInfo,
        key,
        downloadUrl
      }
    })
  } catch (error) {
    console.error('Get file error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get file' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const key = decodeURIComponent(params.key)
    
    await fileStorage.deleteFile(key)

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    })
  } catch (error) {
    console.error('Delete file error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete file' },
      { status: 500 }
    )
  }
}