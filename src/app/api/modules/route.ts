import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const modules = await db.wasmModule.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        deployments: {
          select: {
            id: true,
            name: true,
            status: true,
            region: true,
            environment: true
          }
        },
        _count: {
          select: {
            deployments: true,
            dependencies: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: modules
    })
  } catch (error) {
    console.error('Error fetching modules:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch modules' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, version, language, wasmFile, sourceCode, authorId, isPublic } = body

    if (!name || !version || !language || !wasmFile || !authorId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const wasmModule = await db.wasmModule.create({
      data: {
        name,
        description,
        version,
        language,
        wasmFile,
        sourceCode,
        authorId,
        isPublic: isPublic || false,
        size: 0, // Would be calculated from actual file
        hash: 'temp-hash' // Would be calculated from actual file
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: wasmModule
    })
  } catch (error) {
    console.error('Error creating module:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create module' },
      { status: 500 }
    )
  }
}