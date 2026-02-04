import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const language = searchParams.get('language') || ''
    const category = searchParams.get('category') || ''
    const sort = searchParams.get('sort') || 'popularity'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build search filters
    const where: any = {
      isPublic: true
    }

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ]
    }

    if (language) {
      where.language = { contains: language, mode: 'insensitive' }
    }

    // Get packages with language support
    const packages = await db.package.findMany({
      where,
      include: {
        publisher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        versions: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            downloads: true
          }
        }
      },
      orderBy: getOrderBy(sort),
      skip: (page - 1) * limit,
      take: limit
    })

    // Get supported languages for each package
    const packagesWithLanguages = await Promise.all(
      packages.map(async (pkg) => {
        const supportedLanguages = await getPackageSupportedLanguages(pkg.id)
        
        return {
          ...pkg,
          supportedLanguages,
          latestVersion: pkg.versions[0]?.version || '1.0.0',
          downloadCount: pkg._count.downloads
        }
      })
    )

    // Get total count for pagination
    const total = await db.package.count({ where })

    // Get available languages and categories
    const [languages, categories] = await Promise.all([
      getAvailableLanguages(),
      getAvailableCategories()
    ])

    return NextResponse.json({
      success: true,
      data: {
        packages: packagesWithLanguages,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        filters: {
          languages,
          categories
        }
      }
    })
  } catch (error) {
    console.error('Error searching packages:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to search packages' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name, 
      description, 
      version, 
      language, 
      supportedLanguages,
      category,
      tags,
      publisherId,
      isPublic = false,
      registryUrl,
      license = 'MIT'
    } = body

    if (!name || !version || !language || !publisherId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create package
    const pkg = await db.package.create({
      data: {
        name,
        description,
        version,
        registryUrl,
        isPublic,
        downloads: 0,
        publisherId,
        license
      },
      include: {
        publisher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Create package version with language support
    await db.packageVersion.create({
      data: {
        version,
        wasmFile: '', // Will be uploaded separately
        changelog: `Initial release for ${language}`,
        packageId: pkg.id
      }
    })

    // Store language support metadata
    await storePackageMetadata(pkg.id, {
      primaryLanguage: language,
      supportedLanguages,
      category,
      tags,
      createdAt: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      data: {
        ...pkg,
        supportedLanguages,
        category,
        tags
      }
    })
  } catch (error) {
    console.error('Error creating package:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create package' },
      { status: 500 }
    )
  }
}

function getOrderBy(sort: string) {
  switch (sort) {
    case 'newest':
      return { createdAt: 'desc' }
    case 'updated':
      return { updatedAt: 'desc' }
    case 'name':
      return { name: 'asc' }
    case 'downloads':
    default:
      return { downloads: 'desc' }
  }
}

async function getPackageSupportedLanguages(packageId: string): Promise<string[]> {
  // This would query language support from metadata
  // For now, return common languages
  return ['javascript', 'python', 'go', 'rust', 'c', 'cpp']
}

async function getAvailableLanguages(): Promise<string[]> {
  return [
    'javascript', 'typescript', 'python', 'go', 'rust', 'c', 'cpp',
    'java', 'c#', 'php', 'ruby', 'swift', 'kotlin', 'dart', 'lua'
  ]
}

async function getAvailableCategories(): Promise<string[]> {
  return [
    'web-development', 'mobile', 'desktop', 'game-development', 'ai-ml',
    'database', 'networking', 'security', 'testing', 'utilities',
    'graphics', 'audio', 'video', 'iot', 'blockchain'
  ]
}

async function storePackageMetadata(packageId: string, metadata: any) {
  // This would store metadata in a separate table or file system
  // For now, we'll simulate it
  console.log(`Storing metadata for package ${packageId}:`, metadata)
}